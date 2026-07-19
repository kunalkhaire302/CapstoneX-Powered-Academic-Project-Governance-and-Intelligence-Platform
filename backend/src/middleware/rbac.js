/**
 * Role-Based Access Control (RBAC) middleware.
 * Supports 6 roles: student, mentor, coordinator, hod, admin, accreditation
 *
 * Usage:
 *   router.get('/admin-only', verifyToken, checkRole('admin'), handler);
 *   router.get('/staff', verifyToken, checkRole('admin', 'coordinator', 'hod'), handler);
 */

const VALID_ROLES = ['student', 'mentor', 'hod', 'admin', 'accreditation'];

/**
 * Returns middleware that checks if req.user.role is in the allowed roles list.
 * @param  {...string} allowedRoles - Roles that can access the route
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = req.user.role;

    if (!VALID_ROLES.includes(userRole)) {
      return res.status(403).json({ error: 'Invalid user role.' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Access denied.',
        message: `This action requires one of: ${allowedRoles.join(', ')}. Your role: ${userRole}.`,
      });
    }

    next();
  };
};

/**
 * Checks if the user owns the resource or is an admin/coordinator.
 * Used for routes where users can only access their own data.
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request (req) => ownerId
 */
const checkOwnerOrRole = (getResourceOwnerId, ...privilegedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Privileged roles can always access
    if (privilegedRoles.includes(req.user.role)) {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      if (ownerId && ownerId.toString() === req.user.id.toString()) {
        return next();
      }
    } catch (err) {
      // If we can't determine ownership, deny access
    }

    return res.status(403).json({
      error: 'Access denied.',
      message: 'You can only access your own resources.',
    });
  };
};

const checkDepartment = (allowedDepartment) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    // Admin can bypass department checks
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (req.user.department !== allowedDepartment) {
      return res.status(403).json({ error: 'Access denied. You do not belong to the required department.' });
    }
    
    next();
  };
};

module.exports = { checkRole, checkOwnerOrRole, checkDepartment, VALID_ROLES };
