const express = require('express');
const router = express.Router();
const {
  getAlbums,
  getAlbumById,
  createAlbum,
  addPhotosToAlbum,
  deleteAlbum,
} = require('../controllers/galleryController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const branchIsolation = require('../middleware/branchIsolation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

// GET /api/gallery — Public
router.get('/', getAlbums);

// GET /api/gallery/:id — Public
router.get('/:id', getAlbumById);

// POST /api/gallery — Branch Faculty | Central (multipart upload)
router.post(
  '/',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  branchIsolation,
  uploadMultiple,
  handleUploadError,
  createAlbum
);

// PATCH /api/gallery/:id/photos — Add photos to existing album
router.patch(
  '/:id/photos',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  uploadMultiple,
  handleUploadError,
  addPhotosToAlbum
);

// DELETE /api/gallery/:id — Creator | Central
router.delete(
  '/:id',
  verifyToken,
  requireRole('branch_faculty', 'central_faculty'),
  deleteAlbum
);

module.exports = router;
