const router = require('express').Router();
const { createEvaluation, listEvaluations, updateEvaluation } = require('../controllers/evaluationController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);
router.post('/', checkRole('mentor'), createEvaluation);
router.get('/', listEvaluations);
router.put('/:id', checkRole('mentor'), updateEvaluation);

module.exports = router;
