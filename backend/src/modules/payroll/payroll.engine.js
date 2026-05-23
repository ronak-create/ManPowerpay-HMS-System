import { getDaysInMonth, eachDayOfInterval } from 'date-fns';

/**
 * Main payroll calculator for one employee for one month.
 * @param {Object} employee - Full employee object with salaryTemplate and components
 * @param {Object} attendance - { workingDays, daysWorked, otHours, lwpDays }
 * @param {Object} company - { workingDaysBase, otMultiplier, ptState }
 * @param {Array} ptSlabs - [{ minSalary, maxSalary, ptAmount }]
 * @param {Object} tdsInfo - { projectedAnnualTax, taxDeductedSoFar, remainingMonths }
 * @param {Number} advanceEmi - EMI to recover this month (0 if no active loan)
 * @returns {Object} payslip computation result
 */
export function calculatePayroll({ employee, attendance, company, ptSlabs, tdsInfo, advanceEmi = 0 }) {
  const { annualCTC, salaryTemplate } = employee;
  const { workingDays, daysWorked, otHours, lwpDays } = attendance;

  const monthlyCTC = annualCTC / 12;

  // Step 1: Pro-rate gross
  const proRateFactor = workingDays > 0 ? daysWorked / workingDays : 0;
  const baseGross = monthlyCTC * proRateFactor;

  // Step 2: Compute component values in sequence order
  const components = [...(salaryTemplate?.components || [])].sort((a, b) => a.sequence - b.sequence);
  const earnings = [];
  const deductions = [];
  const employerContrib = [];

  let basicPayable = 0;

  // Find basic component to compute OT
  const basicComp = components.find(c => c.name.toLowerCase() === 'basic' && c.type === 'earning');
  if (basicComp) {
    if (basicComp.basis === 'percent_of_gross') {
      basicPayable = baseGross * (basicComp.value / 100);
    } else if (basicComp.basis === 'fixed') {
      basicPayable = basicComp.value * proRateFactor;
    }
  }

  // OT earnings
  const otRate = basicPayable > 0 ? (basicPayable / 26 / 8) * (company.otMultiplier || 2) : 0;
  const otEarnings = otRate * (otHours || 0);

  const grossPayable = baseGross + otEarnings;

  // Rebuild earnings breakdown
  components.filter(c => c.type === 'earning').forEach(c => {
    let amount = 0;
    if (c.name.toLowerCase() === 'basic') {
      amount = basicPayable;
    } else if (c.basis === 'percent_of_basic') {
      amount = basicPayable * (c.value / 100);
    } else if (c.basis === 'percent_of_gross') {
      amount = grossPayable * (c.value / 100);
    } else if (c.basis === 'fixed') {
      amount = c.value;
    } else if (c.basis === 'ot_formula') {
      amount = otEarnings;
    }
    if (amount > 0) earnings.push({ name: c.name, amount: round(amount) });
  });

  // Add OT as separate line if not already in components
  if (otEarnings > 0 && !components.find(c => c.basis === 'ot_formula')) {
    earnings.push({ name: 'Overtime', amount: round(otEarnings) });
  }

  // Step 3: Deductions
  // EPF Employee
  const epfEE = round(0.12 * Math.min(basicPayable, 15000));

  // ESIC Employee
  const esicEE = grossPayable <= 21000 ? round(0.0075 * grossPayable) : 0;

  // PT
  const ptAmount = computePT(grossPayable, ptSlabs);

  // TDS
  let tds = 0;
  if (tdsInfo && tdsInfo.projectedAnnualTax > 0 && tdsInfo.remainingMonths > 0) {
    tds = round(Math.max(0, (tdsInfo.projectedAnnualTax - tdsInfo.taxDeductedSoFar) / tdsInfo.remainingMonths));
  }

  if (epfEE > 0) deductions.push({ name: 'Employee PF (EPF)', amount: epfEE });
  if (esicEE > 0) deductions.push({ name: 'Employee ESIC', amount: esicEE });
  if (ptAmount > 0) deductions.push({ name: 'Professional Tax', amount: ptAmount });
  if (tds > 0) deductions.push({ name: 'TDS / Income Tax', amount: tds });
  if (advanceEmi > 0) deductions.push({ name: 'Salary Advance Recovery', amount: advanceEmi });

  // Employer contributions (shown in CTC)
  const epfER = round(0.12 * Math.min(basicPayable, 15000));
  const esicER = grossPayable <= 21000 ? round(0.0325 * grossPayable) : 0;
  if (epfER > 0) employerContrib.push({ name: 'Employer PF', amount: epfER });
  if (esicER > 0) employerContrib.push({ name: 'Employer ESIC', amount: esicER });

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netPay = round(grossPayable - totalDeductions);

  return {
    grossPayable: round(grossPayable),
    totalDeductions: round(totalDeductions),
    netPay,
    earningsJson: earnings,
    deductionsJson: deductions,
    employerContribJson: employerContrib,
    workingDays,
    presentDays: daysWorked,
    otHours: otHours || 0,
    lwpDays: lwpDays || 0,
    tdsThisMonth: tds,
    basicPayable: round(basicPayable)
  };
}

function computePT(gross, ptSlabs) {
  if (!ptSlabs?.length) return 0;
  const slab = ptSlabs.find(s => gross >= s.minSalary && (s.maxSalary === null || gross <= s.maxSalary));
  return slab?.ptAmount || 0;
}

function round(n) { return Math.round(n * 100) / 100; }
