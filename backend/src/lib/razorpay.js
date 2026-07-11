import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../config/db.js';

// Razorpay billing gateway.
//
// Activation: set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET. When they're absent the
// client stays dormant (isConfigured() === false) and the billing controller
// surfaces a "gateway not configured" state instead of crashing — mirroring the
// dormant patterns used for PII encryption and Supabase storage.

let client;
let warned = false;

export function isConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getPublicKeyId() {
  return process.env.RAZORPAY_KEY_ID || null;
}

// Lazily construct the SDK client (env is loaded by the time a request arrives).
function getClient() {
  if (!isConfigured()) {
    if (!warned) {
      console.warn('[razorpay] RAZORPAY_KEY_ID/SECRET not set — billing checkout is DORMANT.');
      warned = true;
    }
    return null;
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

// Ensure a Razorpay Plan object exists for one of our DB plans and return its id.
// The id is cached on Plan.razorpayPlanId so we create it at most once.
export async function ensureRazorpayPlan(plan) {
  if (plan.razorpayPlanId) return plan.razorpayPlanId;
  const rzp = getClient();
  if (!rzp) throw new Error('Razorpay is not configured');

  // priceMonthly is a rupee amount (Decimal→Number by the Prisma extension).
  const amountPaise = Math.round(Number(plan.priceMonthly) * 100);
  const rzpPlan = await rzp.plans.create({
    period: 'monthly',
    interval: 1,
    item: {
      name: `${plan.name} (ManpowerPay)`,
      amount: amountPaise,
      currency: 'INR',
    },
    notes: { planCode: plan.code },
  });

  // Plan is a global (non-tenant) model, so this write isn't auto-scoped.
  await prisma.plan.update({
    where: { id: plan.id },
    data: { razorpayPlanId: rzpPlan.id },
  });
  return rzpPlan.id;
}

// Create a recurring subscription for a plan. total_count is the max number of
// billing cycles Razorpay will attempt (10 years of monthly ≈ effectively ongoing).
export async function createSubscription({ razorpayPlanId, companyId, notes = {} }) {
  const rzp = getClient();
  if (!rzp) throw new Error('Razorpay is not configured');
  return rzp.subscriptions.create({
    plan_id: razorpayPlanId,
    total_count: 120,
    customer_notify: 1,
    notes: { companyId, ...notes },
  });
}

export async function fetchSubscription(subscriptionId) {
  const rzp = getClient();
  if (!rzp) throw new Error('Razorpay is not configured');
  return rzp.subscriptions.fetch(subscriptionId);
}

// Verify the signature returned by Checkout on a successful subscription payment.
// Razorpay signs `payment_id + '|' + subscription_id` with the key secret.
export function verifyCheckoutSignature({ paymentId, subscriptionId, signature }) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex');
  return timingSafeEqual(expected, signature);
}

// Verify a webhook payload against the raw request body using the webhook secret.
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
