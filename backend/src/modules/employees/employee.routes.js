import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listEmployees, getEmployee, createEmployee, updateEmployee, toggleEmployeeStatus, uploadDocument, getMeta, bulkUploadEmployees, downloadBulkTemplate, generateAppointmentLetter, downloadAppointmentLetter, downloadRelievingLetter } from './employee.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const storage = multer.diskStorage({
  destination: 'uploads/documents/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const bulkUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const router = Router();
router.use(verifyJWT);

router.get('/meta', getMeta);
router.get('/bulk-template', requireRole('admin'), downloadBulkTemplate);
router.post('/bulk-upload', requireRole('admin'), bulkUpload.single('file'), bulkUploadEmployees);
router.get('/:id/appointment-letter', verifyJWT, downloadAppointmentLetter);
router.get('/:id/relieving-letter', verifyJWT, downloadRelievingLetter);
router.get('/', requireRole('admin'), listEmployees);
router.get('/:id', requireRole('admin'), getEmployee);
router.post('/', requireRole('admin'), createEmployee);
router.put('/:id', requireRole('admin'), updateEmployee);
router.patch('/:id/status', requireRole('admin'), toggleEmployeeStatus);
router.post('/:id/documents', requireRole('admin'), upload.single('file'), uploadDocument);

export default router;
