require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize, AgentRun, AgentTask } = require('../models');
const { executeRun } = require('../services/agentTeamService');
const logger = require('../utils/logger');

// PostgreSQL is the durable pending-work store. executeRun claims work with a
// conditional UPDATE, so multiple processes cannot claim the same queued run.
let stopping = false;
process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });

async function recoverInterruptedRuns() {
  const timeout = Number(process.env.AGENT_TEAM_TIMEOUT_MS || 120000);
  await sequelize.transaction(async transaction => {
    const stale = await AgentRun.findAll({
      where: { status: 'running', started_at: { [Op.lt]: new Date(Date.now() - timeout * 2) } },
      transaction, lock: transaction.LOCK.UPDATE, skipLocked: true,
    });
    for (const run of stale) {
      const tasks = await AgentTask.findAll({ where: { run_id: run.id }, transaction });
      const exhausted = tasks.some(task => task.attempt >= task.max_attempts);
      await run.update({ status: exhausted ? 'failed' : 'queued', error_message: 'Worker interrupted; recovery attempted.' }, { transaction });
      await AgentTask.update({ status: exhausted ? 'failed' : 'queued' }, { where: { run_id: run.id }, transaction });
    }
  });
}

async function main() {
  if (!process.env.AI_INTERNAL_SECRET || !process.env.AI_SERVICE_URL) throw new Error('AI service URL and internal secret are required');
  await sequelize.authenticate();
  while (!stopping) {
    try {
      await recoverInterruptedRuns();
      const runs = await AgentRun.findAll({ where: { status: 'queued' }, attributes: ['id'], order: [['created_at', 'ASC']], limit: 1 });
      if (runs.length) await executeRun(runs[0].id);
      else await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      logger.error(`Agent worker iteration failed: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  await sequelize.close();
}

if (require.main === module) main().catch(error => { logger.error(error.message); process.exitCode = 1; });
module.exports = { recoverInterruptedRuns };
