-- Multi-tenancy: add companyId to tenant tables (backfilled to the existing
-- company), composite unique keys, and billing tables.

-- ── Billing tables ──────────────────────────────────────────────────────────
CREATE TABLE "plans" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "employeeLimit" INTEGER NOT NULL DEFAULT 10,
  "features" JSONB NOT NULL DEFAULT '{}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "currentPeriodEnd" TIMESTAMP(3),
  "razorpaySubscriptionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscriptions_companyId_key" ON "subscriptions"("companyId");

CREATE TABLE "payment_events" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payment_events_subscriptionId_idx" ON "payment_events"("subscriptionId");

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Add companyId to tenant tables (nullable → backfill → NOT NULL) ──────────
-- Backfill target: the single existing company.
DO $$
DECLARE cid TEXT;
BEGIN
  SELECT id INTO cid FROM "companies" ORDER BY "createdAt" ASC LIMIT 1;

  ALTER TABLE "users"          ADD COLUMN "companyId" TEXT;
  ALTER TABLE "employees"      ADD COLUMN "companyId" TEXT;
  ALTER TABLE "attendance"     ADD COLUMN "companyId" TEXT;
  ALTER TABLE "leave_requests" ADD COLUMN "companyId" TEXT;
  ALTER TABLE "leave_balances" ADD COLUMN "companyId" TEXT;
  ALTER TABLE "payroll_runs"   ADD COLUMN "companyId" TEXT;
  ALTER TABLE "payslips"       ADD COLUMN "companyId" TEXT;
  ALTER TABLE "advance_loans"  ADD COLUMN "companyId" TEXT;
  ALTER TABLE "audit_logs"     ADD COLUMN "companyId" TEXT;
  ALTER TABLE "notifications"  ADD COLUMN "companyId" TEXT;
  ALTER TABLE "resignations"   ADD COLUMN "companyId" TEXT;
  ALTER TABLE "form16"         ADD COLUMN "companyId" TEXT;

  UPDATE "users"          SET "companyId" = cid;
  UPDATE "employees"      SET "companyId" = cid;
  UPDATE "attendance"     SET "companyId" = cid;
  UPDATE "leave_requests" SET "companyId" = cid;
  UPDATE "leave_balances" SET "companyId" = cid;
  UPDATE "payroll_runs"   SET "companyId" = cid;
  UPDATE "payslips"       SET "companyId" = cid;
  UPDATE "advance_loans"  SET "companyId" = cid;
  UPDATE "audit_logs"     SET "companyId" = cid;
  UPDATE "notifications"  SET "companyId" = cid;
  UPDATE "resignations"   SET "companyId" = cid;
  UPDATE "form16"         SET "companyId" = cid;
END $$;

ALTER TABLE "users"          ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "employees"      ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "attendance"     ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "leave_requests" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "leave_balances" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "payroll_runs"   ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "payslips"       ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "advance_loans"  ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "audit_logs"     ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "notifications"  ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "resignations"   ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "form16"         ALTER COLUMN "companyId" SET NOT NULL;

-- ── Replace global uniques with tenant-scoped composite uniques ──────────────
DROP INDEX IF EXISTS "employees_empCode_key";
CREATE UNIQUE INDEX "employees_companyId_empCode_key" ON "employees"("companyId", "empCode");
DROP INDEX IF EXISTS "payroll_runs_month_year_key";
CREATE UNIQUE INDEX "payroll_runs_companyId_month_year_key" ON "payroll_runs"("companyId", "month", "year");

-- ── Indexes on companyId ────────────────────────────────────────────────────
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
CREATE INDEX "employees_companyId_idx" ON "employees"("companyId");
CREATE INDEX "attendance_companyId_idx" ON "attendance"("companyId");
CREATE INDEX "leave_requests_companyId_idx" ON "leave_requests"("companyId");
CREATE INDEX "leave_balances_companyId_idx" ON "leave_balances"("companyId");
CREATE INDEX "payroll_runs_companyId_idx" ON "payroll_runs"("companyId");
CREATE INDEX "payslips_companyId_idx" ON "payslips"("companyId");
CREATE INDEX "advance_loans_companyId_idx" ON "advance_loans"("companyId");
CREATE INDEX "audit_logs_companyId_idx" ON "audit_logs"("companyId");
CREATE INDEX "notifications_companyId_idx" ON "notifications"("companyId");
CREATE INDEX "resignations_companyId_idx" ON "resignations"("companyId");
CREATE INDEX "form16_companyId_idx" ON "form16"("companyId");

-- ── Foreign keys ────────────────────────────────────────────────────────────
ALTER TABLE "users"          ADD CONSTRAINT "users_companyId_fkey"          FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "employees"      ADD CONSTRAINT "employees_companyId_fkey"      FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendance"     ADD CONSTRAINT "attendance_companyId_fkey"     FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payroll_runs"   ADD CONSTRAINT "payroll_runs_companyId_fkey"   FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payslips"       ADD CONSTRAINT "payslips_companyId_fkey"       FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "advance_loans"  ADD CONSTRAINT "advance_loans_companyId_fkey"  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs"     ADD CONSTRAINT "audit_logs_companyId_fkey"     FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications"  ADD CONSTRAINT "notifications_companyId_fkey"  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resignations"   ADD CONSTRAINT "resignations_companyId_fkey"   FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "form16"         ADD CONSTRAINT "form16_companyId_fkey"         FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
