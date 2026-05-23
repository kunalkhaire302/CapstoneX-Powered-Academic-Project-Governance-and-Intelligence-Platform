const router = require('express').Router();
const { listNotifications, markAsRead, markAllAsRead, broadcast } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);
router.get('/', listNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.post('/broadcast', checkRole('admin'), broadcast);

module.exports = router;
