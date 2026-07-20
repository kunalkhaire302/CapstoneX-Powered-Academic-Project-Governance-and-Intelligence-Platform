const router = require('express').Router();
const multer = require('multer');
const { listUsers, getUser, updateUser, deleteUser, bulkImport, updateProfile, adminCreateUser } = require('../controllers/userController');
const { getStudentDashboard } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

const { secureUpload } = require('../middleware/uploadValidation');

router.use(verifyToken);
router.get('/dashboard/student', checkRole('student'), getStudentDashboard);
router.put('/profile', updateProfile);
router.get('/', checkRole('admin', 'mentor'), listUsers);
router.get('/:id', getUser);
router.post('/admin-create', checkRole('admin'), adminCreateUser);
router.put('/:id', checkRole('admin'), updateUser);
router.delete('/:id', checkRole('admin'), deleteUser);
router.post('/bulk-import', checkRole('admin'), secureUpload('file'), bulkImport);

module.exports = router;
