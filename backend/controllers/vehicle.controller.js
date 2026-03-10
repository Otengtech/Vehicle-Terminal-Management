/**
 * Vehicle Controller
 * Handles vehicle management operations
 */

import Vehicle from '../models/Vehicle.model.js';
import Driver from '../models/Driver.model.js';
import Terminal from '../models/Terminal.model.js';
import Record from '../models/Record.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Create new vehicle
 * @route POST /api/vehicles
 * @access Private
 */
export const createVehicle = catchAsync(async (req, res, next) => {
  // Ensure vehicle is assigned to user's terminal
  const terminalId = req.user.role === 'Superadmin' 
    ? req.body.currentTerminalId || req.user.terminalId 
    : req.user.terminalId;

  if (!terminalId) {
    return next(new AppError('Terminal ID is required', 400));
  }

  // Verify terminal exists
  const terminal = await Terminal.findById(terminalId);
  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if license plate already exists
  const existingVehicle = await Vehicle.findOne({ 
    licensePlate: req.body.licensePlate.toUpperCase() 
  });
  
  if (existingVehicle) {
    return next(new AppError('Vehicle with this license plate already exists', 409));
  }

  // Check VIN uniqueness if provided
  if (req.body.vin) {
    const existingVIN = await Vehicle.findOne({ vin: req.body.vin.toUpperCase() });
    if (existingVIN) {
      return next(new AppError('Vehicle with this VIN already exists', 409));
    }
  }

  // Check if assigned driver exists and is in same terminal
  if (req.body.assignedDriverId) {
    const driver = await Driver.findById(req.body.assignedDriverId);
    if (!driver) {
      return next(new AppError('Assigned driver not found', 404));
    }
    if (driver.assignedTerminalId.toString() !== terminalId.toString()) {
      return next(new AppError('Driver must be from the same terminal', 400));
    }
    if (driver.currentVehicleId) {
      return next(new AppError('Driver is already assigned to another vehicle', 400));
    }
  }

  const vehicleData = {
    ...req.body,
    licensePlate: req.body.licensePlate.toUpperCase(),
    vin: req.body.vin ? req.body.vin.toUpperCase() : undefined,
    currentTerminalId: terminalId,
    createdBy: req.user.id,
    checkInTimestamp: req.body.currentStatus === 'Checked-In' ? new Date() : undefined
  };

  const vehicle = await Vehicle.create(vehicleData);

  // Update driver if assigned
  if (req.body.assignedDriverId) {
    await Driver.findByIdAndUpdate(req.body.assignedDriverId, {
      currentVehicleId: vehicle._id,
      status: 'On Route'
    });
  }

  // Update terminal occupancy
  if (vehicle.currentStatus === 'Checked-In') {
    terminal.currentOccupancy += 1;
    await terminal.save();
  }

  // Create audit record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId,
    notes: `Created vehicle: ${vehicle.licensePlate}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Vehicle created: ${vehicle.licensePlate} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: vehicle
  });
});

/**
 * Get all vehicles
 * @route GET /api/vehicles
 * @access Private
 */
export const getVehicles = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search, terminalId, vehicleType } = req.query;

  const query = {};
  
  // Apply terminal filter
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.currentTerminalId = req.user.terminalId;
  } else if (terminalId) {
    query.currentTerminalId = terminalId;
  }

  // Filter by status
  if (status) {
    query.currentStatus = status;
  }

  // Filter by vehicle type
  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  // Search by license plate, make, model
  if (search) {
    query.$or = [
      { licensePlate: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { vin: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vehicles, total] = await Promise.all([
    Vehicle.find(query)
      .populate('currentTerminalId', 'name location')
      .populate('assignedDriverId', 'fullName licenseNumber phoneNumber')
      .populate('createdBy', 'fullName email')
      .populate('damages.reportedBy', 'fullName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Vehicle.countDocuments(query)
  ]);

  // Add days in terminal to each vehicle
  const vehiclesWithMeta = vehicles.map(vehicle => {
    const doc = vehicle.toObject();
    doc.daysInTerminal = vehicle.daysInTerminal;
    return doc;
  });

  res.status(200).json({
    success: true,
    data: vehiclesWithMeta,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get vehicle by ID
 * @route GET /api/vehicles/:vehicleId
 * @access Private
 */
export const getVehicleById = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.vehicleId)
    .populate('currentTerminalId', 'name location')
    .populate('assignedDriverId')
    .populate('createdBy', 'fullName email')
    .populate('damages.reportedBy', 'fullName');

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if Admin has access to this vehicle
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      vehicle.currentTerminalId._id.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this vehicle', 403));
  }

  const vehicleData = vehicle.toObject();
  vehicleData.daysInTerminal = vehicle.daysInTerminal;

  // Get vehicle history
  const history = await Record.find({ vehicleId: vehicle._id })
    .populate('performedBy', 'fullName')
    .populate('driverId', 'fullName')
    .sort({ timestamp: -1 })
    .limit(20);

  vehicleData.recentHistory = history;

  res.status(200).json({
    success: true,
    data: vehicleData
  });
});

/**
 * Update vehicle
 * @route PATCH /api/vehicles/:vehicleId
 * @access Private
 */
export const updateVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.vehicleId);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if Admin has access to this vehicle
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      vehicle.currentTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this vehicle', 403));
  }

  // Check if updating license plate and it's not already taken
  if (req.body.licensePlate && 
      req.body.licensePlate.toUpperCase() !== vehicle.licensePlate) {
    const existingVehicle = await Vehicle.findOne({ 
      licensePlate: req.body.licensePlate.toUpperCase() 
    });
    
    if (existingVehicle) {
      return next(new AppError('Vehicle with this license plate already exists', 409));
    }
  }

  // Check VIN uniqueness if updating
  if (req.body.vin && req.body.vin.toUpperCase() !== vehicle.vin) {
    const existingVIN = await Vehicle.findOne({ vin: req.body.vin.toUpperCase() });
    if (existingVIN) {
      return next(new AppError('Vehicle with this VIN already exists', 409));
    }
  }

  // Handle driver assignment changes
  if (req.body.assignedDriverId !== undefined) {
    if (req.body.assignedDriverId) {
      // Assigning new driver
      const driver = await Driver.findById(req.body.assignedDriverId);
      if (!driver) {
        return next(new AppError('Driver not found', 404));
      }
      if (driver.assignedTerminalId.toString() !== vehicle.currentTerminalId.toString()) {
        return next(new AppError('Driver must be from the same terminal', 400));
      }
      
      // Remove old driver assignment if exists
      if (vehicle.assignedDriverId) {
        await Driver.findByIdAndUpdate(vehicle.assignedDriverId, {
          currentVehicleId: null,
          status: 'Available'
        });
      }
      
      // Assign new driver
      await Driver.findByIdAndUpdate(req.body.assignedDriverId, {
        currentVehicleId: vehicle._id,
        status: 'On Route'
      });
    } else {
      // Unassign driver
      if (vehicle.assignedDriverId) {
        await Driver.findByIdAndUpdate(vehicle.assignedDriverId, {
          currentVehicleId: null,
          status: 'Available'
        });
      }
    }
  }

  // Track status change
  const oldStatus = vehicle.currentStatus;
  
  // Update vehicle
  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.vehicleId,
    {
      ...req.body,
      licensePlate: req.body.licensePlate ? req.body.licensePlate.toUpperCase() : undefined,
      vin: req.body.vin ? req.body.vin.toUpperCase() : undefined
    },
    { new: true, runValidators: true }
  );

  // Handle terminal occupancy if status changed
  if (oldStatus !== updatedVehicle.currentStatus) {
    const terminal = await Terminal.findById(vehicle.currentTerminalId);
    
    if (updatedVehicle.currentStatus === 'Checked-In' && oldStatus !== 'Checked-In') {
      terminal.currentOccupancy += 1;
      await terminal.save();
    } else if (updatedVehicle.currentStatus !== 'Checked-In' && oldStatus === 'Checked-In') {
      terminal.currentOccupancy -= 1;
      await terminal.save();
    }
  }

  // Create audit record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    notes: `Updated vehicle: ${vehicle.licensePlate}`,
    previousData: { status: oldStatus },
    newData: { status: updatedVehicle.currentStatus },
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Vehicle updated: ${vehicle.licensePlate} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: updatedVehicle
  });
});

/**
 * Delete vehicle (Superadmin only)
 * @route DELETE /api/vehicles/:vehicleId
 * @access Private/Superadmin
 */
export const deleteVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.vehicleId);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if vehicle is checked-in
  if (vehicle.currentStatus === 'Checked-In') {
    return next(new AppError('Cannot delete a vehicle that is currently checked in', 400));
  }

  // Unassign driver if assigned
  if (vehicle.assignedDriverId) {
    await Driver.findByIdAndUpdate(vehicle.assignedDriverId, {
      currentVehicleId: null,
      status: 'Available'
    });
  }

  await vehicle.deleteOne();

  // Create audit record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    notes: `Deleted vehicle: ${vehicle.licensePlate}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Vehicle deleted: ${vehicle.licensePlate} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully'
  });
});

/**
 * Search vehicles
 * @route GET /api/vehicles/search
 * @access Private
 */
export const searchVehicles = catchAsync(async (req, res) => {
  const { 
    search, status, terminalId, vehicleType, 
    make, yearFrom, yearTo, condition,
    page = 1, limit = 10 
  } = req.query;

  const query = {};
  
  // Apply terminal filter
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.currentTerminalId = req.user.terminalId;
  } else if (terminalId) {
    query.currentTerminalId = terminalId;
  }

  if (status) query.currentStatus = status;
  if (vehicleType) query.vehicleType = vehicleType;
  if (make) query.make = { $regex: make, $options: 'i' };
  if (condition) query.condition = condition;
  
  if (yearFrom || yearTo) {
    query.year = {};
    if (yearFrom) query.year.$gte = parseInt(yearFrom);
    if (yearTo) query.year.$lte = parseInt(yearTo);
  }

  if (search) {
    query.$or = [
      { licensePlate: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { vin: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vehicles, total] = await Promise.all([
    Vehicle.find(query)
      .populate('currentTerminalId', 'name')
      .populate('assignedDriverId', 'fullName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Vehicle.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: vehicles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get vehicles by status
 * @route GET /api/vehicles/status/:status
 * @access Private
 */
export const getVehiclesByStatus = catchAsync(async (req, res) => {
  const { status } = req.params;
  
  const query = { currentStatus: status };
  
  // Apply terminal filter
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.currentTerminalId = req.user.terminalId;
  }

  const vehicles = await Vehicle.find(query)
    .populate('currentTerminalId', 'name')
    .populate('assignedDriverId', 'fullName')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: vehicles
  });
});

/**
 * Get vehicles by terminal
 * @route GET /api/vehicles/terminal/:terminalId
 * @access Private
 */
export const getVehiclesByTerminal = catchAsync(async (req, res) => {
  const { terminalId } = req.params;

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      req.user.terminalId.toString() !== terminalId) {
    return next(new AppError('You do not have access to this terminal', 403));
  }

  const vehicles = await Vehicle.find({ currentTerminalId: terminalId })
    .populate('assignedDriverId', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: vehicles
  });
});

/**
 * Report damage to vehicle
 * @route POST /api/vehicles/:vehicleId/damage
 * @access Private
 */
export const reportDamage = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.params;
  const { description, location, severity } = req.body;

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

  // Add damage report
  vehicle.damages.push({
    description,
    location,
    severity,
    reportedBy: req.user.id,
    reportedAt: new Date()
  });

  // Update condition if severe
  if (severity === 'Severe') {
    vehicle.condition = 'Damaged';
  }

  await vehicle.save();

  // Create record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Damage Reported',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    notes: `Damage reported: ${description} (${severity})`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Damage reported for vehicle ${vehicle.licensePlate} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

/**
 * Update vehicle location in yard
 * @route PATCH /api/vehicles/:vehicleId/location
 * @access Private
 */
export const updateLocation = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.params;
  const { zone, row, spot } = req.body.locationInYard;

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

  vehicle.locationInYard = { zone, row, spot };
  await vehicle.save();

  // Create record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Location Update',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    notes: `Location updated: ${zone}-${row}-${spot}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

/**
 * Check-in vehicle
 * @route POST /api/vehicles/:vehicleId/check-in
 * @access Private
 */
export const checkIn = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.currentStatus === 'Checked-In') {
    return next(new AppError('Vehicle is already checked in', 400));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      vehicle.currentTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this vehicle', 403));
  }

  const terminal = await Terminal.findById(vehicle.currentTerminalId);
  
  // Check capacity
  if (terminal.currentOccupancy >= terminal.capacity) {
    return next(new AppError('Terminal has reached maximum capacity', 400));
  }

  // Update vehicle
  vehicle.currentStatus = 'Checked-In';
  vehicle.checkInTimestamp = new Date();
  vehicle.checkOutTimestamp = null;
  await vehicle.save();

  // Update terminal occupancy
  terminal.currentOccupancy += 1;
  await terminal.save();

  // Create record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Check-In',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    notes: `Vehicle checked in at ${vehicle.locationInYard?.zone || 'unknown'} location`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Vehicle ${vehicle.licensePlate} checked in by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

/**
 * Check-out vehicle
 * @route POST /api/vehicles/:vehicleId/check-out
 * @access Private
 */
export const checkOut = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.currentStatus !== 'Checked-In') {
    return next(new AppError('Vehicle is not checked in', 400));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      vehicle.currentTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this vehicle', 403));
  }

  const terminal = await Terminal.findById(vehicle.currentTerminalId);

  // Update vehicle
  vehicle.currentStatus = 'Checked-Out';
  vehicle.checkOutTimestamp = new Date();
  
  // Unassign driver if assigned
  if (vehicle.assignedDriverId) {
    await Driver.findByIdAndUpdate(vehicle.assignedDriverId, {
      currentVehicleId: null,
      status: 'Available'
    });
    vehicle.assignedDriverId = null;
  }
  
  await vehicle.save();

  // Update terminal occupancy
  terminal.currentOccupancy -= 1;
  await terminal.save();

  // Create record
  await Record.create({
    vehicleId: vehicle._id,
    actionType: 'Check-Out',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    notes: 'Vehicle checked out',
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Vehicle ${vehicle.licensePlate} checked out by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: vehicle
  });
});