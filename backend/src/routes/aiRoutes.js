const router = require('express').Router();
const { getRecommendations, getRiskScore, generateFeedback, formTeams, listRiskScores } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);
router.post('/recommend', checkRole('student'), getRecommendations);
router.post('/risk-score', checkRole('admin', 'coordinator', 'mentor'), getRiskScore);
router.post('/generate-feedback', checkRole('mentor'), generateFeedback);
router.post('/form-teams', checkRole('admin', 'coordinator'), formTeams);
router.get('/risk-scores', checkRole('admin', 'coordinator'), listRiskScores);

module.exports = router;
