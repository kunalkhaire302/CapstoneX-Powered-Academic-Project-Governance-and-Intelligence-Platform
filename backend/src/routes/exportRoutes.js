const router = require('express').Router();
const { exportGroupsPDF, exportGroupsExcel } = require('../controllers/exportController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(verifyToken);
router.get('/groups/pdf', checkRole('mentor', 'admin'), exportGroupsPDF);
router.get('/groups/excel', checkRole('mentor', 'admin'), exportGroupsExcel);

module.exports = router;
