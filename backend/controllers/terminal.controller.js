/**
 * Terminal Controller
 * Handles terminal management operations
 */

import Terminal from '../models/Terminal.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Driver from '../models/Driver.model.js';
import Record from '../models/Record.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Create new terminal
 * @route POST /api/terminals
 * @access Private (Superadmin/Admin)
 */
export const createTerminal = catchAsync(async (req, res, next) => {
  const terminalData = {
    ...req.body,
    createdBy: req.user.id
  };

  // Check if terminal with same name exists
  const existingTerminal = await Terminal.findOne({ name: req.body.name });
  if (existingTerminal) {
    return next(new AppError('Terminal with this name already exists', 409));
  }

  const terminal = await Terminal.create(terminalData);

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: terminal._id,
    notes: `Created terminal: ${terminal.name}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Terminal created: ${terminal.name} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: terminal
  });
});

/**
 * Get all terminals
 * @route GET /api/terminals
 * @access Private
 */
export const getTerminals = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const query = {};
  
  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search by name or location
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  // If user is Admin, only show their terminal
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query._id = req.user.terminalId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [terminals, total] = await Promise.all([
    Terminal.find(query)
      .populate('createdBy', 'fullName email')
      .populate('assignedAdminId', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Terminal.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: terminals,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get terminal by ID
 * @route GET /api/terminals/:terminalId
 * @access Private
 */
export const getTerminalById = catchAsync(async (req, res, next) => {
  const terminal = await Terminal.findById(req.params.terminalId)
    .populate('createdBy', 'fullName email')
    .populate('assignedAdminId', 'fullName email');

  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if Admin has access to this terminal
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      req.user.terminalId.toString() !== terminal._id.toString()) {
    return next(new AppError('You do not have access to this terminal', 403));
  }

  // Get terminal statistics
  const [vehicleCount, driverCount, activeVehicles] = await Promise.all([
    Vehicle.countDocuments({ currentTerminalId: terminal._id }),
    Driver.countDocuments({ assignedTerminalId: terminal._id }),
    Vehicle.countDocuments({ 
      currentTerminalId: terminal._id, 
      currentStatus: 'Checked-In' 
    })
  ]);

  const terminalData = terminal.toObject();
  terminalData.statistics = {
    totalVehicles: vehicleCount,
    totalDrivers: driverCount,
    activeVehicles,
    occupancyRate: ((activeVehicles / terminal.capacity) * 100).toFixed(2),
    availableSpaces: terminal.capacity - activeVehicles
  };

  res.status(200).json({
    success: true,
    data: terminalData
  });
});

/**
 * Update terminal
 * @route PATCH /api/terminals/:terminalId
 * @access Private
 */
export const updateTerminal = catchAsync(async (req, res, next) => {
  const terminal = await Terminal.findById(req.params.terminalId);

  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if Admin has access to this terminal
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      req.user.terminalId.toString() !== terminal._id.toString()) {
    return next(new AppError('You do not have access to this terminal', 403));
  }

  // Check if updating name and it's not already taken
  if (req.body.name && req.body.name !== terminal.name) {
    const existingTerminal = await Terminal.findOne({ name: req.body.name });
    if (existingTerminal) {
      return next(new AppError('Terminal with this name already exists', 409));
    }
  }

  // Update terminal
  const updatedTerminal = await Terminal.findByIdAndUpdate(
    req.params.terminalId,
    req.body,
    { new: true, runValidators: true }
  );

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: terminal._id,
    notes: `Updated terminal: ${terminal.name}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Terminal updated: ${terminal.name} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: updatedTerminal
  });
});

/**
 * Delete terminal (Superadmin only)
 * @route DELETE /api/terminals/:terminalId
 * @access Private/Superadmin
 */
export const deleteTerminal = catchAsync(async (req, res, next) => {
  const terminal = await Terminal.findById(req.params.terminalId);

  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if terminal has vehicles
  const vehicleCount = await Vehicle.countDocuments({ currentTerminalId: terminal._id });
  if (vehicleCount > 0) {
    return next(new AppError('Cannot delete terminal with active vehicles. Move vehicles first.', 400));
  }

  // Check if terminal has drivers
  const driverCount = await Driver.countDocuments({ assignedTerminalId: terminal._id });
  if (driverCount > 0) {
    return next(new AppError('Cannot delete terminal with assigned drivers. Reassign drivers first.', 400));
  }

  await terminal.deleteOne();

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: null,
    notes: `Deleted terminal: ${terminal.name}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Terminal deleted: ${terminal.name} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Terminal deleted successfully'
  });
});

/**
 * Get terminal statistics
 * @route GET /api/terminals/stats
 * @access Private
 */
export const getTerminalStats = catchAsync(async (req, res) => {
  const matchStage = req.user.role === 'Admin' && req.user.terminalId
    ? { $match: { _id: req.user.terminalId } }
    : { $match: {} };

  const stats = await Terminal.aggregate([
    matchStage,
    {
      $lookup: {
        from: 'vehicles',
        localField: '_id',
        foreignField: 'currentTerminalId',
        as: 'vehicles'
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: '_id',
        foreignField: 'assignedTerminalId',
        as: 'drivers'
      }
    },
    {
      $project: {
        name: 1,
        location: 1,
        capacity: 1,
        currentOccupancy: { $size: '$vehicles' },
        vehicleCount: { $size: '$vehicles' },
        driverCount: { $size: '$drivers' },
        activeVehicles: {
          $size: {
            $filter: {
              input: '$vehicles',
              as: 'vehicle',
              cond: { $eq: ['$$vehicle.currentStatus', 'Checked-In'] }
            }
          }
        },
        status: 1
      }
    },
    {
      $addFields: {
        occupancyRate: {
          $multiply: [
            { $divide: ['$currentOccupancy', '$capacity'] },
            100
          ]
        },
        availableSpaces: { $subtract: ['$capacity', '$currentOccupancy'] }
      }
    }
  ]);

  // Get overall totals
  const totals = await Terminal.aggregate([
    {
      $group: {
        _id: null,
        totalTerminals: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        operationalTerminals: {
          $sum: { $cond: [{ $eq: ['$status', 'Operational'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      terminals: stats,
      totals: totals[0] || { totalTerminals: 0, totalCapacity: 0, operationalTerminals: 0 }
    }
  });
});