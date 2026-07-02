import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

// All queries here run inside a tenant request, so they're auto-scoped to the
// current company by the Prisma extension.

export async function getPlanContext() {
  const [subscription, activeEmployees] = await Promise.all([
    prisma.subscription.findFirst({ include: { plan: true } }),
    prisma.employee.count({ where: { isActive: true } }),
  ]);
  const plan = subscription?.plan || null;
  // No subscription (e.g. legacy tenant) → ungated.
  const limit = plan ? plan.employeeLimit : Infinity;
  return { subscription, plan, activeEmployees, limit };
}

// Throw a 402 if adding `n` employees would exceed the plan's limit.
export async function assertCanAddEmployees(n = 1) {
  const { plan, activeEmployees, limit } = await getPlanContext();
  if (activeEmployees + n > limit) {
    throw new ApiError(
      402,
      `Your ${plan?.name || 'current'} plan allows up to ${limit} employees (you have ${activeEmployees}). Upgrade to add more.`
    );
  }
}

export function planFeature(plan, key, fallback = false) {
  return plan?.features?.[key] ?? fallback;
}
