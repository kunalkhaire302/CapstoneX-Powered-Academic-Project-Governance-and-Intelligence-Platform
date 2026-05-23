const router = require('express').Router();
const Joi = require('joi');
const { register, login, refreshToken, forgotPassword, getProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).optional(),
  role: Joi.string().valid('student', 'mentor', 'coordinator', 'hod', 'admin', 'accreditation').default('student'),
  department: Joi.string().optional(),
  institution_id: Joi.string().uuid().optional(),
  firebase_uid: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().optional(),
  firebase_token: Joi.string().optional(),
}).or('firebase_token', 'email');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.get('/profile', verifyToken, getProfile);
router.post('/logout', verifyToken, logout);

module.exports = router;
