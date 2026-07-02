import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { logAudit } from "../../utils/auditLog.js";
import { generateTempPassword } from "../../utils/password.js";
import { saveFile } from "../../lib/storage.js";
import { generateAppointmentLetterPDF } from "../../utils/appointmentLetterGenerator.js";
import { generateRelievingLetterPDF } from "../../utils/relievingLetterGenerator.js";

// GET /api/employees/bulk-template
export const downloadBulkTemplate = asyncHandler(async (req, res) => {
  const filePath = path.join(
    process.cwd(),
    "uploads/templates/employee_bulk_template.xlsx",
  );
  
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Employees");
  sheet.columns = [
    { header: "Employee Name*", key: "name", width: 25 },
    { header: "Employee ID*", key: "empCode", width: 15 },
    { header: "Email*", key: "email", width: 25 },
    { header: "Mobile*", key: "mobile", width: 15 },
    { header: "Designation*", key: "designation", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Site", key: "site", width: 20 },
    { header: "Salary Template", key: "salaryTemplate", width: 20 },
    { header: "Joining Date* (YYYY-MM-DD)", key: "doj", width: 25 },
    { header: "Annual CTC*", key: "annualCTC", width: 15 },
    { header: "Date of Birth (YYYY-MM-DD)", key: "dob", width: 25 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Address", key: "address", width: 30 },
    { header: "Emergency Contact", key: "emergencyContact", width: 20 },
    { header: "Emergency Phone", key: "emergencyPhone", width: 15 },
    { header: "Bank Name", key: "bankName", width: 20 },
    { header: "Account Number", key: "bankAccountNo", width: 20 },
    { header: "IFSC Code", key: "ifscCode", width: 15 },
    { header: "PF Account No", key: "pfAccountNo", width: 20 },
    { header: "UAN No", key: "uanNo", width: 15 },
    { header: "ESIC No", key: "esicNo", width: 15 },
    { header: "PAN", key: "pan", width: 15 },
    { header: "Aadhaar No", key: "aadhaarNo", width: 20 },
    { header: 'EPF Applicable (true/false/blank)', key: 'epfApplicable', width: 30 },
    { header: 'ESIC Applicable (true/false/blank)', key: 'esicApplicable', width: 30 },
    { header: 'PT Applicable (true/false/blank)', key: 'ptApplicable', width: 30 },
    { header: 'TDS Projected Annual Tax', key: 'tdsProjectedTax', width: 25 },
  ];

  sheet.addRow({
    name: "John Doe",
    empCode: "EMP101",
    email: "john@example.com",
    mobile: "9876543210",
    designation: "Software Engineer",
    department: "Engineering",
    site: "Head Office",
    salaryTemplate: "Standard Template",
    doj: "2024-01-01",
    annualCTC: "600000",
    dob: "1995-05-15",
    gender: "Male",
    address: "123 Main St, City",
    emergencyContact: "Jane Doe",
    emergencyPhone: "9876543211",
    bankName: "HDFC Bank",
    bankAccountNo: "50100123456789",
    ifscCode: "HDFC0001234",
    pfAccountNo: "MH/PUN/12345/678",
    uanNo: "100123456789",
    esicNo: "31123456780011001",
    pan: "ABCDE1234F",
    aadhaarNo: "123456789012",
    epfApplicable: '',
    esicApplicable: '',
    ptApplicable: '',
    tdsProjectedTax: '',
  });

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await workbook.xlsx.writeFile(filePath);
  res.download(filePath);
});

// POST /api/employees/bulk-upload — parse and validate Excel
export const bulkUploadEmployees = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.getWorksheet(1);
  const rows = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    rows.push({
      rowNumber,
      name: row.getCell(1).text?.trim(),
      empCode: row.getCell(2).text?.trim(),
      email: row.getCell(3).text?.trim(),
      mobile: row.getCell(4).text?.trim(),
      designation: row.getCell(5).text?.trim(),
      department: row.getCell(6).text?.trim(),
      site: row.getCell(7).text?.trim(),
      salaryTemplate: row.getCell(8).text?.trim(),
      doj: row.getCell(9).text?.trim(),
      annualCTC: row.getCell(10).text?.trim(),
      dob: row.getCell(11).text?.trim(),
      gender: row.getCell(12).text?.trim(),
      address: row.getCell(13).text?.trim(),
      emergencyContact: row.getCell(14).text?.trim(),
      emergencyPhone: row.getCell(15).text?.trim(),
      bankName: row.getCell(16).text?.trim(),
      bankAccountNo: row.getCell(17).text?.trim(),
      ifscCode: row.getCell(18).text?.trim(),
      pfAccountNo: row.getCell(19).text?.trim(),
      uanNo: row.getCell(20).text?.trim(),
      esicNo: row.getCell(21).text?.trim(),
      pan: row.getCell(22).text?.trim(),
      aadhaarNo: row.getCell(23).text?.trim(),
      epfApplicable: row.getCell(24).text?.trim(),
      esicApplicable: row.getCell(25).text?.trim(),
      ptApplicable: row.getCell(26).text?.trim(),
      tdsProjectedTax: row.getCell(27).text?.trim(),
    });
  });

  const validatedRows = [];
  const [existingUsers, existingEmps, depts, sites, templates] = await Promise.all([
    prisma.user.findMany({ select: { email: true, mobile: true } }),
    prisma.employee.findMany({ select: { empCode: true } }),
    prisma.department.findMany(),
    prisma.site.findMany(),
    prisma.salaryTemplate.findMany(),
  ]);

  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
  const existingMobiles = new Set(existingUsers.map(u => u.mobile));
  const existingCodes = new Set(existingEmps.map(e => e.empCode));

  for (const r of rows) {
    const errors = [];
    if (!r.name) errors.push("Name is required");
    if (!r.empCode) errors.push("Employee ID is required");
    if (!r.email) errors.push("Email is required");
    if (!r.mobile) errors.push("Mobile is required");
    if (!r.doj) errors.push("Joining Date is required");

    if (r.email && existingEmails.has(r.email.toLowerCase())) errors.push("Email already exists");
    if (r.mobile && existingMobiles.has(r.mobile)) errors.push("Mobile already exists");
    if (r.empCode && existingCodes.has(r.empCode)) errors.push("Employee ID already exists");

    const dept = depts.find(d => d.name.toLowerCase() === r.department?.toLowerCase());
    const site = sites.find(s => s.name.toLowerCase() === r.site?.toLowerCase());
    const template = templates.find(t => t.name.toLowerCase() === r.salaryTemplate?.toLowerCase());

    const info = [];
    if (r.department && !dept) info.push(`Department "${r.department}" will be created`);
    if (r.site && !site) info.push(`Site "${r.site}" will be created`);
    
    if (r.salaryTemplate && !template) errors.push(`Salary Template "${r.salaryTemplate}" not found`);

    validatedRows.push({
      ...r,
      id: Math.random().toString(36).substr(2, 9), // temp frontend id
      isValid: errors.length === 0,
      errors,
      info,
      departmentId: dept?.id,
      siteId: site?.id,
      salaryTemplateId: template?.id,
    });
  }

  res.json(new ApiResponse(200, validatedRows));
});

// POST /api/employees/bulk-finalize — save the validated list
export const finalizeBulkUpload = asyncHandler(async (req, res) => {
  const { employees } = req.body;
  if (!employees || !Array.isArray(employees)) throw new ApiError(400, "Invalid data");

  const results = { created: 0, failed: [], credentials: [] };
  const company = await prisma.company.findFirst();
  if (!company) throw new ApiError(404, "Company not configured");

  // Caches to avoid redundant DB calls during the loop
  const deptCache = {};
  const siteCache = {};

  for (const r of employees) {
    try {
      // Re-verify uniqueness
      const conflict = await prisma.user.findFirst({
        where: { OR: [{ email: r.email.toLowerCase() }, { mobile: r.mobile }] }
      });
      if (conflict) throw new Error("Email or mobile already exists");

      const codeConflict = await prisma.employee.findUnique({ where: { empCode: r.empCode } });
      if (codeConflict) throw new Error("Employee ID already exists");

      let finalDeptId = r.departmentId;
      let finalSiteId = r.siteId;

      // Find or create Department
      if (!finalDeptId && r.department) {
        const normalizedDept = r.department.trim();
        if (deptCache[normalizedDept.toLowerCase()]) {
          finalDeptId = deptCache[normalizedDept.toLowerCase()];
        } else {
          const dept = await prisma.department.upsert({
            where: { id: 'unknown' }, // hack to use upsert with name-based finding
            create: { name: normalizedDept, companyId: company.id },
            update: {}, // Not used if not found
          });
          // Note: prisma upsert needs a unique field. Department name is NOT unique in schema.
          // Let's use findFirst then create.
          const existingDept = await prisma.department.findFirst({
            where: { name: { equals: normalizedDept, mode: 'insensitive' } }
          });
          if (existingDept) {
            finalDeptId = existingDept.id;
          } else {
            const newDept = await prisma.department.create({
              data: { name: normalizedDept, companyId: company.id }
            });
            finalDeptId = newDept.id;
          }
          deptCache[normalizedDept.toLowerCase()] = finalDeptId;
        }
      }

      // Find or create Site
      if (!finalSiteId && r.site) {
        const normalizedSite = r.site.trim();
        if (siteCache[normalizedSite.toLowerCase()]) {
          finalSiteId = siteCache[normalizedSite.toLowerCase()];
        } else {
          const existingSite = await prisma.site.findFirst({
            where: { name: { equals: normalizedSite, mode: 'insensitive' } }
          });
          if (existingSite) {
            finalSiteId = existingSite.id;
          } else {
            const newSite = await prisma.site.create({
              data: { name: normalizedSite, companyId: company.id }
            });
            finalSiteId = newSite.id;
          }
          siteCache[normalizedSite.toLowerCase()] = finalSiteId;
        }
      }

      // Unique temp password per employee, must be changed on first login.
      const tempPassword = generateTempPassword();
      const hash = await bcrypt.hash(tempPassword, 12);

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: r.name,
            email: r.email.toLowerCase(),
            mobile: r.mobile,
            passwordHash: hash,
            role: "employee",
            passwordResetRequired: true,
          },
        });
        await tx.employee.create({
          data: {
            userId: user.id,
            empCode: r.empCode,
            departmentId: finalDeptId,
            siteId: finalSiteId,
            salaryTemplateId: r.salaryTemplateId,
            designation: r.designation,
            dateOfJoining: new Date(r.doj),
            annualCTC: Number(r.annualCTC) || 0,
            dateOfBirth: r.dob ? new Date(r.dob) : null,
            gender: r.gender,
            address: r.address,
            emergencyContact: r.emergencyContact,
            emergencyPhone: r.emergencyPhone,
            bankName: r.bankName,
            bankAccountNo: r.bankAccountNo,
            ifscCode: r.ifscCode,
            pfAccountNo: r.pfAccountNo,
            uanNo: r.uanNo,
            esicNo: r.esicNo,
            pan: r.pan,
            aadhaarNo: r.aadhaarNo,
            epfApplicable: r.epfApplicable !== '' ? r.epfApplicable?.toLowerCase() === 'true' : null,
            esicApplicable: r.esicApplicable !== '' ? r.esicApplicable?.toLowerCase() === 'true' : null,
            ptApplicable: r.ptApplicable !== '' ? r.ptApplicable?.toLowerCase() === 'true' : null,
            tdsProjectedTax: r.tdsProjectedTax !== '' ? Number(r.tdsProjectedTax) : null,
          },
        });
      });
      results.created++;
      results.credentials.push({ empCode: r.empCode, email: r.email.toLowerCase(), tempPassword });
    } catch (err) {
      results.failed.push({ empCode: r.empCode, reason: err.message });
    }
  }

  res.json(new ApiResponse(200, results, `Successfully processed ${results.created} employees`));
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
    epfApplicable,
    esicApplicable,
    ptApplicable,
    tdsProjectedTax,
  } = req.body;
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { mobile }] },
  });
  if (existing) throw new ApiError(400, "Email or mobile already registered");
  const empExisting = await prisma.employee.findUnique({ where: { empCode } });
  if (empExisting) throw new ApiError(400, "Employee code already exists");
  // Use the provided password, otherwise generate a random temp one the employee
  // must change on first login (no shared default password).
  const usingTempPassword = !password;
  const tempPassword = usingTempPassword ? generateTempPassword() : null;
  const hash = await bcrypt.hash(password || tempPassword, 12);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        mobile,
        passwordHash: hash,
        role: "employee",
        passwordResetRequired: usingTempPassword,
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
        epfApplicable: epfApplicable !== undefined && epfApplicable !== '' ? Boolean(epfApplicable) : null,
        esicApplicable: esicApplicable !== undefined && esicApplicable !== '' ? Boolean(esicApplicable) : null,
        ptApplicable: ptApplicable !== undefined && ptApplicable !== '' ? Boolean(ptApplicable) : null,
        tdsProjectedTax: tdsProjectedTax !== undefined && tdsProjectedTax !== '' ? Number(tdsProjectedTax) : null,
      },
    });
    return { user, emp };
  });
  // Never persist the plaintext password in the audit log.
  const { password: _pw, ...auditBody } = req.body;
  await logAudit({
    userId: req.user.id,
    action: "CREATE",
    entity: "employees",
    entityId: result.emp.id,
    newValue: auditBody,
  });
  res
    .status(201)
    .json(new ApiResponse(201, { ...result, tempPassword }, "Employee created successfully"));
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
    epfApplicable,
    esicApplicable,
    ptApplicable,
    tdsProjectedTax,
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
        epfApplicable: epfApplicable !== undefined && epfApplicable !== '' ? Boolean(epfApplicable) : undefined,
        esicApplicable: esicApplicable !== undefined && esicApplicable !== '' ? Boolean(esicApplicable) : undefined,
        ptApplicable: ptApplicable !== undefined && ptApplicable !== '' ? Boolean(ptApplicable) : undefined,
        tdsProjectedTax: tdsProjectedTax !== undefined && tdsProjectedTax !== '' ? Number(tdsProjectedTax) : undefined,
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
  const ext = path.extname(req.file.originalname) || "";
  const key = await saveFile(
    `documents/${req.params.id}_${type}_${Date.now()}${ext}`,
    req.file.buffer,
    req.file.mimetype,
  );
  await prisma.employeeDocument.create({
    data: { employeeId: req.params.id, type, filePath: key },
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
  const key = await saveFile(`documents/${employee.empCode}_appointment.pdf`, pdfBuffer, "application/pdf");
  await prisma.employeeDocument.upsert({
    where: {
      employeeId_type: { employeeId: employee.id, type: "appointment_letter" },
    },
    update: { filePath: key, uploadedAt: new Date() },
    create: {
      employeeId: employee.id,
      type: "appointment_letter",
      filePath: key,
    },
  });
  res.json(new ApiResponse(200, { filePath: key }, "Appointment letter generated"));
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
