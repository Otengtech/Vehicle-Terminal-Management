/**
 * Vehicle Model - Core entity representing vehicles in the terminal
 * Tracks location, status, and assignment
 */

import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vin: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls, but unique if provided
    uppercase: true,
    trim: true,
    minlength: [17, 'VIN must be 17 characters'],
    maxlength: [17, 'VIN must be 17 characters']
  },
  
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [2, 'License plate must be at least 2 characters'],
    maxlength: [15, 'License plate cannot exceed 15 characters']
  },
  
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the distant future']
  },
  
  color: {
    type: String,
    trim: true
  },
  
  vehicleType: {
    type: String,
    enum: ['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Heavy Machinery', 'Trailer', 'Other'],
    required: [true, 'Vehicle type is required'],
    default: 'Sedan'
  },
  
  currentStatus: {
    type: String,
    enum: ['Checked-In', 'Checked-Out', 'In Transit', 'Under Inspection', 'Maintenance', 'Reserved', 'Available'],
    default: 'Available',
    required: true
  },
  
  currentTerminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: [true, 'Current terminal is required']
  },
  
  assignedDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  
  locationInYard: {
    zone: String,
    row: String,
    spot: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    }
  },
  
  checkInTimestamp: {
    type: Date,
    default: Date.now
  },
  
  checkOutTimestamp: Date,
  
  expectedCheckOutDate: Date,
  
  lastInspectionDate: Date,
  
  nextInspectionDue: Date,
  
  fuelLevel: {
    type: String,
    enum: ['Empty', '1/4', '1/2', '3/4', 'Full'],
    default: 'Full'
  },
  
  mileage: {
    type: Number,
    min: 0
  },
  
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'Good'
  },
  
  damages: [{
    description: String,
    location: String,
    severity: { type: String, enum: ['Minor', 'Moderate', 'Severe'] },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedAt: { type: Date, default: Date.now },
    imageUrls: [String]
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ vin: 1 });
vehicleSchema.index({ currentStatus: 1 });
vehicleSchema.index({ currentTerminalId: 1 });
vehicleSchema.index({ assignedDriverId: 1 });
vehicleSchema.index({ 'locationInYard.coordinates': '2dsphere' });
vehicleSchema.index({ createdAt: -1 });

// Compound index for terminal + status queries
vehicleSchema.index({ currentTerminalId: 1, currentStatus: 1 });

// Virtual for days in terminal
vehicleSchema.virtual('daysInTerminal').get(function() {
  if (!this.checkInTimestamp) return 0;
  const days = Math.ceil((Date.now() - this.checkInTimestamp) / (1000 * 60 * 60 * 24));
  return days;
});

// Pre-save middleware to update timestamps on status change
vehicleSchema.pre('save', function(next) {
  if (this.isModified('currentStatus')) {
    if (this.currentStatus === 'Checked-In' && !this.checkInTimestamp) {
      this.checkInTimestamp = new Date();
    } else if (this.currentStatus === 'Checked-Out') {
      this.checkOutTimestamp = new Date();
    }
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;