import prisma from '../config/db.js';

/**
 * Create a notification for one or more users.
 * @param {string|string[]} userIds - single userId or array
 * @param {object} payload - { title, message, type, entityId? }
 */
export async function createNotification(userIds, { title, message, type, entityId = null }) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (!ids.length) return;
  await prisma.notification.createMany({
    data: ids.map(userId => ({ userId, title, message, type, entityId }))
  });
}

/**
 * Notify all active employees (used for payroll events).
 */
export async function notifyAllEmployees({ title, message, type, entityId = null }) {
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    select: { userId: true }
  });
  const ids = employees.map(e => e.userId);
  if (!ids.length) return;
  await prisma.notification.createMany({
    data: ids.map(userId => ({ userId, title, message, type, entityId }))
  });
}
