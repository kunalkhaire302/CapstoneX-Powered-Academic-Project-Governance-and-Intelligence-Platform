const router = require('express').Router();
const { listAuditLogs } = require('../controllers/auditLogController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);
router.get('/', checkRole('admin'), listAuditLogs);

module.exports = router;
