const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['student_coordinator', 'branch_faculty', 'central_faculty'],
    },
    jntuNo: {
      type: String,
      unique: true,
      sparse: true, // Only for students — allows null for faculty
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Only for faculty — allows null for students
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CENTRAL'],
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: check if account is currently locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method: increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock after 5 failed attempts for 15 minutes
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Instance method: reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Static method: hash password
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
};

// Index for faster lookups
userSchema.index({ role: 1, branch: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
