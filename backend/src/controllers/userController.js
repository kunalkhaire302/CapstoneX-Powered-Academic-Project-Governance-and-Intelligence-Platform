const { getFirestoreDB, getFirebaseAuth } = require('../config/firebase');
const { createAuditLog } = require('../utils/auditLog');
const { sendEmail, emailTemplates } = require('../utils/email');
const { parse } = require('csv-parse/sync');

/**
 * List all users.
 */
const listUsers = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const usersSnapshot = await db.collection('users').get();
    
    let users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ data: users, total: users.length, page: 1, limit: users.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single user by ID.
 */
const getUser = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({ user: { id: userDoc.id, ...userDoc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user.
 */
const updateUser = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, role, department, avatar_url, skills, interests, is_active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (skills !== undefined) updates.skills = skills;
    if (interests !== undefined) updates.interests = interests;
    if (is_active !== undefined) updates.is_active = is_active;

    await userRef.update(updates);

    await createAuditLog({
      userId: req.user.id,
      action: 'user.updated',
      entityType: 'user',
      entityId: req.params.id,
      metadata: req.body,
      ipAddress: req.ip,
    });

    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (deactivate) a user.
 */
const deleteUser = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const userRef = db.collection('users').doc(req.params.id);
    
    await userRef.update({ is_active: false });

    await createAuditLog({
      userId: req.user.id,
      action: 'user.deactivated',
      entityType: 'user',
      entityId: req.params.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import users via CSV.
 */
const bulkImport = async (req, res, next) => {
  res.status(501).json({ error: 'Bulk import disabled during Firestore migration.' });
};

/**
 * Update the current user's profile.
 */
const updateProfile = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, bio, avatar_url, skills, interests } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (skills !== undefined) updates.skills = skills;
    if (interests !== undefined) updates.interests = interests;

    await userRef.update(updates);

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user (Admin only).
 */
const adminCreateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }

    const auth = getFirebaseAuth();
    const userRecord = await auth.createUser({
      email,
      password: password || 'CapstoneX@2024',
      displayName: name,
    });

    const db = getFirestoreDB();
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      department: department || '',
      created_at: new Date(),
      is_active: true
    });

    res.status(201).json({ message: 'User created successfully', user: { id: userRecord.uid, name, email, role } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, getUser, updateUser, deleteUser, bulkImport, updateProfile, adminCreateUser };
