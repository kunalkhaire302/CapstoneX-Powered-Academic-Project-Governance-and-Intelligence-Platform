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
router.post('/problem/analyze', checkRole('student', 'mentor', 'coordinator'), analyzeProblemStatement);
router.post('/plagiarism/check', checkRole('mentor', 'coordinator', 'admin'), checkPlagiarism);

// Mentor/Coordinator/Admin endpoints
router.post('/risk-score', checkRole('mentor', 'coordinator', 'admin'), getRiskScore);
router.get('/risk-scores', checkRole('mentor', 'coordinator', 'admin'), listRiskScores);
router.post('/feedback/analyze', checkRole('mentor', 'coordinator'), analyzeFeedback);
router.post('/teams/form', checkRole('coordinator', 'admin'), formTeams);

// Reports endpoints
router.post('/reports/department/pdf', checkRole('hod', 'coordinator', 'admin', 'accreditation'), generateDepartmentReport);
router.post('/reports/accreditation', checkRole('hod', 'accreditation', 'admin'), generateAccreditationReport);

module.exports = router;
