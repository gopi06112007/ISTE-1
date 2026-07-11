const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'],
    },
    role: {
      type: String,
      required: true,
      trim: true,
      // ISTE role title — e.g. "Technical Lead", "Faculty Coordinator"
    },
    year: {
      type: String,
      trim: true,
      // Students only — e.g. "2nd Year", "3rd Year"
    },
    designation: {
      type: String,
      trim: true,
      // Faculty only — e.g. "Associate Professor"
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    photoPublicId: {
      type: String,
      default: '',
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtered queries
profileSchema.index({ branch: 1, role: 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
