// Demo-tenant seed — a realistic, self-selling company for the live demo login.
// Idempotent: it wipes and rebuilds ONLY the `company_demo` tenant, so it is safe
// to re-run and never touches real customer data.
//
//   npm run db:seed:demo
//
// Demo login comes from SEED_DEMO_EMAIL / SEED_DEMO_PASSWORD (defaults below). The
// demo tenant is intentionally a *known* public login — keep it on real data isolated
// by tenant scoping, and never point it at a production admin account.
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js'; // extended client: Decimal→Number + PII encryption
import { calculatePayroll } from '../src/modules/payroll/payroll.engine.js';
import { isSunday, dateKey } from '../src/utils/dates.js';
import { eachDayOfInterval } from 'date-fns';

dotenv.config();

const COMPANY_ID = 'company_demo';
const DEMO_EMAIL = (process.env.SEED_DEMO_EMAIL || 'demo@manpowerpay.com').toLowerCase();
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo@12345';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Deterministic pseudo-randomness so re-seeds produce the same believable data.
let _seed = 20260712;
const rand = () => { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; };
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const EMPLOYEES = [
  { name: 'Rajesh Kumar Sharma',   designation: 'Operations Manager',   ctc: 720000, dept: 'Operations',  site: 'Ahmedabad HQ',    tds: 18000 },
  { name: 'Priya Nair',            designation: 'HR Executive',         ctc: 480000, dept: 'HR',          site: 'Ahmedabad HQ' },
  { name: 'Amit Patel',            designation: 'Accounts Executive',   ctc: 420000, dept: 'Accounts',    site: 'Ahmedabad HQ' },
  { name: 'Sunita Devi',           designation: 'Housekeeping Supervisor', ctc: 264000, dept: 'Housekeeping', site: 'Gandhinagar Site' },
  { name: 'Mohammed Irfan',        designation: 'Security Supervisor',  ctc: 288000, dept: 'Security',    site: 'Gandhinagar Site' },
  { name: 'Kavita Joshi',          designation: 'Site Coordinator',     ctc: 360000, dept: 'Operations',  site: 'Surat Branch' },
  { name: 'Deepak Yadav',          designation: 'Security Guard',       ctc: 216000, dept: 'Security',    site: 'Surat Branch' },
  { name: 'Anjali Mehta',          designation: 'Housekeeping Staff',   ctc: 198000, dept: 'Housekeeping', site: 'Ahmedabad HQ' },
  { name: 'Suresh Chauhan',        designation: 'Facility Technician',  ctc: 312000, dept: 'Operations',  site: 'Gandhinagar Site' },
  { name: 'Rekha Pillai',          designation: 'Accounts Assistant',   ctc: 252000, dept: 'Accounts',    site: 'Ahmedabad HQ' },
  { name: 'Vikram Singh Rathore',  designation: 'Security Guard',       ctc: 216000, dept: 'Security',    site: 'Ahmedabad HQ' },
  { name: 'Neha Agarwal',          designation: 'Front Desk Executive', ctc: 288000, dept: 'Operations',  site: 'Surat Branch' },
];

// Delete existing demo data in FK-safe order (children before parents).
async function wipeDemoTenant() {
  const cid = COMPANY_ID;
  const empIds = (await prisma.employee.findMany({ where: { companyId: cid }, select: { id: true } })).map((e) => e.id);
  await prisma.payslip.deleteMany({ where: { companyId: cid } });
  await prisma.payrollRun.deleteMany({ where: { companyId: cid } });
  await prisma.attendance.deleteMany({ where: { companyId: cid } });
  await prisma.leaveRequest.deleteMany({ where: { companyId: cid } });
  await prisma.leaveBalance.deleteMany({ where: { companyId: cid } });
  await prisma.advanceLoan.deleteMany({ where: { companyId: cid } });
  await prisma.resignation.deleteMany({ where: { companyId: cid } });
  await prisma.form16.deleteMany({ where: { companyId: cid } });
  if (empIds.length) await prisma.employeeDocument.deleteMany({ where: { employeeId: { in: empIds } } });
  await prisma.notification.deleteMany({ where: { companyId: cid } });
  await prisma.auditLog.deleteMany({ where: { companyId: cid } });
  await prisma.employee.deleteMany({ where: { companyId: cid } });
  // Users that belong to the demo tenant (admin + employee logins).
  await prisma.user.deleteMany({ where: { companyId: cid } });
  const tpl = await prisma.salaryTemplate.findMany({ where: { companyId: cid }, select: { id: true } });
  if (tpl.length) await prisma.salaryComponent.deleteMany({ where: { templateId: { in: tpl.map((t) => t.id) } } });
  await prisma.salaryTemplate.deleteMany({ where: { companyId: cid } });
  await prisma.department.deleteMany({ where: { companyId: cid } });
  await prisma.site.deleteMany({ where: { companyId: cid } });
  await prisma.ptSlab.deleteMany({ where: { companyId: cid } });
  await prisma.holiday.deleteMany({ where: { companyId: cid } });
  await prisma.subscription.deleteMany({ where: { companyId: cid } });
}

// Build a month of attendance for one employee. Sundays = WO, holidays = HO,
// otherwise mostly Present with a sprinkling of absences / half-days / paid leave.
function buildAttendance(companyId, employeeId, year, month, holidayKeys, upToDay) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const rows = [];
  for (const day of eachDayOfInterval({ start, end })) {
    if (upToDay && day.getDate() > upToDay) break;
    let status;
    if (isSunday(day)) status = 'WO';
    else if (holidayKeys.has(dateKey(day))) status = 'HO';
    else {
      const r = rand();
      status = r < 0.90 ? 'P' : r < 0.94 ? 'A' : r < 0.97 ? 'H' : 'PL';
    }
    const otHours = status === 'P' && rand() < 0.15 ? pick([1, 2, 2, 3]) : 0;
    rows.push({ companyId, employeeId, date: day, status, otHours, markedAt: new Date() });
  }
  return rows;
}

async function main() {
  console.log(`Seeding demo tenant (${COMPANY_ID})...`);
  await wipeDemoTenant();

  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pYear = prevMonthDate.getFullYear();
  const pMonth = prevMonthDate.getMonth() + 1;

  // Company
  const company = await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: { name: 'Acme Facilities Services Pvt Ltd', brandColor: '#0EA5A4' },
    create: {
      id: COMPANY_ID,
      name: 'Acme Facilities Services Pvt Ltd',
      registeredAddress: 'B-204, Sarkhej-Gandhinagar Highway, Ahmedabad, Gujarat 380054',
      gstin: '24AACCA1234F1Z5',
      pan: 'AACCA1234F',
      epfCode: 'GJAHD0012345000',
      esicCode: '37000123450000123',
      ptState: 'Gujarat',
      brandColor: '#0EA5A4',
      workingDaysBase: 26,
      otMultiplier: 2.0,
      financialYearStart: 4,
    },
  });

  // Subscription → Growth plan (a healthy paid tenant, no employee-limit gate)
  const growth = await prisma.plan.findUnique({ where: { code: 'growth' } });
  if (growth) {
    await prisma.subscription.upsert({
      where: { companyId: company.id },
      update: { planId: growth.id, status: 'active' },
      create: { companyId: company.id, planId: growth.id, status: 'active', currentPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1) },
    });
  }

  // Admin login
  const adminHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await prisma.user.create({
    data: { companyId: company.id, name: 'Demo Administrator', email: DEMO_EMAIL, mobile: '9111100000', passwordHash: adminHash, role: 'admin' },
  });

  // PT slabs (Gujarat)
  await prisma.ptSlab.createMany({
    data: [
      { companyId: company.id, state: 'Gujarat', minSalary: 0, maxSalary: 5999, ptAmount: 0 },
      { companyId: company.id, state: 'Gujarat', minSalary: 6000, maxSalary: 8999, ptAmount: 80 },
      { companyId: company.id, state: 'Gujarat', minSalary: 9000, maxSalary: 11999, ptAmount: 150 },
      { companyId: company.id, state: 'Gujarat', minSalary: 12000, maxSalary: null, ptAmount: 200 },
    ],
  });

  // Sites & departments
  const siteNames = ['Ahmedabad HQ', 'Gandhinagar Site', 'Surat Branch'];
  const sites = {};
  for (const name of siteNames) sites[name] = await prisma.site.create({ data: { companyId: company.id, name, address: `${name}, Gujarat` } });

  const deptNames = ['Operations', 'Housekeeping', 'Security', 'Accounts', 'HR'];
  const depts = {};
  for (const name of deptNames) depts[name] = await prisma.department.create({ data: { companyId: company.id, name } });

  // Salary template
  const template = await prisma.salaryTemplate.create({
    data: {
      companyId: company.id,
      name: 'Standard Template',
      components: {
        create: [
          { name: 'Basic', type: 'earning', basis: 'percent_of_gross', value: 50, sequence: 1, isEpfApplicable: true, isEsicApplicable: true },
          { name: 'HRA', type: 'earning', basis: 'percent_of_basic', value: 40, sequence: 2 },
          { name: 'Travel Allowance', type: 'earning', basis: 'fixed', value: 1600, sequence: 3 },
          { name: 'Special Allowance', type: 'earning', basis: 'fixed', value: 0, sequence: 4 },
          { name: 'Employee PF', type: 'deduction', basis: 'percent_of_basic', value: 12, sequence: 10 },
          { name: 'Employee ESIC', type: 'deduction', basis: 'percent_of_gross', value: 0.75, sequence: 11 },
          { name: 'Professional Tax', type: 'deduction', basis: 'state_slab', value: 0, sequence: 12 },
          { name: 'TDS', type: 'deduction', basis: 'tds_formula', value: 0, sequence: 13 },
          { name: 'Employer PF', type: 'employer_contribution', basis: 'percent_of_basic', value: 12, sequence: 20 },
          { name: 'Employer ESIC', type: 'employer_contribution', basis: 'percent_of_gross', value: 3.25, sequence: 21 },
        ],
      },
    },
  });

  // Holidays in the previous month (so payroll working-days logic has data)
  await prisma.holiday.create({ data: { companyId: company.id, name: 'Regional Festival', date: new Date(pYear, pMonth - 1, 15) } });

  // Employees + their users
  const empHash = await bcrypt.hash('Emp@12345', 12);
  const created = [];
  for (let i = 0; i < EMPLOYEES.length; i++) {
    const e = EMPLOYEES[i];
    const empCode = `ACM${String(i + 1).padStart(3, '0')}`;
    const firstName = e.name.split(' ')[0].toLowerCase();
    const user = await prisma.user.create({
      data: {
        companyId: company.id, name: e.name,
        email: `${firstName}.${empCode.toLowerCase()}@acmefacilities.example`,
        mobile: `98${String(76500000 + i).padStart(8, '0')}`,
        passwordHash: empHash, role: 'employee',
      },
    });
    const emp = await prisma.employee.create({
      data: {
        companyId: company.id, userId: user.id, empCode,
        departmentId: depts[e.dept].id, siteId: sites[e.site].id, salaryTemplateId: template.id,
        designation: e.designation,
        dateOfJoining: new Date(2021 + (i % 4), (i * 2) % 12, 1 + (i % 27)),
        gender: pick(['Male', 'Female']),
        pan: `ABCPD${String(1000 + i).slice(-4)}${pick(['A', 'B', 'C'])}`,
        aadhaarNo: `${4000 + i}${String(10000000 + i * 137).slice(0, 8)}`,
        uanNo: `10${String(10000000 + i * 991).padStart(10, '0')}`,
        bankName: pick(['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank']),
        bankAccountNo: `${5011}${String(20000000 + i * 4211).padStart(10, '0')}`,
        ifscCode: pick(['HDFC0001234', 'ICIC0004321', 'SBIN0009876', 'UTIB0005678']),
        annualCTC: e.ctc,
        tdsProjectedTax: e.tds ?? 0,
      },
    });
    created.push({ emp, meta: e });
  }
  console.log(`Created ${created.length} employees.`);

  // Attendance: previous full month + current month up to today
  const holidayKeys = new Set([dateKey(new Date(pYear, pMonth - 1, 15))]);
  for (const { emp } of created) {
    const prev = buildAttendance(company.id, emp.id, pYear, pMonth, holidayKeys, null);
    const curr = buildAttendance(company.id, emp.id, now.getFullYear(), now.getMonth() + 1, new Set(), now.getDate());
    await prisma.attendance.createMany({ data: [...prev, ...curr] });
  }
  console.log('Attendance seeded for previous + current month.');

  // Leave requests (a couple pending, one approved)
  await prisma.leaveRequest.create({ data: { companyId: company.id, employeeId: created[1].emp.id, leaveType: 'CL', fromDate: new Date(now.getFullYear(), now.getMonth(), Math.min(20, 28)), toDate: new Date(now.getFullYear(), now.getMonth(), Math.min(21, 28)), totalDays: 2, reason: 'Family function', status: 'pending' } });
  await prisma.leaveRequest.create({ data: { companyId: company.id, employeeId: created[5].emp.id, leaveType: 'SL', fromDate: new Date(pYear, pMonth - 1, 22), toDate: new Date(pYear, pMonth - 1, 23), totalDays: 2, reason: 'Fever', status: 'approved', approvedAt: new Date() } });
  await prisma.leaveRequest.create({ data: { companyId: company.id, employeeId: created[8].emp.id, leaveType: 'CL', fromDate: new Date(now.getFullYear(), now.getMonth(), Math.min(25, 28)), toDate: new Date(now.getFullYear(), now.getMonth(), Math.min(25, 28)), totalDays: 1, reason: 'Personal work', status: 'pending' } });

  // Advance loans (active)
  await prisma.advanceLoan.create({ data: { companyId: company.id, employeeId: created[3].emp.id, sanctionedAmount: 30000, emi: 5000, startMonth: pMonth, startYear: pYear, balanceRemaining: 25000, status: 'active', reason: 'Medical emergency' } });
  await prisma.advanceLoan.create({ data: { companyId: company.id, employeeId: created[6].emp.id, sanctionedAmount: 20000, emi: 4000, startMonth: pMonth, startYear: pYear, balanceRemaining: 16000, status: 'active', reason: 'Festival advance' } });

  // ── Locked payroll run for the previous month (via the real engine) ──────────
  const companyForPayroll = await prisma.company.findUnique({ where: { id: company.id }, include: { ptSlabs: true } });
  const run = await prisma.payrollRun.create({ data: { companyId: company.id, month: pMonth, year: pYear, status: 'draft' } });
  const workingDays = 26; // workingDaysBase

  const empsForPayroll = await prisma.employee.findMany({
    where: { companyId: company.id, isActive: true },
    include: { salaryTemplate: { include: { components: { orderBy: { sequence: 'asc' } } } }, advanceLoans: { where: { status: 'active' } } },
  });

  const start = new Date(pYear, pMonth - 1, 1);
  const end = new Date(pYear, pMonth, 0);
  for (const emp of empsForPayroll) {
    const att = await prisma.attendance.findMany({ where: { employeeId: emp.id, date: { gte: start, lte: end } } });
    const present = att.filter((a) => a.status === 'P').length;
    const half = att.filter((a) => a.status === 'H').length;
    const pl = att.filter((a) => a.status === 'PL').length;
    const otHours = att.reduce((s, a) => s + (a.otHours || 0), 0);
    const daysWorked = present + half * 0.5 + pl;
    const lwpDays = Math.max(0, workingDays - daysWorked);
    const currentFyMonth = pMonth >= 4 ? pMonth - 3 : pMonth + 9;
    const advanceEmi = emp.advanceLoans.reduce((s, l) => s + Math.min(l.emi, l.balanceRemaining), 0);

    const result = calculatePayroll({
      employee: emp,
      attendance: { workingDays, daysWorked, otHours, lwpDays },
      company: companyForPayroll,
      ptSlabs: companyForPayroll.ptSlabs,
      tdsInfo: { projectedAnnualTax: emp.tdsProjectedTax ?? 0, taxDeductedSoFar: 0, remainingMonths: 12 - currentFyMonth + 1 },
      advanceEmi,
      statutoryConfig: companyForPayroll.statutoryConfig,
    });
    const { basicPayable, ...dbResult } = result;
    await prisma.payslip.create({ data: { companyId: company.id, employeeId: emp.id, payrollRunId: run.id, month: pMonth, year: pYear, ...dbResult } });
  }

  // Approve → lock (reduce advances + lock attendance to mirror a real cycle)
  await prisma.payrollRun.update({ where: { id: run.id }, data: { status: 'approved', approvedAt: new Date() } });
  await prisma.attendance.updateMany({ where: { companyId: company.id, date: { gte: start, lte: end } }, data: { isLocked: true } });
  await prisma.payrollRun.update({ where: { id: run.id }, data: { status: 'locked', lockedAt: new Date() } });

  console.log(`Locked payroll run for ${MONTHS[pMonth]} ${pYear} (${empsForPayroll.length} payslips).`);
  console.log('\n────────────────────────────────────────');
  console.log('Demo tenant ready.');
  console.log(`  Company : ${company.name}`);
  console.log(`  Login   : ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log('────────────────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
