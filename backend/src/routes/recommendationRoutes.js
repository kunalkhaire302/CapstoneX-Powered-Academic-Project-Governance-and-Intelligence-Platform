/**
 * Recommendation Routes
 * REST API routes for problem statement analysis and AI recommendations.
 *
 * All routes require authentication (verifyToken).
 * Student role is required for most endpoints.
 */
const router = require('express').Router();
const {
  analyzeProblem,
  getProblemSimilar,
  getRecommendation,
  improveProblem,
  rescoreProblem,
  getStudentRecommendations,
  saveDraft,
} = require('../controllers/recommendationController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// All routes require authentication
router.use(verifyToken);

// ──────────────────────────────────────────
// Problem Statement Analysis
// ──────────────────────────────────────────
router.post('/recommend', checkRole('student'), analyzeProblem);
router.post('/problem/analyze', checkRole('student'), analyzeProblem);
router.post('/problem/rescore', checkRole('student'), rescoreProblem);
router.post('/problem/improve', checkRole('student'), improveProblem);
router.post('/problem/draft', checkRole('student'), saveDraft);

// ──────────────────────────────────────────
// Recommendation Retrieval
// ──────────────────────────────────────────
router.get('/problem/similar/:id', checkRole('student', 'mentor'), getProblemSimilar);
router.get('/recommendation/:id', checkRole('student', 'mentor'), getRecommendation);
router.get('/student/recommendations', checkRole('student'), getStudentRecommendations);

module.exports = router;
