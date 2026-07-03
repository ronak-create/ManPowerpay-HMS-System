-- Per-tenant branding accent color. NULL = use the platform default (amber).
ALTER TABLE "companies" ADD COLUMN "brandColor" TEXT;
