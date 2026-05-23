const { Topic, Group, GroupMember, User } = require('../models');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');

const submitTopic = async (req, res, next) => {
  try {
    const { group_id, title, abstract, domain_tags, technology_tags, file_url } = req.body;
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Group not found.' });

    const existing = await Topic.findOne({ where: { group_id } });
    if (existing) return res.status(409).json({ error: 'Group already has a topic.' });

    const topic = await Topic.create({
      group_id, title, abstract,
      domain_tags: domain_tags || [],
      technology_tags: technology_tags || [],
      file_url, status: 'submitted', submitted_at: new Date(),
    });

    await group.update({ topic_id: topic.id });
    await createAuditLog({ userId: req.user.id, action: 'topic.submitted', entityType: 'topic', entityId: topic.id, ipAddress: req.ip });
    res.status(201).json({ message: 'Topic submitted.', topic });
  } catch (error) { next(error); }
};

const listTopics = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.department) {
      const groups = await Group.findAll({ where: { department: req.query.department }, attributes: ['id'] });
      where.group_id = groups.map(g => g.id);
    }
    const { rows, count } = await Topic.findAndCountAll({
      where, include: [{ model: Group, attributes: ['id', 'name', 'department'] }],
      order: [['created_at', 'DESC']], limit, offset, distinct: true,
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (error) { next(error); }
};

const approveTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    await topic.update({ status: 'approved', approved_at: new Date(), approved_by: req.user.id });

    // Automated Mentor Assignment
    const group = await Group.findByPk(topic.group_id);
    if (group && !group.mentor_id) {
      const mentors = await User.findAll({
        where: { role: 'mentor', department: group.department, is_active: true },
        include: [{ model: Group, as: 'mentored_groups' }]
      });
      
      if (mentors.length > 0) {
        mentors.sort((a, b) => (a.mentored_groups?.length || 0) - (b.mentored_groups?.length || 0));
        const selectedMentor = mentors[0];
        await group.update({ mentor_id: selectedMentor.id });
        await createAuditLog({ userId: req.user.id, action: 'group.mentor_assigned', entityType: 'group', entityId: group.id, metadata: { mentor_id: selectedMentor.id }, ipAddress: req.ip });
      }
    }

    await createAuditLog({ userId: req.user.id, action: 'topic.approved', entityType: 'topic', entityId: topic.id, ipAddress: req.ip });
    res.json({ message: 'Topic approved and mentor assigned if available.', topic });
  } catch (error) { next(error); }
};

const rejectTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    const { reason, request_revision } = req.body;
    const status = request_revision ? 'revision_requested' : 'rejected';
    await topic.update({ status, rejection_reason: reason });
    await createAuditLog({ userId: req.user.id, action: `topic.${status}`, entityType: 'topic', entityId: topic.id, metadata: { reason }, ipAddress: req.ip });
    res.json({ message: `Topic ${status.replace('_', ' ')}.`, topic });
  } catch (error) { next(error); }
};

module.exports = { submitTopic, listTopics, approveTopic, rejectTopic };
