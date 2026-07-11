const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
      // e.g. "10:00 AM"
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Other'],
    },
    posterUrl: {
      type: String,
      default: '',
    },
    posterPublicId: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: dynamically compute event status based on date
eventSchema.virtual('status').get(function () {
  if (!this.date) return 'upcoming';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(this.date);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate >= today ? 'upcoming' : 'past';
});

// Index for filtered queries
eventSchema.index({ branch: 1, category: 1 });
eventSchema.index({ date: -1 });
eventSchema.index({ createdBy: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
