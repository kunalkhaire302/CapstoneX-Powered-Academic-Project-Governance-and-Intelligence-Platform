const { getFirebaseAuth, getFirestoreDB } = require('../config/firebase');
const { sendEmail, emailTemplates } = require('../utils/email');
const { createAuditLog } = require('../utils/auditLog');
const logger = require('../utils/logger');

/**
 * Register a new user profile in Firestore.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, role, department, firebase_uid } = req.body;

    if (!firebase_uid) {
      return res.status(400).json({ error: 'Firebase UID is required.' });
    }

    const db = getFirestoreDB();
    if (!db) {
      return res.status(500).json({ error: 'Firestore is not initialized.' });
    }

    const userRef = db.collection('users').doc(firebase_uid);
    const doc = await userRef.get();
    
    if (doc.exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userData = {
      name,
      email,
      role: role || 'student',
      department: department || '',
      firebase_uid,
      created_at: new Date(),
      is_active: true
    };

    await userRef.set(userData);

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      ...emailTemplates.welcome(name),
    }).catch((err) => logger.warn('Welcome email failed:', err.message));

    // Audit log
    await createAuditLog({
      userId: firebase_uid,
      action: 'user.registered',
      entityType: 'user',
      entityId: firebase_uid,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: firebase_uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user's profile from Firestore.
 */
const getProfile = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    const userData = userDoc.data();
    res.json({ user: { id: req.user.id, ...userData } });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout — frontend handles Firebase logout, backend just acknowledges.
 */
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

module.exports = { register, getProfile, logout };
