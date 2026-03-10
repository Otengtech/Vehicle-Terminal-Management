/**
 * Driver Controller
 * Handles driver management operations
 */

import Driver from '../models/Driver.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Terminal from '../models/Terminal.model.js';
import Record from '../models/Record.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Create new driver
 * @route POST /api/drivers
 * @access Private
 */
export const createDriver = catchAsync(async (req, res, next) => {
  // Ensure driver is assigned to user's terminal
  const terminalId = req.user.role === 'Superadmin' 
    ? req.body.terminalId || req.user.terminalId 
    : req.user.terminalId;

  if (!terminalId) {
    return next(new AppError('Terminal ID is required', 400));
  }

  // Verify terminal exists
  const terminal = await Terminal.findById(terminalId);
  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Check if license number already exists
  const existingDriver = await Driver.findOne({ 
    licenseNumber: req.body.licenseNumber.toUpperCase() 
  });
  
  if (existingDriver) {
    return next(new AppError('Driver with this license number already exists', 409));
  }

  const driverData = {
    ...req.body,
    licenseNumber: req.body.licenseNumber.toUpperCase(),
    assignedTerminalId: terminalId,
    createdBy: req.user.id
  };

  const driver = await Driver.create(driverData);

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId,
    notes: `Created driver: ${driver.fullName} (${driver.licenseNumber})`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Driver created: ${driver.fullName} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: driver
  });
});

/**
 * Get all drivers
 * @route GET /api/drivers
 * @access Private
 */
export const getDrivers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search, terminalId } = req.query;

  const query = {};
  
  // Apply terminal filter
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.assignedTerminalId = req.user.terminalId;
  } else if (terminalId) {
    query.assignedTerminalId = terminalId;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search by name, license, or phone
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [drivers, total] = await Promise.all([
    Driver.find(query)
      .populate('assignedTerminalId', 'name location')
      .populate('currentVehicleId', 'licensePlate make model')
      .populate('createdBy', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Driver.countDocuments(query)
  ]);

  // Add license status to each driver
  const driversWithStatus = drivers.map(driver => {
    const doc = driver.toObject();
    doc.licenseStatus = driver.licenseStatus;
    return doc;
  });

  res.status(200).json({
    success: true,
    data: driversWithStatus,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get driver by ID
 * @route GET /api/drivers/:driverId
 * @access Private
 */
export const getDriverById = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.driverId)
    .populate('assignedTerminalId', 'name location')
    .populate('currentVehicleId')
    .populate('createdBy', 'fullName email');

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  // Check if Admin has access to this driver
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      driver.assignedTerminalId._id.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this driver', 403));
  }

  const driverData = driver.toObject();
  driverData.licenseStatus = driver.licenseStatus;

  res.status(200).json({
    success: true,
    data: driverData
  });
});

/**
 * Update driver
 * @route PATCH /api/drivers/:driverId
 * @access Private
 */
export const updateDriver = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.driverId);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  // Check if Admin has access to this driver
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      driver.assignedTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this driver', 403));
  }

  // Check if updating license number and it's not already taken
  if (req.body.licenseNumber && 
      req.body.licenseNumber.toUpperCase() !== driver.licenseNumber) {
    const existingDriver = await Driver.findOne({ 
      licenseNumber: req.body.licenseNumber.toUpperCase() 
    });
    
    if (existingDriver) {
      return next(new AppError('Driver with this license number already exists', 409));
    }
  }

  // Update driver
  const updatedDriver = await Driver.findByIdAndUpdate(
    req.params.driverId,
    {
      ...req.body,
      licenseNumber: req.body.licenseNumber ? req.body.licenseNumber.toUpperCase() : undefined
    },
    { new: true, runValidators: true }
  );

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: driver.assignedTerminalId,
    notes: `Updated driver: ${driver.fullName}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Driver updated: ${driver.fullName} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: updatedDriver
  });
});

/**
 * Delete driver
 * @route DELETE /api/drivers/:driverId
 * @access Private
 */
export const deleteDriver = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.driverId);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  // Check if Admin has access to this driver
  if (req.user.role === 'Admin' && 
      req.user.terminalId && 
      driver.assignedTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this driver', 403));
  }

  // Check if driver is currently assigned to a vehicle
  if (driver.currentVehicleId) {
    return next(new AppError('Cannot delete driver who is currently assigned to a vehicle', 400));
  }

  await driver.deleteOne();

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: driver.assignedTerminalId,
    notes: `Deleted driver: ${driver.fullName}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Driver deleted: ${driver.fullName} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Driver deleted successfully'
  });
});

/**
 * Search drivers
 * @route GET /api/drivers/search
 * @access Private
 */
export const searchDrivers = catchAsync(async (req, res) => {
  const { search, status, terminalId, licenseClass, page = 1, limit = 10 } = req.query;

  const query = {};
  
  // Apply terminal filter
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.assignedTerminalId = req.user.terminalId;
  } else if (terminalId) {
    query.assignedTerminalId = terminalId;
  }

  if (status) query.status = status;
  if (licenseClass) query.licenseClass = licenseClass;

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [drivers, total] = await Promise.all([
    Driver.find(query)
      .populate('assignedTerminalId', 'name')
      .populate('currentVehicleId', 'licensePlate')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ fullName: 1 }),
    Driver.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: drivers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get available drivers
 * @route GET /api/drivers/available
 * @access Private
 */
export const getAvailableDrivers = catchAsync(async (req, res) => {
  const query = {
    status: 'Available',
    currentVehicleId: null
  };

  // Apply terminal filter
  if (req.user.role === 'Admin' && req.user.terminalId) {
    query.assignedTerminalId = req.user.terminalId;
  } else if (req.query.terminalId) {
    query.assignedTerminalId = req.query.terminalId;
  }

  const drivers = await Driver.find(query)
    .populate('assignedTerminalId', 'name')
    .select('fullName licenseNumber phoneNumber licenseClass')
    .sort({ fullName: 1 });

  res.status(200).json({
    success: true,
    data: drivers
  });
});

/**
 * Assign vehicle to driver
 * @route POST /api/drivers/:driverId/assign/:vehicleId
 * @access Private
 */
export const assignVehicle = catchAsync(async (req, res, next) => {
  const { driverId, vehicleId } = req.params;

  const [driver, vehicle] = await Promise.all([
    Driver.findById(driverId),
    Vehicle.findById(vehicleId)
  ]);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin') {
    if (driver.assignedTerminalId.toString() !== req.user.terminalId.toString() ||
        vehicle.currentTerminalId.toString() !== req.user.terminalId.toString()) {
      return next(new AppError('You do not have access to these resources', 403));
    }
  }

  // Check if driver is available
  if (driver.status !== 'Available') {
    return next(new AppError('Driver is not available for assignment', 400));
  }

  // Check if vehicle is available
  if (vehicle.assignedDriverId) {
    return next(new AppError('Vehicle is already assigned to a driver', 400));
  }

  // Update driver
  driver.currentVehicleId = vehicleId;
  driver.status = 'On Route';
  await driver.save();

  // Update vehicle
  vehicle.assignedDriverId = driverId;
  await vehicle.save();

  // Create record
  await Record.create({
    vehicleId,
    actionType: 'Driver Assignment',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: vehicle.currentTerminalId,
    driverId,
    notes: `Driver ${driver.fullName} assigned to vehicle ${vehicle.licensePlate}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Driver ${driver.fullName} assigned to vehicle ${vehicle.licensePlate}`);

  res.status(200).json({
    success: true,
    message: 'Driver assigned successfully',
    data: { driver, vehicle }
  });
});

/**
 * Unassign vehicle from driver
 * @route POST /api/drivers/:driverId/unassign
 * @access Private
 */
export const unassignVehicle = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.driverId);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  if (!driver.currentVehicleId) {
    return next(new AppError('Driver has no vehicle assigned', 400));
  }

  // Check if Admin has access
  if (req.user.role === 'Admin' && 
      driver.assignedTerminalId.toString() !== req.user.terminalId.toString()) {
    return next(new AppError('You do not have access to this driver', 403));
  }

  const vehicle = await Vehicle.findById(driver.currentVehicleId);

  // Update driver
  driver.currentVehicleId = null;
  driver.status = 'Available';
  await driver.save();

  // Update vehicle
  if (vehicle) {
    vehicle.assignedDriverId = null;
    await vehicle.save();
  }

  // Create record
  await Record.create({
    vehicleId: driver.currentVehicleId,
    actionType: 'Driver Unassignment',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: driver.assignedTerminalId,
    driverId: driver._id,
    notes: `Driver ${driver.fullName} unassigned from vehicle`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Driver ${driver.fullName} unassigned from vehicle`);

  res.status(200).json({
    success: true,
    message: 'Driver unassigned successfully',
    data: driver
  });
});