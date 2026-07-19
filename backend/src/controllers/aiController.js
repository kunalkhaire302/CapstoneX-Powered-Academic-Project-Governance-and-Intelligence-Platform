const axios = require('axios');
const { AiReport, RiskScore } = require('../models');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET;

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

const analyzeFeedback = async (req, res, next) => {
  try {
    const { text } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/feedback/analyze`, {
      text,
    }, { timeout: 15000, ...getAiHeaders() });

    await AiReport.create({
      model_name: 'feedback_analyzer', report_type: 'feedback',
      result_json: response.data,
    });
    res.json(response.data);
  } catch (error) {
    logger.error('AI Feedback Analysis error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const formTeams = async (req, res, next) => {
  try {
    const { students, team_size, constraints } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/teams/form`, {
      students, team_size, constraints
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

const checkPlagiarism = async (req, res, next) => {
  try {
    const { text, document_type, threshold, exclude_project_id } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/plagiarism/check`, {
      text, document_type, threshold, exclude_project_id
    }, { timeout: 20000, ...getAiHeaders() });

    // Store plagiarism report
    const { PlagiarismReport } = require('../models');
    if (PlagiarismReport) {
      await PlagiarismReport.create({
        student_id: req.user.id,
        document_id: req.body.document_id || null,
        similarity_score: response.data.overall_similarity || 0,
        risk_level: response.data.risk_level || 'none',
        matched_projects: response.data.matched_projects || [],
        highlighted_sections: response.data.highlighted_sections || []
      });
    }

    res.json(response.data);
  } catch (error) {
    logger.error('AI Plagiarism Check error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const analyzeProblemStatement = async (req, res, next) => {
  try {
    const { title, description, tech_stack, domain } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/problem/analyze`, {
      title, description, tech_stack, domain
    }, { timeout: 15000, ...getAiHeaders() });

    await AiReport.create({
      student_id: req.user.id, model_name: 'problem_analyzer', 
      report_type: 'problem_statement', result_json: response.data,
    });
    res.json(response.data);
  } catch (error) {
    logger.error('AI Problem Statement Analysis error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const generateDepartmentReport = async (req, res, next) => {
  try {
    const { department, metrics, top_projects } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/reports/department/pdf`, {
      department, metrics, top_projects
    }, { 
      timeout: 30000, 
      responseType: 'arraybuffer', // Important for PDF
      ...getAiHeaders() 
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=department_report_${department}.pdf`
    });
    res.send(response.data);
  } catch (error) {
    logger.error('AI Department Report error:', error.message);
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'AI service unavailable.' });
    next(error);
  }
};

const generateAccreditationReport = async (req, res, next) => {
  try {
    const { data } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/reports/accreditation`, {
      data
    }, { timeout: 30000, ...getAiHeaders() });

    res.json(response.data);
  } catch (error) {
    logger.error('AI Accreditation Report error:', error.message);
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

module.exports = { 
  getRecommendations, 
  getRiskScore, 
  analyzeFeedback, 
  formTeams, 
  listRiskScores,
  checkPlagiarism,
  analyzeProblemStatement,
  generateDepartmentReport,
  generateAccreditationReport
};
