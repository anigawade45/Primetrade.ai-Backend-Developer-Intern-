const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

const userValidationRules = () => {
  return [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ];
};

const loginValidationRules = () => {
  return [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty(),
  ];
};

const taskValidationRules = () => {
  return [
    body('title', 'Title is required').optional().notEmpty().trim(),
    body('description', 'Description is required').optional().notEmpty().trim(),
    body('status', 'Status must be pending, in-progress or completed')
      .optional()
      .isIn(['pending', 'in-progress', 'completed']),
  ];
};

module.exports = {
  userValidationRules,
  loginValidationRules,
  taskValidationRules,
  validate,
};
