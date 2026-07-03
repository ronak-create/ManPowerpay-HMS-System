/**
 * Statutory configuration for the payroll engine.
 *
 * The engine itself is country-agnostic: every jurisdiction-specific rule
 * (contribution rates, wage ceilings, eligibility thresholds, labels) lives in
 * a plain config object so a tenant can be onboarded to a different scheme
 * without touching engine code. India (EPF / ESIC / PT / TDS) ships as the
 * built-in default; a company can override any subset via `Company.statutoryConfig`.
 *
 * A statutory scheme is applied to an employee only when BOTH hold:
 *   1. the scheme is `enabled` here, and
 *   2. the employee/template opts in (e.g. `isEpfApplicable`, employee override).
 * Setting `enabled: false` removes the scheme entirely (e.g. a non-India tenant).
 */

export const INDIA_STATUTORY_CONFIG = {
  // Employees' Provident Fund — 12% of PF wages (Basic), capped at a ₹15,000 wage base.
  epf: {
    enabled: true,
    label: 'Employee PF (EPF)',
    employerLabel: 'Employer PF',
    base: 'basic', // 'basic' | 'gross'
    employeeRate: 0.12,
    employerRate: 0.12,
    wageCeiling: 15000, // cap on the contribution base; null = uncapped
  },
  // Employees' State Insurance — only when monthly gross is within the ceiling.
  esic: {
    enabled: true,
    label: 'Employee ESIC',
    employerLabel: 'Employer ESIC',
    base: 'gross',
    employeeRate: 0.0075,
    employerRate: 0.0325,
    grossThreshold: 21000, // scheme applies only if gross <= threshold; null = always
  },
  // Professional Tax — slab driven (see Company.ptSlabs); config only toggles/labels it.
  professionalTax: {
    enabled: true,
    label: 'Professional Tax',
  },
  // Tax Deducted at Source — spread projected annual tax over remaining FY months.
  tds: {
    enabled: true,
    label: 'TDS / Income Tax',
  },
  // Overtime — hourly rate = base / divisorDays / hoursPerDay * company.otMultiplier.
  overtime: {
    label: 'Overtime',
    divisorDays: 26,
    hoursPerDay: 8,
  },
};

/**
 * Merge tenant overrides over the India defaults (one level deep — sufficient
 * for the flat scheme objects above). Passing `null`/`undefined` yields the
 * India defaults unchanged, so existing callers keep working.
 */
export function resolveStatutoryConfig(overrides) {
  if (!overrides || typeof overrides !== 'object') return INDIA_STATUTORY_CONFIG;
  const merged = {};
  const keys = new Set([...Object.keys(INDIA_STATUTORY_CONFIG), ...Object.keys(overrides)]);
  for (const key of keys) {
    const base = INDIA_STATUTORY_CONFIG[key];
    const over = overrides[key];
    if (base && over && typeof base === 'object' && typeof over === 'object') {
      merged[key] = { ...base, ...over };
    } else {
      merged[key] = over !== undefined ? over : base;
    }
  }
  return merged;
}

// Field types accepted per scheme when a tenant supplies an override. Anything
// not listed here is dropped, so a stored override can never inject unexpected
// keys or wrong-typed values into the engine.
const OVERRIDE_SCHEMA = {
  epf: { enabled: 'boolean', label: 'string', employerLabel: 'string', base: 'base', employeeRate: 'rate', employerRate: 'rate', wageCeiling: 'amountOrNull' },
  esic: { enabled: 'boolean', label: 'string', employerLabel: 'string', base: 'base', employeeRate: 'rate', employerRate: 'rate', grossThreshold: 'amountOrNull' },
  professionalTax: { enabled: 'boolean', label: 'string' },
  tds: { enabled: 'boolean', label: 'string' },
  overtime: { label: 'string', divisorDays: 'positiveNumber', hoursPerDay: 'positiveNumber' },
};

/**
 * Validate & clean tenant-supplied statutory overrides. Returns
 * `{ config, errors }`: `config` keeps only recognized, correctly-typed fields
 * (safe to persist); `errors` lists every rejected field. An empty/whitespace
 * config is normalized to `null` (→ India defaults).
 */
export function sanitizeStatutoryConfig(input) {
  const errors = [];
  if (input == null) return { config: null, errors };
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { config: null, errors: ['statutoryConfig must be an object'] };
  }

  const config = {};
  for (const [scheme, raw] of Object.entries(input)) {
    const schema = OVERRIDE_SCHEMA[scheme];
    if (!schema) { errors.push(`unknown scheme "${scheme}"`); continue; }
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push(`"${scheme}" must be an object`); continue;
    }
    const clean = {};
    for (const [field, value] of Object.entries(raw)) {
      const kind = schema[field];
      if (!kind) { errors.push(`unknown field "${scheme}.${field}"`); continue; }
      const checked = coerceField(kind, value);
      if (checked.ok) clean[field] = checked.value;
      else errors.push(`"${scheme}.${field}" ${checked.reason}`);
    }
    if (Object.keys(clean).length) config[scheme] = clean;
  }

  return { config: Object.keys(config).length ? config : null, errors };
}

function coerceField(kind, value) {
  switch (kind) {
    case 'boolean':
      return typeof value === 'boolean' ? { ok: true, value } : { ok: false, reason: 'must be a boolean' };
    case 'string':
      return typeof value === 'string' && value.trim() ? { ok: true, value: value.trim() } : { ok: false, reason: 'must be a non-empty string' };
    case 'base':
      return value === 'basic' || value === 'gross' ? { ok: true, value } : { ok: false, reason: "must be 'basic' or 'gross'" };
    case 'rate':
      return typeof value === 'number' && value >= 0 && value <= 1 ? { ok: true, value } : { ok: false, reason: 'must be a fraction between 0 and 1' };
    case 'positiveNumber':
      return typeof value === 'number' && value > 0 ? { ok: true, value } : { ok: false, reason: 'must be a positive number' };
    case 'amountOrNull':
      if (value === null) return { ok: true, value: null };
      return typeof value === 'number' && value >= 0 ? { ok: true, value } : { ok: false, reason: 'must be a non-negative number or null' };
    default:
      return { ok: false, reason: 'unsupported' };
  }
}
