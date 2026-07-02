import prisma from '../config/db.js';

// companyId is auto-injected by the tenant-scoping Prisma extension for calls made
// inside an authenticated request. Pass it explicitly for pre-auth calls (e.g.
// login), which run without a tenant context.
export const logAudit = async ({ userId, action, entity, entityId, oldValue, newValue, companyId }) => {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId: String(entityId), oldValue, newValue, ...(companyId ? { companyId } : {}) }
  });
};
