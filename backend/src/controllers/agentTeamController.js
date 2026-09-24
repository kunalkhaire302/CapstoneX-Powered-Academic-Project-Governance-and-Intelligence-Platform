const { Op } = require('sequelize');
const { AgentRun, AgentTask, AgentApproval, Group, GroupMember, User } = require('../models');
const { createAuditLog } = require('../utils/auditLog');
const {
  assertGroupAccess, getAccessibleRun, dispatchRun, getAIServiceReadiness, assertAIServiceReady,
} = require('../services/agentTeamService');
const { AGENT_CATALOG, normalizeAgentSelection } = require('../services/agentCatalog');

const createRun = async (req, res, next) => {
  try {
    const { group_id, objective, context = {}, constraints = [], selected_agents, workflow = 'proposal_review' } = req.body;
    await assertGroupAccess(req.user, group_id);
    await assertAIServiceReady();
    const agents = normalizeAgentSelection(selected_agents);
    if (!agents.some(agent => agent.key === 'head_agent') || !agents.some(agent => agent.key === 'quality_auditor')) {
      return res.status(400).json({ error: 'Head Agent and Quality Auditor are required for every run.' });
    }

    const run = await AgentRun.create({
      group_id,
      created_by: req.user.id,
      workflow,
      objective,
      context_json: context,
      constraints_json: constraints,
      selected_agents: agents.map(agent => agent.key),
      status: 'queued',
    });
    await AgentTask.bulkCreate(agents.map(agent => ({
      run_id: run.id,
      agent_key: agent.key,
      agent_name: agent.name,
      objective: agent.objective,
      sequence: agent.sequence,
      status: 'queued',
      max_attempts: 2,
    })));
    await createAuditLog({
      userId: req.user.id, action: 'agent_run.created', entityType: 'agent_run', entityId: run.id,
      metadata: { group_id, workflow, selected_agents: agents.map(agent => agent.key) }, ipAddress: req.ip,
    });
    dispatchRun(run.id);
    const created = await getAccessibleRun(req.user, run.id);
    res.status(202).json({ data: created });
  } catch (error) { next(error); }
};

const listRuns = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.group_id) {
      await assertGroupAccess(req.user, req.query.group_id);
      where.group_id = req.query.group_id;
    } else if (req.user.role === 'student') {
      const memberships = await GroupMember.findAll({ where: { student_id: req.user.id }, attributes: ['group_id'], raw: true });
      where.group_id = { [Op.in]: memberships.map(item => item.group_id) };
    } else if (req.user.role === 'mentor') {
      const groups = await Group.findAll({ where: { mentor_id: req.user.id }, attributes: ['id'], raw: true });
      where.group_id = { [Op.in]: groups.map(item => item.id) };
    }
    if (req.query.status) where.status = req.query.status;

    const limit = Math.min(Number(req.query.limit || 20), 50);
    const runs = await AgentRun.findAll({
      where,
      include: [
        { model: AgentTask, as: 'tasks', separate: true, order: [['sequence', 'ASC']] },
        { model: Group, as: 'group', attributes: ['id', 'name', 'department', 'status'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
      ],
      order: [['created_at', 'DESC']], limit,
    });
    res.json({ data: runs });
  } catch (error) { next(error); }
};

const getRun = async (req, res, next) => {
  try { res.json({ data: await getAccessibleRun(req.user, req.params.id) }); } catch (error) { next(error); }
};

const cancelRun = async (req, res, next) => {
  try {
    const run = await getAccessibleRun(req.user, req.params.id);
    if (req.user.role === 'student' && run.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Students can only cancel agent runs they created.' });
    }
    if (!['queued', 'running'].includes(run.status)) return res.status(409).json({ error: 'Only queued or running runs can be cancelled.' });
    await run.update({ status: 'cancelled', canceled_at: new Date() });
    await AgentTask.update({ status: 'cancelled', completed_at: new Date() }, { where: { run_id: run.id, status: { [Op.in]: ['queued', 'working'] } } });
    await createAuditLog({ userId: req.user.id, action: 'agent_run.cancelled', entityType: 'agent_run', entityId: run.id, ipAddress: req.ip });
    res.json({ data: await getAccessibleRun(req.user, run.id) });
  } catch (error) { next(error); }
};

const retryRun = async (req, res, next) => {
  try {
    const run = await getAccessibleRun(req.user, req.params.id);
    if (req.user.role === 'student' && run.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Students can only retry agent runs they created.' });
    }
    if (!['failed', 'revision_requested', 'cancelled'].includes(run.status)) return res.status(409).json({ error: 'This run is not eligible for retry.' });
    if (run.tasks.some(task => task.attempt >= task.max_attempts)) {
      return res.status(409).json({ error: 'Maximum retry limit reached. Create a new run with revised project context.' });
    }
    await assertAIServiceReady();
    await run.update({ status: 'queued', error_message: null, completed_at: null, canceled_at: null, approved_at: null, approved_by: null });
    await AgentTask.update({ status: 'queued', result_json: null, confidence: null, error_message: null, started_at: null, completed_at: null, latency_ms: null }, { where: { run_id: run.id } });
    await createAuditLog({ userId: req.user.id, action: 'agent_run.retried', entityType: 'agent_run', entityId: run.id, ipAddress: req.ip });
    dispatchRun(run.id);
    res.status(202).json({ data: await getAccessibleRun(req.user, run.id) });
  } catch (error) { next(error); }
};

const reviewRun = async (req, res, next) => {
  try {
    const run = await getAccessibleRun(req.user, req.params.id, true);
    if (!['awaiting_approval', 'approved', 'rejected', 'revision_requested'].includes(run.status)) {
      return res.status(409).json({ error: 'This run is not ready for human review.' });
    }
    const { decision, comment = '' } = req.body;
    const status = decision === 'approved' ? 'approved' : decision;
    await AgentApproval.create({ run_id: run.id, reviewer_id: req.user.id, decision, comment });
    await run.update({
      status,
      approved_by: decision === 'approved' ? req.user.id : null,
      approved_at: decision === 'approved' ? new Date() : null,
    });
    await createAuditLog({ userId: req.user.id, action: `agent_run.${decision}`, entityType: 'agent_run', entityId: run.id, metadata: { comment }, ipAddress: req.ip });
    res.json({ data: await getAccessibleRun(req.user, run.id) });
  } catch (error) { next(error); }
};

const getCatalog = (req, res) => res.json({ data: AGENT_CATALOG });
const getStatus = async (req, res, next) => {
  try { res.json({ data: await getAIServiceReadiness() }); } catch (error) { next(error); }
};

module.exports = { createRun, listRuns, getRun, cancelRun, retryRun, reviewRun, getCatalog, getStatus };
