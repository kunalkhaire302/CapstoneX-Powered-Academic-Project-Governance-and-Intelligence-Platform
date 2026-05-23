const router = require('express').Router();
const { createLogbook, submitLogbook, listLogbooks, updateLogbook, addFeedback } = require('../controllers/logbookController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const multer = require('multer');
const { validate } = require('../middleware/validator');
const schemas = require('../utils/schemas');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(verifyToken);
router.post('/', checkRole('student'), upload.single('file'), validate(schemas.createLogbook), createLogbook);
router.get('/', listLogbooks);
router.put('/:id', checkRole('student'), updateLogbook);
router.put('/:id/submit', checkRole('student'), submitLogbook);
router.post('/:id/feedback', checkRole('mentor'), addFeedback);

module.exports = router;
