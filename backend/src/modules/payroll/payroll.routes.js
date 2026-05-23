import { Router } from 'express';
import { listPayrollRuns, createPayrollRun, getPayrollRun, approvePayroll, lockPayroll, getBankFile } from './payroll.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT, requireRole('admin'));

router.get('/', listPayrollRuns);
router.post('/run', createPayrollRun);
router.get('/:runId', getPayrollRun);
router.patch('/:runId/approve', approvePayroll);
router.patch('/:runId/lock', lockPayroll);
router.get('/:runId/bank-file', getBankFile);

export default router;
