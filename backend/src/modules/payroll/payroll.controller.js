import prisma from '../../config/db.js';
import { getDaysInMonth, eachDayOfInterval } from 'date-fns';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { calculatePayroll } from './payroll.engine.js';
import { logAudit } from '../../utils/auditLog.js';
import { isSunday, dateKey } from '../../utils/dates.js';
import { generateForm16ForEmployee } from '../payslips/form16.controller.js';
import { notifyAllEmployees } from '../../utils/notify.js';

// GET /api/payroll — list all payroll runs
export const listPayrollRuns = asyncHandler(async (req, res) => {
  const runs = await prisma.payrollRun.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: { _count: { select: { payslips: true } } }
  });
  res.json(new ApiResponse(200, runs));
});

// POST /api/payroll/run — Create or recompute a draft payroll run
export const createPayrollRun = asyncHandler(async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) throw new ApiError(400, 'month and year required');

  // Check for existing locked run
  const existing = await prisma.payrollRun.findUnique({ where: { month_year: { month, year } } });
  if (existing?.status === 'locked') throw new ApiError(400, 'Payroll for this month is already locked');

  const company = await prisma.company.findFirst({ include: { ptSlabs: true } });
  if (!company) throw new ApiError(400, 'Company not configured');

  // Get all active employees
  const employees = await prisma.employee.findMany({
    where: { isActive: true, dateOfJoining: { lte: new Date(year, month - 1, 28) } },
    include: {
      salaryTemplate: { include: { components: { orderBy: { sequence: 'asc' } } } },
      advanceLoans: { where: { status: 'active' } }
    }
  });

  // Working days in month (calendar - Sundays - holidays)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const holidays = await prisma.holiday.findMany({ where: { date: { gte: startDate, lte: endDate } } });
  const holidayDates = new Set(holidays.map(h => dateKey(h.date)));
  const workingDays = company.workingDaysBase === 26
    ? 26
    : allDays.filter(d => !isSunday(d) && !holidayDates.has(dateKey(d))).length;

  // Create/update the run
  const run = await prisma.payrollRun.upsert({
    where: { month_year: { month, year } },
    create: { month, year, status: 'draft' },
    update: { status: 'draft' }
  });

  // Compute payslips for all employees
  const payslipData = await Promise.all(employees.map(async (emp) => {
    const attendance = await prisma.attendance.findMany({
      where: { employeeId: emp.id, date: { gte: startDate, lte: endDate } }
    });

    const present = attendance.filter(a => a.status === 'P').length;
    const halfDay = attendance.filter(a => a.status === 'H').length;
    const paidLeave = attendance.filter(a => a.status === 'PL').length;
    const otHours = attendance.reduce((s, a) => s + (a.otHours || 0), 0);
    const daysWorked = present + (halfDay * 0.5) + paidLeave;
    const lwpDays = Math.max(0, workingDays - daysWorked);

    // TDS info: get total TDS deducted this financial year
    const fyStart = month >= 4 ? new Date(year, 3, 1) : new Date(year - 1, 3, 1);
    const prevPayslips = await prisma.payslip.findMany({
      where: {
        employeeId: emp.id,
        payrollRun: { status: { in: ['approved', 'locked'] } },
        OR: [
          { year: fyStart.getFullYear(), month: { gte: 4 } },
          { year: fyStart.getFullYear() + 1, month: { lte: 3 } }
        ]
      }
    });
    const taxDeductedSoFar = prevPayslips.reduce((s, p) => s + (p.tdsThisMonth || 0), 0);
    const fyMonthsTotal = 12;
    const currentFyMonth = month >= 4 ? month - 3 : month + 9;
    const remainingMonths = fyMonthsTotal - currentFyMonth + 1;

    // Recover EMI for every active loan, capped at each loan's outstanding balance.
    const advanceEmi = emp.advanceLoans.reduce(
      (sum, loan) => sum + Math.min(loan.emi, loan.balanceRemaining), 0
    );

    const result = calculatePayroll({
      employee: emp,
      attendance: { workingDays, daysWorked, otHours, lwpDays },
      company,
      ptSlabs: company.ptSlabs,
      tdsInfo: {
        projectedAnnualTax: emp.tdsProjectedTax ?? 0,
        taxDeductedSoFar,
        remainingMonths
      },
      advanceEmi
    });

    // Omit fields not in the Payslip database model (like basicPayable)
    const { basicPayable, ...dbResult } = result;

    return { employeeId: emp.id, payrollRunId: run.id, month, year, ...dbResult };
  }));

  // Upsert all payslips
  await prisma.$transaction(
    payslipData.map(p =>
      prisma.payslip.upsert({
        where: { employeeId_payrollRunId: { employeeId: p.employeeId, payrollRunId: p.payrollRunId } },
        create: p,
        update: p
      })
    )
  );

  const summary = {
    totalEmployees: payslipData.length,
    totalGross: payslipData.reduce((s, p) => s + p.grossPayable, 0),
    totalDeductions: payslipData.reduce((s, p) => s + p.totalDeductions, 0),
    totalNetPay: payslipData.reduce((s, p) => s + p.netPay, 0),
  };

  await logAudit({ userId: req.user.id, action: 'PAYROLL_RUN', entity: 'payroll_runs', entityId: run.id, newValue: { month, year, ...summary } });
  res.json(new ApiResponse(200, { run, payslips: payslipData, summary }, 'Payroll draft created'));
});

// GET /api/payroll/:runId — Get payroll run with payslips
export const getPayrollRun = asyncHandler(async (req, res) => {
  const run = await prisma.payrollRun.findUnique({
    where: { id: req.params.runId },
    include: {
      payslips: {
        include: { employee: { include: { user: { select: { name: true } } } } },
        orderBy: { netPay: 'desc' }
      }
    }
  });
  if (!run) throw new ApiError(404, 'Payroll run not found');
  res.json(new ApiResponse(200, run));
});

// PATCH /api/payroll/:runId/approve
export const approvePayroll = asyncHandler(async (req, res) => {
  const run = await prisma.payrollRun.findUnique({ where: { id: req.params.runId } });
  if (!run) throw new ApiError(404, 'Run not found');
  if (run.status !== 'draft') throw new ApiError(400, 'Only draft payrolls can be approved');

  await prisma.payrollRun.update({
    where: { id: req.params.runId },
    data: { status: 'approved', approvedById: req.user.id, approvedAt: new Date() }
  });

  await logAudit({ userId: req.user.id, action: 'APPROVE_PAYROLL', entity: 'payroll_runs', entityId: req.params.runId });
  res.json(new ApiResponse(200, null, 'Payroll approved'));
});

// PATCH /api/payroll/:runId/lock — Lock payroll (no more edits)
export const lockPayroll = asyncHandler(async (req, res) => {
  const run = await prisma.payrollRun.findUnique({ where: { id: req.params.runId }, include: { payslips: { include: { employee: { include: { user: true, advanceLoans: { where: { status: 'active' } } } } } } } });
  if (!run) throw new ApiError(404, 'Run not found');
  if (run.status !== 'approved') throw new ApiError(400, 'Only approved payrolls can be locked');

  await prisma.$transaction(async (tx) => {
    // Reduce every active advance loan, flooring the balance at 0.
    for (const payslip of run.payslips) {
      for (const loan of payslip.employee.advanceLoans) {
        const recovered = Math.min(loan.emi, loan.balanceRemaining);
        const newBalance = Math.max(0, loan.balanceRemaining - recovered);
        await tx.advanceLoan.update({
          where: { id: loan.id },
          data: { balanceRemaining: newBalance, status: newBalance <= 0 ? 'closed' : 'active' }
        });
      }
    }

    // Lock attendance for this month
    await tx.attendance.updateMany({
      where: { date: { gte: new Date(run.year, run.month - 1, 1), lte: new Date(run.year, run.month, 0) } },
      data: { isLocked: true }
    });

    await tx.payrollRun.update({ where: { id: run.id }, data: { status: 'locked', lockedAt: new Date() } });
  });

  // Notify all employees their payslip is ready
  await notifyAllEmployees({
    title: 'Payslip Ready 💰',
    message: `Your payslip for ${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][run.month]} ${run.year} is now available.`,
    type: 'payslip_ready',
    entityId: run.id
  });

  // If locking month is March (month === 3), trigger Form 16 generation for all employees
  if (run.month === 3) {
    // Fire-and-forget: generate Form 16 for the financial year
    generateAllForm16ForYear(run.year).catch(err => console.error('Form16 batch error:', err));
  }

  await logAudit({ userId: req.user.id, action: 'LOCK_PAYROLL', entity: 'payroll_runs', entityId: req.params.runId });
  res.json(new ApiResponse(200, null, 'Payroll locked successfully'));
});

// Helper for background generation
async function generateAllForm16ForYear(year) {
  const employees = await prisma.employee.findMany({ where: { isActive: true }, select: { id: true } });
  for (const emp of employees) {
    try { await generateForm16ForEmployee(emp.id, year); } catch (e) { /* ignore single fails */ }
  }
}

// GET /api/payroll/:runId/bank-file — Download NEFT format bank file
export const getBankFile = asyncHandler(async (req, res) => {
  const run = await prisma.payrollRun.findUnique({
    where: { id: req.params.runId },
    include: { payslips: { include: { employee: { include: { user: { select: { name: true } } } } } } }
  });
  if (!run || run.status !== 'locked') throw new ApiError(400, 'Only locked payrolls can be exported');

  const rows = [['Emp Code', 'Employee Name', 'Bank Name', 'Account No', 'IFSC', 'Amount'].join(',')];
  run.payslips.forEach(p => {
    const e = p.employee;
    rows.push([e.empCode, `"${e.user.name}"`, e.bankName || '', e.bankAccountNo || '', e.ifscCode || '', p.netPay].join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=bank_file_${run.month}_${run.year}.csv`);
  res.send(rows.join('\n'));
});
