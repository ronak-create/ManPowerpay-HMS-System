import ApiError from '../utils/ApiError.js';

// Usage: requireRole('admin') or requireRole('admin', 'supervisor')
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied — requires role: ${roles.join(' or ')}`));
  }
  next();
};
