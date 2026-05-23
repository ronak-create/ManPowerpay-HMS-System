import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';

// GET /api/employees — List all employees (Admin) or own team (Supervisor)
export const listEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, siteId, supervisorId, isActive } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (req.user.role === 'supervisor') {
    const sup = await prisma.supervisor.findUnique({ where: { userId: req.user.id } });
    where.supervisorId = sup.id;
  }
  if (search) {
    where.OR = [
      { empCode: { contains: search, mode: 'insensitive' } },
      { designation: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (siteId) where.siteId = siteId;
  if (supervisorId) where.supervisorId = supervisorId;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where, skip: Number(skip), take: Number(limit),
      include: { user: { select: { name: true, email: true, mobile: true } }, site: true, department: true, supervisor: { include: { user: { select: { name: true } } } }, salaryTemplate: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.employee.count({ where })
  ]);

  res.json(new ApiResponse(200, { employees, total, page: Number(page), limit: Number(limit) }));
});

// GET /api/employees/:id
export const getEmployee = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, email: true, mobile: true, isActive: true } },
      site: true, department: true,
      supervisor: { include: { user: { select: { name: true } } } },
      salaryTemplate: { include: { components: { orderBy: { sequence: 'asc' } } } },
      documents: true
    }
  });
  if (!emp) throw new ApiError(404, 'Employee not found');
  res.json(new ApiResponse(200, emp));
});

// POST /api/employees — Create employee + user account
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    name, email, mobile, password,
    empCode, supervisorId, departmentId, siteId, salaryTemplateId,
    designation, dateOfJoining, annualCTC,
    dateOfBirth, gender, address, emergencyContact, emergencyPhone,
    pfAccountNo, esicNo, pan, aadhaarNo, uanNo,
    bankName, bankAccountNo, ifscCode
  } = req.body;

  // Validate unique
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { mobile }] } });
  if (existing) throw new ApiError(400, 'Email or mobile already registered');
  const empExisting = await prisma.employee.findUnique({ where: { empCode } });
  if (empExisting) throw new ApiError(400, 'Employee code already exists');

  const hash = await bcrypt.hash(password || 'Welcome@1234', 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email: email.toLowerCase(), mobile, passwordHash: hash, role: 'employee' }
    });
    const emp = await tx.employee.create({
      data: {
        userId: user.id, empCode, supervisorId, departmentId, siteId, salaryTemplateId,
        designation, dateOfJoining: new Date(dateOfJoining), annualCTC: Number(annualCTC) || 0,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender, address, emergencyContact, emergencyPhone,
        pfAccountNo, esicNo, pan, aadhaarNo: aadhaarNo, uanNo,
        bankName, bankAccountNo, ifscCode
      }
    });
    return { user, emp };
  });

  await logAudit({ userId: req.user.id, action: 'CREATE', entity: 'employees', entityId: result.emp.id, newValue: req.body });
  res.status(201).json(new ApiResponse(201, result, 'Employee created successfully. Default password: Welcome@1234'));
});

// PUT /api/employees/:id — Update employee
export const updateEmployee = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!emp) throw new ApiError(404, 'Employee not found');

  const oldValue = { ...emp };
  const {
    name, mobile, supervisorId, departmentId, siteId, salaryTemplateId,
    designation, annualCTC, dateOfBirth, gender, address,
    emergencyContact, emergencyPhone, pfAccountNo, esicNo, pan, aadhaarNo, uanNo,
    bankName, bankAccountNo, ifscCode
  } = req.body;

  await prisma.$transaction([
    prisma.user.update({ where: { id: emp.userId }, data: { name, mobile } }),
    prisma.employee.update({
      where: { id: req.params.id },
      data: {
        supervisorId, departmentId, siteId, salaryTemplateId,
        designation, annualCTC: Number(annualCTC) || emp.annualCTC,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : emp.dateOfBirth,
        gender, address, emergencyContact, emergencyPhone,
        pfAccountNo, esicNo, pan, aadhaarNo, uanNo,
        bankName, bankAccountNo, ifscCode
      }
    })
  ]);

  await logAudit({ userId: req.user.id, action: 'UPDATE', entity: 'employees', entityId: req.params.id, oldValue, newValue: req.body });
  res.json(new ApiResponse(200, null, 'Employee updated successfully'));
});

// PATCH /api/employees/:id/status — Activate / Deactivate
export const toggleEmployeeStatus = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
  if (!emp) throw new ApiError(404, 'Employee not found');

  const { isActive, dateOfLeaving, reason } = req.body;
  await prisma.$transaction([
    prisma.employee.update({ where: { id: req.params.id }, data: { isActive, dateOfLeaving: dateOfLeaving ? new Date(dateOfLeaving) : undefined } }),
    prisma.user.update({ where: { id: emp.userId }, data: { isActive } })
  ]);

  await logAudit({ userId: req.user.id, action: isActive ? 'ACTIVATE' : 'DEACTIVATE', entity: 'employees', entityId: req.params.id, newValue: { reason } });
  res.json(new ApiResponse(200, null, `Employee ${isActive ? 'activated' : 'deactivated'}`));
});

// POST /api/employees/:id/documents — Upload document
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const { type } = req.body;
  await prisma.employeeDocument.create({
    data: { employeeId: req.params.id, type, filePath: req.file.path }
  });
  res.json(new ApiResponse(201, null, 'Document uploaded'));
});

// GET /api/employees/meta — for dropdowns
export const getMeta = asyncHandler(async (req, res) => {
  const [sites, departments, supervisors, templates] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: 'asc' } }),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.supervisor.findMany({ include: { user: { select: { name: true } } } }),
    prisma.salaryTemplate.findMany({ orderBy: { name: 'asc' } })
  ]);
  res.json(new ApiResponse(200, { sites, departments, supervisors, templates }));
});
