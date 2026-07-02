-- Reconcile columns that were added to the database out-of-band so migration
-- history reproduces the current schema. IF NOT EXISTS keeps this idempotent on
-- databases where the columns already exist.
ALTER TABLE "otp_tokens" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false;

-- Indexes on frequently-filtered / foreign-key columns.
CREATE INDEX IF NOT EXISTS "attendance_date_idx" ON "attendance"("date");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX IF NOT EXISTS "employees_departmentId_idx" ON "employees"("departmentId");
CREATE INDEX IF NOT EXISTS "employees_siteId_idx" ON "employees"("siteId");
CREATE INDEX IF NOT EXISTS "holidays_date_idx" ON "holidays"("date");
CREATE INDEX IF NOT EXISTS "leave_requests_employeeId_idx" ON "leave_requests"("employeeId");
CREATE INDEX IF NOT EXISTS "leave_requests_status_idx" ON "leave_requests"("status");
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "otp_tokens_email_idx" ON "otp_tokens"("email");
CREATE INDEX IF NOT EXISTS "payslips_payrollRunId_idx" ON "payslips"("payrollRunId");
