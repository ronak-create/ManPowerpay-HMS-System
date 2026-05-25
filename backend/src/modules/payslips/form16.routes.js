import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { downloadForm16, generateAllForm16 } from './form16.controller.js';

const router = Router();
router.use(verifyJWT);

router.get('/:empId', downloadForm16);
router.post('/generate-all', requireRole('admin'), generateAllForm16);

export default router;
