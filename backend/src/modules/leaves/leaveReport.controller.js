import PdfPrinter from "pdfmake";
import { format } from "date-fns";
import prisma from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const vfsFonts = require("pdfmake/build/vfs_fonts.js");

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

export const downloadLeaveReport = asyncHandler(async (req, res) => {
  const { empId } = req.params;
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  // Restrict to admin or own employee account
  if (req.user.role === "employee") {
    const emp = await prisma.employee.findUnique({
      where: { userId: req.user.id },
    });
    if (!emp || emp.id !== empId)
      throw new ApiError(403, "Unauthorized access request");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: empId },
    include: { user: { select: { name: true } }, department: true, site: true },
  });
  if (!employee) throw new ApiError(404, "Employee record not found");

  const company = await prisma.company.findFirst();

  // ✅ Fixed Date Logic: Captures any leave overlapping with the requested year
  const leaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId: empId,
      fromDate: { lte: new Date(year, 11, 31, 23, 59, 59) },
      toDate: { gte: new Date(year, 0, 1, 0, 0, 0) },
    },
    orderBy: { fromDate: "desc" },
  });

  // ✅ Fixed Table Data Logic: Prevents crash by handling zero-record states safely
  const tableBody = [
    [
      { text: "Leave Type", bold: true, fillColor: "#F3F4F6" },
      { text: "From", bold: true, fillColor: "#F3F4F6" },
      { text: "To", bold: true, fillColor: "#F3F4F6" },
      { text: "Days", bold: true, alignment: "center", fillColor: "#F3F4F6" },
      { text: "Status", bold: true, fillColor: "#F3F4F6" },
      { text: "Reason", bold: true, fillColor: "#F3F4F6" },
    ],
  ];

  if (leaves.length === 0) {
    tableBody.push([
      {
        text: "No leave records found for this period.",
        colSpan: 6,
        alignment: "center",
        italics: true,
        color: "#888888",
      },
      "",
      "",
      "",
      "",
      "", // ✅ Required empty strings matching colSpan rule to prevent pdfmake engine crash
    ]);
  } else {
    leaves.forEach((l) => {
      // Map status colors dynamically safely
      const statusStr = (l.status || "pending").toLowerCase();
      let statusColor = "orange";
      if (statusStr === "approved") statusColor = "green";
      if (statusStr === "rejected") statusColor = "red";

      tableBody.push([
        { text: l.leaveType || "-", fontSize: 9 },
        {
          text: l.fromDate ? format(new Date(l.fromDate), "dd MMM yyyy") : "-",
        },
        { text: l.toDate ? format(new Date(l.toDate), "dd MMM yyyy") : "-" },
        { text: l.totalDays ?? 0, alignment: "center" },
        { text: statusStr.toUpperCase(), bold: true, color: statusColor },
        { text: l.reason || "-", fontSize: 8 },
      ]);
    });
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: "Roboto", fontSize: 9, color: DARK },

    content: [
      {
        columns: [
          { text: company?.name || "ManpowerPay HMS", style: "header" },
          {
            text: `LEAVE SUMMARY REPORT - ${year}`,
            alignment: "right",
            bold: true,
          },
        ],
        margin: [0, 0, 0, 20], // ✅ Added margin bottom to space out main title
      },

      {
        table: {
          widths: [90, "*", 80, "*"], // ✅ Four explicit table column widths matching the grid layout
          body: [
            [
              { text: "Employee Name", bold: true },
              { text: employee?.user?.name || "Employee" },
              { text: "Employee ID", bold: true },
              { text: employee?.empCode || "-" },
            ],
            [
              { text: "Department", bold: true },
              { text: employee?.department?.name || "-" },
              { text: "Site", bold: true },
              { text: employee?.site?.name || "-" },
            ],
          ],
        },
        margin: [0, 0, 0, 20], // ✅ Generous 20pt margin to separate details from data table
      },

      { text: "LEAVE RECORDS", bold: true, color: BLUE, margin: [0, 0, 0, 10] }, // ✅ Spaced heading away from data records
      {
        table: {
          headerRows: 1,
          widths: ["*", 70, 70, 40, 60, "*"],
          body: tableBody,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#E5E7EB",
          vLineColor: () => "#E5E7EB",
        },
      },

      {
        text: `\nReport generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        fontSize: 7,
        italics: true,
        alignment: "right",
      },
    ],

    styles: {
      header: { fontSize: 14, bold: true, color: BLUE },
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks = [];

  pdfDoc.on("data", (chunk) => chunks.push(chunk));
  pdfDoc.on("end", () => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Leave_Report_${employee.empCode || empId}_${year}.pdf`,
      );
      res.send(Buffer.concat(chunks));
    }
  });

  pdfDoc.on("error", (err) => {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: `PDF Generation failed: ${err.message}` });
    }
  });

  pdfDoc.end();
});
