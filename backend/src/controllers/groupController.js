const { Group, GroupMember, User, Topic } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { logAction } = require('../utils/auditLog');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

/**
 * Create a new capstone group
 */
const createGroup = async (req, res, next) => {
  try {
    const { name, department, batch_year, max_members } = req.body;
    const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await Group.create({
      id: uuidv4(),
      name,
      join_code,
      department: department || req.user.department,
      batch_year: batch_year || new Date().getFullYear(),
      max_members: max_members || 4,
      status: 'not_started',
    });

    // Add creator as leader
    await GroupMember.create({
      id: uuidv4(),
      group_id: group.id,
      student_id: req.user.id,
      role_in_group: 'leader',
    });

    logAction(req.user.id, 'group.created', 'group', group.id, req);
    res.status(201).json({ group, join_code });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a group via join code
 */
const joinGroup = async (req, res, next) => {
  try {
    const { join_code } = req.body;
    const group = await Group.findOne({ where: { join_code } });
    if (!group) return res.status(404).json({ error: 'Invalid join code' });

    const memberCount = await GroupMember.count({ where: { group_id: group.id } });
    if (memberCount >= group.max_members) return res.status(400).json({ error: 'Group is full' });

    const existing = await GroupMember.findOne({ where: { group_id: group.id, student_id: req.user.id } });
    if (existing) return res.status(400).json({ error: 'Already a member of this group' });

    await GroupMember.create({
      id: uuidv4(),
      group_id: group.id,
      student_id: req.user.id,
      role_in_group: 'member',
    });

    logAction(req.user.id, 'group.joined', 'group', group.id, req);
    res.json({ message: 'Joined group successfully', group });
  } catch (error) {
    next(error);
  }
};

/**
 * List groups with filters
 */
const listGroups = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};

    if (req.user.role === 'student') {
      const memberships = await GroupMember.findAll({ where: { student_id: req.user.id }, attributes: ['group_id'] });
      where.id = { [Op.in]: memberships.map(m => m.group_id) };
    } else if (req.user.role === 'mentor') {
      where.mentor_id = req.user.id;
    } else if (['coordinator', 'hod'].includes(req.user.role)) {
      where.department = req.user.department;
    }

    const { rows, count } = await Group.findAndCountAll({
      where,
      include: [{ model: User, as: 'mentor', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single group with members
 */
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: User, as: 'mentor', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'coordinator', attributes: ['id', 'name', 'email'] },
        { model: GroupMember, as: 'members', include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatar_url'] }] },
        { model: Topic, as: 'topic' },
      ],
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json({ group });
  } catch (error) {
    next(error);
  }
};

/**
 * Update group details
 */
const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const { name, mentor_id, coordinator_id, status } = req.body;
    await group.update({ name: name || group.name, mentor_id: mentor_id || group.mentor_id, coordinator_id: coordinator_id || group.coordinator_id, status: status || group.status });

    logAction(req.user.id, 'group.updated', 'group', group.id, req);
    res.json(group);
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, joinGroup, listGroups, getGroup, updateGroup };
