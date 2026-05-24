import { Router } from 'express';
import { generateEPFECR, generateESIC, generatePTChallan } from './statutory.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT, requireRole('admin'));

router.get('/epf-ecr', generateEPFECR);
router.get('/esic', generateESIC);
router.get('/pt', generatePTChallan);

export default router;
