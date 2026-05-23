/**
 * Joi validation middleware factory.
 * Creates middleware that validates req.body, req.query, or req.params against a Joi schema.
 *
 * Usage:
 *   const { validate } = require('../middleware/validator');
 *   router.post('/users', validate(createUserSchema, 'body'), handler);
 */

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }

    // Replace with validated + sanitized values
    req[property] = value;
    next();
  };
};

module.exports = { validate };
