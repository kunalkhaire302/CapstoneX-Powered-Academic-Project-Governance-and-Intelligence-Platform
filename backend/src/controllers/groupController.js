const { Group, GroupMember, User, Topic } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { createAuditLog } = require('../utils/auditLog');
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
      status: 'forming',
    });

    // Add creator as leader
    await GroupMember.create({
      id: uuidv4(),
      group_id: group.id,
      student_id: req.user.id,
      role_in_group: 'leader',
    });

    await createAuditLog({ userId: req.user.id, action: 'group.created', entityType: 'group', entityId: group.id, ipAddress: req.ip });
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
      status: 'accepted'
    });

    await createAuditLog({ userId: req.user.id, action: 'group.joined', entityType: 'group', entityId: group.id, ipAddress: req.ip });
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
      include: [
        { model: User, as: 'mentor', attributes: ['id', 'name', 'email'] },
        { model: GroupMember, as: 'members', include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
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
        { model: Topic, as: 'topics' },
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

    await createAuditLog({ userId: req.user.id, action: 'group.updated', entityType: 'group', entityId: group.id, ipAddress: req.ip });
    res.json(group);
  } catch (error) {
    next(error);
  }
};

/**
 * Invite a member to the group
 */
const inviteMember = async (req, res, next) => {
  try {
    const { student_id } = req.body;
    const group_id = req.params.id;

    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'forming') return res.status(400).json({ error: 'Group is already locked or pending approval' });

    // Ensure requester is leader
    const requester = await GroupMember.findOne({ where: { group_id, student_id: req.user.id, role_in_group: 'leader' } });
    if (!requester && req.user.role !== 'admin') return res.status(403).json({ error: 'Only the leader can invite members' });

    // Check if group is full
    const memberCount = await GroupMember.count({ where: { group_id, status: { [Op.in]: ['pending', 'accepted'] } } });
    if (memberCount >= group.max_members) return res.status(400).json({ error: 'Group is full' });

    // Check if student is already in a group
    const existingMembership = await GroupMember.findOne({ where: { student_id, status: { [Op.in]: ['pending', 'accepted'] } } });
    if (existingMembership) return res.status(400).json({ error: 'Student is already in a group or has a pending invite' });

    const invite = await GroupMember.create({
      id: uuidv4(),
      group_id,
      student_id,
      role_in_group: 'member',
      status: 'pending'
    });

    res.status(201).json({ message: 'Invitation sent', invite });
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to an invitation
 */
const respondToInvite = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const invite = await GroupMember.findOne({ where: { id: req.params.invite_id, student_id: req.user.id } });
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });
    if (invite.status !== 'pending') return res.status(400).json({ error: 'Invitation is not pending' });

    await invite.update({ status });
    res.json({ message: `Invitation ${status}`, invite });
  } catch (error) {
    next(error);
  }
};

/**
 * Lock group formation and request approval
 */
const lockGroup = async (req, res, next) => {
  try {
    const group_id = req.params.id;
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'forming') return res.status(400).json({ error: 'Group is not in forming state' });

    // Ensure requester is leader
    const requester = await GroupMember.findOne({ where: { group_id, student_id: req.user.id, role_in_group: 'leader' } });
    if (!requester && req.user.role !== 'admin') return res.status(403).json({ error: 'Only the leader can lock the group' });

    // Check minimum members
    const memberCount = await GroupMember.count({ where: { group_id, status: 'accepted' } });
    if (memberCount < 2) return res.status(400).json({ error: 'Group must have at least 2 accepted members to lock' });

    await group.update({ status: 'pending_approval' });
    
    // Auto-cancel pending invites
    await GroupMember.update({ status: 'rejected' }, { where: { group_id, status: 'pending' } });

    res.json({ message: 'Group locked and submitted for approval', group });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin assigns a mentor to the group
 */
const allocateMentor = async (req, res, next) => {
  try {
    const { mentor_id } = req.body;
    const group_id = req.params.id;

    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'topics_submitted') return res.status(400).json({ error: 'Group must submit topics before mentor allocation' });

    const mentor = await User.findOne({ where: { id: mentor_id, role: 'mentor' } });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    await group.update({ mentor_id });
    await createAuditLog({ userId: req.user.id, action: 'group.mentor_allocated', entityType: 'group', entityId: group.id, metadata: { mentor_id }, ipAddress: req.ip });

    res.json({ message: 'Mentor allocated successfully', group });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, joinGroup, listGroups, getGroup, updateGroup, inviteMember, respondToInvite, lockGroup, allocateMentor };
