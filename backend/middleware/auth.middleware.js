/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */

import { verifyToken, extractTokenFromHeader } from '../config/auth.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate user via JWT token
 * Verifies token and fetches fresh user data from database
 */
export const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  // Check if token exists
  if (!token) {
    return next(new AppError('No authentication token provided', 401));
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists in database
    const user = await User.findById(decoded.userId)
      .select('-passwordHash -loginAttempts -lockUntil')
      .populate('terminalId');

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user account is active
    if (user.status !== 'Active') {
      return next(new AppError('Your account has been suspended', 403));
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      terminalId: user.terminalId?._id || null,
      terminal: user.terminalId,
      forcePasswordChange: user.forcePasswordChange
    };

    logger.debug(`User authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    return next(new AppError('Authentication failed', 401));
  }
});

/**
 * Optional authentication - doesn't error if no token
 * Useful for public routes that may have user-specific data
 */
export const optionalAuthenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId)
      .select('-passwordHash -loginAttempts -lockUntil');

    if (user && user.status === 'Active') {
      req.user = {
        id: user._id,
        role: user.role,
        terminalId: user.terminalId
      };
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed:', error.message);
  }

  next();
});