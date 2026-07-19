const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('FATAL ERROR: JWT secrets are not defined.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate an access token (short-lived, 15 min default).
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
  );
};

/**
 * Generate a refresh token (long-lived, 7 days default).
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY, algorithm: 'HS256' }
  );
};

/**
 * Verify an access token.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
};

/**
 * Verify a refresh token.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
