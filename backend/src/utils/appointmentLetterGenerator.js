import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';
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

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export async function generateAppointmentLetterPDF(employee, company) {
  const empName = employee.user?.name || 'Employee';
  const empCode = employee.empCode;
  const designation = employee.designation;
  const doj = employee.dateOfJoining ? format(new Date(employee.dateOfJoining), 'dd MMMM yyyy') : '-';
  const ctc = formatINR(employee.annualCTC);
  const issueDate = format(new Date(), 'dd MMMM yyyy');

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [60, 60, 60, 60],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: DARK, lineHeight: 1.5 },

    content: [
      {
        columns: [
          {
            stack: [
              { text: company.name || 'ManpowerPay HMS', style: 'companyName' },
              { text: company.registeredAddress || '', style: 'companyAddr' },
            ]
          }
        ],
        margin: [0, 0, 0, 40]
      },

      { text: `Date: ${issueDate}`, alignment: 'right', margin: [0, 0, 0, 20] },

      {
        stack: [
          { text: 'To,', bold: true },
          { text: empName, bold: true },
          { text: `Employee ID: ${empCode}` },
          { text: employee.address || '', italics: true },
        ],
        margin: [0, 0, 0, 30]
      },

      { text: 'Subject: Letter of Appointment', style: 'subject', decoration: 'underline' },

      { text: `Dear ${empName},`, margin: [0, 20, 0, 10] },

      {
        text: [
          'With reference to your application and subsequent interview you had with us, we are pleased to appoint you as ',
          { text: designation, bold: true },
          ' in our organization on the following terms and conditions:'
        ],
        margin: [0, 0, 0, 15]
      },

      {
        ol: [
          {
            text: [
              { text: 'Date of Joining: ', bold: true },
              `Your appointment is effective from your date of joining, which is `,
              { text: doj, bold: true },
              '.'
            ]
          },
          {
            text: [
              { text: 'Remuneration: ', bold: true },
              `Your Total Cost to Company (CTC) will be `,
              { text: ctc, bold: true },
              ' per annum. The detailed breakup of your salary will be provided to you separately.'
            ]
          },
          {
            text: [
              { text: 'Probation: ', bold: true },
              'You will be on probation for a period of six months from the date of joining. Your services will be confirmed in writing subject to your satisfactory performance during the probation period.'
            ]
          },
          {
            text: [
              { text: 'Notice Period: ', bold: true },
              'During probation, either party can terminate the services by giving 15 days notice. Post confirmation, the notice period will be 30 days.'
            ]
          },
          {
            text: [
              { text: 'Roles and Responsibilities: ', bold: true },
              'Your duties and responsibilities will be as explained to you by your department head. You are expected to perform your duties with diligence and integrity.'
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      { text: 'We welcome you to our team and look forward to a long and mutually beneficial association.', margin: [0, 0, 0, 40] },

      {
        columns: [
          {
            stack: [
              { text: 'For ' + (company.name || 'ManpowerPay HMS'), bold: true },
              { text: '\n\n\n\n' },
              { text: 'Authorized Signatory', bold: true }
            ]
          },
          {
            stack: [
              { text: 'Accepted By', bold: true, alignment: 'right' },
              { text: '\n\n\n\n' },
              { text: empName, bold: true, alignment: 'right' }
            ]
          }
        ]
      },

      { text: '\n\n[TERMS AND CONDITIONS APPLY]', style: 'footer', alignment: 'center' }
    ],

    styles: {
      companyName: { fontSize: 16, bold: true, color: BLUE },
      companyAddr: { fontSize: 8, color: '#666666' },
      subject: { fontSize: 11, bold: true, alignment: 'center', margin: [0, 10, 0, 10] },
      footer: { fontSize: 8, color: '#999999', italics: true, margin: [0, 50, 0, 0] }
    }
  };

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}
