import { Router } from 'express';
import { listSupervisors, createSupervisor, updateSupervisor, toggleSupervisorStatus, reassignEmployees } from './supervisor.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT, requireRole('admin'));

router.get('/', listSupervisors);
router.post('/', createSupervisor);
router.put('/:id', updateSupervisor);
router.patch('/:id/status', toggleSupervisorStatus);
router.post('/reassign', reassignEmployees);

export default router;
