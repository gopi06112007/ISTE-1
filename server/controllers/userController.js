const User = require('../models/User');
const Profile = require('../models/Profile');
const logActivity = require('../utils/activityLogger');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

/**
 * POST /api/users/assign-credentials
 * Creates a new User + linked Profile.
 * Branch Faculty: can only create within own branch (student_coordinator role).
 * Central Faculty: can create any role in any branch.
 */
const assignCredentials = async (req, res) => {
  try {
    const {
      role, // 'student_coordinator' or 'branch_faculty'
      jntuNo, // required for students
      email, // required for faculty
      password,
      branch,
      name,
      isteRole, // ISTE role title
      year, // students only
      designation, // faculty only
      bio,
      socialLinks,
    } = req.body;

    // Validate required fields
    if (!role || !password || !branch || !name || !isteRole) {
      return res.status(400).json({
        success: false,
        message: 'role, password, branch, name, and isteRole are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Role-specific validation
    if (role === 'student_coordinator' && !jntuNo) {
      return res.status(400).json({
        success: false,
        message: 'JNTU No is required for student coordinators.',
      });
    }

    if (role === 'branch_faculty' && !email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for branch faculty coordinators.',
      });
    }

    // Branch faculty can only create student coordinators in their branch
    if (req.user.role === 'branch_faculty') {
      if (role !== 'student_coordinator') {
        return res.status(403).json({
          success: false,
          message: 'Branch faculty can only create student coordinator accounts.',
        });
      }
      if (branch !== req.user.branch) {
        return res.status(403).json({
          success: false,
          message: 'Cannot create users in other branches.',
        });
      }
    }

    // Central faculty cannot create other central faculty
    if (role === 'central_faculty' && req.user.role !== 'central_faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only central faculty can create central accounts.',
      });
    }

    // Check for existing user
    if (jntuNo) {
      const existingUser = await User.findOne({ jntuNo: jntuNo.toUpperCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `User with JNTU No ${jntuNo} already exists.`,
        });
      }
    }

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `User with email ${email} already exists.`,
        });
      }
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Handle photo upload
    let photoUrl = '';
    let photoPublicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/profiles');
      photoUrl = result.url;
      photoPublicId = result.publicId;
    }

    // Create user
    const user = await User.create({
      role,
      jntuNo: jntuNo ? jntuNo.toUpperCase() : undefined,
      email: email ? email.toLowerCase() : undefined,
      passwordHash,
      branch: branch.toUpperCase(),
      isActive: true,
      createdBy: req.user.userId,
    });

    // Create linked profile
    const profile = await Profile.create({
      userId: user._id,
      name,
      branch: branch.toUpperCase(),
      role: isteRole,
      year: year || undefined,
      designation: designation || undefined,
      bio: bio || '',
      photoUrl,
      photoPublicId,
      socialLinks: socialLinks || {},
    });

    // Link profile to user
    user.profileId = profile._id;
    await user.save();

    // Log activity
    await logActivity({
      action: 'CREATE',
      performedBy: req.user.userId,
      targetModel: 'User',
      targetId: user._id,
      details: `Created ${role} account for ${name} (${jntuNo || email}) in ${branch}`,
    });

    return res.status(201).json({
      success: true,
      message: `${role} credentials assigned successfully.`,
      data: {
        user: {
          _id: user._id,
          role: user.role,
          branch: user.branch,
          jntuNo: user.jntuNo,
          email: user.email,
          isActive: user.isActive,
        },
        profile,
      },
    });
  } catch (error) {
    console.error('Assign credentials error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/users
 * Central Faculty: all users
 * Branch Faculty: users in own branch
 */
const getUsers = async (req, res) => {
  try {
    const { branch, role } = req.query;
    const filter = {};

    if (req.user.role === 'branch_faculty') {
      filter.branch = req.user.branch;
    } else if (branch) {
      filter.branch = branch.toUpperCase();
    }

    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-passwordHash -loginAttempts -lockUntil')
      .populate('profileId')
      .sort({ branch: 1, role: 1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/users/:id/toggle-active
 * Activate/deactivate a user account
 */
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Branch isolation
    if (req.user.role === 'branch_faculty' && user.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify users from other branches.',
      });
    }

    // Prevent deactivating central admin
    if (user.role === 'central_faculty') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate central faculty accounts.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logActivity({
      action: 'UPDATE',
      performedBy: req.user.userId,
      targetModel: 'User',
      targetId: user._id,
      details: `${user.isActive ? 'Activated' : 'Deactivated'} user ${user.jntuNo || user.email}`,
    });

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * DELETE /api/users/:id
 * Central Faculty only
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'central_faculty') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete central faculty accounts.',
      });
    }

    // Branch isolation for branch faculty
    if (req.user.role === 'branch_faculty' && user.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete users from other branches.',
      });
    }

    // Delete associated profile
    if (user.profileId) {
      await Profile.findByIdAndDelete(user.profileId);
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      performedBy: req.user.userId,
      targetModel: 'User',
      targetId: user._id,
      details: `Deleted user ${user.jntuNo || user.email} (${user.role}) from ${user.branch}`,
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/users/activity-log
 * Central Faculty only
 */
const getActivityLogs = async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    const logs = await ActivityLog.find()
      .populate({
        path: 'performedBy',
        select: 'role email branch jntuNo',
        populate: {
          path: 'profileId',
          select: 'name',
        },
      })
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  assignCredentials,
  getUsers,
  toggleUserActive,
  deleteUser,
  getActivityLogs,
};
