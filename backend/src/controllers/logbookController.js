const { Logbook, LogbookFeedback, User, Group, GroupMember } = require('../models');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { Op } = require('sequelize');

const createLogbook = async (req, res, next) => {
  try {
    const { group_id, week_number, title, content, file_url } = req.body;

    // RBAC: Check if student belongs to the group
    const isMember = await GroupMember.findOne({ where: { group_id, student_id: req.user.id, status: 'accepted' } });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this group.' });
    }

    let finalFileUrl = file_url;

    if (req.file) {
      finalFileUrl = await uploadToCloudinary(req.file.buffer, 'logbooks');
    }

    const logbook = await Logbook.create({
      group_id, student_id: req.user.id, week_number, title, content, file_url: finalFileUrl,
      status: 'draft',
    });
    res.status(201).json({ message: 'Logbook entry created.', logbook });
  } catch (error) { next(error); }
};

const submitLogbook = async (req, res, next) => {
  try {
    const logbook = await Logbook.findByPk(req.params.id);
    if (!logbook) return res.status(404).json({ error: 'Logbook not found.' });
    if (logbook.student_id !== req.user.id) return res.status(403).json({ error: 'Not your logbook.' });
    if (logbook.status !== 'draft' && logbook.status !== 'revision_requested') {
      return res.status(409).json({ error: 'Only draft or revision-requested logbooks can be submitted.' });
    }
    
    // Deadline validation: check if submitted after Friday 11:59 PM of the current week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    let status = 'on_time';
    
    // If it is Saturday (6) or Sunday (0), it is considered late for that week's sprint.
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      status = 'late';
    }

    await logbook.update({ status, submitted_at: now });
    await createAuditLog({ userId: req.user.id, action: `logbook.submitted_${status}`, entityType: 'logbook', entityId: logbook.id, ipAddress: req.ip });
    res.json({ message: `Logbook submitted (${status}).`, logbook });
  } catch (error) { next(error); }
};

const listLogbooks = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.group_id) where.group_id = req.query.group_id;
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.status) where.status = req.query.status;
    if (req.query.week_number) where.week_number = parseInt(req.query.week_number, 10);
    if (req.user.role === 'student') where.student_id = req.user.id;
    if (req.user.role === 'mentor') {
      const groups = await Group.findAll({ where: { mentor_id: req.user.id }, attributes: ['id'] });
      const ids = groups.map(group => group.id);
      where.group_id = { [Op.in]: req.query.group_id ? ids.filter(id => id === req.query.group_id) : ids };
    }

    const { rows, count } = await Logbook.findAndCountAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Group, attributes: ['id', 'name'] },
        { model: LogbookFeedback, as: 'feedback', include: [{ model: User, as: 'mentor', attributes: ['id', 'name'] }] },
      ],
      order: [['week_number', 'DESC'], ['created_at', 'DESC']],
      limit, offset, distinct: true,
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (error) { next(error); }
};

const updateLogbook = async (req, res, next) => {
  try {
    const logbook = await Logbook.findByPk(req.params.id);
    if (!logbook) return res.status(404).json({ error: 'Logbook not found.' });

    // RBAC Check
    if (logbook.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Not your logbook.' });
    }
    if (logbook.status !== 'draft' && logbook.status !== 'revision_requested') {
      return res.status(409).json({ error: 'Submitted or graded logbooks cannot be edited.' });
    }

    const { title, content, file_url } = req.body;
    await logbook.update({ ...(title && { title }), ...(content && { content }), ...(file_url !== undefined && { file_url }) });
    res.json({ message: 'Logbook updated.', logbook });
  } catch (error) { next(error); }
};

const addFeedback = async (req, res, next) => {
  try {
    const logbook = await Logbook.findByPk(req.params.id);
    if (!logbook) return res.status(404).json({ error: 'Logbook not found.' });

    // RBAC Check: Ensure mentor is assigned to the group
    const group = await Group.findByPk(logbook.group_id);
    if (!group || group.mentor_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You are not the mentor for this group.' });
    }

    const { comment, status } = req.body;
    const feedback = await LogbookFeedback.create({
      logbook_id: logbook.id, mentor_id: req.user.id, comment, status,
    });
    await logbook.update({ status: status === 'revision_requested' ? 'revision_requested' : 'graded' });
    await createAuditLog({ userId: req.user.id, action: 'logbook.feedback', entityType: 'logbook', entityId: logbook.id, ipAddress: req.ip });
    res.status(201).json({ message: 'Feedback added.', feedback });
  } catch (error) { next(error); }
};

module.exports = { createLogbook, submitLogbook, listLogbooks, updateLogbook, addFeedback };
