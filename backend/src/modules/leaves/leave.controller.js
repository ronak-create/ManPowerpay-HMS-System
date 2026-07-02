import prisma from '../../config/db.js';
import { eachDayOfInterval } from 'date-fns';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';
import { createNotification } from '../../utils/notify.js';
import { isSunday, dateKey } from '../../utils/dates.js';

// Helper: count working days in a date range (excludes Sundays & holidays)
async function countWorkingDays(from, to) {
  const days = eachDayOfInterval({ start: new Date(from), end: new Date(to) });
  const holidays = await prisma.holiday.findMany({ where: { date: { gte: new Date(from), lte: new Date(to) } } });
  const holidaySet = new Set(holidays.map(h => dateKey(h.date)));
  return days.filter(d => !isSunday(d) && !holidaySet.has(dateKey(d))).length;
}

// Helper: update attendance records for a date range.
// Runs on the provided Prisma client (`client`), which may be a transaction handle.
async function applyLeaveToAttendance(client, employeeId, fromDate, toDate, status, markedById) {
  const days = eachDayOfInterval({ start: new Date(fromDate), end: new Date(toDate) });
  const holidays = await client.holiday.findMany({ where: { date: { gte: new Date(fromDate), lte: new Date(toDate) } } });
  const holidaySet = new Set(holidays.map(h => dateKey(h.date)));

  for (const d of days.filter(d => !isSunday(d) && !holidaySet.has(dateKey(d)))) {
    await client.attendance.upsert({
      where: { employeeId_date: { employeeId, date: d } },
      create: { employeeId, date: d, status, markedById },
      update: { status }
    });
  }
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
  const emp = await prisma.employee.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { name: true } } }
  });
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

  // Notify admins of new leave request
  const admins = await prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } });
  await createNotification(admins.map(a => a.id), {
    title: 'New Leave Request',
    message: `${emp.user?.name || 'An employee'} applied for ${leaveType} leave (${totalDays} day${totalDays > 1 ? 's' : ''})`,
    type: 'leave_request',
    entityId: leave.id
  });

  res.status(201).json(new ApiResponse(201, leave, 'Leave applied successfully'));
});

// PATCH /api/leaves/:id/approve — Admin approves
export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: req.params.id }, include: { employee: true } });
  if (!leave) throw new ApiError(404, 'Leave request not found');
  if (leave.status !== 'pending') throw new ApiError(400, 'Leave is not in pending state');

  const attendanceStatus = leave.leaveType === 'LWP' ? 'LWP' : 'PL';

  // Balance deduction, attendance update, and status change must be atomic so a
  // concurrent approval cannot double-spend the balance or leave records inconsistent.
  await prisma.$transaction(async (tx) => {
    if (leave.leaveType !== 'LWP') {
      const year = leave.fromDate.getFullYear();
      // Conditional decrement — only succeeds if enough balance remains, so the
      // balance can never go negative even under concurrent approvals.
      const res = await tx.leaveBalance.updateMany({
        where: { employeeId: leave.employeeId, leaveType: leave.leaveType, year, balance: { gte: leave.totalDays } },
        data: { used: { increment: leave.totalDays }, balance: { decrement: leave.totalDays } }
      });
      if (res.count === 0) throw new ApiError(400, `Insufficient ${leave.leaveType} balance to approve`);
    }

    await applyLeaveToAttendance(tx, leave.employeeId, leave.fromDate, leave.toDate, attendanceStatus, req.user.id);

    await tx.leaveRequest.update({
      where: { id: req.params.id },
      data: { status: 'approved', approvedById: req.user.id, approvedAt: new Date(), remarks: req.body.remarks }
    });
  });

  const empUser = await prisma.employee.findUnique({ where: { id: leave.employeeId }, select: { userId: true } });
  await createNotification(empUser.userId, {
    title: 'Leave Approved ✅',
    message: `Your ${leave.leaveType} leave (${leave.totalDays} days) has been approved.`,
    type: 'leave_approved',
    entityId: leave.id
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

  const empUser = await prisma.employee.findUnique({ where: { id: leave.employeeId }, select: { userId: true } });
  await createNotification(empUser.userId, {
    title: 'Leave Rejected',
    message: `Your ${leave.leaveType} leave request has been rejected.${req.body.remarks ? ' Reason: ' + req.body.remarks : ''}`,
    type: 'leave_rejected',
    entityId: leave.id
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
