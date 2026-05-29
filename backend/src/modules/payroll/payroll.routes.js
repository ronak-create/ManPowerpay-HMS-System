import { Router } from 'express';
import { listPayrollRuns, createPayrollRun, getPayrollRun, approvePayroll, lockPayroll, getBankFile } from './payroll.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();

// Apply verifyJWT and requireRole to each route explicitly
router.get('/', verifyJWT, requireRole('admin'), listPayrollRuns);
router.post('/run', verifyJWT, requireRole('admin'), createPayrollRun);
router.get('/:runId', verifyJWT, requireRole('admin'), getPayrollRun);
router.patch('/:runId/approve', verifyJWT, requireRole('admin'), approvePayroll);
router.patch('/:runId/lock', verifyJWT, requireRole('admin'), lockPayroll);
router.get('/:runId/bank-file', verifyJWT, requireRole('admin'), getBankFile);

export default router;
