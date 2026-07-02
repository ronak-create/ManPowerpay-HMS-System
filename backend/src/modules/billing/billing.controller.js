import prisma from '../../config/db.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { getPlanContext } from '../../lib/plan.js';

// GET /api/billing — current plan, usage, and available plans (for upgrade UI)
export const getBilling = asyncHandler(async (req, res) => {
  const { subscription, plan, activeEmployees, limit } = await getPlanContext();
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  });
  res.json(new ApiResponse(200, {
    subscription: subscription
      ? { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd }
      : null,
    plan,
    usage: { activeEmployees, employeeLimit: limit === Infinity ? null : limit },
    availablePlans: plans,
  }));
});
