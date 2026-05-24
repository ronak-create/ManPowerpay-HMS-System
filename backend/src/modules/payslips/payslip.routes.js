import { Router } from 'express';
import { listPayslips, getPayslip, downloadPayslip, emailPayslips, generateAllPDFs } from './payslip.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/', listPayslips);
router.get('/:id', getPayslip);
router.get('/:id/pdf', downloadPayslip);
router.post('/run/:runId/email', requireRole('admin'), emailPayslips);
router.post('/run/:runId/generate-all', requireRole('admin'), generateAllPDFs);

export default router;
