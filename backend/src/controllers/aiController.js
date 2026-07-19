const axios = require('axios');
const { AiReport, RiskScore } = require('../models');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET || 'dev_internal_secret_key_123';

const getAiHeaders = () => ({
  headers: {
    'X-Internal-Token': AI_INTERNAL_SECRET,
    'Content-Type': 'application/json'
  }
});

const getRecommendations = async (req, res, next) => {
  try {
    const { skills, interests, technologies } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/recommend`, {
      student_id: req.user.id, skills, interests, technologies,
    }, { timeout: 10000, ...getAiHeaders() });

    await AiReport.create({
      student_id: req.user.id, model_name: 'recommendation_engine',
      report_type: 'recommendation', result_json: response.data,
      confidence: response.data.recommendations?.[0]?.match_score || 0,
    });
    res.json(response.data);
  } catch (error) {
    logger.error('AI Recommendation error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const getRiskScore = async (req, res, next) => {
  try {
    const { group_id, features } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/risk-score`, {
      group_id, features,
    }, { timeout: 10000, ...getAiHeaders() });

    await RiskScore.create({
      group_id, score: response.data.probability || 0,
      label: response.data.risk_label || 'low',
      features_json: features,
    });
    res.json(response.data);
  } catch (error) {
    logger.error('AI Risk Score error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const generateFeedback = async (req, res, next) => {
  try {
    const { rubric_scores, summary } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-feedback`, {
      rubric_scores, summary,
    }, { timeout: 15000, ...getAiHeaders() });

    await AiReport.create({
      model_name: 'feedback_generator', report_type: 'feedback',
      result_json: response.data,
    });
    res.json(response.data);
  } catch (error) {
    logger.error('AI Feedback error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const formTeams = async (req, res, next) => {
  try {
    const { students, team_size } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/form-teams`, {
      students, team_size,
    }, { timeout: 15000, ...getAiHeaders() });

    await AiReport.create({
      model_name: 'team_formation', report_type: 'team_formation',
      result_json: response.data,
    });
    res.json(response.data);
  } catch (error) {
    logger.error('AI Team Formation error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const listRiskScores = async (req, res, next) => {
  try {
    const scores = await RiskScore.findAll({
      order: [['predicted_at', 'DESC']],
      limit: parseInt(req.query.limit, 10) || 50,
    });
    res.json({ data: scores });
  } catch (error) { next(error); }
};

module.exports = { getRecommendations, getRiskScore, generateFeedback, formTeams, listRiskScores };
