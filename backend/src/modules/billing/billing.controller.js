import prisma from '../../config/db.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { getPlanContext } from '../../lib/plan.js';
import { getCompanyId } from '../../lib/tenantContext.js';
import {
  isConfigured,
  getPublicKeyId,
  ensureRazorpayPlan,
  createSubscription,
  fetchSubscription,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from '../../lib/razorpay.js';

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
    gatewayConfigured: isConfigured(),
  }));
});

// POST /api/billing/checkout — start a plan change.
// Free plans switch immediately; paid plans create a Razorpay subscription and
// return the id + public key for Checkout to open in the browser.
export const createCheckout = asyncHandler(async (req, res) => {
  const companyId = getCompanyId();
  const { planCode } = req.body || {};
  if (!planCode) throw new ApiError(400, 'planCode is required');

  const plan = await prisma.plan.findFirst({ where: { code: planCode, isActive: true } });
  if (!plan) throw new ApiError(404, 'Plan not found');

  // Free tier → switch immediately, no payment.
  if (Number(plan.priceMonthly) === 0) {
    await prisma.subscription.upsert({
      where: { companyId },
      update: { planId: plan.id, status: 'active', currentPeriodEnd: null, razorpaySubscriptionId: null },
      create: { planId: plan.id, status: 'active' },
    });
    return res.json(new ApiResponse(200, { free: true }, 'Switched to the free plan.'));
  }

  if (!isConfigured()) {
    throw new ApiError(503, 'Online payments are not enabled yet. Please contact support to change your plan.');
  }

  const razorpayPlanId = await ensureRazorpayPlan(plan);
  const rzSub = await createSubscription({ razorpayPlanId, companyId, notes: { planCode: plan.code } });

  // Record the pending Razorpay subscription against this tenant. We keep the
  // company on the free plan until payment is verified (create-branch), so a
  // higher limit is never granted before payment lands.
  const freePlan = await prisma.plan.findFirst({ where: { code: 'free' } });
  await prisma.subscription.upsert({
    where: { companyId },
    update: { razorpaySubscriptionId: rzSub.id, status: 'created' },
    create: { planId: freePlan?.id || plan.id, status: 'created', razorpaySubscriptionId: rzSub.id },
  });

  res.json(new ApiResponse(200, {
    razorpaySubscriptionId: rzSub.id,
    keyId: getPublicKeyId(),
    planName: plan.name,
    amount: Math.round(Number(plan.priceMonthly) * 100),
  }));
});

// POST /api/billing/verify — confirm a successful Checkout and activate the plan.
export const verifyPayment = asyncHandler(async (req, res) => {
  const companyId = getCompanyId();
  const {
    razorpay_payment_id: paymentId,
    razorpay_subscription_id: subscriptionId,
    razorpay_signature: signature,
    planCode,
  } = req.body || {};

  if (!paymentId || !subscriptionId || !signature || !planCode) {
    throw new ApiError(400, 'Missing payment confirmation fields');
  }
  if (!verifyCheckoutSignature({ paymentId, subscriptionId, signature })) {
    throw new ApiError(400, 'Payment signature verification failed');
  }

  // The subscription id must be the one we created for this tenant.
  const existing = await prisma.subscription.findFirst({ where: { razorpaySubscriptionId: subscriptionId } });
  if (!existing) throw new ApiError(404, 'No matching subscription for this company');

  const plan = await prisma.plan.findFirst({ where: { code: planCode, isActive: true } });
  if (!plan) throw new ApiError(404, 'Plan not found');

  // Cross-check that the paid Razorpay subscription is really for this plan.
  const rzSub = await fetchSubscription(subscriptionId);
  if (plan.razorpayPlanId && rzSub.plan_id !== plan.razorpayPlanId) {
    throw new ApiError(400, 'Payment does not match the selected plan');
  }
  const currentPeriodEnd = rzSub.current_end ? new Date(rzSub.current_end * 1000) : null;

  const updated = await prisma.subscription.update({
    where: { companyId },
    data: { planId: plan.id, status: 'active', currentPeriodEnd },
  });

  await prisma.paymentEvent.create({
    data: {
      subscriptionId: updated.id,
      event: 'checkout.verified',
      payloadJson: { paymentId, subscriptionId, planCode },
    },
  });

  res.json(new ApiResponse(200, { plan: { code: plan.code, name: plan.name } }, 'Plan activated.'));
});

// Razorpay subscription event → our subscription status. Anything else is logged
// but left as-is.
const STATUS_BY_EVENT = {
  'subscription.activated': 'active',
  'subscription.charged': 'active',
  'subscription.authenticated': 'active',
  'subscription.pending': 'past_due',
  'subscription.halted': 'halted',
  'subscription.cancelled': 'cancelled',
  'subscription.completed': 'cancelled',
};

// POST /api/billing/webhook — public, signature-verified. Mounted in app.js with a
// raw body parser so we can validate the HMAC over the exact bytes Razorpay sent.
// Runs outside any tenant context, so Subscription queries here are not auto-scoped.
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer, from express.raw
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody.toString('utf8'));
  const event = payload.event;
  const rzSub = payload.payload?.subscription?.entity;

  if (rzSub?.id) {
    const sub = await prisma.subscription.findFirst({ where: { razorpaySubscriptionId: rzSub.id } });
    if (sub) {
      const nextStatus = STATUS_BY_EVENT[event];
      const data = {};
      if (nextStatus) data.status = nextStatus;
      if (rzSub.current_end) data.currentPeriodEnd = new Date(rzSub.current_end * 1000);
      if (Object.keys(data).length) {
        await prisma.subscription.update({ where: { id: sub.id }, data });
      }
      await prisma.paymentEvent.create({
        data: { subscriptionId: sub.id, event: event || 'unknown', payloadJson: payload },
      });
    }
  }

  // Always 200 quickly so Razorpay doesn't retry a handled event.
  res.json({ received: true });
});
