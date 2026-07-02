import { describe, it, expect } from 'vitest';
import { calculatePayroll } from '../src/modules/payroll/payroll.engine.js';

// Salary components mirroring the default seed template (Basic 50% of gross,
// HRA 40% of basic, fixed Travel Allowance, and a residual Special Allowance).
const seedComponents = [
  { name: 'Basic', type: 'earning', basis: 'percent_of_gross', value: 50, sequence: 1, isEpfApplicable: true, isEsicApplicable: true },
  { name: 'HRA', type: 'earning', basis: 'percent_of_basic', value: 40, sequence: 2 },
  { name: 'Travel Allowance', type: 'earning', basis: 'fixed', value: 1600, sequence: 3 },
  { name: 'Special Allowance', type: 'earning', basis: 'fixed', value: 0, sequence: 4 },
];

const ptSlabs = [
  { minSalary: 0, maxSalary: 5999, ptAmount: 0 },
  { minSalary: 6000, maxSalary: 8999, ptAmount: 80 },
  { minSalary: 9000, maxSalary: 11999, ptAmount: 150 },
  { minSalary: 12000, maxSalary: null, ptAmount: 200 },
];

const company = { workingDaysBase: 26, otMultiplier: 2.0 };

function makeEmployee(overrides = {}) {
  return {
    annualCTC: 600000,
    salaryTemplate: { components: seedComponents },
    epfApplicable: null,
    esicApplicable: null,
    ptApplicable: null,
    tdsProjectedTax: null,
    ...overrides,
  };
}

const noTds = { projectedAnnualTax: 0, taxDeductedSoFar: 0, remainingMonths: 12 };

describe('calculatePayroll — golden master', () => {
  it('A: full month, high salary (no ESIC)', () => {
    const result = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds, advanceEmi: 0,
    });
    expect(result).toMatchSnapshot();
  });

  it('B: partial month with LWP', () => {
    const result = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 20, otHours: 0, lwpDays: 6 },
      company, ptSlabs, tdsInfo: noTds, advanceEmi: 0,
    });
    expect(result).toMatchSnapshot();
  });

  it('C: full month with overtime', () => {
    const result = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 26, otHours: 10, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds, advanceEmi: 0,
    });
    expect(result).toMatchSnapshot();
  });

  it('D: low salary, ESIC applicable (gross <= 21000)', () => {
    const result = calculatePayroll({
      employee: makeEmployee({ annualCTC: 240000 }),
      attendance: { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds, advanceEmi: 0,
    });
    expect(result).toMatchSnapshot();
  });

  it('E: with advance EMI recovery', () => {
    const result = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds, advanceEmi: 5000,
    });
    expect(result).toMatchSnapshot();
  });

  it('F: worked more than the 26-day base (over-attendance)', () => {
    const result = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 30, otHours: 0, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds, advanceEmi: 0,
    });
    expect(result).toMatchSnapshot();
  });

  it('G: with projected TDS', () => {
    const result = calculatePayroll({
      employee: makeEmployee({ tdsProjectedTax: 60000 }),
      attendance: { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 },
      company, ptSlabs,
      tdsInfo: { projectedAnnualTax: 60000, taxDeductedSoFar: 0, remainingMonths: 12 },
      advanceEmi: 0,
    });
    expect(result).toMatchSnapshot();
  });
});

// Invariant checks that must hold regardless of the snapshot values.
describe('calculatePayroll — invariants', () => {
  const scenarios = [
    { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 },
    { workingDays: 26, daysWorked: 20, otHours: 0, lwpDays: 6 },
    { workingDays: 26, daysWorked: 26, otHours: 10, lwpDays: 0 },
  ];

  it('net pay equals gross minus total deductions', () => {
    for (const attendance of scenarios) {
      const r = calculatePayroll({ employee: makeEmployee(), attendance, company, ptSlabs, tdsInfo: noTds });
      expect(r.netPay).toBeCloseTo(r.grossPayable - r.totalDeductions, 2);
    }
  });

  it('earning line items reconcile to gross payable', () => {
    for (const attendance of scenarios) {
      const r = calculatePayroll({ employee: makeEmployee(), attendance, company, ptSlabs, tdsInfo: noTds });
      const sumEarnings = r.earningsJson.reduce((s, e) => s + e.amount, 0);
      expect(sumEarnings).toBeCloseTo(r.grossPayable, 2);
    }
  });

  it('does not overpay when attendance exceeds the working-day base', () => {
    const full = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds,
    });
    const over = calculatePayroll({
      employee: makeEmployee(),
      attendance: { workingDays: 26, daysWorked: 30, otHours: 0, lwpDays: 0 },
      company, ptSlabs, tdsInfo: noTds,
    });
    expect(over.netPay).toBe(full.netPay);
    expect(over.basicPayable).toBe(full.basicPayable);
  });
});
