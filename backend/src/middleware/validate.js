/**
 * Validation Middleware Factory
 * Creates middleware to validate requests using Zod schemas
 */

const { ZodError } = require('zod');

/**
 * Creates validation middleware from a Zod schema
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // Pass to error handler
      } else {
        next(error);
      }
    }
  };
};

module.exports = validate;
