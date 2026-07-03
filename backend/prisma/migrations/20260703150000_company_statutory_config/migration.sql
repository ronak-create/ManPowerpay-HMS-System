-- AlterTable
-- Nullable jurisdiction-rules override for the payroll engine.
-- NULL means "use the built-in India defaults" (see src/modules/payroll/payroll.statutory.js).
ALTER TABLE "companies" ADD COLUMN "statutoryConfig" JSONB;
