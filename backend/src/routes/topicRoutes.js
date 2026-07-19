const router = require('express').Router();
const { submitTopic, listTopics, approveTopic, rejectTopic } = require('../controllers/topicController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');
const schemas = require('../utils/schemas');

router.use(verifyToken);
router.post('/', checkRole('student'), validate(schemas.submitTopic), submitTopic);
router.get('/', listTopics);
router.put('/:id/approve', checkRole('mentor', 'hod', 'admin'), approveTopic);
router.put('/:id/reject', checkRole('mentor', 'hod', 'admin'), rejectTopic);

module.exports = router;
