const express = require('express');
const router = express.Router();
const {
  assignCredentials,
  getUsers,
  toggleUserActive,
  deleteUser,
  getActivityLogs,
  resetUserPassword,
} = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const branchIsolation = require('../middleware/branchIsolation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// GET /api/users/activity-log — Central only
router.get(
  '/activity-log',
  verifyToken,
  requireRole('central_faculty'),
  getActivityLogs
);

// POST /api/users/assign-credentials — Branch Faculty | Central
router.post(
  '/assign-credentials',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  branchIsolation,
  uploadSingle,
  handleUploadError,
  assignCredentials
);

// GET /api/users — Branch Faculty | Central
router.get(
  '/',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  getUsers
);

// PATCH /api/users/:id/toggle-active — Branch Faculty | Central
router.patch(
  '/:id/toggle-active',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  toggleUserActive
);

// PATCH /api/users/:id/reset-password — Branch Faculty | Central
router.patch(
  '/:id/reset-password',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  resetUserPassword
);

// DELETE /api/users/:id — Branch Faculty | Central
router.delete(
  '/:id',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  deleteUser
);

module.exports = router;
