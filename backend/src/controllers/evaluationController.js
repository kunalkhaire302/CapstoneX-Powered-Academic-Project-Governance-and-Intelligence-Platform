const { Evaluation, Group, User } = require('../models');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');

const createEvaluation = async (req, res, next) => {
  try {
    const { group_id, student_id, type, rubric_json, total_score, max_score } = req.body;

    // RBAC: Ensure mentor is assigned to the group
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    if (group.mentor_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You are not the mentor for this group.' });
    }

    const evaluation = await Evaluation.create({
      group_id, mentor_id: req.user.id, student_id, type,
      rubric_json, total_score, max_score: max_score || 100,
      submitted_at: new Date(),
    });
    await createAuditLog({ userId: req.user.id, action: 'evaluation.created', entityType: 'evaluation', entityId: evaluation.id, ipAddress: req.ip });
    res.status(201).json({ message: 'Evaluation submitted.', evaluation });
  } catch (error) { next(error); }
};

const listEvaluations = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.group_id) where.group_id = req.query.group_id;
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.type) where.type = req.query.type;
    if (req.user.role === 'mentor') where.mentor_id = req.user.id;
    if (req.user.role === 'student') where.student_id = req.user.id;

    const { rows, count } = await Evaluation.findAndCountAll({
      where,
      include: [
        { model: Group, attributes: ['id', 'name'] },
        { model: User, as: 'evaluator', attributes: ['id', 'name'] },
        { model: User, as: 'evaluated_student', attributes: ['id', 'name'] },
      ],
      order: [['submitted_at', 'DESC']], limit, offset, distinct: true,
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (error) { next(error); }
};

const updateEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) return res.status(404).json({ error: 'Evaluation not found.' });

    // RBAC: Check ownership
    if (evaluation.mentor_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You can only update your own evaluations.' });
    }

    const { rubric_json, total_score, ai_feedback } = req.body;
    await evaluation.update({
      ...(rubric_json && { rubric_json }), ...(total_score !== undefined && { total_score }),
      ...(ai_feedback && { ai_feedback }),
    });
    res.json({ message: 'Evaluation updated.', evaluation });
  } catch (error) { next(error); }
};

module.exports = { createEvaluation, listEvaluations, updateEvaluation };
