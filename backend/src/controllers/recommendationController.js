const axios = require('axios');
const { getFirestoreDB } = require('../config/firebase');
const { createAuditLog } = require('../utils/auditLog');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET;

const getAiHeaders = () => ({
  headers: {
    'X-Internal-Token': AI_INTERNAL_SECRET,
    'Content-Type': 'application/json'
  }
});

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

    const db = getFirestoreDB();

    if (group_id) {
      const isMemberSnap = await db.collection('group_members')
        .where('group_id', '==', group_id)
        .where('student_id', '==', req.user.id)
        .get();
      if (isMemberSnap.empty) {
        return res.status(403).json({ error: 'Access denied: You are not a member of this group.' });
      }
    }

    // 1. Save/update ProblemStatement in database
    const problemStmtsSnap = await db.collection('problem_statements')
      .where('student_id', '==', req.user.id)
      .where('title', '==', title)
      .limit(1)
      .get();

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
      updated_at: new Date()
    };

    let problemStmtId;
    if (!problemStmtsSnap.empty) {
      problemStmtId = problemStmtsSnap.docs[0].id;
      await db.collection('problem_statements').doc(problemStmtId).update(stmtData);
    } else {
      stmtData.created_at = new Date();
      const newRef = await db.collection('problem_statements').add(stmtData);
      problemStmtId = newRef.id;
    }

    // 2. Call AI service for analysis
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/problem/analyze`,
      { ...stmtData, student_id: req.user.id, group_id: group_id || null },
      { timeout: 30000, ...getAiHeaders() }
    );

    const report = aiResponse.data;

    // 3. Save Recommendation
    const recsSnap = await db.collection('recommendations')
      .where('problem_statement_id', '==', problemStmtId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    const recData = {
      problem_statement_id: problemStmtId,
      student_id: req.user.id,
      scores_json: report.scores || {},
      similar_projects_json: report.similar_projects || [],
      ai_suggestions_json: report.ai_suggestions || {},
      sdg_alignment: report.sdg_alignment || [],
      keywords: report.keywords || [],
      domain_analysis_json: report.domain_analysis || {},
      warnings_json: report.warnings || [],
      model_version: report.model_version || '2.0-hybrid-embedding',
      updated_at: new Date()
    };

    let recommendationId;
    let version = 1;
    if (!recsSnap.empty) {
      const existingRec = recsSnap.docs[0].data();
      version = (existingRec.version || 1) + 1;
      recData.version = version;
      recommendationId = recsSnap.docs[0].id;
      await db.collection('recommendations').doc(recommendationId).update(recData);
    } else {
      recData.version = version;
      recData.created_at = new Date();
      const newRef = await db.collection('recommendations').add(recData);
      recommendationId = newRef.id;
    }

    // 4. Save to history
    await db.collection('recommendation_history').add({
      recommendation_id: recommendationId,
      problem_statement_id: problemStmtId,
      student_id: req.user.id,
      action: 'analyzed',
      scores_snapshot: report.scores || {},
      created_at: new Date()
    });

    // 5. Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'problem.analyzed',
      entityType: 'problem_statement',
      entityId: problemStmtId,
      ipAddress: req.ip,
    });

    res.json({
      ...report,
      problem_statement_id: problemStmtId,
      recommendation_id: recommendationId,
      version: version,
    });

  } catch (error) {
    logger.error('Problem analysis error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'AI service unavailable. Please try again later.' });
    }
    next(error);
  }
};

const getProblemSimilar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getFirestoreDB();
    const recsSnap = await db.collection('recommendations')
      .where('problem_statement_id', '==', id)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    if (!recsSnap.empty) {
      const recommendation = recsSnap.docs[0].data();
      if (recommendation.similar_projects_json?.length > 0) {
        return res.json({
          similar_projects: recommendation.similar_projects_json,
          cached: true,
        });
      }
    }

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

const getRecommendation = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const doc = await db.collection('recommendations').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }
    
    const data = doc.data();
    
    // Fetch related problem statement
    let problem_statement = null;
    if (data.problem_statement_id) {
      const psDoc = await db.collection('problem_statements').doc(data.problem_statement_id).get();
      if (psDoc.exists) problem_statement = { id: psDoc.id, ...psDoc.data() };
    }

    res.json({
      recommendation: {
        id: doc.id,
        scores: data.scores_json,
        similar_projects: data.similar_projects_json,
        ai_suggestions: data.ai_suggestions_json,
        sdg_alignment: data.sdg_alignment,
        keywords: data.keywords,
        domain_analysis: data.domain_analysis_json,
        warnings: data.warnings_json,
        version: data.version,
        model_version: data.model_version,
        problem_statement,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (error) { next(error); }
};

const improveProblem = async (req, res, next) => {
  try {
    const { title, problem_statement, description, domain, tech_stack, scores, similar_projects } = req.body;

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/problem/improve`,
      { title, problem_statement, description, domain, tech_stack, scores, similar_projects },
      { timeout: 20000, ...getAiHeaders() }
    );

    if (req.body.problem_statement_id) {
      const db = getFirestoreDB();
      await db.collection('recommendation_history').add({
        problem_statement_id: req.body.problem_statement_id,
        student_id: req.user.id,
        action: 'improved',
        scores_snapshot: scores || {},
        created_at: new Date()
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

const rescoreProblem = async (req, res, next) => {
  return analyzeProblem(req, res, next);
};

const getStudentRecommendations = async (req, res, next) => {
  try {
    const db = getFirestoreDB();
    const limit = parseInt(req.query.limit, 10) || 20;
    
    const recsSnap = await db.collection('recommendations')
      .where('student_id', '==', req.user.id)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();
      
    const data = [];
    for (const doc of recsSnap.docs) {
      const rec = doc.data();
      let problem_statement = null;
      if (rec.problem_statement_id) {
        const psDoc = await db.collection('problem_statements').doc(rec.problem_statement_id).get();
        if (psDoc.exists) problem_statement = psDoc.data();
      }
      
      data.push({
        id: doc.id,
        title: problem_statement?.title || 'Untitled',
        domain: problem_statement?.domain || '',
        status: problem_statement?.status || 'draft',
        overall_score: rec.scores_json?.overall || 0,
        scores: rec.scores_json,
        version: rec.version,
        created_at: rec.created_at,
        updated_at: rec.updated_at,
        problem_statement_id: rec.problem_statement_id,
      });
    }

    res.json({ data, total: data.length });
  } catch (error) { next(error); }
};

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
    
    const db = getFirestoreDB();

    if (group_id) {
      const isMemberSnap = await db.collection('group_members')
        .where('group_id', '==', group_id)
        .where('student_id', '==', req.user.id)
        .get();
      if (isMemberSnap.empty) {
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
      updated_at: new Date()
    };

    let draftId = id;
    if (draftId) {
      const doc = await db.collection('problem_statements').doc(draftId).get();
      if (!doc.exists) return res.status(404).json({ error: 'Draft not found.' });
      if (doc.data().student_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
      
      await db.collection('problem_statements').doc(draftId).update(draftData);
    } else {
      draftData.created_at = new Date();
      const newRef = await db.collection('problem_statements').add(draftData);
      draftId = newRef.id;
    }

    res.json({ message: 'Draft saved.', problem_statement: { id: draftId, ...draftData } });
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
