

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from "crypto";

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    // Email Field (Unique Identifier)
    email: {
      type: String,
      required: [true, 'Email is required'], // Custom error message
      unique: true, // Ensures no duplicate emails
      lowercase: true, // Always convert to lowercase
      trim: true, // Removes whitespace
      validate: [validator.isEmail, 'Please provide a valid email'] // Email validation
    },

    // Password Field (Securely Hashed)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Never returned in queries by default
    },

    // Password Confirmation (Not persisted)
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // Custom validator to check if passwords match
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords do not match!'
      }
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },

    // Account Status Flags
    active: {
      type: Boolean,
      default: true,
      select: false // Hide from public output
    },

    // Password Changed At (For JWT invalidation)
    passwordChangedAt: Date,

    // Password Reset Tokens
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    // Schema Options
    toJSON: { virtuals: true }, // Include virtuals when converted to JSON
    toObject: { virtuals: true } // Include virtuals when converted to objects
  }
);

// =============================================
// 🛡️ MIDDLEWARE (Hooks)
// =============================================

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Hash password with cost factor of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field (we don't need to store it)
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  // Set to current time minus 1 second to ensure token was created after
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// =============================================
// 🔐 INSTANCE METHODS
// =============================================

// Compare candidate password with stored hash
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and save to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;