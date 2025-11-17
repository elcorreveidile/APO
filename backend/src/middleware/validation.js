const { validationResult } = require('express-validator');

/**
 * Validate request using express-validator
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(400).json({
      success: false,
      errors: extractedErrors
    });
  }

  next();
};
