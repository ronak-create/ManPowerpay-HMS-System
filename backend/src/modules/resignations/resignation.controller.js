import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';
import { createNotification } from '../../utils/notify.js';
import { generateResignationAcceptancePDF } from '../../utils/resignationLetterGenerator.js';

// POST /api/resignations — Employee applies for resignation
export const applyResignation = asyncHandler(async (req, res) => {
  const { lastWorkingDay, reason } = req.body;
  const emp = await prisma.employee.findUnique({
    where: { userId: req.user.id },
    include: { user: true }
  });
  if (!emp) throw new ApiError(404, 'Employee record not found');

  // Check for existing pending/approved resignation
  const existing = await prisma.resignation.findFirst({
    where: { employeeId: emp.id, status: { in: ['pending', 'approved'] } }
  });
  if (existing) throw new ApiError(400, 'You already have an active resignation request');

  const resignation = await prisma.resignation.create({
    data: {
      employeeId: emp.id,
      lastWorkingDay: new Date(lastWorkingDay),
      reason,
      status: 'pending'
    }
  });

  // Notify admins
  const admins = await prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } });
  await createNotification(admins.map(a => a.id), {
    title: 'New Resignation Request',
    message: `${emp.user.name} has submitted a resignation request for ${lastWorkingDay}.`,
    type: 'resignation_request',
    entityId: resignation.id
  });

  await logAudit({ userId: req.user.id, action: 'CREATE', entity: 'resignations', entityId: resignation.id, newValue: req.body });
  res.status(201).json(new ApiResponse(201, resignation, 'Resignation request submitted'));
});

// GET /api/resignations — List resignations (Admin: all, Employee: own)
export const listResignations = asyncHandler(async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { employee: { userId: req.user.id } };
  const resignations = await prisma.resignation.findMany({
    where,
    include: {
      employee: { include: { user: { select: { name: true } } } },
      approvedBy: { select: { name: true } }
    },
    orderBy: { appliedAt: 'desc' }
  });
  res.json(new ApiResponse(200, resignations));
});

// PATCH /api/resignations/:id/approve — Admin approves
export const approveResignation = asyncHandler(async (req, res) => {
  const resignation = await prisma.resignation.findUnique({
    where: { id: req.params.id },
    include: { employee: true }
  });
  if (!resignation) throw new ApiError(404, 'Request not found');
  if (resignation.status !== 'pending') throw new ApiError(400, 'Only pending requests can be approved');

  const { remarks } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.resignation.update({
      where: { id: resignation.id },
      data: {
        status: 'approved',
        remarks,
        approvedById: req.user.id,
        approvedAt: new Date()
      }
    });

    // Update employee dateOfLeaving (but keep isActive = true for now)
    await tx.employee.update({
      where: { id: resignation.employeeId },
      data: { dateOfLeaving: resignation.lastWorkingDay }
    });

    return updated;
  });

  // Notify employee
  await createNotification(resignation.employee.userId, {
    title: 'Resignation Approved ✅',
    message: `Your resignation has been accepted. Your last working day is ${resignation.lastWorkingDay.toISOString().split('T')[0]}.`,
    type: 'resignation_approved',
    entityId: resignation.id
  });

  await logAudit({ userId: req.user.id, action: 'APPROVE_RESIGNATION', entity: 'resignations', entityId: resignation.id, newValue: { remarks } });
  res.json(new ApiResponse(200, result, 'Resignation approved'));
});

// PATCH /api/resignations/:id/reject — Admin rejects
export const rejectResignation = asyncHandler(async (req, res) => {
  const resignation = await prisma.resignation.findUnique({
    where: { id: req.params.id },
    include: { employee: true }
  });
  if (!resignation) throw new ApiError(404, 'Request not found');
  if (resignation.status !== 'pending') throw new ApiError(400, 'Only pending requests can be rejected');

  const { remarks } = req.body;
  await prisma.resignation.update({
    where: { id: resignation.id },
    data: { status: 'rejected', remarks, approvedById: req.user.id, approvedAt: new Date() }
  });

  await createNotification(resignation.employee.userId, {
    title: 'Resignation Rejected',
    message: `Your resignation request has been rejected. Reason: ${remarks || 'N/A'}`,
    type: 'resignation_rejected',
    entityId: resignation.id
  });

  res.json(new ApiResponse(200, null, 'Resignation rejected'));
});

// PATCH /api/resignations/:id/withdraw — Employee withdraws
export const withdrawResignation = asyncHandler(async (req, res) => {
  const resignation = await prisma.resignation.findUnique({
    where: { id: req.params.id },
    include: { employee: true }
  });
  if (!resignation) throw new ApiError(404, 'Request not found');
  if (resignation.employee.userId !== req.user.id) throw new ApiError(403, 'Unauthorized');
  if (resignation.status !== 'pending') throw new ApiError(400, 'Only pending requests can be withdrawn');

  await prisma.resignation.update({
    where: { id: resignation.id },
    data: { status: 'withdrawn' }
  });

  res.json(new ApiResponse(200, null, 'Resignation withdrawn'));
});

// GET /api/resignations/:id/letter — Download PDF
export const downloadResignationLetter = asyncHandler(async (req, res) => {
  const resignation = await prisma.resignation.findUnique({
    where: { id: req.params.id },
    include: {
      employee: { include: { user: { select: { name: true } } } }
    }
  });

  if (!resignation) throw new ApiError(404, 'Resignation record not found');
  if (resignation.status !== 'approved') throw new ApiError(400, 'Letter only available for approved resignations');

  // Auth check
  if (req.user.role !== 'admin' && resignation.employee.userId !== req.user.id) {
    throw new ApiError(403, 'Unauthorized');
  }

  const company = await prisma.company.findFirst();
  if (!company) throw new ApiError(404, 'Company not configured');

  const pdfBuffer = await generateResignationAcceptancePDF(resignation.employee, resignation, company);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Resignation_Acceptance_${resignation.employee.empCode}.pdf"`);
  res.send(pdfBuffer);
});

// DELETE /api/resignations/purge/:employeeId — Admin purges data
export const purgeEmployeeData = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!emp) throw new ApiError(404, 'Employee not found');

  // Safety check: must have an approved resignation and LWD must be in past
  const resignation = await prisma.resignation.findFirst({
    where: { employeeId, status: 'approved' }
  });
  
  if (!resignation || resignation.lastWorkingDay > new Date()) {
    throw new ApiError(400, 'Can only purge data for employees who have completed their notice period');
  }

  // Purge sensitive fields but keep record for audit
  await prisma.$transaction([
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        address: '[PURGED]',
        bankAccountNo: '[PURGED]',
        ifscCode: '[PURGED]',
        pfAccountNo: '[PURGED]',
        uanNo: '[PURGED]',
        pan: '[PURGED]',
        aadhaarNo: '[PURGED]',
        emergencyPhone: '[PURGED]',
        emergencyContact: '[PURGED]'
      }
    }),
    prisma.user.update({
      where: { id: emp.userId },
      data: { mobile: `PURGED_${emp.id}`, email: `purged_${emp.id}@deleted.com`, isActive: false }
    })
  ]);

  await logAudit({ userId: req.user.id, action: 'PURGE_DATA', entity: 'employees', entityId: employeeId });
  res.json(new ApiResponse(200, null, 'Employee sensitive data purged successfully'));
});
