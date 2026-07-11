const express = require('express');
const router = express.Router();
const {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const branchIsolation = require('../middleware/branchIsolation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// GET /api/profiles — Public
router.get('/', getProfiles);

// GET /api/profiles/:id — Public
router.get('/:id', getProfileById);

// POST /api/profiles — Branch Faculty | Central
router.post(
  '/',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  branchIsolation,
  uploadSingle,
  handleUploadError,
  createProfile
);

// PATCH /api/profiles/:id — Branch/Central + profile owner
router.patch(
  '/:id',
  verifyToken,
  uploadSingle,
  handleUploadError,
  updateProfile
);

// DELETE /api/profiles/:id — Branch Faculty | Central
router.delete(
  '/:id',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  deleteProfile
);

module.exports = router;
