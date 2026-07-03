import prisma from '../../config/db.js';
import multer from 'multer';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import path from 'path';
import { logAudit } from '../../utils/auditLog.js';
import { createNotification } from '../../utils/notify.js';
import { saveFile, getBuffer } from '../../lib/storage.js';
import { resolveStatutoryConfig, sanitizeStatutoryConfig, INDIA_STATUTORY_CONFIG } from '../payroll/payroll.statutory.js';

// GET /api/company
export const getCompany = asyncHandler(async (req, res) => {
  const company = await prisma.company.findFirst({
    include: {
      ptSlabs: { orderBy: { minSalary: 'asc' } },
      holidays: { orderBy: { date: 'asc' } },
      sites: { orderBy: { name: 'asc' } },
      departments: { orderBy: { name: 'asc' } }
    }
  });
  if (!company) throw new ApiError(404, 'Company not configured');
  res.json(new ApiResponse(200, company));
});

// PUT /api/company
export const updateCompany = asyncHandler(async (req, res) => {
  const { name, registeredAddress, gstin, pan, epfCode, esicCode, ptState, payrollCycleDay, workingDaysBase, otMultiplier, financialYearStart } = req.body;
  const company = await prisma.company.findFirst();

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { name, registeredAddress, gstin, pan, epfCode, esicCode, ptState, payrollCycleDay: Number(payrollCycleDay), workingDaysBase: Number(workingDaysBase), otMultiplier: Number(otMultiplier), financialYearStart: Number(financialYearStart) }
  });

  await logAudit({ userId: req.user.id, action: 'UPDATE', entity: 'company', entityId: company.id, newValue: req.body });
  res.json(new ApiResponse(200, updated, 'Company settings updated'));
});

// POST /api/company/logo — Upload logo
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const company = await prisma.company.findFirst();
  const ext = path.extname(req.file.originalname) || '.png';
  const key = await saveFile(`logos/logo_${company.id}${ext}`, req.file.buffer, req.file.mimetype);
  await prisma.company.update({ where: { id: company.id }, data: { logoPath: key } });
  res.json(new ApiResponse(200, { logoPath: key }, 'Logo uploaded'));
});

// GET /api/company/logo — Public: stream the current company logo from storage
export const getLogo = asyncHandler(async (req, res) => {
  const company = await prisma.company.findFirst({ select: { logoPath: true } });
  if (!company?.logoPath) throw new ApiError(404, 'No logo set');
  const buf = await getBuffer(company.logoPath);
  if (!buf) throw new ApiError(404, 'Logo not found');
  const ext = path.extname(company.logoPath).toLowerCase();
  const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(buf);
});

// GET /api/company/statutory-config — effective payroll statutory rules
export const getStatutoryConfig = asyncHandler(async (req, res) => {
  const company = await prisma.company.findFirst({ select: { id: true, statutoryConfig: true } });
  if (!company) throw new ApiError(404, 'Company not configured');
  res.json(new ApiResponse(200, {
    isCustom: !!company.statutoryConfig,
    overrides: company.statutoryConfig || null,
    effective: resolveStatutoryConfig(company.statutoryConfig),
    defaults: INDIA_STATUTORY_CONFIG,
  }));
});

// PUT /api/company/statutory-config — replace the jurisdiction-rules override
export const updateStatutoryConfig = asyncHandler(async (req, res) => {
  const { config, errors } = sanitizeStatutoryConfig(req.body?.statutoryConfig ?? req.body);
  if (errors.length) throw new ApiError(400, `Invalid statutory config: ${errors.join('; ')}`);

  const company = await prisma.company.findFirst({ select: { id: true } });
  if (!company) throw new ApiError(404, 'Company not configured');

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { statutoryConfig: config }, // null resets to India defaults
    select: { statutoryConfig: true },
  });

  await logAudit({ userId: req.user.id, action: 'UPDATE', entity: 'company', entityId: company.id, newValue: { statutoryConfig: config } });
  res.json(new ApiResponse(200, {
    isCustom: !!updated.statutoryConfig,
    overrides: updated.statutoryConfig,
    effective: resolveStatutoryConfig(updated.statutoryConfig),
  }, config ? 'Statutory config updated' : 'Statutory config reset to defaults'));
});

// POST /api/company/holidays — Add holiday
export const addHoliday = asyncHandler(async (req, res) => {
  const { name, date } = req.body;
  const company = await prisma.company.findFirst();
  const holiday = await prisma.holiday.create({ data: { companyId: company.id, name, date: new Date(date) } });
  res.status(201).json(new ApiResponse(201, holiday, 'Holiday added'));
});

// DELETE /api/company/holidays/:id
export const deleteHoliday = asyncHandler(async (req, res) => {
  await prisma.holiday.delete({ where: { id: req.params.id } });
  res.json(new ApiResponse(200, null, 'Holiday deleted'));
});

// PUT /api/company/pt-slabs — Replace all PT slabs for a state
export const updatePTSlabs = asyncHandler(async (req, res) => {
  const { state, slabs } = req.body; // slabs: [{ minSalary, maxSalary, ptAmount }]
  const company = await prisma.company.findFirst();
  await prisma.$transaction([
    prisma.ptSlab.deleteMany({ where: { companyId: company.id, state } }),
    prisma.ptSlab.createMany({ data: slabs.map(s => ({ ...s, companyId: company.id, state })) })
  ]);
  res.json(new ApiResponse(200, null, 'PT slabs updated'));
});

// POST /api/company/sites — Add site
export const addSite = asyncHandler(async (req, res) => {
  const { name, address } = req.body;
  const company = await prisma.company.findFirst();
  const site = await prisma.site.create({ data: { companyId: company.id, name, address } });
  res.status(201).json(new ApiResponse(201, site, 'Site added'));
});

// POST /api/company/departments — Add department
export const addDepartment = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const company = await prisma.company.findFirst();
  const dept = await prisma.department.create({ data: { companyId: company.id, name } });
  res.status(201).json(new ApiResponse(201, dept, 'Department added'));
});

// POST /api/company/advance-loans — Create advance loan for employee
export const createAdvanceLoan = asyncHandler(async (req, res) => {
  const { employeeId, sanctionedAmount, emi, startMonth, startYear, reason } = req.body;
  const loan = await prisma.advanceLoan.create({
    data: { employeeId, sanctionedAmount: Number(sanctionedAmount), emi: Number(emi), startMonth: Number(startMonth), startYear: Number(startYear), balanceRemaining: Number(sanctionedAmount), reason }
  });

  const empUser = await prisma.employee.findUnique({ where: { id: employeeId }, select: { userId: true } });
  if (empUser) {
    await createNotification(empUser.userId, {
      title: 'Salary Advance Sanctioned',
      message: `A salary advance of ₹${Number(sanctionedAmount).toLocaleString('en-IN')} has been sanctioned. EMI: ₹${Number(emi).toLocaleString('en-IN')}/month.`,
      type: 'advance_created',
      entityId: loan.id
    });
  }

  await logAudit({ userId: req.user.id, action: 'CREATE', entity: 'advance_loans', entityId: loan.id, newValue: req.body });
  res.status(201).json(new ApiResponse(201, loan, 'Advance loan created'));
});

// DELETE /api/company/sites/:id
export const deleteSite = asyncHandler(async (req, res) => {
  // Check if any employees are assigned to this site first
  const count = await prisma.employee.count({ where: { siteId: req.params.id } });
  if (count > 0) throw new ApiError(400, `Cannot delete — ${count} employee(s) are assigned to this site`);
  await prisma.site.delete({ where: { id: req.params.id } });
  res.json(new ApiResponse(200, null, 'Site deleted'));
});

// DELETE /api/company/departments/:id
export const deleteDepartment = asyncHandler(async (req, res) => {
  const count = await prisma.employee.count({ where: { departmentId: req.params.id } });
  if (count > 0) throw new ApiError(400, `Cannot delete — ${count} employee(s) are in this department`);
  await prisma.department.delete({ where: { id: req.params.id } });
  res.json(new ApiResponse(200, null, 'Department deleted'));
});

// GET /api/company/advance-loans
export const listAdvanceLoans = asyncHandler(async (req, res) => {
  const { status, employeeId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (employeeId) where.employeeId = employeeId;
  const loans = await prisma.advanceLoan.findMany({
    where,
    include: { employee: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(new ApiResponse(200, loans));
});
