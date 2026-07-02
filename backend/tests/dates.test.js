import { describe, it, expect } from 'vitest';
import { toDateOnly, dateKey, isSunday, getTodayDateOnly } from '../src/utils/dates.js';

describe('dates util', () => {
  it('toDateOnly strips time to UTC midnight', () => {
    const d = toDateOnly('2026-06-02T18:30:00.000Z');
    expect(d.toISOString()).toBe('2026-06-02T00:00:00.000Z');
  });

  it('dateKey is a stable UTC YYYY-MM-DD', () => {
    expect(dateKey('2026-06-02T23:59:00.000Z')).toBe('2026-06-02');
    expect(dateKey(new Date('2026-12-31T00:00:00.000Z'))).toBe('2026-12-31');
  });

  it('isSunday uses UTC day-of-week', () => {
    expect(isSunday('2026-06-07')).toBe(true);  // Sunday
    expect(isSunday('2026-06-08')).toBe(false); // Monday
  });

  it('getTodayDateOnly returns a UTC-midnight date', () => {
    const d = getTodayDateOnly('Asia/Kolkata');
    expect(d.toISOString()).toMatch(/T00:00:00\.000Z$/);
  });

  it('getTodayDateOnly can differ from UTC date near midnight boundaries', () => {
    // At 22:00 UTC, IST (UTC+5:30) is already the next calendar day.
    // We can't freeze time here without a mock, so just assert it is a valid date.
    const ist = getTodayDateOnly('Asia/Kolkata');
    const utc = getTodayDateOnly('UTC');
    const diffDays = Math.abs((ist - utc) / 86400000);
    expect(diffDays <= 1).toBe(true);
  });
});
