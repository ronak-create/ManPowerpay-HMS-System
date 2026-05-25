import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';
import { sendOtpEmail } from '../../utils/mailer.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  // Check lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(403, `Account locked until ${user.lockedUntil.toISOString()}`);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const attempts = user.failedAttempts + 1;
    const lock = attempts >= 5 ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {};
    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: attempts, ...lock } });
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null, lastLogin: new Date() } });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  await logAudit({ userId: user.id, action: 'LOGIN', entity: 'users', entityId: user.id });

  res.json(new ApiResponse(200, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  }, 'Login successful'));
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });
  // Always return 200 to prevent email enumeration
  if (!user) return res.json(new ApiResponse(200, null, 'If account exists, OTP has been sent'));

  const otp = randomInt(100000, 999999).toString();
  await prisma.otpToken.create({
    data: { email: user.email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });

  await sendOtpEmail(user.email, user.name, otp);
  res.json(new ApiResponse(200, null, 'OTP sent to email'));
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new ApiError(400, 'All fields required');
  if (newPassword.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  const record = await prisma.otpToken.findFirst({
    where: { email: email.toLowerCase(), otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  if (!record) throw new ApiError(400, 'Invalid or expired OTP');

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email: email.toLowerCase() }, data: { passwordHash: hash } });
  await prisma.otpToken.update({ where: { id: record.id }, data: { used: true } });

  res.json(new ApiResponse(200, null, 'Password reset successful'));
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let extra = {};
  if (user.role === 'employee') {
    extra.employee = await prisma.employee.findUnique({ where: { userId: user.id }, include: { site: true, department: true } });
  }
  res.json(new ApiResponse(200, { id: user.id, name: user.name, email: user.email, role: user.role, ...extra }));
});

// POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Both fields required');
  if (newPassword.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new ApiError(400, 'Current password is incorrect');

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});
