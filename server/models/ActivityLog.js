const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      // e.g. "CREATE", "UPDATE", "DELETE"
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['User', 'Profile', 'Event', 'Blog', 'Gallery'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      // Human-readable description: "Created student coordinator John Doe in CSE"
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  }
);

// Index for recent activity queries
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ performedBy: 1 });
activityLogSchema.index({ targetModel: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
