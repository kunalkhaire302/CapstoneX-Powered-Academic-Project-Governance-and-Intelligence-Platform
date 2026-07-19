const { Topic, Group, GroupMember, User } = require('../models');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../utils/auditLog');
const axios = require('axios');
const { Op } = require('sequelize');

const submitTopic = async (req, res, next) => {
  try {
    const { group_id, topics } = req.body;
    const group = await Group.findByPk(group_id, {
      include: [{ model: GroupMember, as: 'members' }]
    });
    if (!group) return res.status(404).json({ error: 'Group not found.' });

    // RBAC Check: Must be a member of the group to submit topics
    if (req.user.role === 'student') {
      const isMember = group.members.some(m => m.student_id === req.user.id);
      if (!isMember) return res.status(403).json({ error: 'Access denied: You are not a member of this group.' });
    }

    const existingCount = await Topic.count({ where: { group_id } });
    if (existingCount > 0) return res.status(409).json({ error: 'Group already has submitted topics.' });

    if (!Array.isArray(topics) || topics.length === 0 || topics.length > 3) {
      return res.status(400).json({ error: 'Must submit between 1 and 3 topics.' });
    }

    const createdTopics = [];
    for (const t of topics) {
      const topic = await Topic.create({
        group_id, 
        title: t.title, 
        abstract: t.abstract,
        domain_tags: t.domain_tags || [],
        technology_tags: t.technology_tags || [],
        status: 'submitted', 
        submitted_at: new Date(),
      });

      // Generate AI Recommendation
      try {
        const aiPayload = {
          title: t.title,
          problem_statement: t.abstract,
          description: t.abstract,
          domain: (t.domain_tags || []).join(', '),
          tech_stack: t.technology_tags || []
        };
        const aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/ai/problem/analyze`, 
          aiPayload,
          {
            headers: {
              'X-Internal-Token': process.env.AI_INTERNAL_SECRET
            },
            timeout: 10000
          }
        );
        if (aiResponse.data) {
          await topic.update({ 
            ai_scores: aiResponse.data.scores, 
            ai_suggestions: aiResponse.data.ai_suggestions 
          });
        }
      } catch (err) {
        console.error(`AI Recommendation failed for topic: ${t.title}`, err.message);
      }

      createdTopics.push(topic);
    }

    await group.update({ status: 'topics_submitted' });
    await createAuditLog({ userId: req.user.id, action: 'topics.submitted', entityType: 'group', entityId: group.id, ipAddress: req.ip });
    res.status(201).json({ message: 'Topics submitted successfully.', topics: createdTopics });
  } catch (error) { next(error); }
};

const listTopics = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    
    // RBAC Check
    if (req.user.role === 'student') {
      const memberships = await GroupMember.findAll({ where: { student_id: req.user.id }, attributes: ['group_id'] });
      where.group_id = { [Op.in]: memberships.map(m => m.group_id) };
    } else if (req.user.role === 'mentor') {
      const mentoredGroups = await Group.findAll({ where: { mentor_id: req.user.id }, attributes: ['id'] });
      where.group_id = { [Op.in]: mentoredGroups.map(g => g.id) };
    } else if (['coordinator', 'hod'].includes(req.user.role)) {
      const departmentGroups = await Group.findAll({ where: { department: req.user.department }, attributes: ['id'] });
      where.group_id = { [Op.in]: departmentGroups.map(g => g.id) };
    } else if (req.query.department) {
      // Admin filter
      const groups = await Group.findAll({ where: { department: req.query.department }, attributes: ['id'] });
      where.group_id = { [Op.in]: groups.map(g => g.id) };
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

    // Reject other topics in the same group
    await Topic.update({ status: 'rejected' }, {
      where: {
        group_id: topic.group_id,
        id: { [Op.ne]: topic.id }
      }
    });

    // Set Group status
    const group = await Group.findByPk(topic.group_id);
    if (group) {
      await group.update({ topic_id: topic.id, status: 'project_active' });
    }

    await createAuditLog({ userId: req.user.id, action: 'topic.approved', entityType: 'topic', entityId: topic.id, ipAddress: req.ip });
    res.json({ message: 'Topic approved.', topic });
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
