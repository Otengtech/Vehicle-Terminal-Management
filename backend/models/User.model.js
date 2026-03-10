/**
 * User Model - Represents Superadmin and Admin users
 * Handles authentication and role-based access control
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [60, 'Invalid password hash'] // bcrypt hashes are 60 chars
  },
  
  role: {
    type: String,
    enum: {
      values: ['Superadmin', 'Admin'],
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'Role is required'],
    default: 'Admin'
  },
  
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: function() {
      return this.role === 'Admin'; // Terminal required for Admins, optional for Superadmins
    }
  },
  
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Pending'],
    default: 'Active'
  },
  
  forcePasswordChange: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'Admin'; // Track who created this admin
    }
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  toJSON: {
    transform: (doc, ret) => {
      delete ret.passwordHash; // Never send password hash in responses
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ terminalId: 1 });

/**
 * Compare candidate password with stored hash
 * @param {String} candidatePassword - Plain text password to check
 * @returns {Boolean} True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Check if account is locked due to too many failed attempts
 * @returns {Boolean} True if account is locked
 */
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/**
 * Increment login attempts and lock if necessary
 */
userSchema.methods.incLoginAttempts = function() {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock if attempts exceed 5
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }
  
  return this.updateOne(updates);
};

/**
 * Reset login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

const User = mongoose.model('User', userSchema);

export default User;