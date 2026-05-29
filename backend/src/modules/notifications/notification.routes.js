import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from './notification.controller.js';
import { verifyJWT } from '../../middleware/auth.js';

const router = Router();
router.use(verifyJWT);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
