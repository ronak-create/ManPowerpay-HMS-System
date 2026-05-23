import prisma from '../../config/db.js';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, differenceInDays } from 'date-fns';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';

const GRACE_PERIOD_DAYS = 3;

// Helper: check if date is within locked payroll month
async function isDateLocked(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const run = await prisma.payrollRun.findUnique({
    where: { month_year: { month, year } }
  });
  return run?.status === 'locked';
}

// GET /api/attendance/team?month=6&year=2026
// Supervisor: gets full month grid for their team
export const getTeamAttendance = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) throw new ApiError(400, 'month and year are required');

  let supervisorId = null;
  if (req.user.role === 'supervisor') {
    const sup = await prisma.supervisor.findUnique({ where: { userId: req.user.id } });
    if (!sup) throw new ApiError(403, 'Supervisor record not found');
    supervisorId = sup.id;
  }

  const whereEmp = { isActive: true };
  if (supervisorId) whereEmp.supervisorId = supervisorId;

  const employees = await prisma.employee.findMany({
    where: whereEmp,
    include: { user: { select: { name: true } } }
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  const attendance = await prisma.attendance.findMany({
    where: {
      employeeId: { in: employees.map(e => e.id) },
      date: { gte: startDate, lte: endDate }
    }
  });

  // Build lookup: employeeId -> date -> record
  const lookup = {};
  attendance.forEach(a => {
    if (!lookup[a.employeeId]) lookup[a.employeeId] = {};
    lookup[a.employeeId][format(a.date, 'yyyy-MM-dd')] = a;
  });

  // Holidays for the month
  const holidays = await prisma.holiday.findMany({
    where: { date: { gte: startDate, lte: endDate } }
  });
  const holidayDates = new Set(holidays.map(h => format(h.date, 'yyyy-MM-dd')));

  res.json(new ApiResponse(200, { employees, attendance: lookup, holidayDates: [...holidayDates], startDate, endDate }));
});

// GET /api/attendance/employee/:empId?month=6&year=2026
// Employee own attendance OR Admin viewing specific employee
export const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  let empId = req.params.empId;

  // Employee can only view their own
  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (!emp || emp.id !== empId) throw new ApiError(403, 'Cannot view other employee attendance');
    empId = emp.id;
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [attendance, holidays] = await Promise.all([
    prisma.attendance.findMany({ where: { employeeId: empId, date: { gte: startDate, lte: endDate } }, orderBy: { date: 'asc' } }),
    prisma.holiday.findMany({ where: { date: { gte: startDate, lte: endDate } } })
  ]);

  const holidayDates = new Set(holidays.map(h => format(h.date, 'yyyy-MM-dd')));

  // Enrich with day-of-week WO info (Sundays)
  const dayMap = {};
  attendance.forEach(a => { dayMap[format(a.date, 'yyyy-MM-dd')] = a; });

  const calendar = allDays.map(day => {
    const key = format(day, 'yyyy-MM-dd');
    const existing = dayMap[key];
    const isSunday = day.getDay() === 0;
    const isHoliday = holidayDates.has(key);
    return {
      date: key,
      status: existing?.status || (isHoliday ? 'HO' : isSunday ? 'WO' : null),
      otHours: existing?.otHours || 0,
      record: existing || null
    };
  });

  // Summary
  const present = attendance.filter(a => a.status === 'P').length;
  const halfDay = attendance.filter(a => a.status === 'H').length;
  const absent = attendance.filter(a => a.status === 'A' || a.status === 'LWP').length;
  const paidLeave = attendance.filter(a => a.status === 'PL').length;
  const totalOT = attendance.reduce((s, a) => s + (a.otHours || 0), 0);

  res.json(new ApiResponse(200, { calendar, summary: { present, halfDay, absent, paidLeave, totalOT } }));
});

// POST /api/attendance/bulk — Supervisor marks attendance for their team
export const markBulkAttendance = asyncHandler(async (req, res) => {
  // Body: { date: "2026-06-15", records: [{ employeeId, status, otHours }] }
  const { date, records } = req.body;
  if (!date || !records?.length) throw new ApiError(400, 'date and records are required');

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (attendanceDate > today) throw new ApiError(400, 'Cannot mark future attendance');
  if (await isDateLocked(attendanceDate)) throw new ApiError(400, 'Attendance for this month is locked (payroll has been processed)');

  // Verify supervisor owns these employees
  const sup = await prisma.supervisor.findUnique({ where: { userId: req.user.id } });
  if (!sup && req.user.role !== 'admin') throw new ApiError(403, 'Unauthorized');

  if (req.user.role === 'supervisor') {
    const teamIds = (await prisma.employee.findMany({ where: { supervisorId: sup.id }, select: { id: true } })).map(e => e.id);
    const unauthorized = records.filter(r => !teamIds.includes(r.employeeId));
    if (unauthorized.length) throw new ApiError(403, 'Some employees are not in your team');
  }

  const daysDiff = differenceInDays(today, attendanceDate);

  const upserts = records.map(r =>
    prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: r.employeeId, date: attendanceDate } },
      create: {
        employeeId: r.employeeId, date: attendanceDate,
        status: r.status, otHours: r.otHours || 0,
        markedById: req.user.id, markedAt: new Date(),
        correctionReason: daysDiff > GRACE_PERIOD_DAYS ? r.correctionReason : null
      },
      update: {
        status: r.status, otHours: r.otHours || 0,
        correctedById: req.user.id,
        correctionReason: daysDiff > GRACE_PERIOD_DAYS ? r.correctionReason : null
      }
    })
  );

  await prisma.$transaction(upserts);
  await logAudit({ userId: req.user.id, action: 'MARK_ATTENDANCE', entity: 'attendance', entityId: `${date}_bulk`, newValue: records });

  res.json(new ApiResponse(200, null, 'Attendance marked successfully'));
});

// PATCH /api/attendance/:id — Admin correction (no grace period restriction)
export const adminCorrect = asyncHandler(async (req, res) => {
  const { status, otHours, correctionReason } = req.body;
  const rec = await prisma.attendance.findUnique({ where: { id: req.params.id } });
  if (!rec) throw new ApiError(404, 'Attendance record not found');
  if (rec.isLocked) throw new ApiError(400, 'Attendance is locked');

  await prisma.attendance.update({
    where: { id: req.params.id },
    data: { status, otHours: otHours || 0, correctedById: req.user.id, correctionReason }
  });
  res.json(new ApiResponse(200, null, 'Attendance corrected'));
});

// GET /api/attendance/summary/:empId?month=6&year=2026 — Used by payroll engine
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  const records = await prisma.attendance.findMany({
    where: { employeeId: req.params.empId, date: { gte: startDate, lte: endDate } }
  });

  const holidays = await prisma.holiday.findMany({ where: { date: { gte: startDate, lte: endDate } } });
  const holidayDates = new Set(holidays.map(h => format(h.date, 'yyyy-MM-dd')));

  const totalCalendarDays = endDate.getDate();
  const totalSundays = eachDayOfInterval({ start: startDate, end: endDate }).filter(d => d.getDay() === 0).length;
  const workingDays = totalCalendarDays - totalSundays - holidayDates.size;

  const present = records.filter(r => r.status === 'P').length;
  const halfDay = records.filter(r => r.status === 'H').length;
  const paidLeave = records.filter(r => r.status === 'PL').length;
  const otHours = records.reduce((s, r) => s + (r.otHours || 0), 0);

  const daysWorked = present + (halfDay * 0.5) + paidLeave;
  const lwpDays = Math.max(0, workingDays - daysWorked);

  res.json(new ApiResponse(200, { workingDays, present, halfDay, paidLeave, daysWorked, lwpDays, otHours }));
});
