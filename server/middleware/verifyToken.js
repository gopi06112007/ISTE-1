const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verify JWT from HttpOnly cookie.
 * Attaches req.user = { userId, role, branch } on success.
 * Returns 401 if no token, invalid token, or user not found/inactive.
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('role branch isActive');

    if (!user) {
      // Clear invalid cookie
      res.clearCookie('token');
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    if (!user.isActive) {
      res.clearCookie('token');
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Contact your coordinator.',
      });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      role: user.role,
      branch: user.branch,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      res.clearCookie('token');
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

module.exports = verifyToken;
