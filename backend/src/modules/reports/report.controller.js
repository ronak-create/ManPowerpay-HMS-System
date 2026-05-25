import prisma from '../../config/db.js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import ExcelJS from 'exceljs';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── MONTHLY ATTENDANCE REGISTER ───────────────────────────────────────────────
// GET /api/reports/attendance?month=6&year=2026&siteId=xxx
export const attendanceReport = asyncHandler(async (req, res) => {
  const { month, year, siteId, format: fmt = 'json' } = req.query;

  const where = { isActive: true };
  if (siteId) where.siteId = siteId;

  const employees = await prisma.employee.findMany({
    where,
    include: { user: { select: { name: true } }, site: true }
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  const attendance = await prisma.attendance.findMany({
    where: {
      employeeId: { in: employees.map(e => e.id) },
      date: { gte: startDate, lte: endDate }
    }
  });

  const attMap = {};
  attendance.forEach(a => {
    if (!attMap[a.employeeId]) attMap[a.employeeId] = {};
    attMap[a.employeeId][format(a.date, 'dd')] = a.status;
  });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  if (fmt === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Register');

    const headers = ['Emp Code', 'Name', 'Site', ...days.map(d => format(d, 'd')), 'P', 'A', 'H', 'PL', 'WO', 'HO', 'Working Days'];
    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };

    employees.forEach((emp, i) => {
      const dayStatuses = days.map(d => attMap[emp.id]?.[format(d, 'dd')] || '');
      const p = dayStatuses.filter(s => s === 'P').length;
      const a = dayStatuses.filter(s => s === 'A').length;
      const h = dayStatuses.filter(s => s === 'H').length;
      const pl = dayStatuses.filter(s => s === 'PL').length;
      const wo = dayStatuses.filter(s => s === 'WO').length;
      const ho = dayStatuses.filter(s => s === 'HO').length;

      sheet.addRow([emp.empCode, emp.user?.name, emp.site?.name || '-', ...dayStatuses, p, a, h, pl, wo, ho, p + (h * 0.5) + pl]);
      if (i % 2 === 0) sheet.getRow(i + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    });

    sheet.columns.forEach((col, i) => { col.width = i < 3 ? 18 : 4; });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${month}_${year}.xlsx`);
    return res.send(Buffer.from(buffer));
  }

  // JSON for frontend table
  const data = employees.map(emp => {
    const statuses = days.reduce((acc, d) => { acc[format(d, 'dd')] = attMap[emp.id]?.[format(d, 'dd')] || null; return acc; }, {});
    const p = Object.values(statuses).filter(s => s === 'P').length;
    const h = Object.values(statuses).filter(s => s === 'H').length;
    const pl = Object.values(statuses).filter(s => s === 'PL').length;
    return { emp, statuses, summary: { p, h, pl, a: Object.values(statuses).filter(s => s === 'A').length, workingDays: p + (h * 0.5) + pl } };
  });

  res.json(new ApiResponse(200, { data, days: days.map(d => format(d, 'd')), month, year }));
});

// ── PAYROLL SUMMARY REPORT ────────────────────────────────────────────────────
// GET /api/reports/payroll-summary?month=6&year=2026&format=excel
export const payrollSummaryReport = asyncHandler(async (req, res) => {
  const { month, year, format: fmt = 'json' } = req.query;
  const run = await prisma.payrollRun.findUnique({
    where: { month_year: { month: parseInt(month), year: parseInt(year) } },
    include: {
      payslips: {
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              department: true, site: true
            }
          }
        }
      }
    }
  });
  if (!run) throw new ApiError(404, 'Payroll run not found');

  if (fmt === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payroll Summary');

    const headers = ['Emp Code', 'Name', 'Department', 'Site', 'Working Days', 'Days Worked', 'OT Hours', 'LWP Days', 'Gross Pay', 'EPF (EE)', 'ESIC (EE)', 'PT', 'TDS', 'Advance', 'Total Deductions', 'Net Pay'];
    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };

    run.payslips.forEach((p, i) => {
      const getDeduction = (name) => p.deductionsJson.find(d => d.name.toLowerCase().includes(name.toLowerCase()))?.amount || 0;
      sheet.addRow([
        p.employee.empCode, p.employee.user?.name, p.employee.department?.name, p.employee.site?.name,
        p.workingDays, p.presentDays, p.otHours, p.lwpDays,
        p.grossPayable, getDeduction('PF'), getDeduction('ESIC'), getDeduction('Tax'), getDeduction('TDS'),
        getDeduction('Advance'), p.totalDeductions, p.netPay
      ]);
      if (i % 2 === 0) sheet.getRow(i + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    });

    // Totals
    const lr = sheet.lastRow.number + 1;
    sheet.addRow(['', 'TOTAL', '', '', '', '', '', '', '', { formula: `SUM(I2:I${lr - 1})` }, '', '', '', '', '', { formula: `SUM(O2:O${lr - 1})` }, { formula: `SUM(P2:P${lr - 1})` }]);
    sheet.getRow(lr).font = { bold: true };

    sheet.columns.forEach((col, i) => { col.width = i < 4 ? 20 : 14; });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Payroll_Summary_${month}_${year}.xlsx`);
    return res.send(Buffer.from(buffer));
  }

  res.json(new ApiResponse(200, run));
});

export const payrollTrend = asyncHandler(async (req, res) => {
  const today = new Date();
  const trend = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      return prisma.payrollRun.findUnique({
        where: { month_year: { month: d.getMonth() + 1, year: d.getFullYear() } },
        include: { payslips: { select: { netPay: true } } }
      }).then(run => ({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()],
        netPay: run ? run.payslips.reduce((s, p) => s + p.netPay, 0) : 0,
        status: run?.status || null
      }));
    })
  );
  res.json(new ApiResponse(200, trend));
});

// ── HEADCOUNT REPORT ──────────────────────────────────────────────────────────
export const headcountReport = asyncHandler(async (req, res) => {
  const { siteId, isActive = 'true' } = req.query;
  const where = { isActive: isActive === 'true' };
  if (siteId) where.siteId = siteId;

  const employees = await prisma.employee.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, mobile: true } },
      site: true, department: true,
      salaryTemplate: true
    },
    orderBy: { empCode: 'asc' }
  });

  const { format: fmt = 'json' } = req.query;
  if (fmt === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Headcount');
    sheet.columns = [
      { header: 'Emp Code', key: 'empCode', width: 12 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Department', key: 'dept', width: 18 },
      { header: 'Site', key: 'site', width: 18 },
      { header: 'Date of Joining', key: 'doj', width: 15 },
      { header: 'Annual CTC', key: 'ctc', width: 14 },
      { header: 'Status', key: 'status', width: 10 },
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };

    employees.forEach(e => {
      sheet.addRow({
        empCode: e.empCode, name: e.user?.name, mobile: e.user?.mobile, email: e.user?.email,
        designation: e.designation, dept: e.department?.name, site: e.site?.name,
        doj: e.dateOfJoining ? format(new Date(e.dateOfJoining), 'dd/MM/yyyy') : '',
        ctc: e.annualCTC, status: e.isActive ? 'Active' : 'Inactive'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Headcount_Report.xlsx');
    return res.send(Buffer.from(buffer));
  }

  res.json(new ApiResponse(200, { employees, total: employees.length }));
});

// ── SALARY ADVANCE LEDGER ─────────────────────────────────────────────────────
export const advanceLedger = asyncHandler(async (req, res) => {
  const { outstandingOnly = 'false' } = req.query;
  const where = {};
  if (outstandingOnly === 'true') where.status = 'active';

  const loans = await prisma.advanceLoan.findMany({
    where,
    include: { employee: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(new ApiResponse(200, loans));
});

// ── AUDIT LOG REPORT ──────────────────────────────────────────────────────────
export const auditReport = asyncHandler(async (req, res) => {
  const { userId, action, entity, from, to, page = 1, limit = 100 } = req.query;
  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (entity) where.entity = entity;
  if (from && to) where.createdAt = { gte: new Date(from), lte: new Date(to) };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip: (page - 1) * limit, take: Number(limit),
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count({ where })
  ]);

  res.json(new ApiResponse(200, { logs, total }));
});

// ── ADMIN DASHBOARD STATS ─────────────────────────────────────────────────────
export const dashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const [totalEmployees, activeEmployees, totalSites, currentRun, todayAttendance] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.site.count(),
    prisma.payrollRun.findFirst({ orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
    prisma.attendance.findMany({ where: { date: new Date(todayStr) } })
  ]);

  const presentToday = todayAttendance.filter(a => a.status === 'P').length;
  const absentToday = todayAttendance.filter(a => a.status === 'A').length;

  const pendingLeaves = await prisma.leaveRequest.count({ where: { status: 'pending' } });

  // Monthly payroll trend (last 6 months)
  const trend = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return prisma.payrollRun.findUnique({
        where: { month_year: { month: d.getMonth() + 1, year: d.getFullYear() } },
        include: { _count: { select: { payslips: true } } }
      }).then(run => ({ month: d.getMonth() + 1, year: d.getFullYear(), run }));
    })
  );

  res.json(new ApiResponse(200, {
    totalEmployees, activeEmployees, totalSites,
    presentToday, absentToday, pendingLeaves,
    currentRun, trend: trend.reverse()
  }));
});
