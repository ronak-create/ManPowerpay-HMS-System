import { Router } from 'express';
import multer from 'multer';
import { getCompany, updateCompany, uploadLogo, getLogo, addHoliday, deleteHoliday, updatePTSlabs, addSite, deleteSite, addDepartment, deleteDepartment, createAdvanceLoan, listAdvanceLoans, getStatutoryConfig, updateStatutoryConfig } from './company.controller.js';
import { exportCompanyData } from '../dataexport/dataexport.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { imageFileFilter } from '../../utils/uploads.js';

// Memory storage: logo is streamed to the storage abstraction (Render disk is ephemeral).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: imageFileFilter });

const router = Router();

// Public: logo is rendered in <img> tags which can't send an auth header.
// The id-keyed route is tenant-safe; the bare route stays for single-tenant use.
router.get('/logo', getLogo);
router.get('/:companyId/logo', getLogo);

router.use(verifyJWT);

router.get('/', getCompany);
router.put('/', requireRole('admin'), updateCompany);
router.post('/logo', requireRole('admin'), upload.single('logo'), uploadLogo);
router.post('/holidays', requireRole('admin'), addHoliday);
router.delete('/holidays/:id', requireRole('admin'), deleteHoliday);
router.put('/pt-slabs', requireRole('admin'), updatePTSlabs);
router.get('/statutory-config', getStatutoryConfig);
router.put('/statutory-config', requireRole('admin'), updateStatutoryConfig);
router.post('/sites', requireRole('admin'), addSite);
router.delete('/sites/:id', requireRole('admin'), deleteSite);
router.post('/departments', requireRole('admin'), addDepartment);
router.delete('/departments/:id', requireRole('admin'), deleteDepartment);
router.post('/advance-loans', requireRole('admin'), createAdvanceLoan);
router.get('/advance-loans', requireRole('admin'), listAdvanceLoans);
router.get('/export', requireRole('admin'), exportCompanyData);

export default router;
