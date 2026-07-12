// Standalone audit-log pruning job. Schedule on the host (cron / Render cron job /
// GitHub Actions) to run daily:  node scripts/pruneAuditLogs.js
//
// Retention window comes from AUDIT_LOG_RETENTION_DAYS (default 365). Set it to 0
// to disable pruning. Exits non-zero on failure so a scheduler can alert.
import dotenv from 'dotenv';
import { pruneAuditLogs } from '../src/lib/auditRetention.js';
import prisma from '../src/config/db.js';

dotenv.config();

(async () => {
  try {
    const result = await pruneAuditLogs();
    if (result.deleted === null) {
      console.log(`[prune-audit] pruning disabled (retentionDays=${result.retentionDays}); nothing deleted.`);
    } else {
      console.log(`[prune-audit] deleted ${result.deleted} audit log(s) older than ${result.retentionDays} days (cutoff ${result.cutoff.toISOString()}).`);
    }
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[prune-audit] failed:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
})();
