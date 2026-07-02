import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { saveFile, getBuffer } from '../../lib/storage.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const vfsFonts = require('pdfmake/build/vfs_fonts.js');

// Safely extract the vfs object array
const virtualFileSystem = vfsFonts?.pdfMake?.vfs ?? vfsFonts;

const fonts = {
  vfs: virtualFileSystem,
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

const printer = new PdfPrinter(fonts);

const BLUE = '#1F4E79';
const DARK = '#333333';

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export async function generateForm16PDF(employee, company, year, payslips) {
  const empName = employee?.user?.name || 'Employee';
  const designation = employee?.designation || '-';
  const empCode = employee?.empCode || '-';
  const pan = employee?.pan || '-';
  const companyName = company?.name || 'ManpowerPay HMS';
  const registeredAddress = company?.registeredAddress || '';
  
  const issueDate = format(new Date(), 'dd MMMM yyyy');
  const fyRange = `FY ${year - 1}-${String(year).slice(-2)}`;

  const totalGross = payslips.reduce((s, p) => s + (p.grossPayable || 0), 0);
  const totalTDS = payslips.reduce((s, p) => s + (p.tdsThisMonth || 0), 0);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: 'Roboto', fontSize: 9, color: DARK, lineHeight: 1.4 },

    content: [
      { text: 'SALARY CERTIFICATE / FORM 16 SUMMARY', style: 'header', alignment: 'center' },
      { text: `For the period: ${fyRange}`, alignment: 'center', margin: [0, 5, 0, 20] },

      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                stack: [
                  { text: 'EMPLOYER DETAILS', bold: true, color: BLUE },
                  { text: companyName, bold: true },
                  { text: registeredAddress, fontSize: 8 },
                  { text: `PAN: ${company?.pan || '-'}` },
                ]
              },
              {
                stack: [
                  { text: 'EMPLOYEE DETAILS', bold: true, color: BLUE },
                  { text: empName, bold: true },
                  { text: `Designation: ${designation}` },
                  { text: `PAN: ${pan}` },
                  { text: `Emp Code: ${empCode}` },
                ]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      },

      { text: 'ANNUAL SALARY & TAX SUMMARY', bold: true, color: BLUE, margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 100, 100],
          body: [
            [
              { text: 'Month', bold: true, fillColor: '#F3F4F6' },
              { text: 'Gross Salary (₹)', bold: true, alignment: 'right', fillColor: '#F3F4F6' },
              { text: 'TDS Deducted (₹)', bold: true, alignment: 'right', fillColor: '#F3F4F6' }
            ],
            ...payslips.map(p => {
              // Ensure integer conversions to keep JavaScript date parsing stable
              const parsedYear = parseInt(p.year, 10) || year;
              const parsedMonth = parseInt(p.month, 10) || 1;
              const rowDate = new Date(parsedYear, parsedMonth - 1, 1);
              return [
                { text: isNaN(rowDate.getTime()) ? '-' : format(rowDate, 'MMMM yyyy') },
                { text: formatINR(p.grossPayable), alignment: 'right' },
                { text: formatINR(p.tdsThisMonth), alignment: 'right' }
              ];
            }),
            [
              { text: 'TOTAL ANNUAL', bold: true, fillColor: '#F9FAFB' },
              { text: formatINR(totalGross), bold: true, alignment: 'right', fillColor: '#F9FAFB' },
              { text: formatINR(totalTDS), bold: true, alignment: 'right', fillColor: '#F9FAFB' }
            ]
          ]
        },
        margin: [0, 0, 0, 30]
      },

      {
        stack: [
          { text: 'Declaration:', bold: true },
          { text: `I, on behalf of the company, do hereby certify that a sum of ${formatINR(totalTDS)} has been deducted as income tax from the salary paid to the above-mentioned employee and the same has been deposited to the credit of the Central Government.` }
        ],
        margin: [0, 0, 0, 40]
      },

      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            stack: [
              { text: 'For ' + companyName, bold: true, alignment: 'center' },
              { text: '\n\n\n\n' },
              { text: 'Authorized Signatory', bold: true, alignment: 'center' },
              { text: `Date: ${issueDate}`, fontSize: 8, alignment: 'center' }
            ]
          }
        ]
      }
    ],

    styles: {
      header: { fontSize: 14, bold: true, color: BLUE }
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ── CONTROLLERS ─────────────────────────────────────────────────────────────

export const generateForm16ForEmployee = async (employeeId, year) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { name: true } } }
  });
  if (!employee) throw new Error('Employee not found');

  const company = await prisma.company.findFirst();
  if (!company) throw new Error('Company not configured');

  const payslips = await prisma.payslip.findMany({
    where: {
      employeeId,
      OR: [
        { year: year - 1, month: { gte: 4 } },
        { year: year, month: { lte: 3 } }
      ],
      payrollRun: { status: 'locked' }
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }]
  });

  if (!payslips.length) throw new Error('No locked payslips found for this financial year');

  const totalGross = payslips.reduce((s, p) => s + (p.grossPayable || 0), 0);
  const totalTDS = payslips.reduce((s, p) => s + (p.tdsThisMonth || 0), 0);

  const pdfBuffer = await generateForm16PDF(employee, company, year, payslips);
  const fileName = `${employee.empCode || employeeId}_Form16_${year}.pdf`;
  const key = await saveFile(`form16/${fileName}`, pdfBuffer, 'application/pdf');

  const record = await prisma.form16.upsert({
    where: { employeeId_year: { employeeId, year } },
    update: { pdfPath: key, grossSalary: totalGross, totalTDS, generatedAt: new Date() },
    create: { employeeId, year, pdfPath: key, grossSalary: totalGross, totalTDS }
  });

  return record;
};

export const downloadForm16 = asyncHandler(async (req, res) => {
  const employeeId = req.params.empId;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (!emp || emp.id !== employeeId) throw new ApiError(403, 'Unauthorized access request');
  }

  let record = await prisma.form16.findUnique({ where: { employeeId_year: { employeeId, year } } });
  let buf = record?.pdfPath ? await getBuffer(record.pdfPath) : null;

  // Regenerate if missing from storage.
  if (!buf) {
    try {
      record = await generateForm16ForEmployee(employeeId, year);
      buf = await getBuffer(record.pdfPath);
    } catch (err) {
      throw new ApiError(404, `Form 16 Generation Error: ${err.message}`);
    }
  }
  if (!buf) throw new ApiError(404, 'Form 16 not available');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${employeeId}_Form16_${year}.pdf`);
  res.send(buf);
});

export const generateAllForm16 = asyncHandler(async (req, res) => {
  const year = parseInt(req.body.year, 10) || new Date().getFullYear();
  const employees = await prisma.employee.findMany({ where: { isActive: true }, select: { id: true, empCode: true } });

  const results = { generated: 0, failed: [] };
  
  for (const emp of employees) {
    try {
      await generateForm16ForEmployee(emp.id, year);
      results.generated++;
    } catch (err) {
      results.failed.push({ empCode: emp.empCode, error: err.message });
    }
  }

  res.status(200).json(new ApiResponse(200, results, `Form 16 generation batch complete for ${year}`));
});
