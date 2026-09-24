const axios = require('axios');
const { Op } = require('sequelize');
const {
  sequelize, AgentRun, AgentTask, AgentApproval, Group, GroupMember, User,
} = require('../models');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');
const AI_INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET;
const EXECUTION_TIMEOUT_MS = Number(process.env.AGENT_TEAM_TIMEOUT_MS || 120000);
let readinessCache = { checkedAt: 0, value: null };

async function getAIServiceReadiness({ refresh = false } = {}) {
  if (!AI_SERVICE_URL) {
    return { available: false, reason: 'AI service is not configured. Set AI_SERVICE_URL to a deployed service.' };
  }
  if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1|\[?::1\]?/i.test(AI_SERVICE_URL)) {
    return { available: false, reason: 'AI_SERVICE_URL points to localhost, which is not the deployed AI service.' };
  }
  if (!AI_INTERNAL_SECRET) {
    return { available: false, reason: 'AI service authentication is not configured.' };
  }
  if (!refresh && readinessCache.value && Date.now() - readinessCache.checkedAt < 30000) return readinessCache.value;
  try {
    await axios.get(`${AI_SERVICE_URL}/api/ai/health`, { timeout: 5000 });
    readinessCache = { checkedAt: Date.now(), value: { available: true, reason: null } };
  } catch (error) {
    const reason = error.code === 'ECONNABORTED'
      ? 'AI service health check timed out.'
      : 'AI service is currently unreachable.';
    readinessCache = { checkedAt: Date.now(), value: { available: false, reason } };
  }
  return readinessCache.value;
}

async function assertAIServiceReady() {
  const readiness = await getAIServiceReadiness({ refresh: true });
  if (!readiness.available) {
    const error = new Error(readiness.reason);
    error.statusCode = 503;
    error.code = 'AI_SERVICE_UNAVAILABLE';
    throw error;
  }
}

async function assertGroupAccess(user, groupId, { reviewer = false } = {}) {
  const group = await Group.findByPk(groupId);
  if (!group) {
    const error = new Error('Project group not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') return group;
  if (user.role === 'mentor') {
    if (group.mentor_id === user.id) return group;
  } else if (!reviewer && user.role === 'student') {
    const membership = await GroupMember.findOne({
      where: { group_id: groupId, student_id: user.id, status: { [Op.in]: ['accepted', 'active'] } },
    });
    if (membership) return group;
  }

  const error = new Error(reviewer
    ? 'Only the assigned mentor or an administrator can review this AI run.'
    : 'You do not have access to this project group.');
  error.statusCode = 403;
  throw error;
}

async function getAccessibleRun(user, runId, reviewer = false) {
  const run = await AgentRun.findByPk(runId, {
    include: [
      { model: AgentTask, as: 'tasks', separate: true, order: [['sequence', 'ASC']] },
      { model: AgentApproval, as: 'approvals', separate: true, order: [['created_at', 'DESC']], include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'role'] }] },
      { model: Group, as: 'group', attributes: ['id', 'name', 'mentor_id', 'department', 'status'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
      { model: User, as: 'approver', attributes: ['id', 'name', 'role'] },
    ],
  });
  if (!run) {
    const error = new Error('AI agent run not found.');
    error.statusCode = 404;
    throw error;
  }
  await assertGroupAccess(user, run.group_id, { reviewer });
  return run;
}

async function executeRun(runId) {
  const [claimed] = await AgentRun.update(
    { status: 'running', started_at: new Date(), error_message: null },
    { where: { id: runId, status: 'queued' } },
  );
  if (!claimed) return;

  const run = await AgentRun.findByPk(runId, {
    include: [{ model: AgentTask, as: 'tasks', separate: true, order: [['sequence', 'ASC']] }],
  });
  if (!run) return;
  const executionStartedAt = new Date(run.started_at).getTime();

  await AgentTask.update(
    { status: 'working', started_at: new Date(), attempt: sequelize.literal('attempt + 1') },
    { where: { run_id: runId, status: 'queued' } },
  );

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/agent-team/execute`, {
      run_id: run.id,
      project_id: run.group_id,
      workflow: run.workflow,
      objective: run.objective,
      context: run.context_json,
      constraints: run.constraints_json,
      selected_agents: run.selected_agents,
      max_revisions: 1,
    }, {
      timeout: EXECUTION_TIMEOUT_MS,
      headers: { 'X-Internal-Token': AI_INTERNAL_SECRET, 'Content-Type': 'application/json' },
    });

    const payload = response.data;
    const currentRun = await AgentRun.findByPk(runId, { attributes: ['status', 'started_at'] });
    if (!currentRun || currentRun.status !== 'running' || new Date(currentRun.started_at).getTime() !== executionStartedAt) {
      logger.info(`Discarding stale AI agent response for run ${runId}`);
      return;
    }
    const taskResults = Array.isArray(payload.tasks) ? payload.tasks : [];
    await Promise.all(run.tasks.map(async task => {
      const result = taskResults.find(item => item.agent === task.agent_key);
      if (!result) {
        return task.update({ status: 'failed', error_message: 'AI service omitted this worker result.', completed_at: new Date() });
      }
      return task.update({
        status: result.status || 'completed',
        confidence: result.confidence,
        result_json: result,
        token_usage_json: result.usage || {},
        latency_ms: result.latency_ms,
        error_message: result.error || null,
        completed_at: new Date(),
      });
    }));

    const finalStatus = payload.status === 'failed' ? 'failed' : 'awaiting_approval';
    await run.update({
      status: finalStatus,
      confidence: payload.confidence,
      final_report_json: payload.final_report || {},
      quality_report_json: payload.quality || {},
      token_usage_json: payload.usage || {},
      estimated_cost: payload.estimated_cost || 0,
      requires_human_approval: true,
      completed_at: new Date(),
      error_message: payload.error || null,
    });
  } catch (error) {
    const message = error.response?.data?.error || error.message || 'AI agent execution failed.';
    logger.error(`AI agent run ${runId} failed: ${message}`);
    const currentRun = await AgentRun.findByPk(runId, { attributes: ['status', 'started_at'] });
    if (!currentRun || currentRun.status !== 'running' || new Date(currentRun.started_at).getTime() !== executionStartedAt) return;
    await AgentTask.update(
      { status: 'failed', error_message: message, completed_at: new Date() },
      { where: { run_id: runId, status: 'working' } },
    );
    await run.update({ status: 'failed', error_message: message, completed_at: new Date() });
  }
}

function dispatchRun(runId) {
  if (process.env.AGENT_WORKER_MODE === 'external') return;
  setImmediate(() => executeRun(runId).catch(error => logger.error(`Agent dispatcher failed: ${error.message}`)));
}

async function resumePendingRuns() {
  const staleBefore = new Date(Date.now() - EXECUTION_TIMEOUT_MS * 2);
  await AgentRun.update(
    { status: 'queued', error_message: 'Recovered after an interrupted worker process.' },
    { where: { status: 'running', started_at: { [Op.lt]: staleBefore } } },
  );
  const queued = await AgentRun.findAll({ where: { status: 'queued' }, attributes: ['id'], limit: 25, order: [['created_at', 'ASC']] });
  queued.forEach(run => dispatchRun(run.id));
}

module.exports = {
  assertGroupAccess,
  getAccessibleRun,
  executeRun,
  dispatchRun,
  resumePendingRuns,
  getAIServiceReadiness,
  assertAIServiceReady,
};
