/**
 * Terminal Model - Represents physical terminal locations
 * Tracks capacity, occupancy, and assigned admin
 */

import mongoose from 'mongoose';

const terminalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Terminal name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Terminal name must be at least 3 characters'],
    maxlength: [100, 'Terminal name cannot exceed 100 characters']
  },
  
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10000, 'Capacity cannot exceed 10000']
  },
  
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.capacity;
      },
      message: 'Occupancy cannot exceed capacity'
    }
  },
  
  contactNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /\+\d{1,3}\d{10,}/.test(v);
      },
      message: 'Please provide a valid phone number with country code'
    }
  },
  
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['Operational', 'Under Maintenance', 'Closed'],
    default: 'Operational'
  },
  
  assignedAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for occupancy percentage
terminalSchema.virtual('occupancyPercentage').get(function() {
  return ((this.currentOccupancy / this.capacity) * 100).toFixed(2);
});

// Virtual for available spaces
terminalSchema.virtual('availableSpaces').get(function() {
  return this.capacity - this.currentOccupancy;
});

// Indexes for faster queries
terminalSchema.index({ status: 1 });
terminalSchema.index({ 'address.city': 1 });
terminalSchema.index({ assignedAdminId: 1 });

// Pre-save middleware to ensure occupancy doesn't exceed capacity
terminalSchema.pre('save', function(next) {
  if (this.currentOccupancy > this.capacity) {
    this.currentOccupancy = this.capacity;
  }
  next();
});

const Terminal = mongoose.model('Terminal', terminalSchema);

export default Terminal;