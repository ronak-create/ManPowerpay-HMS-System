import { Router } from 'express';
import { listLeaves, applyLeave, approveLeave, rejectLeave, cancelLeave, getLeaveBalance, initLeaveBalance } from './leave.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/', listLeaves);
router.get('/balance/:empId', getLeaveBalance);
router.post('/', requireRole('employee'), applyLeave);
router.patch('/:id/approve', requireRole('admin', 'supervisor'), approveLeave);
router.patch('/:id/reject', requireRole('admin', 'supervisor'), rejectLeave);
router.patch('/:id/cancel', requireRole('employee'), cancelLeave);
router.post('/balance/init', requireRole('admin'), initLeaveBalance);

export default router;
