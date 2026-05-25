import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfMakeFonts = require('pdfmake/build/vfs_fonts.js');

const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  }
};

const printer = new PdfPrinter(fonts);
printer.vfs = pdfMakeFonts;

const BLUE = '#1F4E79';
const DARK = '#333333';

export const downloadLeaveReport = asyncHandler(async (req, res) => {
  const { empId } = req.params;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Restrict to admin or own employee
  if (req.user.role === 'employee') {
    const emp = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (!emp || emp.id !== empId) throw new ApiError(403, 'Unauthorized');
  }

  const employee = await prisma.employee.findUnique({
    where: { id: empId },
    include: { user: { select: { name: true } }, department: true, site: true }
  });
  if (!employee) throw new ApiError(404, 'Employee not found');

  const company = await prisma.company.findFirst();

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId: empId,
      fromDate: { gte: new Date(year, 0, 1) },
      toDate: { lte: new Date(year, 11, 31) }
    },
    orderBy: { fromDate: 'desc' }
  });

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: 'Roboto', fontSize: 9, color: DARK },

    content: [
      {
        columns: [
          { text: company?.name || 'ManpowerPay HMS', style: 'header' },
          { text: `LEAVE SUMMARY REPORT - ${year}`, alignment: 'right', bold: true }
        ],
        margin: [0, 0, 0, 20]
      },

      {
        table: {
          widths: [80, '*', 80, '*'],
          body: [
            [{ text: 'Employee Name', bold: true }, employee.user.name, { text: 'Employee ID', bold: true }, employee.empCode],
            [{ text: 'Department', bold: true }, employee.department?.name || '-', { text: 'Site', bold: true }, employee.site?.name || '-']
          ]
        },
        margin: [0, 0, 0, 20]
      },

      { text: 'LEAVE RECORDS', bold: true, color: BLUE, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 70, 70, 40, 60, '*'],
          body: [
            [
              { text: 'Leave Type', bold: true, fillColor: '#F3F4F6' },
              { text: 'From', bold: true, fillColor: '#F3F4F6' },
              { text: 'To', bold: true, fillColor: '#F3F4F6' },
              { text: 'Days', bold: true, alignment: 'center', fillColor: '#F3F4F6' },
              { text: 'Status', bold: true, fillColor: '#F3F4F6' },
              { text: 'Reason', bold: true, fillColor: '#F3F4F6' }
            ],
            ...leaves.map(l => [
              l.leaveType,
              format(new Date(l.fromDate), 'dd MMM yyyy'),
              format(new Date(l.toDate), 'dd MMM yyyy'),
              { text: l.totalDays, alignment: 'center' },
              { text: l.status.toUpperCase(), bold: true, color: l.status === 'approved' ? 'green' : l.status === 'rejected' ? 'red' : 'orange' },
              { text: l.reason, fontSize: 8 }
            ])
          ]
        }
      },

      { text: `\nReport generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, fontSize: 7, italics: true, alignment: 'right' }
    ],

    styles: {
      header: { fontSize: 14, bold: true, color: BLUE }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks = [];
  pdfDoc.on('data', (chunk) => chunks.push(chunk));
  pdfDoc.on('end', () => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Leave_Report_${employee.empCode}_${year}.pdf`);
    res.send(Buffer.concat(chunks));
  });
  pdfDoc.end();
});
