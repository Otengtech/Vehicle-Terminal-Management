/**
 * Record Controller
 * Handles audit trail and history operations
 */

import Record from '../models/Record.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Terminal from '../models/Terminal.model.js';
import User from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Create new record
 * @route POST /api/records
 * @access Private
 */
export const createRecord = catchAsync(async (req, res, next) => {
  const recordData = {
    ...req.body,
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: req.body.terminalId || req.user.terminalId,
    metadata: {
      ...req.body.metadata,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  };

  // Verify vehicle exists if provided
  if (recordData.vehicleId) {
    const vehicle = await Vehicle.findById(recordData.vehicleId);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }
  }

  const record = await Record.create(recordData);

  logger.info(`Record created: ${record.actionType} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: record
  });
});

/**
 * Get all records with filtering
 * @route GET /api/records
 * @access Private
 */
export const getRecords = catchAsync(async (req, res) => {
  const { 
    vehicleId, terminalId, performedBy, driverId,
    actionType, startDate, endDate, isSystemGenerated,
    page = 1, limit = 50, sortBy = 'timestamp', sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Apply filters
  if (vehicleId) query.vehicleId = vehicleId;
  if (terminalId) query.terminalId = terminalId;
  if (performedBy) query.performedBy = performedBy;
  if (driverId) query.driverId = driverId;
  if (actionType) query.actionType = actionType;
  if (isSystemGenerated !== undefined) query.isSystemGenerated = isSystemGenerated === 'true';

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  // Restrict to user's terminal if Admin
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.terminalId = req.user.terminalId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [records, total] = await Promise.all([
    Record.find(query)
      .populate('vehicleId', 'licensePlate make model')
      .populate('performedBy', 'fullName email')
      .populate('driverId', 'fullName licenseNumber')
      .populate('terminalId', 'name location')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort),
    Record.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: records,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get record by ID
 * @route GET /api/records/:recordId
 * @access Private
 */
export const getRecordById = catchAsync(async (req, res, next) => {
  const record = await Record.findById(req.params.recordId)
    .populate('vehicleId')
    .populate('performedBy', 'fullName email')
    .populate('driverId')
    .populate('terminalId');

  if (!record) {
    return next(new AppError('Record not found', 404));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      record.terminalId._id.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this record', 403));
  }

  res.status(200).json({
    success: true,
    data: record
  });
});

/**
 * Get vehicle history
 * @route GET /api/records/vehicle/:vehicleId
 * @access Private
 */
export const getVehicleHistory = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.params;
  const { limit = 50 } = req.query;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      vehicle.currentTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this vehicle', 403));
  }

  const records = await Record.find({ vehicleId })
    .populate('performedBy', 'fullName email')
    .populate('driverId', 'fullName')
    .populate('terminalId', 'name')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: records
  });
});

/**
 * Get terminal summary
 * @route GET /api/records/terminal/:terminalId/summary
 * @access Private
 */
export const getTerminalSummary = catchAsync(async (req, res, next) => {
  const { terminalId } = req.params;

  const terminal = await Terminal.findById(terminalId);
  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      terminalId !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this terminal', 403));
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const summary = await Record.aggregate([
    {
      $match: {
        terminalId: terminal._id,
        timestamp: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get daily activity for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyActivity = await Record.aggregate([
    {
      $match: {
        terminalId: terminal._id,
        timestamp: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          actionType: '$actionType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        actions: {
          $push: {
            actionType: '$_id.actionType',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary,
      dailyActivity
    }
  });
});

/**
 * Get daily report
 * @route GET /api/records/terminal/:terminalId/daily
 * @access Private
 */
export const getDailyReport = catchAsync(async (req, res, next) => {
  const { terminalId } = req.params;
  const { date = new Date() } = req.query;

  const terminal = await Terminal.findById(terminalId);
  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      terminalId !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this terminal', 403));
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const records = await Record.find({
    terminalId: terminal._id,
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate('vehicleId', 'licensePlate')
    .populate('performedBy', 'fullName')
    .populate('driverId', 'fullName')
    .sort({ timestamp: 1 });

  // Group by action type
  const summary = records.reduce((acc, record) => {
    const type = record.actionType;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        records: []
      };
    }
    acc[type].count += 1;
    acc[type].records.push(record);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      date: startOfDay.toISOString().split('T')[0],
      terminal: terminal.name,
      totalRecords: records.length,
      summary,
      records
    }
  });
});

/**
 * Get user activity
 * @route GET /api/records/user/:userId/activity
 * @access Private
 */
export const getUserActivity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Only Superadmin can view other users' activity
  if (req.user.role !== 'Superadmin' && req.user.id !== userId) {
    return next(new AppError('You do not have permission to view this user\'s activity', 403));
  }

  const records = await Record.find({ performedBy: userId })
    .populate('vehicleId', 'licensePlate')
    .populate('terminalId', 'name')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: records
  });
});