import PdfPrinter from "pdfmake";
import { format } from "date-fns";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const vfsFonts = require("pdfmake/build/vfs_fonts");

// Extract VFS mapping safely
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

const BLUE = "#1F4E79";
const DARK = "#333333";
const GRAY = "#F5F5F5";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function monthName(m) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][(m || 1) - 1];
}

export async function generatePayslipPDF(payslip, employee, company) {
  const empName = employee?.user?.name || "Employee";
  const empCode = employee?.empCode || "-";
  const designation = employee?.designation || "-";
  const department = employee?.department?.name || "-";
  const site = employee?.site?.name || "-";
  const pan = employee?.pan || "-";
  const uan = employee?.uanNo || "-";
  const pfNo = employee?.pfAccountNo || "-";
  const esicNo = employee?.esicNo || "-";
  const bankAccount = employee?.bankAccountNo
    ? `XXXX${employee.bankAccountNo.slice(-4)}`
    : "-";
  const bankIfsc = employee?.ifscCode || "-";
  const doj = employee?.dateOfJoining
    ? format(new Date(employee.dateOfJoining), "dd MMM yyyy")
    : "-";
  const payPeriod = `${monthName(payslip?.month)} ${payslip?.year || ""}`;

  const earnings = payslip?.earningsJson || [];
  const deductions = payslip?.deductionsJson || [];
  const employerContrib = payslip?.employerContribJson || [];

  const totalEarnings = earnings.reduce((s, e) => s + (e.amount || 0), 0);
  const totalDeductions = deductions.reduce((s, d) => s + (d.amount || 0), 0);

  const earningRows = earnings.map((e) => [
    { text: e.name || "-", style: "tableCell" },
    { text: formatINR(e.amount), style: "tableCellRight" },
  ]);
  while (earningRows.length < 5)
    earningRows.push([
      { text: "", style: "tableCell" },
      { text: "", style: "tableCellRight" },
    ]);

  const deductionRows = deductions.map((d) => [
    { text: d.name || "-", style: "tableCell" },
    { text: formatINR(d.amount), style: "tableCellRight" },
  ]);
  while (deductionRows.length < 5)
    deductionRows.push([
      { text: "", style: "tableCell" },
      { text: "", style: "tableCellRight" },
    ]);

  // Process employer contribution rows into an aligned layout key-value table
  const contribRows = [];
  for (let i = 0; i < employerContrib.length; i += 2) {
    const item1 = employerContrib[i];
    const item2 = employerContrib[i + 1];
    contribRows.push([
      { text: item1 ? item1.name : "", style: "labelCell" },
      { text: item1 ? formatINR(item1.amount) : "", style: "valueCell" },
      { text: item2 ? item2.name : "", style: "labelCell" },
      { text: item2 ? formatINR(item2.amount) : "", style: "valueCell" },
    ]);
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 36],
    defaultStyle: { font: "Roboto", fontSize: 9, color: DARK },

    content: [
      {
        columns: [
          {
            stack: [
              {
                text: company?.name || "ManpowerPay HMS",
                style: "companyName",
              },
              { text: company?.registeredAddress || "", style: "companyAddr" },
              ...(company?.gstin
                ? [{ text: `GSTIN: ${company.gstin}`, style: "companyAddr" }]
                : []),
            ],
          },
          {
            stack: [
              { text: "SALARY SLIP", style: "slipTitle" },
              { text: `Pay Period: ${payPeriod}`, style: "slipSubtitle" },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 522,
            y2: 0,
            lineWidth: 2,
            lineColor: BLUE,
          },
        ],
      },

      {
        text: "EMPLOYEE DETAILS",
        style: "sectionHeader",
        margin: [0, 8, 0, 4],
      },
      {
        columns: [
          {
            table: {
              widths: [110, 140],
              body: [
                [
                  { text: "Employee Code", style: "labelCell" },
                  { text: empCode, style: "valueCell" },
                ],
                [
                  { text: "Name", style: "labelCell" },
                  { text: empName, style: "valueCell" },
                ],
                [
                  { text: "Designation", style: "labelCell" },
                  { text: designation, style: "valueCell" },
                ],
                [
                  { text: "Department", style: "labelCell" },
                  { text: department, style: "valueCell" },
                ],
                [
                  { text: "Site / Location", style: "labelCell" },
                  { text: site, style: "valueCell" },
                ],
                [
                  { text: "Date of Joining", style: "labelCell" },
                  { text: doj, style: "valueCell" },
                ],
              ],
            },
            layout: "noBorders",
          },
          {
            table: {
              widths: [90, 140],
              body: [
                [
                  { text: "PAN", style: "labelCell" },
                  { text: pan, style: "valueCell" },
                ],
                [
                  { text: "UAN", style: "labelCell" },
                  { text: uan, style: "valueCell" },
                ],
                [
                  { text: "PF Account", style: "labelCell" },
                  { text: pfNo, style: "valueCell" },
                ],
                [
                  { text: "ESIC No", style: "labelCell" },
                  { text: esicNo, style: "valueCell" },
                ],
                [
                  { text: "Bank Account", style: "labelCell" },
                  { text: bankAccount, style: "valueCell" },
                ],
                [
                  { text: "IFSC", style: "labelCell" },
                  { text: bankIfsc, style: "valueCell" },
                ],
              ],
            },
            layout: "noBorders",
          },
        ],
        margin: [0, 0, 0, 8],
      },

      {
        text: "ATTENDANCE SUMMARY",
        style: "sectionHeader",
        margin: [0, 4, 0, 4],
      },
      {
        table: {
          widths: ["*", "*", "*", "*", "*"],
          body: [
            [
              { text: "Working Days", style: "attHeader" },
              { text: "Days Present", style: "attHeader" },
              { text: "OT Hours", style: "attHeader" },
              { text: "LWP Days", style: "attHeader" },
              { text: "Paid Leaves", style: "attHeader" },
            ],
            [
              { text: payslip?.workingDays ?? 0, style: "attValue" },
              { text: payslip?.presentDays ?? 0, style: "attValue" },
              { text: payslip?.otHours ?? 0, style: "attValue" },
              { text: payslip?.lwpDays ?? 0, style: "attValue" },
              {
                text: earnings.find((e) => e.name === "Paid Leave")
                  ? "Yes"
                  : "-",
                style: "attValue",
              },
            ],
          ],
        },
        layout: {
          fillColor: (i) => (i === 0 ? BLUE : GRAY),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#CCCCCC",
          vLineColor: () => "#CCCCCC",
        },
        margin: [0, 0, 0, 8],
      },

      {
        text: "EARNINGS & DEDUCTIONS",
        style: "sectionHeader",
        margin: [0, 4, 0, 4],
      },
      {
        columns: [
          {
            width: "49%",
            table: {
              widths: ["*", 80],
              body: [
                [
                  {
                    text: "Earnings",
                    style: "tableHeader",
                    colSpan: 2,
                    alignment: "center",
                    fillColor: BLUE,
                    color: "white",
                  },
                  "",
                ], // ✅ Fixed colSpan empty string rule
                ...earningRows,
                [
                  { text: "Total Earnings", style: "totalLabel" },
                  { text: formatINR(totalEarnings), style: "totalValue" },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#CCCCCC",
              vLineColor: () => "#CCCCCC",
            },
          },
          { width: "2%", text: "" },
          {
            width: "49%",
            table: {
              widths: ["*", 80],
              body: [
                [
                  {
                    text: "Deductions",
                    style: "tableHeader",
                    colSpan: 2,
                    alignment: "center",
                    fillColor: "#C0392B",
                    color: "white",
                  },
                  "",
                ], // ✅ Fixed colSpan empty string rule
                ...deductionRows,
                [
                  { text: "Total Deductions", style: "totalLabel" },
                  { text: formatINR(totalDeductions), style: "totalValue" },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#CCCCCC",
              vLineColor: () => "#CCCCCC",
            },
          },
        ],
        margin: [0, 0, 0, 8],
      },

      ...(contribRows.length
        ? [
            {
              text: "EMPLOYER CONTRIBUTIONS (Not deducted from salary)",
              style: "sectionHeader",
              margin: [0, 8, 0, 4],
            },
            {
              table: {
                widths: ["*", 100, "*", 100],
                body: contribRows,
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#CCCCCC",
                vLineColor: () => "#CCCCCC",
              },
            },
          ]
        : []), // ✅ Resolved cut-off logic error safely
    ],

    styles: {
      companyName: { fontSize: 14, bold: true, color: BLUE },
      companyAddr: { fontSize: 8, color: "#666666" },
      slipTitle: { fontSize: 14, bold: true, color: BLUE },
      slipSubtitle: { fontSize: 9, color: "#555555" },
      sectionHeader: { fontSize: 10, bold: true, color: BLUE },
      labelCell: {
        fontSize: 8,
        bold: true,
        color: "#555555",
        margin: [2, 2, 2, 2],
      },
      valueCell: { fontSize: 8, color: DARK, margin: [2, 2, 2, 2] },
      attHeader: {
        fontSize: 8,
        bold: true,
        color: "white",
        alignment: "center",
        margin: [2, 4, 2, 4],
      },
      attValue: { fontSize: 8, alignment: "center", margin: [2, 4, 2, 4] },
      tableHeader: { fontSize: 9, bold: true, margin: [2, 4, 2, 4] },
      tableCell: { fontSize: 8, margin: [4, 4, 4, 4] },
      tableCellRight: { fontSize: 8, alignment: "right", margin: [4, 4, 4, 4] },
      totalLabel: {
        fontSize: 8,
        bold: true,
        color: BLUE,
        margin: [4, 4, 4, 4],
      },
      totalValue: {
        fontSize: 8,
        bold: true,
        alignment: "right",
        color: BLUE,
        margin: [4, 4, 4, 4],
      },
    },
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", reject);
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
}
