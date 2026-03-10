/**
 * Request Validation Middleware
 * Validates incoming request data against Joi schemas
 */

import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const data = req[property];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: { label: '' }
      }
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.debug(`Validation failed: ${JSON.stringify(errors)}`);
      
      return next(new AppError('Validation failed', 400, errors));
    }

    // Replace request data with validated/sanitized data
    req[property] = value;
    next();
  };
};

/**
 * MongoDB ID validation middleware
 * Validates if ID parameter is a valid MongoDB ObjectId
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return next();
    }

    const isValid = /^[0-9a-fA-F]{24}$/.test(id);

    if (!isValid) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }

    next();
  };
};

/**
 * Date range validation for queries
 */
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && isNaN(Date.parse(startDate))) {
    return next(new AppError('Invalid start date format', 400));
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return next(new AppError('Invalid end date format', 400));
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return next(new AppError('Start date cannot be after end date', 400));
  }

  next();
};