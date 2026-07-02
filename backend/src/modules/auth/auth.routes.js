import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, forgotPassword, resetPassword, getMe, changePassword } from './auth.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.schema.js';

const router = Router();

// Throttle OTP issuance and reset attempts to prevent brute-forcing the 6-digit OTP.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

router.post('/login', validate({ body: loginSchema }), login);
router.post('/forgot-password', otpLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', otpLimiter, validate({ body: resetPasswordSchema }), resetPassword);
router.get('/me', verifyJWT, getMe);
router.post('/change-password', verifyJWT, validate({ body: changePasswordSchema }), changePassword);

export default router;
