const { Op } = require('sequelize');
const { User, Institution, GroupMember, Group } = require('../models');
const { parsePagination, paginatedResponse, parseSort } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');
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

    const { name, role, department, institution_id, avatar_url, skills, interests, is_active } = req.body;

    await user.update({
      ...(name && { name }),
      ...(role && { role }),
      ...(department !== undefined && { department }),
      ...(institution_id && { institution_id }),
      ...(avatar_url !== undefined && { avatar_url }),
      ...(skills && { skills }),
      ...(interests && { interests }),
      ...(is_active !== undefined && { is_active }),
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

    await user.update({ is_active: false });

    await createAuditLog({
      userId: req.user.id,
      action: 'user.deactivated',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'User deactivated successfully.' });
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
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty.' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const record of records) {
      try {
        const { name, email, role, department } = record;
        if (!name || !email) {
          results.errors.push({ email: email || 'unknown', reason: 'Missing name or email' });
          results.skipped++;
          continue;
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
          results.errors.push({ email, reason: 'User already exists' });
          results.skipped++;
          continue;
        }

        // Generate a default password
        const defaultPassword = await bcrypt.hash('CapstoneX@2024', 12);

        await User.create({
          name,
          email,
          password_hash: defaultPassword,
          role: role || 'student',
          department,
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

module.exports = { listUsers, getUser, updateUser, deleteUser, bulkImport };
