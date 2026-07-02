import { Router } from 'express';
import multer from 'multer';
import { getTeamAttendance, getEmployeeAttendance, markBulkAttendance, adminCorrect, getAttendanceSummary, downloadAttendanceTemplate, bulkUploadAttendance } from './attendance.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { spreadsheetFileFilter } from '../../utils/uploads.js';

const bulkUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: spreadsheetFileFilter });

const router = Router();
router.use(verifyJWT);

router.get('/team', requireRole('admin'), getTeamAttendance);
router.get('/bulk-template', requireRole('admin'), downloadAttendanceTemplate);
router.post('/bulk-upload', requireRole('admin'), bulkUpload.single('file'), bulkUploadAttendance);
router.get('/summary/:empId', requireRole('admin'), getAttendanceSummary);
router.get('/employee/:empId', getEmployeeAttendance); 
router.post('/bulk', requireRole('admin'), markBulkAttendance);
router.patch('/:id', requireRole('admin'), adminCorrect);

export default router;
