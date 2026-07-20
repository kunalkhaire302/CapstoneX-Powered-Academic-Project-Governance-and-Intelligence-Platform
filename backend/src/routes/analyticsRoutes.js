const router = require('express').Router();
const { getSystemAnalytics, getDepartmentAnalytics } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);
router.get('/system', checkRole('admin'), getSystemAnalytics);
router.get('/department', checkRole('mentor', 'admin'), getDepartmentAnalytics);

module.exports = router;
