const router = require('express').Router();
const Joi = require('joi');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { checkRole } = require('../middleware/rbac');
const { createRun, listRuns, getRun, cancelRun, retryRun, reviewRun, getCatalog, getStatus } = require('../controllers/agentTeamController');

const agentKeys = [
  'head_agent', 'project_analyst', 'technical_reviewer', 'research_agent',
  'documentation_agent', 'progress_monitor', 'quality_auditor',
  'recommendation_agent', 'communication_agent',
];

const createSchema = Joi.object({
  group_id: Joi.string().uuid().required(),
  workflow: Joi.string().valid('proposal_review', 'progress_review', 'technical_review').default('proposal_review'),
  objective: Joi.string().trim().min(20).max(4000).required(),
  context: Joi.object().max(50).default({}),
  constraints: Joi.array().items(Joi.string().trim().max(500)).max(20).default([]),
  selected_agents: Joi.array().items(Joi.string().valid(...agentKeys)).unique().min(2).max(agentKeys.length),
});

const reviewSchema = Joi.object({
  decision: Joi.string().valid('approved', 'rejected', 'revision_requested').required(),
  comment: Joi.string().allow('').max(2000).default(''),
});

router.use(verifyToken);
router.get('/catalog', getCatalog);
router.get('/status', getStatus);
router.get('/runs', listRuns);
router.post('/runs', validate(createSchema), createRun);
router.get('/runs/:id', getRun);
router.post('/runs/:id/cancel', cancelRun);
router.post('/runs/:id/retry', retryRun);
router.post('/runs/:id/review', checkRole('mentor', 'admin'), validate(reviewSchema), reviewRun);

module.exports = router;
