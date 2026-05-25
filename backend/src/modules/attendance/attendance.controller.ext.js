// GET /api/attendance/bulk-template
export const downloadAttendanceTemplate = asyncHandler(async (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads/templates/attendance_bulk_template.xlsx');
  if (!fs.existsSync(filePath)) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');
    sheet.columns = [
      { header: 'Date (YYYY-MM-DD)', key: 'date', width: 20 },
      { header: 'Employee ID (empCode)', key: 'empCode', width: 20 },
      { header: 'Status (P/A/H/PL)', key: 'status', width: 15 },
      { header: 'OT Hours', key: 'otHours', width: 15 },
    ];
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await workbook.xlsx.writeFile(filePath);
  }
  res.download(filePath);
});

// POST /api/attendance/bulk-upload
export const bulkUploadAttendance = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.getWorksheet(1);

  const results = { created: 0, failed: [] };
  const records = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    records.push({
      rowNumber,
      date: row.getCell(1).text,
      empCode: row.getCell(2).text,
      status: row.getCell(3).text,
      otHours: parseFloat(row.getCell(4).text) || 0
    });
  });

  for (const r of records) {
    try {
      if (!r.date || !r.empCode || !r.status) throw new Error('Missing required fields');
      
      const emp = await prisma.employee.findUnique({ where: { empCode: r.empCode } });
      if (!emp) throw new Error(`Employee ${r.empCode} not found`);

      const date = new Date(r.date);
      if (isNaN(date.getTime())) throw new Error('Invalid date format');
      if (await isDateLocked(date)) throw new Error('Attendance month is locked');

      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: emp.id, date } },
        create: { employeeId: emp.id, date, status: r.status, otHours: r.otHours, markedById: req.user.id },
        update: { status: r.status, otHours: r.otHours, correctedById: req.user.id }
      });
      results.created++;
    } catch (err) {
      results.failed.push({ row: r.rowNumber, empCode: r.empCode, reason: err.message });
    }
  }
  res.json(new ApiResponse(200, results, 'Bulk attendance upload completed'));
});
