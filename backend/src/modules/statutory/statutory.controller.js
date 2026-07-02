import prisma from '../../config/db.js';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ExcelJS from 'exceljs';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── EPF ECR (Electronic Challan cum Return) ──────────────────────────────────
// GET /api/statutory/epf-ecr?month=6&year=2026
export const generateEPFECR = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) throw new ApiError(400, 'month and year required');

  const run = await prisma.payrollRun.findFirst({
    where: { month: parseInt(month), year: parseInt(year) },
    include: {
      payslips: {
        include: { employee: { select: { empCode: true, uanNo: true, pfAccountNo: true, pan: true } } }
      }
    }
  });
  if (!run) throw new ApiError(404, 'Payroll run not found for this period');
  if (run.status === 'draft') throw new ApiError(400, 'Payroll must be approved before exporting ECR');

  const company = await prisma.company.findFirst();

  // ECR Format: UAN, Member Name, Gross Wages, EPF Wages (capped 15000), EPS Wages, EPF Contribution, EPS Contribution, Diff in EPF & EPS, NCP days, Refund of Advances
  const rows = run.payslips.map(p => {
    const epfDeduction = p.deductionsJson.find(d => d.name.includes('PF') && !d.name.includes('Employer'));
    const empContrib = p.employerContribJson.find(d => d.name.includes('Employer PF'));

    const epfWages = Math.min(p.earningsJson.find(e => e.name === 'Basic')?.amount || 0, 15000);
    const epfContrib = epfDeduction?.amount || 0;
    const epsContrib = Math.min(epfWages * 0.0833, 1250); // EPS = 8.33% capped at ₹1,250
    const epfDiff = epfContrib - epsContrib;

    return {
      uan: p.employee.uanNo || '',
      memberName: '', // Will be filled from UAN portal
      grossWages: p.grossPayable,
      epfWages,
      epsWages: epfWages,
      edliWages: epfWages,
      eeShare: Math.round(epfContrib * 100) / 100,
      erShare: Math.round((empContrib?.amount || 0) * 100) / 100,
      eps: Math.round(epsContrib * 100) / 100,
      ncpDays: p.lwpDays || 0,
      refund: 0
    };
  });

  // Generate ECR text file (EPFO prescribed format)
  const header = `#~#${company?.epfCode || 'XXXX'}#~#${format(new Date(year, month - 1, 1), 'MM/yyyy')}#~#`;
  const lines = rows.map((r, i) =>
    `${i + 1}#~#${r.uan}#~#${r.memberName}#~#${r.grossWages}#~#${r.epfWages}#~#${r.epsWages}#~#${r.edliWages}#~#${r.eeShare}#~#${r.erShare}#~#${r.eps}#~#${r.ncpDays}#~#${r.refund}#~#`
  );

  const content = [header, ...lines].join('\n');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=EPF_ECR_${month}_${year}.txt`);
  res.send(content);
});

// ── ESIC Contribution Statement ───────────────────────────────────────────────
// GET /api/statutory/esic?month=6&year=2026
export const generateESIC = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const run = await prisma.payrollRun.findFirst({
    where: { month: parseInt(month), year: parseInt(year) },
    include: {
      payslips: {
        include: {
          employee: { select: { empCode: true, esicNo: true, uanNo: true, user: { select: { name: true } } } }
        }
      }
    }
  });
  if (!run) throw new ApiError(404, 'Payroll run not found');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('ESIC Contribution');

  sheet.columns = [
    { header: 'ESIC IP No', key: 'esicNo', width: 20 },
    { header: 'Employee Name', key: 'name', width: 25 },
    { header: 'Emp Code', key: 'empCode', width: 15 },
    { header: 'Gross Wages', key: 'grossWages', width: 15 },
    { header: 'Employee ESIC (0.75%)', key: 'eeEsic', width: 22 },
    { header: 'Employer ESIC (3.25%)', key: 'erEsic', width: 22 },
    { header: 'Total ESIC', key: 'total', width: 15 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };

  run.payslips
    .filter(p => p.grossPayable <= 21000) // Only ESIC eligible
    .forEach((p, i) => {
      const eeEsic = p.deductionsJson.find(d => d.name.includes('ESIC'))?.amount || 0;
      const erEsic = p.employerContribJson.find(d => d.name.includes('ESIC'))?.amount || 0;
      sheet.addRow({
        esicNo: p.employee.esicNo || '',
        name: p.employee.user?.name || '',
        empCode: p.employee.empCode,
        grossWages: p.grossPayable,
        eeEsic, erEsic,
        total: Math.round((eeEsic + erEsic) * 100) / 100
      });
      if (i % 2 === 0) {
        sheet.getRow(i + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FF' } };
      }
    });

  // Totals row
  const lastRow = sheet.lastRow.number + 1;
  sheet.addRow({
    esicNo: 'TOTAL', grossWages: { formula: `SUM(D2:D${lastRow - 1})` },
    eeEsic: { formula: `SUM(E2:E${lastRow - 1})` },
    erEsic: { formula: `SUM(F2:F${lastRow - 1})` },
    total: { formula: `SUM(G2:G${lastRow - 1})` }
  });
  sheet.getRow(lastRow).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=ESIC_${month}_${year}.xlsx`);
  res.send(buffer);
});

// ── Professional Tax Challan ──────────────────────────────────────────────────
// GET /api/statutory/pt?month=6&year=2026
export const generatePTChallan = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const run = await prisma.payrollRun.findFirst({
    where: { month: parseInt(month), year: parseInt(year) },
    include: {
      payslips: {
        include: { employee: { include: { user: { select: { name: true } } } } }
      }
    }
  });
  if (!run) throw new ApiError(404, 'Payroll run not found');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('PT Challan');
  const company = await prisma.company.findFirst();

  // Header info
  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = `PROFESSIONAL TAX CHALLAN — ${format(new Date(year, month - 1, 1), 'MMMM yyyy')}`;
  sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.addRow([]);
  sheet.addRow(['Company:', company?.name, '', 'State:', company?.ptState]);
  sheet.addRow([]);

  sheet.addRow(['Emp Code', 'Employee Name', 'Gross Salary', 'PT Amount', 'Month']);
  sheet.getRow(5).font = { bold: true };
  sheet.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };

  let totalPT = 0;
  run.payslips.forEach(p => {
    const pt = p.deductionsJson.find(d => d.name.includes('Professional Tax'))?.amount || 0;
    if (pt > 0) {
      sheet.addRow([p.employee.empCode, p.employee.user?.name, p.grossPayable, pt, `${month}/${year}`]);
      totalPT += pt;
    }
  });
  sheet.addRow(['', 'TOTAL PT', '', totalPT, '']);
  sheet.lastRow.font = { bold: true };

  ['A', 'B', 'C', 'D', 'E'].forEach(col => { sheet.getColumn(col).width = col === 'B' ? 25 : 15; });

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=PT_Challan_${month}_${year}.xlsx`);
  res.send(buffer);
});
