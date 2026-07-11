const Blog = require('../models/Blog');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const logActivity = require('../utils/activityLogger');

/**
 * GET /api/blogs
 * Public — supports ?category= filter
 */
const getBlogs = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) filter.category = category;

    const blogs = await Blog.find(filter)
      .populate({
        path: 'author',
        select: 'role branch',
        populate: {
          path: 'profileId',
          select: 'name photoUrl',
        },
      })
      .sort({ publishedAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/blogs/:id
 * Public
 */
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate({
      path: 'author',
      select: 'role branch',
      populate: {
        path: 'profileId',
        select: 'name photoUrl bio',
      },
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * POST /api/blogs
 * Central Faculty only
 */
const createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'title, content, and category are required.',
      });
    }

    // Handle featured image upload
    let featuredImageUrl = '';
    let featuredImagePublicId = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/blogs');
      featuredImageUrl = uploadResult.url;
      featuredImagePublicId = uploadResult.publicId;
    }

    const blog = await Blog.create({
      title,
      content, // TipTap HTML output — sanitized on client render with DOMPurify
      category,
      featuredImageUrl,
      featuredImagePublicId,
      author: req.user.userId,
      publishedAt: new Date(),
    });

    await logActivity({
      action: 'CREATE',
      performedBy: req.user.userId,
      targetModel: 'Blog',
      targetId: blog._id,
      details: `Created blog post "${title}"`,
    });

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully.',
      data: blog,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/blogs/:id
 * Central Faculty only
 */
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Handle featured image upload
    if (req.file) {
      if (blog.featuredImagePublicId) {
        await deleteFromCloudinary(blog.featuredImagePublicId);
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/blogs');
      req.body.featuredImageUrl = uploadResult.url;
      req.body.featuredImagePublicId = uploadResult.publicId;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await logActivity({
      action: 'UPDATE',
      performedBy: req.user.userId,
      targetModel: 'Blog',
      targetId: blog._id,
      details: `Updated blog post "${updatedBlog.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully.',
      data: updatedBlog,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * DELETE /api/blogs/:id
 * Central Faculty only
 */
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    if (blog.featuredImagePublicId) {
      await deleteFromCloudinary(blog.featuredImagePublicId);
    }

    await Blog.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      performedBy: req.user.userId,
      targetModel: 'Blog',
      targetId: blog._id,
      details: `Deleted blog post "${blog.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully.',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
