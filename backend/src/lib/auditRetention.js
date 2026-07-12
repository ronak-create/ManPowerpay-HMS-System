import prisma from '../config/db.js';
import { runUnscoped } from './tenantContext.js';

// Default retention window for audit logs. Overridable via AUDIT_LOG_RETENTION_DAYS.
// Indian statutory records (payroll, PF/ESI) are kept elsewhere; audit trail here is
// operational history, so a rolling window is appropriate. 0/negative disables pruning.
export const DEFAULT_RETENTION_DAYS = 365;

export function getRetentionDays() {
  const raw = process.env.AUDIT_LOG_RETENTION_DAYS;
  if (raw === undefined || raw === '') return DEFAULT_RETENTION_DAYS;
  const n = Number(raw);
  return Number.isFinite(n) ? n : DEFAULT_RETENTION_DAYS;
}

// Delete audit logs older than the retention window across ALL tenants. Runs
// unscoped on purpose — this is a platform maintenance task, not a per-request one.
// Returns { retentionDays, cutoff, deleted } (deleted null when pruning disabled).
export async function pruneAuditLogs(retentionDays = getRetentionDays()) {
  if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
    return { retentionDays, cutoff: null, deleted: null };
  }
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const { count } = await runUnscoped(() =>
    prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } })
  );
  return { retentionDays, cutoff, deleted: count };
}
