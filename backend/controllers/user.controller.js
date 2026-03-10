/**
 * User Controller
 * Handles admin user management operations
 */

import User from '../models/User.model.js';
import Terminal from '../models/Terminal.model.js';
import Record from '../models/Record.model.js';
import { hashPassword } from '../services/password.service.js';
import { generateTemporaryPassword } from '../services/token.service.js';
import { sendTemporaryPasswordEmail } from '../services/email.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Create new admin (Superadmin only)
 * @route POST /api/users
 * @access Private/Superadmin
 */
export const createAdmin = catchAsync(async (req, res, next) => {
  const { fullName, email, terminalId, status } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 409));
  }

  // Verify terminal exists
  const terminal = await Terminal.findById(terminalId);
  if (!terminal) {
    return next(new AppError('Terminal not found', 404));
  }

  // Generate temporary password
  const tempPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(tempPassword);

  // Create admin user
  const admin = await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role: 'Admin',
    terminalId,
    status: status || 'Active',
    forcePasswordChange: true,
    createdBy: req.user.id
  });

  // Send welcome email with temporary password
  await sendTemporaryPasswordEmail(admin, tempPassword);

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: null,
    notes: `Created admin: ${admin.email}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Admin created: ${admin.email} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      terminalId: admin.terminalId,
      status: admin.status,
      createdAt: admin.createdAt
    }
  });
});

/**
 * Get all admins (Superadmin only)
 * @route GET /api/users
 * @access Private/Superadmin
 */
export const getAdmins = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const query = { role: 'Admin' };
  
  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [admins, total] = await Promise.all([
    User.find(query)
      .populate('terminalId', 'name location')
      .populate('createdBy', 'fullName email')
      .select('-passwordHash -loginAttempts -lockUntil')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: admins,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get admin by ID (Superadmin only)
 * @route GET /api/users/:userId
 * @access Private/Superadmin
 */
export const getAdminById = catchAsync(async (req, res, next) => {
  const admin = await User.findById(req.params.userId)
    .populate('terminalId')
    .populate('createdBy', 'fullName email')
    .select('-passwordHash -loginAttempts -lockUntil');

  if (!admin || admin.role !== 'Admin') {
    return next(new AppError('Admin not found', 404));
  }

  res.status(200).json({
    success: true,
    data: admin
  });
});

/**
 * Update admin (Superadmin only)
 * @route PATCH /api/users/:userId
 * @access Private/Superadmin
 */
export const updateAdmin = catchAsync(async (req, res, next) => {
  const admin = await User.findById(req.params.userId);

  if (!admin || admin.role !== 'Admin') {
    return next(new AppError('Admin not found', 404));
  }

  // Check if updating terminal
  if (req.body.terminalId) {
    const terminal = await Terminal.findById(req.body.terminalId);
    if (!terminal) {
      return next(new AppError('Terminal not found', 404));
    }
  }

  // Check if updating email and it's not already taken
  if (req.body.email && req.body.email.toLowerCase() !== admin.email) {
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already in use', 409));
    }
  }

  // Update admin
  const updatedAdmin = await User.findByIdAndUpdate(
    req.params.userId,
    {
      ...req.body,
      email: req.body.email ? req.body.email.toLowerCase() : undefined
    },
    { new: true, runValidators: true }
  ).select('-passwordHash -loginAttempts -lockUntil');

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: null,
    notes: `Updated admin: ${updatedAdmin.email}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Admin updated: ${updatedAdmin.email} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: updatedAdmin
  });
});

/**
 * Delete admin (Superadmin only)
 * @route DELETE /api/users/:userId
 * @access Private/Superadmin
 */
export const deleteAdmin = catchAsync(async (req, res, next) => {
  const admin = await User.findById(req.params.userId);

  if (!admin || admin.role !== 'Admin') {
    return next(new AppError('Admin not found', 404));
  }

  // Prevent deleting last superadmin? Not needed since this is admin
  await admin.deleteOne();

  // Create audit record
  await Record.create({
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    terminalId: null,
    notes: `Deleted admin: ${admin.email}`,
    metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent') },
    isSystemGenerated: true
  });

  logger.info(`Admin deleted: ${admin.email} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Admin deleted successfully'
  });
});

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('terminalId')
    .select('-passwordHash -loginAttempts -lockUntil');

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Update current user profile
 * @route PATCH /api/users/profile
 * @access Private
 */
export const updateProfile = catchAsync(async (req, res, next) => {
  // Prevent role change via profile update
  if (req.body.role) {
    delete req.body.role;
  }

  // Check if updating email and it's not already taken
  if (req.body.email && req.body.email.toLowerCase() !== req.user.email) {
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already in use', 409));
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...req.body,
      email: req.body.email ? req.body.email.toLowerCase() : undefined
    },
    { new: true, runValidators: true }
  ).select('-passwordHash -loginAttempts -lockUntil');

  logger.info(`Profile updated: ${updatedUser.email}`);

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});