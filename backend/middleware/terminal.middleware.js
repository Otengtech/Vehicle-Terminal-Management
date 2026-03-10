/**
 * Terminal-specific Middleware
 * Ensures Admins only access their assigned terminal
 */

import AppError from '../utils/AppError.js';
import Terminal from '../models/Terminal.model.js';

/**
 * Middleware to restrict queries to user's terminal
 * Automatically adds terminal filter to query
 */
export const restrictToUserTerminal = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Superadmins can access all terminals
  if (req.user.role === 'Superadmin') {
    return next();
  }

  // For Admins, add their terminal ID to query
  if (!req.user.terminalId) {
    return next(new AppError('Admin has no assigned terminal', 403));
  }

  // Add terminal filter to query
  req.terminalFilter = { terminalId: req.user.terminalId };
  
  // Also add to body for creation operations
  if (req.method === 'POST' && !req.body.terminalId) {
    req.body.terminalId = req.user.terminalId;
  }

  next();
};

/**
 * Middleware to validate terminal exists
 * Checks if terminal ID in request is valid
 */
export const validateTerminal = async (req, res, next) => {
  const terminalId = req.params.terminalId || req.body.terminalId || req.query.terminalId;

  if (!terminalId) {
    return next();
  }

  try {
    const terminal = await Terminal.findById(terminalId);
    
    if (!terminal) {
      return next(new AppError('Terminal not found', 404));
    }

    req.terminal = terminal;
    next();
  } catch (error) {
    return next(new AppError('Invalid terminal ID format', 400));
  }
};

/**
 * Middleware to check terminal capacity
 * Used before assigning vehicles
 */
export const checkTerminalCapacity = async (req, res, next) => {
  const terminalId = req.body.terminalId || req.params.terminalId;

  if (!terminalId) {
    return next();
  }

  try {
    const terminal = await Terminal.findById(terminalId);
    
    if (!terminal) {
      return next(new AppError('Terminal not found', 404));
    }

    if (terminal.currentOccupancy >= terminal.capacity) {
      return next(new AppError('Terminal has reached maximum capacity', 400));
    }

    next();
  } catch (error) {
    next(error);
  }
};