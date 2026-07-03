import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import prisma from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { logAudit } from '../../utils/auditLog.js';
import { sendOtpEmail } from '../../utils/mailer.js';

// Branding block sent to the client so the app chrome can render tenant identity
// (name, logo, accent color) without a second round-trip.
async function companyBranding(companyId) {
  if (!companyId) return null;
  return prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, logoPath: true, brandColor: true },
  });
}

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

  const token = jwt.sign({ id: user.id, role: user.role, companyId: user.companyId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  await logAudit({ userId: user.id, action: 'LOGIN', entity: 'users', entityId: user.id, companyId: user.companyId });

  res.json(new ApiResponse(200, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, passwordResetRequired: user.passwordResetRequired },
    company: await companyBranding(user.companyId),
  }, 'Login successful'));
});

// POST /api/auth/register — self-serve company signup (public, runs untenanted)
export const register = asyncHandler(async (req, res) => {
  const { companyName, registeredAddress, adminName, adminEmail, adminMobile, password } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: adminEmail.toLowerCase() }, { mobile: adminMobile }] }
  });
  if (existing) throw new ApiError(400, 'An account with this email or mobile already exists');

  const hash = await bcrypt.hash(password, 12);

  const { company, admin } = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, registeredAddress: registeredAddress || companyName },
    });
    const admin = await tx.user.create({
      data: {
        companyId: company.id,
        name: adminName,
        email: adminEmail.toLowerCase(),
        mobile: adminMobile,
        passwordHash: hash,
        role: 'admin',
      },
    });
    // Sensible defaults so the tenant can run payroll immediately.
    await tx.site.create({ data: { companyId: company.id, name: 'Head Office' } });
    await tx.department.create({ data: { companyId: company.id, name: 'General' } });
    await tx.ptSlab.createMany({
      data: [
        { companyId: company.id, state: 'Gujarat', minSalary: 0, maxSalary: 5999, ptAmount: 0 },
        { companyId: company.id, state: 'Gujarat', minSalary: 6000, maxSalary: 8999, ptAmount: 80 },
        { companyId: company.id, state: 'Gujarat', minSalary: 9000, maxSalary: 11999, ptAmount: 150 },
        { companyId: company.id, state: 'Gujarat', minSalary: 12000, maxSalary: null, ptAmount: 200 },
      ],
    });
    await tx.salaryTemplate.create({
      data: {
        companyId: company.id,
        name: 'Standard Template',
        components: {
          create: [
            { name: 'Basic', type: 'earning', basis: 'percent_of_gross', value: 50, sequence: 1, isEpfApplicable: true, isEsicApplicable: true },
            { name: 'HRA', type: 'earning', basis: 'percent_of_basic', value: 40, sequence: 2 },
            { name: 'Travel Allowance', type: 'earning', basis: 'fixed', value: 1600, sequence: 3 },
            { name: 'Special Allowance', type: 'earning', basis: 'fixed', value: 0, sequence: 4 },
          ],
        },
      },
    });
    // Attach the free plan if one is configured.
    const freePlan = await tx.plan.findUnique({ where: { code: 'free' } });
    if (freePlan) {
      await tx.subscription.create({ data: { companyId: company.id, planId: freePlan.id, status: 'active' } });
    }
    return { company, admin };
  });

  const token = jwt.sign({ id: admin.id, role: admin.role, companyId: company.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.status(201).json(new ApiResponse(201, {
    token,
    user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, passwordResetRequired: false },
  }, 'Company registered'));
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

  // Look up the latest live OTP for this email so we can count attempts even when
  // the submitted code is wrong (defense-in-depth alongside the endpoint rate limit).
  const record = await prisma.otpToken.findFirst({
    where: { email, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
  if (!record) throw new ApiError(400, 'Invalid or expired OTP');

  const MAX_OTP_ATTEMPTS = 5;
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otpToken.update({ where: { id: record.id }, data: { used: true } });
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new OTP.');
  }
  if (record.otp !== otp) {
    await prisma.otpToken.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  const hash = await bcrypt.hash(newPassword, 12);
  // Reset the password, clear any lockout, and clear the forced-reset flag.
  await prisma.user.update({
    where: { email },
    data: { passwordHash: hash, failedAttempts: 0, lockedUntil: null, passwordResetRequired: false }
  });
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
  res.json(new ApiResponse(200, { id: user.id, name: user.name, email: user.email, role: user.role, passwordResetRequired: user.passwordResetRequired, company: await companyBranding(user.companyId), ...extra }));
});

// POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new ApiError(400, 'Current password is incorrect');

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash, passwordResetRequired: false } });
  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});
