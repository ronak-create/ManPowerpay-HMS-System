import { Router } from 'express';
import { getTeamAttendance, getEmployeeAttendance, markBulkAttendance, adminCorrect, getAttendanceSummary } from './attendance.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/team', requireRole('supervisor', 'admin'), getTeamAttendance);
router.get('/summary/:empId', requireRole('admin', 'supervisor'), getAttendanceSummary);
router.get('/employee/:empId', getEmployeeAttendance); // employee self, admin, supervisor
router.post('/bulk', requireRole('supervisor', 'admin'), markBulkAttendance);
router.patch('/:id', requireRole('admin'), adminCorrect);

export default router;
