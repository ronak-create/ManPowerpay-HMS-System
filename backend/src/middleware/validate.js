import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Build an Express middleware that validates and coerces the request against a
 * Zod schema shaped like `{ body?, query?, params? }`. Parsed values replace the
 * originals so controllers receive typed, trimmed, defaulted data.
 *
 * Usage: router.post('/', validate({ body: createEmployeeSchema }), createEmployee)
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ApiError(400, 'Validation failed', errors));
    }
    next(err);
  }
};
