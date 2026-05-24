import { Router } from 'express';
import multer from 'multer';
import { getCompany, updateCompany, uploadLogo, addHoliday, deleteHoliday, updatePTSlabs, addSite, deleteSite, addDepartment, deleteDepartment, createAdvanceLoan, listAdvanceLoans } from './company.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const storage = multer.diskStorage({
  destination: 'uploads/logos/',
  filename: (_, file, cb) => cb(null, `logo_${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const router = Router();
router.use(verifyJWT);

router.get('/', getCompany);
router.put('/', requireRole('admin'), updateCompany);
router.post('/logo', requireRole('admin'), upload.single('logo'), uploadLogo);
router.post('/holidays', requireRole('admin'), addHoliday);
router.delete('/holidays/:id', requireRole('admin'), deleteHoliday);
router.put('/pt-slabs', requireRole('admin'), updatePTSlabs);
router.post('/sites', requireRole('admin'), addSite);
router.delete('/sites/:id', requireRole('admin'), deleteSite);
router.post('/departments', requireRole('admin'), addDepartment);
router.delete('/departments/:id', requireRole('admin'), deleteDepartment);
router.post('/advance-loans', requireRole('admin'), createAdvanceLoan);
router.get('/advance-loans', requireRole('admin'), listAdvanceLoans);

export default router;
