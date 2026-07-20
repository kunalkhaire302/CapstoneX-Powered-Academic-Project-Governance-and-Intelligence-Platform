const jwt = require('jsonwebtoken');
const { getFirebaseAuth } = require('../config/firebase');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Authentication middleware.
 * Supports both Firebase ID tokens and local JWT tokens.
 * Sets req.user = { id, email, role, name } on success.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded = null;

    // Try Firebase token verification first
    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth) {
      try {
        const firebaseUser = await firebaseAuth.verifyIdToken(token);
        // Find the user in our database by firebase UID or email
        const user = await User.findOne({
          where: { email: firebaseUser.email },
          attributes: ['id', 'email', 'role', 'name', 'institution_id'],
        });
        if (!user) {
          return res.status(401).json({ error: 'User not found. Please register first.' });
        }
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          institution_id: user.institution_id,
        };
        return next();
      } catch (firebaseErr) {
        // Not a Firebase token, try local JWT
        logger.debug('Firebase token verification failed, trying local JWT');
      }
    }

    // Local JWT verification
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired. Please refresh.' });
      }
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Look up user from decoded token
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'name', 'institution_id'],
    });
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      institution_id: user.institution_id,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};

/**
 * Optional auth — sets req.user if token is present, but doesn't block.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return verifyToken(req, res, next);
};

module.exports = { verifyToken, optionalAuth };
