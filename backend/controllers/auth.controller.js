/**
 * Authentication Controller
 */

import User from '../models/User.model.js';
import Record from '../models/Record.model.js';
import { generateAuthToken } from '../services/token.service.js';
import { comparePassword, hashPassword } from '../services/password.service.js'; // ✅ Added hashPassword
import { sendPasswordResetConfirmation } from '../services/email.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+passwordHash +loginAttempts +lockUntil');

  if (!user) {
    logger.warn(`Login failed: User not found - ${email}`);
    return next(new AppError('Invalid credentials', 401));
  }

  if (user.isLocked()) {
    const lockTimeLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    logger.warn(`Login failed: Account locked - ${email}`);
    return next(new AppError(`Account locked. Try again in ${lockTimeLeft} minutes`, 423));
  }

  if (user.status !== 'Active') {
    logger.warn(`Login failed: Account ${user.status} - ${email}`);
    return next(new AppError(`Your account is ${user.status.toLowerCase()}`, 403));
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    logger.warn(`Login failed: Invalid password - ${email}`);
    return next(new AppError('Invalid credentials', 401));
  }

  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save();

  const token = generateAuthToken(user);

  // ✅ Build record data conditionally
  const recordData = {
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: user._id,
    performedByRole: user.role,
    notes: 'User logged in',
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    isSystemGenerated: true
  };

  // Only add terminalId if user has one (Admins only)
  if (user.terminalId) {
    recordData.terminalId = user.terminalId;
  }

  await Record.create(recordData);

  logger.info(`User logged in: ${user.email}`);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        terminalId: user.terminalId,
        forcePasswordChange: user.forcePasswordChange
      }
    }
  });
});

/**
 * Change password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    logger.warn(`Password change failed: Invalid current password - ${user.email}`);
    return next(new AppError('Current password is incorrect', 401));
  }

  // Hash new password
  user.passwordHash = await hashPassword(newPassword);
  user.forcePasswordChange = false;
  await user.save();

  await sendPasswordResetConfirmation(user.email, user.fullName);

  // Record the action
  const recordData = {
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: user._id,
    performedByRole: user.role,
    notes: 'Password changed',
    isSystemGenerated: true
  };
  if (user.terminalId) recordData.terminalId = user.terminalId;
  await Record.create(recordData);

  logger.info(`Password changed: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = catchAsync(async (req, res) => {
  // Log the logout action
  const recordData = {
    vehicleId: null,
    actionType: 'Status Change',
    performedBy: req.user.id,
    performedByRole: req.user.role,
    notes: 'User logged out',
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    isSystemGenerated: true
  };
  if (req.user.terminalId) recordData.terminalId = req.user.terminalId;
  await Record.create(recordData);

  logger.info(`User logged out: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});