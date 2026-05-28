import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { logAudit } from "../../utils/auditLog.js";
import { generateAppointmentLetterPDF } from "../../utils/appointmentLetterGenerator.js";
import { generateRelievingLetterPDF } from "../../utils/relievingLetterGenerator.js";

// GET /api/employees/bulk-template
export const downloadBulkTemplate = asyncHandler(async (req, res) => {
  const filePath = path.join(
    process.cwd(),
    "uploads/templates/employee_bulk_template.xlsx",
  );
  if (!fs.existsSync(filePath)) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Employees");
    sheet.columns = [
      { header: "Employee Name", key: "name", width: 25 },
      { header: "Employee ID", key: "empCode", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Site", key: "site", width: 20 },
      { header: "Joining Date (YYYY-MM-DD)", key: "doj", width: 25 },
      { header: "Annual CTC", key: "annualCTC", width: 15 },
    ];
    sheet.addRow({
      name: "John Doe",
      empCode: "EMP101",
      email: "john@example.com",
      mobile: "9876543210",
      designation: "Software Engineer",
      department: "Engineering",
      site: "Head Office",
      doj: "2024-01-01",
      annualCTC: "600000",
    });
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await workbook.xlsx.writeFile(filePath);
  }
  res.download(filePath);
});

// POST /api/employees/bulk-upload
export const bulkUploadEmployees = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.getWorksheet(1);
  const results = { created: 0, failed: [] };
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    rows.push({
      rowNumber,
      name: row.getCell(1).text,
      empCode: row.getCell(2).text,
      email: row.getCell(3).text,
      mobile: row.getCell(4).text,
      designation: row.getCell(5).text,
      department: row.getCell(6).text,
      site: row.getCell(7).text,
      doj: row.getCell(8).text,
      annualCTC: row.getCell(9).text,
    });
  });
  const hash = await bcrypt.hash("Welcome@1234", 12);
  for (const r of rows) {
    try {
      if (!r.name || !r.email || !r.mobile || !r.empCode)
        throw new Error("Missing required fields");
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: r.email.toLowerCase() }, { mobile: r.mobile }] },
      });
      if (existing) throw new Error("Email or mobile already exists");
      const empExisting = await prisma.employee.findUnique({
        where: { empCode: r.empCode },
      });
      if (empExisting) throw new Error("Employee code already exists");
      const dept = await prisma.department.findFirst({
        where: { name: { equals: r.department, mode: "insensitive" } },
      });
      const site = await prisma.site.findFirst({
        where: { name: { equals: r.site, mode: "insensitive" } },
      });
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: r.name,
            email: r.email.toLowerCase(),
            mobile: r.mobile,
            passwordHash: hash,
            role: "employee",
          },
        });
        await tx.employee.create({
          data: {
            userId: user.id,
            empCode: r.empCode,
            departmentId: dept?.id,
            siteId: site?.id,
            designation: r.designation,
            dateOfJoining: new Date(r.doj),
            annualCTC: Number(r.annualCTC) || 0,
          },
        });
      });
      results.created++;
    } catch (err) {
      results.failed.push({
        row: r.rowNumber,
        empCode: r.empCode,
        reason: err.message,
      });
    }
  }
  res.json(new ApiResponse(200, results, "Bulk upload completed"));
});

// GET /api/employees
export const listEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, siteId, isActive } = req.query;
  const skip = (page - 1) * limit;
  const where = {};
  if (search) {
    where.OR = [
      { empCode: { contains: search, mode: "insensitive" } },
      { designation: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (siteId) where.siteId = siteId;
  if (isActive !== undefined) where.isActive = isActive === "true";
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      include: {
        user: { select: { name: true, email: true, mobile: true } },
        site: true,
        department: true,
        salaryTemplate: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.count({ where }),
  ]);
  res.json(
    new ApiResponse(200, {
      employees,
      total,
      page: Number(page),
      limit: Number(limit),
    }),
  );
});

// GET /api/employees/:id
export const getEmployee = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: { name: true, email: true, mobile: true, isActive: true },
      },
      site: true,
      department: true,
      salaryTemplate: {
        include: { components: { orderBy: { sequence: "asc" } } },
      },
      documents: true,
    },
  });
  if (!emp) throw new ApiError(404, "Employee not found");
  res.json(new ApiResponse(200, emp));
});

// POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    mobile,
    password,
    empCode,
    departmentId,
    siteId,
    salaryTemplateId,
    designation,
    dateOfJoining,
    annualCTC,
    dateOfBirth,
    gender,
    address,
    emergencyContact,
    emergencyPhone,
    pfAccountNo,
    esicNo,
    pan,
    aadhaarNo,
    uanNo,
    bankName,
    bankAccountNo,
    ifscCode,
  } = req.body;
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { mobile }] },
  });
  if (existing) throw new ApiError(400, "Email or mobile already registered");
  const empExisting = await prisma.employee.findUnique({ where: { empCode } });
  if (empExisting) throw new ApiError(400, "Employee code already exists");
  const hash = await bcrypt.hash(password || "Welcome@1234", 12);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        mobile,
        passwordHash: hash,
        role: "employee",
      },
    });
    const emp = await tx.employee.create({
      data: {
        userId: user.id,
        empCode,
        departmentId,
        siteId,
        salaryTemplateId,
        designation,
        dateOfJoining: new Date(dateOfJoining),
        annualCTC: Number(annualCTC) || 0,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        emergencyContact,
        emergencyPhone,
        pfAccountNo,
        esicNo,
        pan,
        aadhaarNo,
        uanNo,
        bankName,
        bankAccountNo,
        ifscCode,
      },
    });
    return { user, emp };
  });
  await logAudit({
    userId: req.user.id,
    action: "CREATE",
    entity: "employees",
    entityId: result.emp.id,
    newValue: req.body,
  });
  res
    .status(201)
    .json(new ApiResponse(201, result, "Employee created successfully"));
});

// PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  });
  if (!emp) throw new ApiError(404, "Employee not found");
  const oldValue = { ...emp };
  const {
    name,
    mobile,
    departmentId,
    siteId,
    salaryTemplateId,
    designation,
    annualCTC,
    dateOfBirth,
    gender,
    address,
    emergencyContact,
    emergencyPhone,
    pfAccountNo,
    esicNo,
    pan,
    aadhaarNo,
    uanNo,
    bankName,
    bankAccountNo,
    ifscCode,
  } = req.body;
  await prisma.$transaction([
    prisma.user.update({ where: { id: emp.userId }, data: { name, mobile } }),
    prisma.employee.update({
      where: { id: req.params.id },
      data: {
        departmentId,
        siteId,
        salaryTemplateId,
        designation,
        annualCTC: Number(annualCTC) || emp.annualCTC,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : emp.dateOfBirth,
        gender,
        address,
        emergencyContact,
        emergencyPhone,
        pfAccountNo,
        esicNo,
        pan,
        aadhaarNo,
        uanNo,
        bankName,
        bankAccountNo,
        ifscCode,
      },
    }),
  ]);
  await logAudit({
    userId: req.user.id,
    action: "UPDATE",
    entity: "employees",
    entityId: req.params.id,
    oldValue,
    newValue: req.body,
  });
  res.json(new ApiResponse(200, null, "Employee updated successfully"));
});

// PATCH /api/employees/:id/status
export const toggleEmployeeStatus = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({
    where: { id: req.params.id },
  });
  if (!emp) throw new ApiError(404, "Employee not found");
  const { isActive, dateOfLeaving, reason } = req.body;
  await prisma.$transaction([
    prisma.employee.update({
      where: { id: req.params.id },
      data: {
        isActive,
        dateOfLeaving: dateOfLeaving ? new Date(dateOfLeaving) : undefined,
      },
    }),
    prisma.user.update({ where: { id: emp.userId }, data: { isActive } }),
  ]);
  await logAudit({
    userId: req.user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entity: "employees",
    entityId: req.params.id,
    newValue: { reason },
  });
  res.json(
    new ApiResponse(
      200,
      null,
      `Employee ${isActive ? "activated" : "deactivated"}`,
    ),
  );
});

// POST /api/employees/:id/documents
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");
  const { type } = req.body;
  await prisma.employeeDocument.create({
    data: { employeeId: req.params.id, type, filePath: req.file.path },
  });
  res.json(new ApiResponse(201, null, "Document uploaded"));
});

// GET /api/employees/meta
export const getMeta = asyncHandler(async (req, res) => {
  const [sites, departments, templates] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.salaryTemplate.findMany({ orderBy: { name: "asc" } }),
  ]);
  res.json(new ApiResponse(200, { sites, departments, templates }));
});

// POST /api/employees/:id/appointment-letter
export const generateAppointmentLetter = asyncHandler(async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true } } },
  });
  if (!employee) throw new ApiError(404, "Employee not found");
  const company = await prisma.company.findFirst();
  if (!company) throw new ApiError(404, "Company not configured");
  const pdfBuffer = await generateAppointmentLetterPDF(employee, company);
  const fileName = `${employee.empCode}_appointment.pdf`;
  const relativePath = `uploads/documents/${fileName}`;
  const filePath = path.join(process.cwd(), relativePath);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, pdfBuffer);
  await prisma.employeeDocument.upsert({
    where: {
      employeeId_type: { employeeId: employee.id, type: "appointment_letter" },
    },
    update: { filePath: relativePath, uploadedAt: new Date() },
    create: {
      employeeId: employee.id,
      type: "appointment_letter",
      filePath: relativePath,
    },
  });
  res.json(
    new ApiResponse(
      200,
      { filePath: relativePath },
      "Appointment letter generated",
    ),
  );
});

// GET /api/employees/:id/appointment-letter
export const downloadAppointmentLetter = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  if (req.user.role === "employee") {
    const emp = await prisma.employee.findUnique({
      where: { userId: req.user.id },
    });
    if (!emp || emp.id !== employeeId) throw new ApiError(403, "Unauthorized");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { name: true } }, department: true, site: true },
  });
  if (!employee) throw new ApiError(404, "Employee not found");

  const company = await prisma.company.findFirst();
  if (!company) throw new ApiError(404, "Company not configured");

  try {
    const pdfBuffer = await generateAppointmentLetterPDF(employee, company);

    // Record issuance for audit trail only — no file stored on disk
    await prisma.employeeDocument.upsert({
      where: {
        employeeId_type: {
          employeeId: employee.id,
          type: "appointment_letter",
        },
      },
      update: { uploadedAt: new Date() },
      create: {
        employeeId: employee.id,
        type: "appointment_letter",
        filePath: "on-demand",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${employee.empCode}_Appointment_Letter.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err.message, err.stack); // real error
    throw new ApiError(500, "PDF generation failed");
  }
});

// GET /api/employees/:id/relieving-letter
export const downloadRelievingLetter = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  if (req.user.role === "employee") {
    const emp = await prisma.employee.findUnique({
      where: { userId: req.user.id },
    });
    if (!emp || emp.id !== employeeId) throw new ApiError(403, "Unauthorized");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { name: true } } },
  });
  if (!employee) throw new ApiError(404, "Employee not found");
  if (!employee.dateOfLeaving)
    throw new ApiError(400, "Employee has not been offboarded yet");

  const company = await prisma.company.findFirst();
  const pdfBuffer = await generateRelievingLetterPDF(employee, company);

  await prisma.employeeDocument.upsert({
    where: {
      employeeId_type: { employeeId: employee.id, type: "relieving_letter" },
    },
    update: { uploadedAt: new Date() },
    create: {
      employeeId: employee.id,
      type: "relieving_letter",
      filePath: "on-demand",
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${employee.empCode}_Relieving_Letter.pdf"`,
  );
  res.send(pdfBuffer);
});
