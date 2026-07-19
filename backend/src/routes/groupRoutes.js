const router = require('express').Router();
const { createGroup, joinGroup, listGroups, getGroup, updateGroup, inviteMember, respondToInvite, lockGroup, allocateMentor } = require('../controllers/groupController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validator');
const schemas = require('../utils/schemas');

router.use(verifyToken);
router.post('/', checkRole('student', 'admin', 'mentor'), validate(schemas.createGroup), createGroup);
router.post('/join', checkRole('student'), validate(schemas.joinGroup), joinGroup);
router.post('/:id/invite', checkRole('student', 'admin'), inviteMember);
router.post('/invitations/:invite_id/respond', checkRole('student'), respondToInvite);
router.post('/:id/lock', checkRole('student', 'admin'), lockGroup);
router.post('/:id/allocate-mentor', checkRole('admin', 'mentor'), allocateMentor);
router.get('/', listGroups);
router.get('/:id', getGroup);
router.put('/:id', checkRole('admin', 'mentor'), updateGroup);

module.exports = router;
