import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';

export const listSupervisors = asyncHandler(async (req, res) => {
  const supervisors = await prisma.supervisor.findMany({
    include: {
      user: { select: { name: true, email: true, mobile: true, isActive: true } },
      site: true,
      _count: { select: { employees: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(new ApiResponse(200, supervisors));
});

export const createSupervisor = asyncHandler(async (req, res) => {
  const { name, email, mobile, siteId } = req.body;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { mobile }] } });
  if (existing) throw new ApiError(400, 'Email or mobile already registered');

  const hash = await bcrypt.hash('Supervisor@1234', 12);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email: email.toLowerCase(), mobile, passwordHash: hash, role: 'supervisor' }
    });
    const sup = await tx.supervisor.create({ data: { userId: user.id, siteId } });
    return { user, sup };
  });

  await logAudit({ userId: req.user.id, action: 'CREATE', entity: 'supervisors', entityId: result.sup.id, newValue: req.body });
  res.status(201).json(new ApiResponse(201, result, 'Supervisor created. Default password: Supervisor@1234'));
});

export const updateSupervisor = asyncHandler(async (req, res) => {
  const { name, mobile, siteId } = req.body;
  const sup = await prisma.supervisor.findUnique({ where: { id: req.params.id } });
  if (!sup) throw new ApiError(404, 'Supervisor not found');

  await prisma.$transaction([
    prisma.user.update({ where: { id: sup.userId }, data: { name, mobile } }),
    prisma.supervisor.update({ where: { id: req.params.id }, data: { siteId } })
  ]);
  res.json(new ApiResponse(200, null, 'Supervisor updated'));
});

export const toggleSupervisorStatus = asyncHandler(async (req, res) => {
  const sup = await prisma.supervisor.findUnique({ where: { id: req.params.id } });
  if (!sup) throw new ApiError(404, 'Supervisor not found');
  const { isActive } = req.body;
  await prisma.user.update({ where: { id: sup.userId }, data: { isActive } });
  res.json(new ApiResponse(200, null, `Supervisor ${isActive ? 'activated' : 'deactivated'}`));
});

export const reassignEmployees = asyncHandler(async (req, res) => {
  const { employeeIds, targetSupervisorId } = req.body;
  await prisma.employee.updateMany({
    where: { id: { in: employeeIds } },
    data: { supervisorId: targetSupervisorId }
  });
  res.json(new ApiResponse(200, null, 'Employees reassigned'));
});
