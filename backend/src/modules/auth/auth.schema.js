import { z } from 'zod';
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../../utils/password.js';

const strongPassword = z.string().refine(isStrongPassword, { message: PASSWORD_POLICY_MESSAGE });

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  registeredAddress: z.string().optional(),
  adminName: z.string().min(2, 'Your name is required'),
  adminEmail: z.string().email().transform((v) => v.toLowerCase()),
  adminMobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits'),
  password: strongPassword,
});

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
