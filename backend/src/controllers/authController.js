const bcrypt = require('bcryptjs');
const { User, Institution } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { getFirebaseAuth } = require('../config/firebase');
const { sendEmail, emailTemplates } = require('../utils/email');
const { createAuditLog } = require('../utils/auditLog');
const logger = require('../utils/logger');

/**
 * Register a new user.
 * Supports both Firebase and local auth modes.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, institution_id, firebase_uid } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password for local auth
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      role: role || 'student',
      department,
      institution_id,
      firebase_uid,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      ...emailTemplates.welcome(name),
    }).catch((err) => logger.warn('Welcome email failed:', err.message));

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'user.registered',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login with email and password.
 */
const login = async (req, res, next) => {
  try {
    const { email, password, firebase_token } = req.body;

    let user;

    if (firebase_token) {
      // Firebase auth flow
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) {
        try {
          const decoded = await firebaseAuth.verifyIdToken(firebase_token);
          user = await User.findOne({ where: { email: decoded.email } });
          if (!user) {
            // Auto-register Firebase users
            user = await User.create({
              name: decoded.name || decoded.email.split('@')[0],
              email: decoded.email,
              firebase_uid: decoded.uid,
              avatar_url: decoded.picture,
              role: 'student',
            });
          }
        } catch (firebaseErr) {
          return res.status(401).json({ error: 'Invalid Firebase token.' });
        }
      } else {
        return res.status(500).json({ error: 'Firebase not configured.' });
      }
    } else {
      // Local auth flow
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (!user.password_hash) {
        return res.status(401).json({ error: 'This account uses Google sign-in. Please use Google OAuth.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact your administrator.' });
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await createAuditLog({
      userId: user.id,
      action: 'user.login',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar_url: user.avatar_url,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using refresh token from cookie.
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token not found.' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }
    next(error);
  }
};

/**
 * Forgot password — sends reset link via email.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
    }

    const resetToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      ...emailTemplates.passwordReset(user.name, resetLink),
    });

    res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user's profile.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Institution, attributes: ['id', 'name'] }],
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout — clears refresh token cookie.
 */
const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully.' });
};

module.exports = { register, login, refreshToken, forgotPassword, getProfile, logout };
