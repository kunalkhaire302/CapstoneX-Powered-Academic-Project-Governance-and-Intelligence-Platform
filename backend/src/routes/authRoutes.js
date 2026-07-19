const router = require('express').Router();
const Joi = require('joi');
const { register, getProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('student').default('student'),
  department: Joi.string().optional().allow(''),
  firebase_uid: Joi.string().required(),
});

const adminRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('mentor', 'hod', 'admin', 'accreditation').required(),
  department: Joi.string().optional().allow(''),
  firebase_uid: Joi.string().required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/admin/register', verifyToken, checkRole('admin'), validate(adminRegisterSchema), register);
router.get('/profile', verifyToken, getProfile);
router.post('/logout', verifyToken, logout);

module.exports = router;
