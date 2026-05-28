import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const vfsFonts = require('pdfmake/build/vfs_fonts');

const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  }
};

const printer = new PdfPrinter(fonts);
// pdfmake 0.2.x exports { pdfMake: { vfs: {...} } } — must unwrap correctly
// ✅ Correct
printer.vfs = vfsFonts?.pdfMake?.vfs ?? vfsFonts;

const BLUE = '#1F4E79';
const DARK = '#333333';

export async function generateRelievingLetterPDF(employee, company) {
  const empName = employee.user?.name || 'Employee';
  const empCode = employee.empCode;
  const designation = employee.designation;
  const doj = employee.dateOfJoining ? format(new Date(employee.dateOfJoining), 'dd MMMM yyyy') : '-';
  const dol = employee.dateOfLeaving ? format(new Date(employee.dateOfLeaving), 'dd MMMM yyyy') : '-';
  const issueDate = format(new Date(), 'dd MMMM yyyy');

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [60, 60, 60, 60],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: DARK, lineHeight: 1.6 },

    content: [
      {
        columns: [
          {
            stack: [
              { text: company?.name || 'ManpowerPay HMS', style: 'companyName' },
              { text: company?.registeredAddress || '', style: 'companyAddr' },
            ]
          }
        ],
        margin: [0, 0, 0, 40]
      },

      { text: `Date: ${issueDate}`, alignment: 'right', margin: [0, 0, 0, 20] },

      { text: 'RELIEVING LETTER', style: 'title', alignment: 'center', decoration: 'underline' },

      { text: `Dear ${empName},`, margin: [0, 20, 0, 10] },

      {
        text: [
          'This is to formally confirm that your resignation from the services of ',
          { text: company?.name, bold: true },
          ' has been accepted and you are being relieved from your duties as ',
          { text: designation, bold: true },
          ' effective from the close of business hours on ',
          { text: dol, bold: true },
          '.'
        ],
        margin: [0, 0, 0, 15]
      },

      {
        text: [
          'We further confirm that you joined the organization on ',
          { text: doj, bold: true },
          '. Your association with us has been satisfactory and we appreciate the contributions you made during your tenure.'
        ],
        margin: [0, 0, 0, 15]
      },

      {
        text: 'All your dues have been settled as per the full and final settlement process. You have also handed over all company properties, documents, and information that were in your possession.',
        margin: [0, 0, 0, 15]
      },

      { text: 'We wish you all the very best in your future endeavors.', margin: [0, 20, 0, 40] },

      {
        columns: [
          {
            stack: [
              { text: 'For ' + (company?.name || 'ManpowerPay HMS'), bold: true },
              { text: '\n\n\n\n' },
              { text: 'Authorized Signatory', bold: true }
            ]
          }
        ]
      }
    ],

    styles: {
      companyName: { fontSize: 16, bold: true, color: BLUE },
      companyAddr: { fontSize: 8, color: '#666666' },
      title: { fontSize: 14, bold: true, margin: [0, 10, 0, 10] }
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