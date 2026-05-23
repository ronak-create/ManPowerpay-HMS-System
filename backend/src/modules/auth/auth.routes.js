import { Router } from 'express';
import { login, forgotPassword, resetPassword, getMe, changePassword } from './auth.controller.js';
import { verifyJWT } from '../../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyJWT, getMe);
router.post('/change-password', verifyJWT, changePassword);

export default router;
