import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { generatePayslipPDF } from '../../utils/pdfGenerator.js';
import { sendPayslipEmail } from '../../utils/mailer.js';
import { saveFile, getBuffer } from '../../lib/storage.js';

const payslipKey = (empCode, month, year) => `payslips/${empCode}_${month}_${year}.pdf`;

// GET /api/payslips — List payslips (employee: own; admin: all)
export const listPayslips = asyncHandler(async (req, res) => {
  const { employeeId, year } = req.query;
  const where = {};

  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (emp) where.employeeId = emp.id;
  } else {
    if (employeeId) where.employeeId = employeeId;
  }
  if (year) where.year = parseInt(year);

  // Only show payslips from approved or locked payroll runs
  where.payrollRun = { status: { in: ['approved', 'locked'] } };

  const payslips = await prisma.payslip.findMany({
    where,
    include: {
      payrollRun: { select: { status: true } },
      employee: { include: { user: { select: { name: true } } } }
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  res.json(new ApiResponse(200, payslips));
});

// GET /api/payslips/:id — Get one payslip with full details
export const getPayslip = asyncHandler(async (req, res) => {
  const payslip = await prisma.payslip.findUnique({
    where: { id: req.params.id },
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          site: true,
          department: true
        }
      },
      payrollRun: true
    }
  });
  if (!payslip) throw new ApiError(404, 'Payslip not found');

  // Employee can only see their own
  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (emp && payslip.employeeId !== emp.id) throw new ApiError(403, 'Access denied');
  }

  res.json(new ApiResponse(200, payslip));
});

// GET /api/payslips/:id/pdf — Stream PDF download
export const downloadPayslip = asyncHandler(async (req, res) => {
  const payslip = await prisma.payslip.findUnique({
    where: { id: req.params.id },
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          site: true,
          department: true,
          salaryTemplate: true
        }
      },
      payrollRun: true
    }
  });
  if (!payslip) throw new ApiError(404, 'Payslip not found');

  // Access control
  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (emp && payslip.employeeId !== emp.id) throw new ApiError(403, 'Access denied');
  }

  const company = await prisma.company.findFirst();

  // Serve the cached PDF from storage if present
  if (payslip.pdfPath) {
    const cached = await getBuffer(payslip.pdfPath);
    if (cached) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslip.month}_${payslip.year}_${payslip.employee.empCode}.pdf`);
      return res.send(cached);
    }
  }

  // Generate, store, and serve
  const pdfBuffer = await generatePayslipPDF(payslip, payslip.employee, company);
  const key = await saveFile(payslipKey(payslip.employee.empCode, payslip.month, payslip.year), pdfBuffer, 'application/pdf');
  await prisma.payslip.update({ where: { id: payslip.id }, data: { pdfPath: key } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslip.month}_${payslip.year}_${payslip.employee.empCode}.pdf`);
  res.send(pdfBuffer);
});

// POST /api/payslips/run/:runId/email — Admin emails payslips to all employees in a run
export const emailPayslips = asyncHandler(async (req, res) => {
  const run = await prisma.payrollRun.findUnique({
    where: { id: req.params.runId },
    include: {
      payslips: {
        include: {
          employee: {
            include: {
              user: { select: { name: true, email: true } },
              site: true, department: true, salaryTemplate: true
            }
          }
        }
      }
    }
  });
  if (!run) throw new ApiError(404, 'Run not found');
  if (!['approved', 'locked'].includes(run.status)) throw new ApiError(400, 'Run must be approved or locked');

  const company = await prisma.company.findFirst();
  let sent = 0, failed = 0;

  for (const payslip of run.payslips) {
    try {
      const pdfBuffer = await generatePayslipPDF(payslip, payslip.employee, company);
      await sendPayslipEmail(
        payslip.employee.user.email,
        payslip.employee.user.name,
        run.month, run.year, pdfBuffer
      );
      sent++;
    } catch (e) {
      console.error(e);
      failed++;
    }
  }

  res.json(new ApiResponse(200, { sent, failed }, `Payslips emailed: ${sent} sent, ${failed} failed`));
});

// POST /api/payslips/run/:runId/generate-all — Pre-generate all PDFs for a run
export const generateAllPDFs = asyncHandler(async (req, res) => {
  const run = await prisma.payrollRun.findUnique({
    where: { id: req.params.runId },
    include: {
      payslips: {
        include: {
          employee: { include: { user: { select: { name: true } }, site: true, department: true } }
        }
      }
    }
  });
  const company = await prisma.company.findFirst();

  let count = 0;
  for (const payslip of run.payslips) {
    const buf = await generatePayslipPDF(payslip, payslip.employee, company);
    const key = await saveFile(payslipKey(payslip.employee.empCode, run.month, run.year), buf, 'application/pdf');
    await prisma.payslip.update({ where: { id: payslip.id }, data: { pdfPath: key } });
    count++;
  }

  res.json(new ApiResponse(200, { generated: count }, `${count} payslips generated`));
});
