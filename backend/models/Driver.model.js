/**
 * Driver Model - Represents drivers who operate vehicles
 * Drivers are not system users, just data entities
 */

import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [5, 'License number must be at least 5 characters'],
    maxlength: [20, 'License number cannot exceed 20 characters']
  },
  
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'License has already expired'
    }
  },
  
  licenseClass: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'CDL'],
    default: 'D'
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /\+\d{1,3}\d{9,}/.test(v);
      },
      message: 'Please provide a valid phone number with country code'
    }
  },
  
  alternatePhoneNumber: String,
  
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  
  emergencyContact: {
    name: { type: String, required: true },
    relationship: String,
    phoneNumber: { type: String, required: true }
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  dateOfBirth: Date,
  
  assignedTerminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: [true, 'Assigned terminal is required']
  },
  
  currentVehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  
  status: {
    type: String,
    enum: ['Available', 'On Route', 'Off Duty', 'On Leave', 'Suspended', 'Terminated'],
    default: 'Available'
  },
  
  hireDate: {
    type: Date,
    default: Date.now
  },
  
  lastActiveDate: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  documents: [{
    type: { type: String, enum: ['License', 'Medical', 'Training', 'Other'] },
    documentNumber: String,
    expiryDate: Date,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  notes: String,
  
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ assignedTerminalId: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ phoneNumber: 1 });

// Virtual for license status
driverSchema.virtual('licenseStatus').get(function() {
  const daysUntilExpiry = Math.ceil((this.licenseExpiryDate - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return 'Expiring Soon';
  return 'Valid';
});

// Pre-save middleware to update lastActive when status changes to 'On Route'
driverSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'On Route') {
    this.lastActiveDate = new Date();
  }
  next();
});

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;