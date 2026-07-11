const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * POST /api/auth/login
 * Accepts identifier (jntuNo or email) + password.
 */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (JNTU No or Email) and password are required.',
      });
    }

    // Find user by jntuNo or email
    const trimmedIdentifier = identifier.trim();
    let user;

    if (trimmedIdentifier.includes('@')) {
      // Email login (faculty)
      user = await User.findOne({ email: trimmedIdentifier.toLowerCase() });
    } else {
      // JNTU No login (student)
      user = await User.findOne({ jntuNo: trimmedIdentifier.toUpperCase() });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts. Try again after 15 minutes.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Contact your coordinator.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Get profile data
    const profile = await Profile.findOne({ userId: user._id });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        branch: user.branch,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          _id: user._id,
          role: user.role,
          branch: user.branch,
          jntuNo: user.jntuNo || undefined,
          email: user.email || undefined,
        },
        profile: profile || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * POST /api/auth/logout
 * Clears the JWT cookie.
 */
const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/auth/change-password
 * Requires current password + new password.
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Hash new password and save
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/auth/me
 * Returns current authenticated user info + profile.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash -loginAttempts -lockUntil');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const profile = await Profile.findOne({ userId: user._id });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          role: user.role,
          branch: user.branch,
          jntuNo: user.jntuNo || undefined,
          email: user.email || undefined,
          isActive: user.isActive,
        },
        profile: profile || null,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = { login, logout, changePassword, getMe };
