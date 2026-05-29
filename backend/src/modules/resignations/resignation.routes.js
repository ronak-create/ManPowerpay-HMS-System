import { Router } from 'express';
import { 
  applyResignation, 
  listResignations, 
  approveResignation, 
  rejectResignation, 
  withdrawResignation, 
  downloadResignationLetter, 
  purgeEmployeeData 
} from './resignation.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/', listResignations);
router.post('/apply', applyResignation);
router.patch('/:id/withdraw', withdrawResignation);
router.get('/:id/letter', downloadResignationLetter);

// Admin only
router.patch('/:id/approve', requireRole('admin'), approveResignation);
router.patch('/:id/reject', requireRole('admin'), rejectResignation);
router.delete('/purge/:employeeId', requireRole('admin'), purgeEmployeeData);

export default router;
