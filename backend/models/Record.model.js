/**
 * Record Model - Tracks all actions and transactions in the system
 * Provides audit trail and history
 */

import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  
  actionType: {
    type: String,
    enum: [
      'Check-In', 
      'Check-Out', 
      'Inspection Pass', 
      'Inspection Fail',
      'Transfer',
      'Status Change',
      'Driver Assignment',
      'Driver Unassignment',
      'Damage Reported',
      'Maintenance Started',
      'Maintenance Completed',
      'Location Update'
    ],
    required: [true, 'Action type is required']
  },
  
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who performed action is required']
  },
  
  performedByRole: {
    type: String,
    enum: ['Superadmin', 'Admin'],
    required: true
  },
  
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal'
  },
  
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  previousData: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Snapshot of data before the change'
  },
  
  newData: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Snapshot of data after the change'
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  
  isSystemGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for faster queries
recordSchema.index({ vehicleId: 1, timestamp: -1 });
recordSchema.index({ performedBy: 1, timestamp: -1 });
recordSchema.index({ terminalId: 1, timestamp: -1 });
recordSchema.index({ actionType: 1 });
recordSchema.index({ createdAt: -1 });

// Compound index for date range queries
recordSchema.index({ terminalId: 1, actionType: 1, timestamp: -1 });

// Static method to get recent records for a vehicle
recordSchema.statics.getVehicleHistory = async function(vehicleId, limit = 50) {
  return this.find({ vehicleId })
    .populate('performedBy', 'fullName email role')
    .populate('driverId', 'fullName licenseNumber')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get daily summary for a terminal
recordSchema.statics.getDailySummary = async function(terminalId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const records = await this.aggregate([
    {
      $match: {
        terminalId: new mongoose.Types.ObjectId(terminalId),
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        records: { $push: '$$ROOT' }
      }
    }
  ]);
  
  return records;
};

const Record = mongoose.model('Record', recordSchema);

export default Record;