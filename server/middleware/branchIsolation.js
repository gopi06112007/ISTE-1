/**
 * Middleware: Enforce branch isolation for branch faculty coordinators.
 * Must be used AFTER verifyToken middleware (depends on req.user).
 *
 * Rules:
 *   - Central faculty: bypasses all branch checks (full access)
 *   - Branch faculty: can only access resources within their own branch
 *   - Student coordinators: can only access their own branch resources
 *
 * This middleware checks:
 *   1. req.body.branch — for POST/PATCH requests creating/editing resources
 *   2. req.query.branch — for GET requests filtering by branch
 *   3. Resource ownership — for PATCH/DELETE on existing resources (checked in controllers)
 */
const branchIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Central faculty bypasses branch isolation
  if (req.user.role === 'central_faculty') {
    return next();
  }

  const userBranch = req.user.branch;

  // Check body.branch for POST/PATCH — prevent creating resources in other branches
  if (req.body && req.body.branch) {
    if (req.body.branch !== userBranch) {
      return res.status(403).json({
        success: false,
        message: `Branch isolation violation. You can only manage resources in your branch (${userBranch}).`,
      });
    }
  }

  // For GET requests with branch filter, enforce own branch
  // (If no branch filter is specified, controller should scope by user's branch)
  if (req.query && req.query.branch) {
    if (req.query.branch !== userBranch) {
      return res.status(403).json({
        success: false,
        message: `Branch isolation violation. You can only view resources in your branch (${userBranch}).`,
      });
    }
  }

  // Attach branch to request for controllers to use
  req.userBranch = userBranch;

  next();
};

module.exports = branchIsolation;
