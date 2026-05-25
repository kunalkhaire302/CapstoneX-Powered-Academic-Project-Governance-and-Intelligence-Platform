const router = require('express').Router();
const multer = require('multer');
const { listUsers, getUser, updateUser, deleteUser, bulkImport, updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(verifyToken);
router.put('/profile', updateProfile);
router.get('/', checkRole('admin', 'coordinator', 'hod'), listUsers);
router.get('/:id', getUser);
router.put('/:id', checkRole('admin'), updateUser);
router.delete('/:id', checkRole('admin'), deleteUser);
router.post('/bulk-import', checkRole('admin'), upload.single('file'), bulkImport);

module.exports = router;
