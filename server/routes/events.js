const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const branchIsolation = require('../middleware/branchIsolation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// GET /api/events — Public
router.get('/', getEvents);

// GET /api/events/:id — Public
router.get('/:id', getEventById);

// POST /api/events — Branch Faculty | Central
router.post(
  '/',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  branchIsolation,
  uploadSingle,
  handleUploadError,
  createEvent
);

// PATCH /api/events/:id — Creator | Central
router.patch(
  '/:id',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  uploadSingle,
  handleUploadError,
  updateEvent
);

// DELETE /api/events/:id — Creator | Central
router.delete(
  '/:id',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  deleteEvent
);

module.exports = router;
