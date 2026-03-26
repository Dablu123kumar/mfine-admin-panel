import { body, validationResult } from 'express-validator';

// Collect validation errors and respond
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validation rules
export const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['superadmin', 'admin', 'manager', 'support', 'finance']).withMessage('Invalid role'),
];

// Doctor validation rules
export const doctorRules = [
  body('name').trim().notEmpty().withMessage('Doctor name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('speciality').notEmpty().withMessage('Speciality is required'),
];

// Patient validation rules
export const patientRules = [
  body('name').trim().notEmpty().withMessage('Patient name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
];

// Appointment validation rules
export const appointmentRules = [
  body('patient').notEmpty().withMessage('Patient is required'),
  body('doctor').notEmpty().withMessage('Doctor is required'),
  body('type').isIn(['chat', 'audio', 'video']).withMessage('Invalid appointment type'),
  body('scheduledAt').isISO8601().withMessage('Valid date is required'),
  body('fee').isNumeric().withMessage('Fee must be a number'),
];
