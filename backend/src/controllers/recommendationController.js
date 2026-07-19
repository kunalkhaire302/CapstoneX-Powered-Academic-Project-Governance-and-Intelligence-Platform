/**
 * Recommendation Controller
 * Handles problem statement analysis, recommendations, and improvement suggestions.
 * Proxies AI analysis requests to the FastAPI AI service and persists results in PostgreSQL.
 */
const axios = require('axios');
const { ProblemStatement, Recommendation, RecommendationHistory, User, Group, GroupMember } = require('../models');
const { createAuditLog } = require('../utils/auditLog');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET;

const getAiHeaders = () => ({
  headers: {
    'X-Internal-Token': AI_INTERNAL_SECRET,
    'Content-Type': 'application/json'
  }
});

/**
 * POST /api/recommend  or  POST /api/problem/analyze
 * Full 12-step problem statement analysis.
 */
const analyzeProblem = async (req, res, next) => {
  try {
    const {
      title, problem_statement, description, domain, department,
      skills, tech_stack, team_members, hackathon_theme,
      expected_users, target_audience, expected_impact, duration,
      group_id,
    } = req.body;

    if (!title || !problem_statement) {
      return res.status(400).json({ error: 'Title and problem statement are required.' });
    }

    // RBAC: Check if user belongs to group_id
    if (group_id) {
      const isMember = await GroupMember.findOne({ where: { group_id, student_id: req.user.id } });
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied: You are not a member of this group.' });
      }
    }

    // 1. Save/update ProblemStatement in database
    let problemStmt = await ProblemStatement.findOne({
      where: { student_id: req.user.id, title },
    });

    const stmtData = {
      student_id: req.user.id,
      group_id: group_id || null,
      title,
      problem_statement,
      description: description || '',
      domain: domain || '',
      department: department || req.user.department || '',
      skills: skills || [],
      tech_stack: tech_stack || [],
      team_members: team_members || [],
      hackathon_theme: hackathon_theme || '',
      expected_users: expected_users || '',
      target_audience: target_audience || '',
      expected_impact: expected_impact || '',
      duration: duration || '',
      status: 'analyzed',
    };

    if (problemStmt) {
      await problemStmt.update(stmtData);
    } else {
      problemStmt = await ProblemStatement.create(stmtData);
    }

    // 2. Call AI service for analysis
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/problem/analyze`,
      {
        title,
        problem_statement,
        description: description || '',
        domain: domain || '',
        department: department || '',
        skills: skills || [],
        tech_stack: tech_stack || [],
        team_members: team_members || [],
        hackathon_theme: hackathon_theme || '',
        expected_users: expected_users || '',
        target_audience: target_audience || '',
        expected_impact: expected_impact || '',
        duration: duration || '',
        student_id: req.user.id,
        group_id: group_id || null,
      },
      { timeout: 30000, ...getAiHeaders() }
    );

    const report = aiResponse.data;

    // 3. Save Recommendation
    const existingRec = await Recommendation.findOne({
      where: { problem_statement_id: problemStmt.id },
      order: [['created_at', 'DESC']],
    });

    const recData = {
      problem_statement_id: problemStmt.id,
      student_id: req.user.id,
      scores_json: report.scores || {},
      similar_projects_json: report.similar_projects || [],
      ai_suggestions_json: report.ai_suggestions || {},
      sdg_alignment: report.sdg_alignment || [],
      keywords: report.keywords || [],
      domain_analysis_json: report.domain_analysis || {},
      warnings_json: report.warnings || [],
      model_version: report.model_version || '2.0-hybrid-embedding',
    };

    let recommendation;
    if (existingRec) {
      recData.version = (existingRec.version || 1) + 1;
      await existingRec.update(recData);
      recommendation = existingRec;
    } else {
      recData.version = 1;
      recommendation = await Recommendation.create(recData);
    }

    // 4. Save to history
    await RecommendationHistory.create({
      recommendation_id: recommendation.id,
      problem_statement_id: problemStmt.id,
      student_id: req.user.id,
      action: 'analyzed',
      scores_snapshot: report.scores || {},
    });

    // 5. Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'problem.analyzed',
      entityType: 'problem_statement',
      entityId: problemStmt.id,
      ipAddress: req.ip,
    });

    // 6. Return full report with IDs
    res.json({
      ...report,
      problem_statement_id: problemStmt.id,
      recommendation_id: recommendation.id,
      version: recommendation.version,
    });

  } catch (error) {
    logger.error('Problem analysis error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable. Please try again later.' });
    }
    next(error);
  }
};

/**
 * GET /api/problem/similar/:id
 * Find similar projects for a given problem statement.
 */
const getProblemSimilar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if we have cached results
    const recommendation = await Recommendation.findOne({
      where: { problem_statement_id: id },
      order: [['created_at', 'DESC']],
    });

    if (recommendation && recommendation.similar_projects_json?.length > 0) {
      return res.json({
        similar_projects: recommendation.similar_projects_json,
        cached: true,
      });
    }

    // Otherwise, call AI service
    const aiResponse = await axios.get(
      `${AI_SERVICE_URL}/api/ai/problem/similar/${id}`,
      { timeout: 15000, ...getAiHeaders() }
    );

    res.json(aiResponse.data);
  } catch (error) {
    logger.error('Similar projects error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable.' });
    }
    next(error);
  }
};

/**
 * GET /api/recommendation/:id
 * Get a specific recommendation by ID.
 */
const getRecommendation = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findByPk(req.params.id, {
      include: [{ model: ProblemStatement, attributes: ['id', 'title', 'status'] }],
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }

    res.json({
      recommendation: {
        id: recommendation.id,
        scores: recommendation.scores_json,
        similar_projects: recommendation.similar_projects_json,
        ai_suggestions: recommendation.ai_suggestions_json,
        sdg_alignment: recommendation.sdg_alignment,
        keywords: recommendation.keywords,
        domain_analysis: recommendation.domain_analysis_json,
        warnings: recommendation.warnings_json,
        version: recommendation.version,
        model_version: recommendation.model_version,
        problem_statement: recommendation.problem_statement,
        created_at: recommendation.created_at,
        updated_at: recommendation.updated_at,
      },
    });
  } catch (error) { next(error); }
};

/**
 * POST /api/problem/improve
 * Generate improvement suggestions without full re-analysis.
 */
const improveProblem = async (req, res, next) => {
  try {
    const { title, problem_statement, description, domain, tech_stack, scores, similar_projects } = req.body;

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/problem/improve`,
      { title, problem_statement, description, domain, tech_stack, scores, similar_projects },
      { timeout: 20000, ...getAiHeaders() }
    );

    // Log the improvement request
    if (req.body.problem_statement_id) {
      await RecommendationHistory.create({
        problem_statement_id: req.body.problem_statement_id,
        student_id: req.user.id,
        action: 'improved',
        scores_snapshot: scores || {},
      });
    }

    res.json(aiResponse.data);
  } catch (error) {
    logger.error('Improve problem error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable.' });
    }
    next(error);
  }
};

/**
 * POST /api/problem/rescore
 * Re-analyze a problem statement after changes.
 */
const rescoreProblem = async (req, res, next) => {
  // Re-uses the same logic as analyzeProblem
  // The AI service /problem/rescore endpoint is identical to /problem/analyze
  return analyzeProblem(req, res, next);
};

/**
 * GET /api/student/recommendations
 * List all recommendations for the current student.
 */
const getStudentRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: ProblemStatement,
        attributes: ['id', 'title', 'domain', 'status', 'created_at'],
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(req.query.limit, 10) || 20,
    });

    res.json({
      data: recommendations.map(rec => ({
        id: rec.id,
        title: rec.problem_statement?.title || 'Untitled',
        domain: rec.problem_statement?.domain || '',
        status: rec.problem_statement?.status || 'draft',
        overall_score: rec.scores_json?.overall || 0,
        scores: rec.scores_json,
        version: rec.version,
        created_at: rec.created_at,
        updated_at: rec.updated_at,
        problem_statement_id: rec.problem_statement_id,
      })),
      total: recommendations.length,
    });
  } catch (error) { next(error); }
};

/**
 * POST /api/problem/draft
 * Save or update a problem statement draft.
 */
const saveDraft = async (req, res, next) => {
  try {
    const {
      title, problem_statement, description, domain, department,
      skills, tech_stack, team_members, hackathon_theme,
      expected_users, target_audience, expected_impact, duration,
      group_id, id,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required to save a draft.' });
    }

    // RBAC: Check if user belongs to group_id
    if (group_id) {
      const isMember = await GroupMember.findOne({ where: { group_id, student_id: req.user.id } });
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied: You are not a member of this group.' });
      }
    }

    const draftData = {
      student_id: req.user.id,
      group_id: group_id || null,
      title,
      problem_statement: problem_statement || '',
      description: description || '',
      domain: domain || '',
      department: department || '',
      skills: skills || [],
      tech_stack: tech_stack || [],
      team_members: team_members || [],
      hackathon_theme: hackathon_theme || '',
      expected_users: expected_users || '',
      target_audience: target_audience || '',
      expected_impact: expected_impact || '',
      duration: duration || '',
      status: 'draft',
    };

    let draft;
    if (id) {
      draft = await ProblemStatement.findByPk(id);
      if (!draft) return res.status(404).json({ error: 'Draft not found.' });
      if (draft.student_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
      await draft.update(draftData);
    } else {
      draft = await ProblemStatement.create(draftData);
    }

    res.json({ message: 'Draft saved.', problem_statement: draft });
  } catch (error) { next(error); }
};

module.exports = {
  analyzeProblem,
  getProblemSimilar,
  getRecommendation,
  improveProblem,
  rescoreProblem,
  getStudentRecommendations,
  saveDraft,
};
