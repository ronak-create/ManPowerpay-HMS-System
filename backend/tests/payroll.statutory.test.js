import { describe, it, expect } from 'vitest';
import { calculatePayroll } from '../src/modules/payroll/payroll.engine.js';
import { INDIA_STATUTORY_CONFIG, resolveStatutoryConfig, sanitizeStatutoryConfig } from '../src/modules/payroll/payroll.statutory.js';

// Same seed template used by the golden-master suite.
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
const noTds = { projectedAnnualTax: 0, taxDeductedSoFar: 0, remainingMonths: 12 };

function makeEmployee(overrides = {}) {
  return {
    annualCTC: 600000,
    salaryTemplate: { components: seedComponents },
    epfApplicable: null, esicApplicable: null, ptApplicable: null, tdsProjectedTax: null,
    ...overrides,
  };
}

function run(statutoryConfig, empOverrides = {}, attendance = { workingDays: 26, daysWorked: 26, otHours: 0, lwpDays: 0 }) {
  return calculatePayroll({
    employee: makeEmployee(empOverrides), attendance, company, ptSlabs, tdsInfo: noTds, statutoryConfig,
  });
}

function deduction(result, name) {
  return result.deductionsJson.find(d => d.name === name)?.amount ?? 0;
}
function contrib(result, name) {
  return result.employerContribJson.find(c => c.name === name)?.amount ?? 0;
}

describe('resolveStatutoryConfig', () => {
  it('returns India defaults when no override is given', () => {
    expect(resolveStatutoryConfig(null)).toBe(INDIA_STATUTORY_CONFIG);
    expect(resolveStatutoryConfig(undefined)).toBe(INDIA_STATUTORY_CONFIG);
  });

  it('merges a partial scheme override over the defaults without mutating them', () => {
    const merged = resolveStatutoryConfig({ epf: { employeeRate: 0.10 } });
    expect(merged.epf.employeeRate).toBe(0.10);
    expect(merged.epf.wageCeiling).toBe(15000); // untouched default preserved
    expect(merged.esic.enabled).toBe(true);
    expect(INDIA_STATUTORY_CONFIG.epf.employeeRate).toBe(0.12); // original not mutated
  });
});

describe('sanitizeStatutoryConfig', () => {
  it('accepts a valid override and strips whitespace from labels', () => {
    const { config, errors } = sanitizeStatutoryConfig({ epf: { wageCeiling: 50000, label: '  Pension  ' } });
    expect(errors).toEqual([]);
    expect(config).toEqual({ epf: { wageCeiling: 50000, label: 'Pension' } });
  });

  it('normalizes empty input to null (India defaults)', () => {
    expect(sanitizeStatutoryConfig(null).config).toBeNull();
    expect(sanitizeStatutoryConfig({}).config).toBeNull();
    expect(sanitizeStatutoryConfig({ epf: {} }).config).toBeNull();
  });

  it('rejects unknown schemes, unknown fields, and bad types', () => {
    const { config, errors } = sanitizeStatutoryConfig({
      epf: { employeeRate: 2, wageCeiling: 'lots', bogus: 1 },
      gratuity: { enabled: true },
    });
    expect(config).toBeNull();
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('epf.employeeRate'),
      expect.stringContaining('epf.wageCeiling'),
      expect.stringContaining('epf.bogus'),
      expect.stringContaining('gratuity'),
    ]));
  });

  it('allows nulling a ceiling and toggling a scheme off', () => {
    const { config, errors } = sanitizeStatutoryConfig({ epf: { wageCeiling: null }, esic: { enabled: false } });
    expect(errors).toEqual([]);
    expect(config).toEqual({ epf: { wageCeiling: null }, esic: { enabled: false } });
  });
});

describe('calculatePayroll — configurable statutory rules', () => {
  it('honours a raised EPF wage ceiling', () => {
    // Basic = 25,000. India caps PF base at 15,000 → 1,800. Raise ceiling past basic.
    const base = run(undefined);
    expect(deduction(base, 'Employee PF (EPF)')).toBe(1800);

    const raised = run({ epf: { wageCeiling: 50000 } });
    expect(deduction(raised, 'Employee PF (EPF)')).toBe(3000); // 12% of full 25,000
    expect(contrib(raised, 'Employer PF')).toBe(3000);
  });

  it('an uncapped EPF (null ceiling) contributes on the full base', () => {
    const r = run({ epf: { wageCeiling: null } });
    expect(deduction(r, 'Employee PF (EPF)')).toBe(3000);
  });

  it('disabling a scheme removes it even when the employee opts in', () => {
    const r = run({ epf: { enabled: false } }, { epfApplicable: true });
    expect(deduction(r, 'Employee PF (EPF)')).toBe(0);
    expect(contrib(r, 'Employer PF')).toBe(0);
  });

  it('respects a widened ESIC eligibility threshold', () => {
    // Gross 50,000 is above India's 21,000 ESIC ceiling → no ESIC by default.
    expect(deduction(run(undefined), 'Employee ESIC')).toBe(0);

    const wide = run({ esic: { grossThreshold: 100000 } });
    expect(deduction(wide, 'Employee ESIC')).toBe(375);    // 0.75% of 50,000
    expect(contrib(wide, 'Employer ESIC')).toBe(1625);     // 3.25% of 50,000
  });

  it('supports a non-India tenant with all statutory schemes disabled', () => {
    const noStatutory = {
      epf: { enabled: false },
      esic: { enabled: false },
      professionalTax: { enabled: false },
      tds: { enabled: false },
    };
    const r = run(noStatutory, { tdsProjectedTax: 60000 });
    // No statutory deductions at all — only non-statutory lines would remain.
    expect(r.deductionsJson).toHaveLength(0);
    expect(r.employerContribJson).toHaveLength(0);
    expect(r.netPay).toBe(r.grossPayable);
  });

  it('applies custom scheme labels to the payslip line items', () => {
    const r = run({ epf: { label: 'Pension Contribution' } });
    expect(deduction(r, 'Pension Contribution')).toBe(1800);
    expect(deduction(r, 'Employee PF (EPF)')).toBe(0);
  });

  it('derives overtime from a configurable divisor and hours-per-day', () => {
    const attendance = { workingDays: 26, daysWorked: 26, otHours: 10, lwpDays: 0 };
    // India default: 25000 / 26 / 8 * 2 * 10 = 2403.85
    const base = run(undefined, {}, attendance);
    const ot = base.earningsJson.find(e => e.name === 'Overtime').amount;
    expect(ot).toBeCloseTo(2403.85, 2);

    // 30-day divisor, 8h: 25000 / 30 / 8 * 2 * 10 = 2083.33
    const custom = run({ overtime: { divisorDays: 30 } }, {}, attendance);
    const otCustom = custom.earningsJson.find(e => e.name === 'Overtime').amount;
    expect(otCustom).toBeCloseTo(2083.33, 2);
  });
});
