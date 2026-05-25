import prisma from '../../config/db.js';
import { eachDayOfInterval } from 'date-fns';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';

// Helper: count working days in a date range (excludes Sundays & holidays)
async function countWorkingDays(from, to) {
  const days = eachDayOfInterval({ start: new Date(from), end: new Date(to) });
  const holidays = await prisma.holiday.findMany({ where: { date: { gte: new Date(from), lte: new Date(to) } } });
  const holidaySet = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));
  return days.filter(d => d.getDay() !== 0 && !holidaySet.has(d.toISOString().split('T')[0])).length;
}

// Helper: update attendance records for a date range
async function applyLeaveToAttendance(employeeId, fromDate, toDate, status, markedById) {
  const days = eachDayOfInterval({ start: new Date(fromDate), end: new Date(toDate) });
  const holidays = await prisma.holiday.findMany({ where: { date: { gte: new Date(fromDate), lte: new Date(toDate) } } });
  const holidaySet = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

  const upserts = days
    .filter(d => d.getDay() !== 0 && !holidaySet.has(d.toISOString().split('T')[0]))
    .map(d =>
      prisma.attendance.upsert({
        where: { employeeId_date: { employeeId, date: d } },
        create: { employeeId, date: d, status, markedById },
        update: { status }
      })
    );
  await prisma.$transaction(upserts);
}

// GET /api/leaves — List leave requests
export const listLeaves = asyncHandler(async (req, res) => {
  const { status, employeeId, month, year } = req.query;
  const where = {};

  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (emp) where.employeeId = emp.id;
  }
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (month && year) {
    where.fromDate = { gte: new Date(year, month - 1, 1) };
    where.toDate = { lte: new Date(year, month, 0) };
  }

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: { employee: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(new ApiResponse(200, leaves));
});

// GET /api/leaves/balance/:empId?year=2026
export const getLeaveBalance = asyncHandler(async (req, res) => {
  let empId = req.params.empId;
  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (emp) empId = emp.id;
  }
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const balances = await prisma.leaveBalance.findMany({ where: { employeeId: empId, year } });
  res.json(new ApiResponse(200, balances));
});

// POST /api/leaves — Employee applies for leave
export const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;
  const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
  if (!emp) throw new ApiError(404, 'Employee record not found');

  const totalDays = await countWorkingDays(fromDate, toDate);
  if (totalDays === 0) throw new ApiError(400, 'No working days in the selected range');

  // Check balance (except LWP)
  if (leaveType !== 'LWP') {
    const year = new Date(fromDate).getFullYear();
    const balance = await prisma.leaveBalance.findUnique({ where: { employeeId_leaveType_year: { employeeId: emp.id, leaveType, year } } });
    if (!balance || balance.balance < totalDays) throw new ApiError(400, `Insufficient ${leaveType} balance. Available: ${balance?.balance || 0} days`);
  }

  // Check overlapping requests
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeId: emp.id,
      status: { in: ['pending', 'approved'] },
      OR: [{ fromDate: { lte: new Date(toDate) }, toDate: { gte: new Date(fromDate) } }]
    }
  });
  if (overlap) throw new ApiError(400, 'Overlapping leave request already exists');

  const leave = await prisma.leaveRequest.create({
    data: { employeeId: emp.id, leaveType, fromDate: new Date(fromDate), toDate: new Date(toDate), totalDays, reason, status: 'pending' }
  });

  res.status(201).json(new ApiResponse(201, leave, 'Leave applied successfully'));
});

// PATCH /api/leaves/:id/approve — Admin approves
export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: req.params.id }, include: { employee: true } });
  if (!leave) throw new ApiError(404, 'Leave request not found');
  if (leave.status !== 'pending') throw new ApiError(400, 'Leave is not in pending state');

  // Deduct balance (except LWP)
  if (leave.leaveType !== 'LWP') {
    const year = leave.fromDate.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({ where: { employeeId_leaveType_year: { employeeId: leave.employeeId, leaveType: leave.leaveType, year } } });
    if (balance) {
      await prisma.leaveBalance.update({
        where: { employeeId_leaveType_year: { employeeId: leave.employeeId, leaveType: leave.leaveType, year } },
        data: { used: { increment: leave.totalDays }, balance: { decrement: leave.totalDays } }
      });
    }
  }

  // Update attendance
  const attendanceStatus = leave.leaveType === 'LWP' ? 'LWP' : 'PL';
  await applyLeaveToAttendance(leave.employeeId, leave.fromDate, leave.toDate, attendanceStatus, req.user.id);

  await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status: 'approved', approvedById: req.user.id, approvedAt: new Date(), remarks: req.body.remarks }
  });

  await logAudit({ userId: req.user.id, action: 'APPROVE_LEAVE', entity: 'leave_requests', entityId: req.params.id });
  res.json(new ApiResponse(200, null, 'Leave approved'));
});

// PATCH /api/leaves/:id/reject
export const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!leave) throw new ApiError(404, 'Leave not found');
  if (leave.status !== 'pending') throw new ApiError(400, 'Leave is not pending');

  await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status: 'rejected', approvedById: req.user.id, approvedAt: new Date(), remarks: req.body.remarks }
  });
  res.json(new ApiResponse(200, null, 'Leave rejected'));
});

// PATCH /api/leaves/:id/cancel — Employee cancels pending leave
export const cancelLeave = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
  const leave = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!leave || leave.employeeId !== emp.id) throw new ApiError(403, 'Not your leave request');
  if (leave.status !== 'pending') throw new ApiError(400, 'Only pending requests can be cancelled');

  await prisma.leaveRequest.update({ where: { id: req.params.id }, data: { status: 'cancelled' } });
  res.json(new ApiResponse(200, null, 'Leave cancelled'));
});

// POST /api/leaves/balance/init — Admin initialises leave balance for an employee for the year
export const initLeaveBalance = asyncHandler(async (req, res) => {
  const { employeeId, year, CL = 12, PL = 12, SL = 6 } = req.body;
  const types = [{ type: 'CL', total: CL }, { type: 'PL', total: PL }, { type: 'SL', total: SL }];
  const upserts = types.map(t =>
    prisma.leaveBalance.upsert({
      where: { employeeId_leaveType_year: { employeeId, leaveType: t.type, year } },
      create: { employeeId, leaveType: t.type, year, total: t.total, used: 0, balance: t.total },
      update: { total: t.total }
    })
  );
  await prisma.$transaction(upserts);
  res.json(new ApiResponse(200, null, 'Leave balance initialised'));
});
