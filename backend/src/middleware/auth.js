const { getFirebaseAuth, getFirestoreDB } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Authentication middleware.
 * Uses Firebase ID tokens.
 * Sets req.user = { id, email, role, name } on success.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    const firebaseAuth = getFirebaseAuth();
    const db = getFirestoreDB();
    if (!firebaseAuth || !db) {
      return res.status(500).json({ error: 'Firebase is not initialized.' });
    }

    try {
      const firebaseUser = await firebaseAuth.verifyIdToken(token);
      
      const userRef = db.collection('users').doc(firebaseUser.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(401).json({ error: 'User profile not found.' });
      }
      
      const userData = userDoc.data();
      
      req.user = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        role: userData.role || 'student',
        name: userData.name,
        department: userData.department,
        firebaseUid: firebaseUser.uid
      };
      
      return next();
    } catch (firebaseErr) {
      logger.debug('Firebase token verification failed:', firebaseErr.message);
      return res.status(401).json({ error: 'Invalid or expired Firebase token.' });
    }
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
