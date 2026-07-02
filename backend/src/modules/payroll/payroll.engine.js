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
  // Cap at 1.0 — an employee cannot earn more than a full month's base salary from
  // attendance alone (extra time is paid separately as overtime). Without the cap,
  // working more days than the base (e.g. 30 against a 26-day base) overpays.
  const proRateFactor = workingDays > 0 ? Math.min(1, daysWorked / workingDays) : 0;

  const components = [...(salaryTemplate?.components || [])].sort((a, b) => a.sequence - b.sequence);
  const earnings = [];
  const deductions = [];
  const employerContrib = [];

  // Step 1: Basic pay
  const basicComp = components.find(c => c.name.toLowerCase() === 'basic' && c.type === 'earning');
  let basicFull = 0;
  if (basicComp) {
    if (basicComp.basis === 'percent_of_gross') {
      basicFull = monthlyCTC * (basicComp.value / 100);
    } else if (basicComp.basis === 'fixed') {
      basicFull = basicComp.value;
    }
  }
  const basicActual = round(basicFull * proRateFactor);

  // Step 2: OT earnings
  const otRate = basicFull > 0 ? (basicFull / 26 / 8) * (company.otMultiplier || 2) : 0;
  const otEarnings = round(otRate * (otHours || 0));

  // Step 3: Gross
  const grossFull = round(monthlyCTC + otEarnings);
  const lwpDeduction = round(monthlyCTC * (1 - proRateFactor));

  // Step 4: Earnings breakdown.
  // A fixed earning with value 0 acts as the residual ("Special Allowance") that
  // balances the base earnings up to the monthly CTC, so the payslip line items
  // always sum to gross. Overtime is added on top of the base.
  const otComp = components.find(c => c.type === 'earning' && c.basis === 'ot_formula');
  const residualComp = components.find(c => c.type === 'earning' && c.basis === 'fixed' && !c.value);

  let baseEarningsSum = 0;
  components
    .filter(c => c.type === 'earning' && c !== residualComp && c.basis !== 'ot_formula')
    .forEach(c => {
      let amount = 0;
      if (c.name.toLowerCase() === 'basic') {
        amount = basicFull;
      } else if (c.basis === 'percent_of_basic') {
        amount = basicFull * (c.value / 100);
      } else if (c.basis === 'percent_of_gross') {
        amount = monthlyCTC * (c.value / 100);
      } else if (c.basis === 'fixed') {
        amount = c.value;
      }
      if (amount > 0) {
        const rounded = round(amount);
        earnings.push({ name: c.name, amount: rounded });
        baseEarningsSum += rounded;
      }
    });

  // Residual absorbs the gap so base earnings reconcile to the monthly CTC.
  if (residualComp) {
    const residual = round(monthlyCTC - baseEarningsSum);
    if (residual > 0) earnings.push({ name: residualComp.name, amount: residual });
  }

  if (otEarnings > 0) {
    earnings.push({ name: otComp?.name || 'Overtime', amount: round(otEarnings) });
  }

  // Step 5: Deductions
  if (lwpDeduction > 0) {
    deductions.push({ name: `LWP Deduction (${lwpDays} days)`, amount: lwpDeduction });
  }

  const grossActual = round(monthlyCTC * proRateFactor + otEarnings);

  // Determine applicability — employee override takes priority over template
  const epfApplicable = employee.epfApplicable !== null && employee.epfApplicable !== undefined
    ? employee.epfApplicable
    : components.some(c => c.isEpfApplicable && c.type === 'earning');

  const esicApplicable = employee.esicApplicable !== null && employee.esicApplicable !== undefined
    ? employee.esicApplicable
    : components.some(c => c.isEsicApplicable && c.type === 'earning');

  const ptApplicable = employee.ptApplicable !== null && employee.ptApplicable !== undefined
    ? employee.ptApplicable
    : true; // default on

  // EPF Employee
  const epfEE = epfApplicable ? round(0.12 * Math.min(basicActual, 15000)) : 0;

  // ESIC Employee (only if gross <= 21000)
  const esicEE = (esicApplicable && grossActual <= 21000) ? round(0.0075 * grossActual) : 0;

  // PT
  const ptAmount = ptApplicable ? computePT(grossActual, ptSlabs) : 0;

  // TDS — use employee-level projected tax if set, else use tdsInfo passed in
  let effectiveProjectedTax = tdsInfo?.projectedAnnualTax || 0;
  if (employee.tdsProjectedTax !== null && employee.tdsProjectedTax !== undefined) {
    effectiveProjectedTax = employee.tdsProjectedTax;
  }

  let tds = 0;
  if (effectiveProjectedTax > 0 && tdsInfo && tdsInfo.remainingMonths > 0) {
    tds = round(Math.max(0, (effectiveProjectedTax - (tdsInfo.taxDeductedSoFar || 0)) / tdsInfo.remainingMonths));
  }

  if (epfEE > 0) deductions.push({ name: 'Employee PF (EPF)', amount: epfEE });
  if (esicEE > 0) deductions.push({ name: 'Employee ESIC', amount: esicEE });
  if (ptAmount > 0) deductions.push({ name: 'Professional Tax', amount: ptAmount });
  if (tds > 0) deductions.push({ name: 'TDS / Income Tax', amount: tds });
  if (advanceEmi > 0) deductions.push({ name: 'Salary Advance Recovery', amount: advanceEmi });

  // Employer contributions
  const epfER = epfApplicable ? round(0.12 * Math.min(basicActual, 15000)) : 0;
  const esicER = (esicApplicable && grossActual <= 21000) ? round(0.0325 * grossActual) : 0;
  if (epfER > 0) employerContrib.push({ name: 'Employer PF', amount: epfER });
  if (esicER > 0) employerContrib.push({ name: 'Employer ESIC', amount: esicER });

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netPay = round(grossFull - totalDeductions);

  return {
    grossPayable: grossFull,
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
    basicPayable: basicActual
  };
}

function computePT(gross, ptSlabs) {
  if (!ptSlabs?.length) return 0;
  const slab = ptSlabs.find(s => gross >= s.minSalary && (s.maxSalary === null || gross <= s.maxSalary));
  return slab?.ptAmount || 0;
}

function round(n) { return Math.round(n * 100) / 100; }
