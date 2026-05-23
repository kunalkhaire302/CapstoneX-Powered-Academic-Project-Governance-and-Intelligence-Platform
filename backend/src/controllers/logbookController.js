const { Logbook, LogbookFeedback, User, Group } = require('../models');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');
const { uploadToCloudinary } = require('../utils/cloudinary');

const createLogbook = async (req, res, next) => {
  try {
    const { group_id, week_number, title, content, file_url } = req.body;
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
    await logbook.update({ status: 'submitted', submitted_at: new Date() });
    await createAuditLog({ userId: req.user.id, action: 'logbook.submitted', entityType: 'logbook', entityId: logbook.id, ipAddress: req.ip });
    res.json({ message: 'Logbook submitted.', logbook });
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
    const { title, content, file_url } = req.body;
    await logbook.update({ ...(title && { title }), ...(content && { content }), ...(file_url !== undefined && { file_url }) });
    res.json({ message: 'Logbook updated.', logbook });
  } catch (error) { next(error); }
};

const addFeedback = async (req, res, next) => {
  try {
    const logbook = await Logbook.findByPk(req.params.id);
    if (!logbook) return res.status(404).json({ error: 'Logbook not found.' });
    const { comment, status } = req.body;
    const feedback = await LogbookFeedback.create({
      logbook_id: logbook.id, mentor_id: req.user.id, comment, status,
    });
    if (status === 'approved') await logbook.update({ status: 'approved' });
    if (status === 'rejected') await logbook.update({ status: 'rejected' });
    await createAuditLog({ userId: req.user.id, action: 'logbook.feedback', entityType: 'logbook', entityId: logbook.id, ipAddress: req.ip });
    res.status(201).json({ message: 'Feedback added.', feedback });
  } catch (error) { next(error); }
};

module.exports = { createLogbook, submitLogbook, listLogbooks, updateLogbook, addFeedback };
