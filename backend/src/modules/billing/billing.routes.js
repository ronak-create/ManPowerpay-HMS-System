import { Router } from 'express';
import { getBilling } from './billing.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/', requireRole('admin'), getBilling);

export default router;
