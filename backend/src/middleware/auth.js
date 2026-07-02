import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import prisma from '../config/db.js';
import { runWithTenant } from '../lib/tenantContext.js';

export const verifyJWT = async (req, res, next) => {
  try {
    // req.header() is case-insensitive in Express
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      const headerKeys = Object.keys(req.headers).join(', ');
      throw new ApiError(401, `Unauthorised — no token provided (Method: ${req.method}, Path: ${req.path}, Headers found: ${headerKeys})`);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorised — invalid format, must be Bearer <token>');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Unauthorised — empty token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      include: { employee: { select: { dateOfLeaving: true } } }
    });

    if (!user || !user.isActive) throw new ApiError(401, 'User not found or deactivated');

    // Auto-deactivate if Last Working Day has passed
    if (user.employee?.dateOfLeaving && new Date(user.employee.dateOfLeaving) < new Date()) {
      await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
      throw new ApiError(401, 'Your association with the company has ended. Access revoked.');
    }

    req.user = user;
    // Bind the tenant for the rest of the request so all Prisma queries are
    // automatically scoped to this user's company.
    return runWithTenant({ companyId: user.companyId }, () => next());
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
