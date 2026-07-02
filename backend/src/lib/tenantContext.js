import { AsyncLocalStorage } from 'async_hooks';

// Per-request tenant context. The tenant middleware sets { companyId } here after
// auth, and the Prisma extension reads it to scope every query to that company.
const storage = new AsyncLocalStorage();

// Run `fn` with the given tenant context bound for the duration of the request.
export function runWithTenant(context, fn) {
  return storage.run(context, fn);
}

// Current companyId, or undefined when running outside a request (auth, seed,
// signup, webhooks) — in which case the Prisma extension does not scope.
export function getCompanyId() {
  return storage.getStore()?.companyId;
}

// Escape hatch: run a callback with tenant scoping disabled (e.g. cross-tenant
// admin/system tasks). Rarely needed.
export function runUnscoped(fn) {
  return storage.run({ companyId: undefined, bypass: true }, fn);
}

export function isBypassed() {
  return storage.getStore()?.bypass === true;
}
