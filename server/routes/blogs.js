const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  reactBlog,
  shareBlog,
} = require('../controllers/blogController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// GET /api/blogs — Public
router.get('/', getBlogs);

// GET /api/blogs/:id — Public
router.get('/:id', getBlogById);

// POST /api/blogs/:id/like — Public
router.post('/:id/like', toggleLikeBlog);

// POST /api/blogs/:id/react — Public
router.post('/:id/react', reactBlog);

// POST /api/blogs/:id/share — Public
router.post('/:id/share', shareBlog);

// POST /api/blogs — Central only
router.post(
  '/',
  verifyToken,
  requireRole('central_faculty'),
  uploadSingle,
  handleUploadError,
  createBlog
);

// PATCH /api/blogs/:id — Central only
router.patch(
  '/:id',
  verifyToken,
  requireRole('central_faculty'),
  uploadSingle,
  handleUploadError,
  updateBlog
);

// DELETE /api/blogs/:id — Central only
router.delete(
  '/:id',
  verifyToken,
  requireRole('central_faculty'),
  deleteBlog
);

module.exports = router;
