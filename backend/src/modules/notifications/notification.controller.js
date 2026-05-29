import prisma from '../../config/db.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// GET /api/notifications — get current user's notifications (latest 30)
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false }
  });
  res.json(new ApiResponse(200, { notifications, unreadCount }));
});

// PATCH /api/notifications/:id/read — mark one as read
export const markRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true }
  });
  res.json(new ApiResponse(200, null, 'Marked as read'));
});

// PATCH /api/notifications/read-all — mark all as read
export const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true }
  });
  res.json(new ApiResponse(200, null, 'All marked as read'));
});
