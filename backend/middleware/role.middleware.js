/**
 * Role-based Authorization Middleware
 * Restricts access based on user roles
 */

import AppError from '../utils/AppError.js';

/**
 * Middleware to allow only Superadmins
 */
export const requireSuperadmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'Superadmin') {
    return next(new AppError('Superadmin access required', 403));
  }

  next();
};

/**
 * Middleware to allow only Admins (Superadmins also have access)
 * Superadmins have all admin privileges by default
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!['Admin', 'Superadmin'].includes(req.user.role)) {
    return next(new AppError('Admin access required', 403));
  }

  next();
};

/**
 * Middleware to allow specific roles
 * @param  {...string} allowedRoles - Array of allowed roles
 */
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access restricted to: ${allowedRoles.join(', ')}`, 403));
    }

    next();
  };
};

/**
 * Middleware to check if user has permission to modify a resource
 * Superadmins can modify anything
 * Admins can only modify resources in their terminal
 */
export const checkResourcePermission = (resourceType) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Superadmins can do anything
    if (req.user.role === 'Superadmin') {
      return next();
    }

    // For Admins, check terminal ownership
    if (req.user.role === 'Admin') {
      const resourceTerminalId = req.body.terminalId || req.params.terminalId || req.query.terminalId;
      
      if (!resourceTerminalId) {
        return next(new AppError('Terminal ID required for permission check', 400));
      }

      if (req.user.terminalId.toString() !== resourceTerminalId.toString()) {
        return next(new AppError('You can only access resources in your assigned terminal', 403));
      }
    }

    next();
  };
};