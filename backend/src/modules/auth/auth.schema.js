import { z } from 'zod';
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../utils/password.js';

const strongPassword = z.string().refine(isStrongPassword, { message: PASSWORD_POLICY_MESSAGE });

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: strongPassword,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPassword,
});
