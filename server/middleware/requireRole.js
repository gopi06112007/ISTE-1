/**
 * Middleware factory: Require specific role(s) to access a route.
 * Must be used AFTER verifyToken middleware (depends on req.user).
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 *   requireRole('central_faculty')
 *   requireRole('branch_faculty', 'central_faculty')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = requireRole;
