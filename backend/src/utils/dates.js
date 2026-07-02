// Centralized date handling. Attendance/leave/holiday dates are calendar dates
// (@db.Date), so we represent them as UTC-midnight Date objects and compare using
// UTC methods consistently. "Today" is resolved in the company's timezone so a
// UTC-hosted server (Render) doesn't roll the date over early/late for IST users.

export const DEFAULT_TZ = 'Asia/Kolkata';

// Current calendar date in `tz`, as a UTC-midnight Date (e.g. 2026-07-02T00:00:00Z).
export function getTodayDateOnly(tz = DEFAULT_TZ) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

// Normalize any date-ish input to a UTC-midnight Date (drops the time component).
export function toDateOnly(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Stable YYYY-MM-DD key in UTC (matches how @db.Date values serialize).
export function dateKey(input) {
  const d = toDateOnly(input);
  return d ? d.toISOString().slice(0, 10) : null;
}

// Sunday check using UTC so it never mixes with UTC-based holiday keys.
export function isSunday(input) {
  const d = new Date(input);
  return d.getUTCDay() === 0;
}
