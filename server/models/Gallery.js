const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    albumName: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      // Optional — not every album is tied to an event
    },
    photos: [
      {
        type: String,
        // Cloudinary URLs
      },
    ],
    photoPublicIds: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtered queries
gallerySchema.index({ branch: 1 });
gallerySchema.index({ eventId: 1 });
gallerySchema.index({ createdBy: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
