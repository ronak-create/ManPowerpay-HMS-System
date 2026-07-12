import * as Sentry from '@sentry/node';

// Error tracking, dormant by default. Same pattern as razorpay/crypto/storage: does
// nothing unless SENTRY_DSN is set, so local dev and CI never phone home.
let enabled = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    // Keep tracing cheap by default; tune via env in production.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
  enabled = true;
  return true;
}

export function isSentryEnabled() {
  return enabled;
}

// Wire Sentry's Express error handler. Must be registered AFTER routes and BEFORE
// our own errorHandler. No-op when Sentry is disabled.
export function setupSentryErrorHandler(app) {
  if (enabled) Sentry.setupExpressErrorHandler(app);
}

export { Sentry };
