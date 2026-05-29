import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const vfsFonts = require('pdfmake/build/vfs_fonts');

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

export async function generateResignationAcceptancePDF(employee, resignation, company) {
  const empName = employee?.user?.name || 'Employee';
  const designation = employee?.designation || 'Employee';
  const companyName = company?.name || 'ManpowerPay HMS';
  const registeredAddress = company?.registeredAddress || '';
  
  const lastWorkingDay = resignation?.lastWorkingDay ? format(new Date(resignation.lastWorkingDay), 'dd MMMM yyyy') : '-';
  const appliedAt = resignation?.appliedAt ? format(new Date(resignation.appliedAt), 'dd MMMM yyyy') : '-';
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
              { text: companyName, style: 'companyName' },
              { text: registeredAddress, style: 'companyAddr' },
            ]
          }
        ],
        margin: [0, 0, 0, 40]
      },

      { text: `Date: ${issueDate}`, alignment: 'right', margin: [0, 0, 0, 20] },

      { text: 'RESIGNATION ACCEPTANCE LETTER', style: 'title', alignment: 'center', decoration: 'underline' },

      { text: `Dear ${empName},`, margin: [0, 20, 0, 10] },

      {
        text: [
          'This is in reference to your resignation letter dated ',
          { text: appliedAt, bold: true },
          ', wherein you expressed your intention to resign from the services of ',
          { text: companyName, bold: true },
          '.'
        ],
        margin: [0, 0, 0, 15]
      },

      {
        text: [
          'We wish to inform you that your resignation has been accepted by the management. Your last working day with the organization will be ',
          { text: lastWorkingDay, bold: true },
          '.'
        ],
        margin: [0, 0, 0, 15]
      },

      {
        text: 'Until your last working day, you are expected to complete all your current assignments and ensure a smooth handover of your responsibilities to the designated personnel. You must also return all company property and assets in your possession.',
        margin: [0, 0, 0, 15]
      },

      {
        text: 'Your final settlement, including any outstanding dues and benefits, will be processed after your last working day, subject to the successful completion of the exit formalities.',
        margin: [0, 0, 0, 15]
      },

      { text: 'We thank you for your contributions to the company and wish you success in your future endeavors.', margin: [0, 20, 0, 40] },

      {
        columns: [
          {
            stack: [
              { text: 'For ' + companyName, bold: true },
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
