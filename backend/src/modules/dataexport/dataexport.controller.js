import prisma from '../../config/db.js';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';

// Full tenant data export for portability (DPDP data-portability / backup). Admin
// only; everything is auto-scoped to the caller's company by the Prisma extension.
// PII is transparently decrypted on read, so the export contains plaintext the
// tenant already owns — but user credential fields are never included.
//
// GET /api/company/export?format=json|excel&includeAuditLogs=true

const USER_SAFE_SELECT = {
  id: true, name: true, email: true, mobile: true, role: true, isActive: true,
  lastLogin: true, passwordResetRequired: true, createdAt: true, updatedAt: true,
};

// Gather every substantive record the tenant owns. Transient/derivable data
// (notifications, OTP tokens) is excluded; audit logs are opt-in (they can be large).
async function collectTenantData({ includeAuditLogs }) {
  const [
    company, users, departments, sites, salaryTemplates, employees,
    attendance, leaveRequests, leaveBalances, payrollRuns, payslips,
    advanceLoans, resignations, form16s, holidays, ptSlabs, subscription,
  ] = await Promise.all([
    prisma.company.findFirst(),
    prisma.user.findMany({ select: USER_SAFE_SELECT, orderBy: { createdAt: 'asc' } }),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.site.findMany({ orderBy: { name: 'asc' } }),
    prisma.salaryTemplate.findMany({ include: { components: true }, orderBy: { createdAt: 'asc' } }),
    prisma.employee.findMany({ include: { documents: true }, orderBy: { empCode: 'asc' } }),
    prisma.attendance.findMany({ orderBy: [{ date: 'asc' }] }),
    prisma.leaveRequest.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.leaveBalance.findMany(),
    prisma.payrollRun.findMany({ orderBy: [{ year: 'asc' }, { month: 'asc' }] }),
    prisma.payslip.findMany({ orderBy: [{ year: 'asc' }, { month: 'asc' }] }),
    prisma.advanceLoan.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.resignation.findMany({ orderBy: { appliedAt: 'asc' } }),
    prisma.form16.findMany({ orderBy: [{ year: 'asc' }] }),
    prisma.holiday.findMany({ orderBy: { date: 'asc' } }),
    prisma.ptSlab.findMany(),
    prisma.subscription.findFirst({ include: { plan: true } }),
  ]);

  const data = {
    company, users, departments, sites, salaryTemplates, employees,
    attendance, leaveRequests, leaveBalances, payrollRuns, payslips,
    advanceLoans, resignations, form16s, holidays, ptSlabs, subscription,
  };

  if (includeAuditLogs) {
    data.auditLogs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } });
  }

  return data;
}

// Flatten a record into a single row of primitive cells so it fits a spreadsheet;
// nested arrays/objects (e.g. salary components, JSON columns) are JSON-stringified.
function toRow(record) {
  const row = {};
  for (const [key, val] of Object.entries(record)) {
    if (val === null || val === undefined) row[key] = '';
    else if (val instanceof Date) row[key] = format(val, 'yyyy-MM-dd HH:mm:ss');
    else if (typeof val === 'object') row[key] = JSON.stringify(val);
    else row[key] = val;
  }
  return row;
}

export const exportCompanyData = asyncHandler(async (req, res) => {
  const { format: fmt = 'json', includeAuditLogs } = req.query;
  const wantAudit = includeAuditLogs === 'true';

  const data = await collectTenantData({ includeAuditLogs: wantAudit });
  const companyName = data.company?.name || 'company';
  const slug = companyName.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'company';
  const stamp = format(new Date(), 'yyyyMMdd');

  await logAudit({
    userId: req.user.id,
    action: 'EXPORT',
    entity: 'company',
    entityId: data.company?.id ?? req.user.companyId,
    newValue: { format: fmt, includeAuditLogs: wantAudit },
  });

  if (fmt === 'excel') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ManpowerPay';
    workbook.created = new Date();

    for (const [name, value] of Object.entries(data)) {
      const rows = Array.isArray(value) ? value : value ? [value] : [];
      // Excel sheet names cap at 31 chars and disallow a few characters.
      const sheet = workbook.addWorksheet(name.slice(0, 31));
      if (rows.length === 0) { sheet.addRow(['(no records)']); continue; }

      const flat = rows.map(toRow);
      const headers = Object.keys(flat[0]);
      sheet.addRow(headers);
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
      flat.forEach((r) => sheet.addRow(headers.map((h) => r[h])));
      sheet.columns.forEach((col) => { col.width = 20; });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${slug}_export_${stamp}.xlsx`);
    return res.send(Buffer.from(buffer));
  }

  // JSON archive (default) — a self-describing manifest plus the full dataset.
  const counts = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.length : v ? 1 : 0])
  );
  const archive = {
    manifest: {
      application: 'ManpowerPay',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      company: { id: data.company?.id, name: companyName },
      includesAuditLogs: wantAudit,
      counts,
    },
    data,
  };

  if (req.query.download === 'false') {
    // Inline JSON (for a frontend preview) rather than a file download.
    return res.json(new ApiResponse(200, archive));
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=${slug}_export_${stamp}.json`);
  return res.send(JSON.stringify(archive, null, 2));
});
