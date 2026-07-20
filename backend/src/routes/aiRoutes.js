const router = require('express').Router();
const { 
  getRecommendations, 
  getRiskScore, 
  analyzeFeedback, 
  formTeams, 
  listRiskScores,
  checkPlagiarism,
  analyzeProblemStatement,
  generateDepartmentReport,
  generateAccreditationReport,
  checkDetailedHealth
} = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);

// Core student/mentor endpoints
router.get('/health/detailed', checkDetailedHealth);
router.post('/recommend', checkRole('student'), getRecommendations);
router.post('/problem/analyze', checkRole('student', 'mentor'), analyzeProblemStatement);
router.post('/plagiarism/check', checkRole('mentor', 'admin'), checkPlagiarism);

// Mentor/Coordinator/Admin endpoints
router.post('/risk-score', checkRole('mentor', 'admin'), getRiskScore);
router.get('/risk-scores', checkRole('mentor', 'admin'), listRiskScores);
router.post('/feedback/analyze', checkRole('mentor'), analyzeFeedback);
router.post('/teams/form', checkRole('admin'), formTeams);

// Reports endpoints
router.post('/reports/department/pdf', checkRole('admin'), generateDepartmentReport);
router.post('/reports/accreditation', checkRole('admin'), generateAccreditationReport);

module.exports = router;
