const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const logActivity = require('../utils/activityLogger');

/**
 * GET /api/profiles
 * Public — supports ?branch= &role= filters
 */
const getProfiles = async (req, res) => {
  try {
    const { branch, role } = req.query;
    const filter = {};

    if (branch) filter.branch = branch.toUpperCase();
    if (role) filter.role = { $regex: role, $options: 'i' };

    const profiles = await Profile.find(filter)
      .populate({
        path: 'userId',
        select: 'role jntuNo email branch isActive',
      })
      .sort({ branch: 1, name: 1 });

    // Filter out profiles of inactive users
    const activeProfiles = profiles.filter(
      (p) => p.userId && p.userId.isActive
    );

    return res.status(200).json({
      success: true,
      count: activeProfiles.length,
      data: activeProfiles,
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/profiles/:id
 * Public — get a single profile by ID
 */
const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate({
      path: 'userId',
      select: 'role jntuNo email branch isActive',
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get profile by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * POST /api/profiles
 * Branch Faculty | Central — create a new profile (linked to an existing user)
 */
const createProfile = async (req, res) => {
  try {
    const { userId, name, branch, role, year, designation, bio, socialLinks } = req.body;

    if (!userId || !name || !branch || !role) {
      return res.status(400).json({
        success: false,
        message: 'userId, name, branch, and role are required.',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if profile already exists for this user
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Profile already exists for this user.',
      });
    }

    // Handle photo upload if present
    let photoUrl = '';
    let photoPublicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/profiles');
      photoUrl = result.url;
      photoPublicId = result.publicId;
    }

    const profile = await Profile.create({
      userId,
      name,
      branch: branch.toUpperCase(),
      role,
      year,
      designation,
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
      targetModel: 'Profile',
      targetId: profile._id,
      details: `Created profile for ${name} in ${branch}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Profile created successfully.',
      data: profile,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/profiles/:id
 * Branch/Central + profile owner
 * Owner can only edit: bio, photoUrl, socialLinks
 * Faculty/Central can edit all fields
 */
const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    const isOwner = profile.userId.toString() === req.user.userId.toString();
    const isFaculty = ['branch_faculty', 'central_faculty'].includes(req.user.role);

    if (!isOwner && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own profile.',
      });
    }

    // Handle photo upload
    if (req.file) {
      if (profile.photoPublicId) {
        await deleteFromCloudinary(profile.photoPublicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/profiles');
      req.body.photoUrl = result.url;
      req.body.photoPublicId = result.publicId;
    }

    if (req.user.role === 'student_coordinator' && isOwner) {
      const allowedFields = ['name', 'branch', 'role', 'year', 'bio', 'photoUrl', 'photoPublicId', 'socialLinks'];
      const updateData = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // If branch is being updated, validate and sync to User
      if (updateData.branch) {
        updateData.branch = updateData.branch.toUpperCase();
        const validBranches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
        if (!validBranches.includes(updateData.branch)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid branch selection.',
          });
        }
        await User.findByIdAndUpdate(profile.userId, { branch: updateData.branch });
      }

      const updatedProfile = await Profile.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      // Log activity
      await logActivity({
        action: 'UPDATE',
        performedBy: req.user.userId,
        targetModel: 'Profile',
        targetId: profile._id,
        details: `Updated own profile details`,
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedProfile,
      });
    }

    // Sync branch to user if changed by faculty/central
    if (req.body.branch) {
      req.body.branch = req.body.branch.toUpperCase();
      await User.findByIdAndUpdate(profile.userId, { branch: req.body.branch });
    }

    // Faculty/Central can update all fields
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Log activity
    await logActivity({
      action: 'UPDATE',
      performedBy: req.user.userId,
      targetModel: 'Profile',
      targetId: profile._id,
      details: `Updated profile for ${updatedProfile.name}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * DELETE /api/profiles/:id
 * Branch Faculty | Central
 */
const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    // Branch isolation check for branch faculty
    if (req.user.role === 'branch_faculty' && profile.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete profiles from other branches.',
      });
    }

    // Remove profile reference from user
    await User.findByIdAndUpdate(profile.userId, { $unset: { profileId: 1 } });

    if (profile.photoPublicId) {
      await deleteFromCloudinary(profile.photoPublicId);
    }

    await Profile.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity({
      action: 'DELETE',
      performedBy: req.user.userId,
      targetModel: 'Profile',
      targetId: profile._id,
      details: `Deleted profile for ${profile.name} in ${profile.branch}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully.',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};
