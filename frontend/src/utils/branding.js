// Per-tenant branding: drive the app's accent color from the tenant's
// Company.brandColor. The color is applied as CSS variables (--brand /
// --brand-dark) that themed surfaces (primary buttons, brand tiles) read, so a
// single value re-skins the app without touching component classes.

export const DEFAULT_BRAND = "#D97706";
export const DEFAULT_BRAND_DARK = "#B45309";

// Darken a #RGB / #RRGGBB hex by `pct` (0–1) toward black.
export function shade(hex, pct = 0.18) {
  if (!hex) return hex;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return hex;
  const r = Math.round(((n >> 16) & 255) * (1 - pct));
  const g = Math.round(((n >> 8) & 255) * (1 - pct));
  const b = Math.round((n & 255) * (1 - pct));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Apply (or clear) the tenant accent color on the document root.
export function applyBranding(company) {
  const root = document.documentElement;
  const brand = company?.brandColor || DEFAULT_BRAND;
  root.style.setProperty("--brand", brand);
  root.style.setProperty("--brand-dark", shade(brand));
  if (company?.name) document.title = `${company.name} · Payroll`;
}

export function resetBranding() {
  const root = document.documentElement;
  root.style.setProperty("--brand", DEFAULT_BRAND);
  root.style.setProperty("--brand-dark", DEFAULT_BRAND_DARK);
  document.title = "ManpowerPay";
}

// Public URL for a company's logo, keyed by id so it's tenant-safe.
export function companyLogoUrl(companyId) {
  if (!companyId) return null;
  const base = import.meta.env.VITE_API_URL || "/api";
  return `${base}/company/${companyId}/logo`;
}
