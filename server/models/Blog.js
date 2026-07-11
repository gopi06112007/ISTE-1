const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      // Stores TipTap HTML output
    },
    category: {
      type: String,
      required: true,
      enum: ['Announcement', 'Achievement', 'Technical', 'ISTE News'],
    },
    featuredImageUrl: {
      type: String,
      default: '',
    },
    featuredImagePublicId: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtered queries
blogSchema.index({ category: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ author: 1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
