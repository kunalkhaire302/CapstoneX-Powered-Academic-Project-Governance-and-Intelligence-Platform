const router = require('express').Router();
const { createGroup, joinGroup, listGroups, getGroup, updateGroup } = require('../controllers/groupController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');
const schemas = require('../utils/schemas');

router.use(verifyToken);
router.post('/', checkRole('student', 'admin', 'coordinator'), validate(schemas.createGroup), createGroup);
router.post('/join', checkRole('student'), validate(schemas.joinGroup), joinGroup);
router.get('/', listGroups);
router.get('/:id', getGroup);
router.put('/:id', checkRole('admin', 'coordinator', 'mentor'), updateGroup);

module.exports = router;
