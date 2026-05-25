import { Router } from 'express';
import { getTeamAttendance, getEmployeeAttendance, markBulkAttendance, adminCorrect, getAttendanceSummary } from './attendance.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/team', requireRole('admin'), getTeamAttendance);
router.get('/summary/:empId', requireRole('admin'), getAttendanceSummary);
router.get('/employee/:empId', getEmployeeAttendance); // employee self or admin
router.post('/bulk', requireRole('admin'), markBulkAttendance);
router.patch('/:id', requireRole('admin'), adminCorrect);

export default router;
