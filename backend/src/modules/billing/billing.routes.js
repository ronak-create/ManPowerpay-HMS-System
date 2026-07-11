import { Router } from 'express';
import { getBilling, createCheckout, verifyPayment } from './billing.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/', requireRole('admin'), getBilling);
router.post('/checkout', requireRole('admin'), createCheckout);
router.post('/verify', requireRole('admin'), verifyPayment);

export default router;
