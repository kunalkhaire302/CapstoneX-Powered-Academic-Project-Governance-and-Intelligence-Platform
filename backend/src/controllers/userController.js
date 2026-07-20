const { Op } = require('sequelize');
const { User, Institution, GroupMember, Group } = require('../models');
const { parsePagination, paginatedResponse, parseSort } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');
const { getFirebaseAuth } = require('../config/firebase');
const { sendEmail, emailTemplates } = require('../utils/email');
const bcrypt = require('bcryptjs');
const { parse } = require('csv-parse/sync');

/**
 * List all users with pagination, filtering, and search.
 */
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { search, role, department, is_active } = req.query;
    const order = parseSort(req.query.sortBy, req.query.order, ['name', 'email', 'role', 'created_at']);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (department) where.department = department;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Institution, attributes: ['id', 'name'] }],
      order,
      limit,
      offset,
    });

    res.json(paginatedResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single user by ID.
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Institution, attributes: ['id', 'name'] },
        {
          model: GroupMember,
          as: 'group_memberships',
          include: [{ model: Group, attributes: ['id', 'name', 'status'] }],
        },
      ],
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
 * Update a user.
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, role, department, institution_id, avatar_url, skills, interests, is_active, sap_id, roll_no, branch } = req.body;

    await user.update({
      ...(name && { name }),
      ...(role && { role }),
      ...(department !== undefined && { department }),
      ...(institution_id && { institution_id }),
      ...(avatar_url !== undefined && { avatar_url }),
      ...(skills && { skills }),
      ...(interests && { interests }),
      ...(is_active !== undefined && { is_active }),
      ...(sap_id !== undefined && { sap_id }),
      ...(roll_no !== undefined && { roll_no }),
      ...(branch !== undefined && { branch }),
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'user.updated',
      entityType: 'user',
      entityId: user.id,
      metadata: req.body,
      ipAddress: req.ip,
    });

    res.json({ message: 'User updated successfully.', user: { ...user.toJSON(), password_hash: undefined } });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (deactivate) a user.
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.destroy();

    await createAuditLog({
      userId: req.user.id,
      action: 'user.deleted',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import users via CSV.
 * CSV must have columns: name, email, role, department
 */
const bulkImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required.' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: (headers) => headers.map(h => h.trim().toLowerCase().replace(/\s+/g, '_')),
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty.' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const record of records) {
      try {
        const name = record.name || record.fullname || record.student_name;
        const email = record.email || record.email_address;
        const role = record.role || 'student';
        const branch = record.branch || record.department;
        const sap_id = record.sap_id || record.sapid || record.sap_id_number;
        const roll_no = record.roll_no || record.rollno || record.roll_number;
        const providedPassword = record.password || 'CapstoneX@2024';

        if (!name || !email) {
          results.errors.push({ email: email || 'unknown', reason: 'Missing name or email' });
          results.skipped++;
          continue;
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
          results.errors.push({ email, reason: 'User with this email already exists' });
          results.skipped++;
          continue;
        }

        if (sap_id) {
          const existingSapId = await User.findOne({ where: { sap_id } });
          if (existingSapId) {
            results.errors.push({ email, reason: `User with SAP ID ${sap_id} already exists` });
            results.skipped++;
            continue;
          }
        }

        // Generate password hash
        const password_hash = await bcrypt.hash(providedPassword, 12);
        
        let firebase_uid = null;
        const firebaseAuth = getFirebaseAuth();
        if (firebaseAuth) {
          try {
            const fbUser = await firebaseAuth.createUser({
              email: email,
              password: providedPassword,
              displayName: name,
            });
            firebase_uid = fbUser.uid;
          } catch (fbErr) {
            // If already exists in Firebase, just fetch them
            if (fbErr.code === 'auth/email-already-exists') {
              const fbUser = await firebaseAuth.getUserByEmail(email);
              firebase_uid = fbUser.uid;
              await firebaseAuth.updateUser(firebase_uid, { password: providedPassword, displayName: name });
            } else {
              throw new Error(`Firebase Auth error: ${fbErr.message}`);
            }
          }
        }

        await User.create({
          name,
          email,
          password_hash,
          firebase_uid,
          role,
          sap_id,
          roll_no,
          branch,
          institution_id: req.user.institution_id,
        });

        // Send welcome email with credentials notice
        const emailContent = emailTemplates.welcome(name);
        await sendEmail({ to: email, ...emailContent });

        results.created++;
      } catch (err) {
        results.errors.push({ email: record.email, reason: err.message });
        results.skipped++;
      }
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'user.bulk_import',
      entityType: 'user',
      metadata: { total: records.length, created: results.created, skipped: results.skipped },
      ipAddress: req.ip,
    });

    res.json({
      message: `Import complete: ${results.created} created, ${results.skipped} skipped.`,
      results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current user's profile.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, bio, avatar_url, skills, interests } = req.body;

    await user.update({
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatar_url !== undefined && { avatar_url }),
      ...(skills !== undefined && { skills }),
      ...(interests !== undefined && { interests }),
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'user.profile_updated',
      entityType: 'user',
      entityId: user.id,
      metadata: req.body,
      ipAddress: req.ip,
    });

    res.json({ message: 'Profile updated successfully.', user: { ...user.toJSON(), password_hash: undefined } });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user (Admin only) with specific roles.
 */
const adminCreateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, institution_id, sap_id, roll_no, branch } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (sap_id) {
      const existingSapId = await User.findOne({ where: { sap_id } });
      if (existingSapId) {
        return res.status(409).json({ error: 'An account with this SAP ID already exists.' });
      }
    }

    let passwordHash = null;
    let providedPassword = password || 'CapstoneX@2024';
    passwordHash = await bcrypt.hash(providedPassword, 12);

    let firebase_uid = null;
    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth) {
      try {
        const fbUser = await firebaseAuth.createUser({
          email: email,
          password: providedPassword,
          displayName: name,
        });
        firebase_uid = fbUser.uid;
      } catch (fbErr) {
        if (fbErr.code === 'auth/email-already-exists') {
          const fbUser = await firebaseAuth.getUserByEmail(email);
          firebase_uid = fbUser.uid;
          await firebaseAuth.updateUser(firebase_uid, { password: providedPassword, displayName: name });
        } else {
          return res.status(500).json({ error: `Firebase Auth error: ${fbErr.message}` });
        }
      }
    }

    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      firebase_uid,
      role,
      department,
      institution_id: institution_id || req.user.institution_id,
      sap_id: role === 'student' ? sap_id : null,
      roll_no: role === 'student' ? roll_no : null,
      branch: role === 'student' ? branch : null,
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'user.created_by_admin',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'User created successfully', user: { ...user.toJSON(), password_hash: undefined } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, getUser, updateUser, deleteUser, bulkImport, updateProfile, adminCreateUser };
