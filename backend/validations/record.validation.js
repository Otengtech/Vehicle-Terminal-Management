/**
 * Record Validation Schemas
 */

import Joi from 'joi';

// Create record validation schema
export const createRecordSchema = Joi.object({
  vehicleId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid vehicle ID format',
      'string.hex': 'Invalid vehicle ID format',
      'any.required': 'Vehicle ID is required'
    }),
  
  actionType: Joi.string()
    .required()
    .valid(
      'Check-In', 'Check-Out', 'Inspection Pass', 'Inspection Fail',
      'Transfer', 'Status Change', 'Driver Assignment', 'Driver Unassignment',
      'Damage Reported', 'Maintenance Started', 'Maintenance Completed', 'Location Update'
    )
    .messages({
      'any.only': 'Invalid action type',
      'any.required': 'Action type is required'
    }),
  
  driverId: Joi.string()
    .length(24)
    .hex(),
  
  notes: Joi.string()
    .max(1000)
    .trim(),
  
  metadata: Joi.object({
    ipAddress: Joi.string().ip(),
    userAgent: Joi.string().max(500),
    location: Joi.string().max(100)
  })
});

// Get records query validation
export const getRecordsSchema = Joi.object({
  vehicleId: Joi.string().length(24).hex(),
  terminalId: Joi.string().length(24).hex(),
  performedBy: Joi.string().length(24).hex(),
  driverId: Joi.string().length(24).hex(),
  
  actionType: Joi.string().valid(
    'Check-In', 'Check-Out', 'Inspection Pass', 'Inspection Fail',
    'Transfer', 'Status Change', 'Driver Assignment', 'Driver Unassignment',
    'Damage Reported', 'Maintenance Started', 'Maintenance Completed', 'Location Update'
  ),
  
  startDate: Joi.date(),
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .messages({
      'date.greater': 'End date must be after start date'
    }),
  
  isSystemGenerated: Joi.boolean(),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(500).default(50),
  sortBy: Joi.string().valid('timestamp', 'createdAt', 'actionType').default('timestamp'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Record ID param validation
export const recordIdParamSchema = Joi.object({
  recordId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid record ID format',
      'string.hex': 'Invalid record ID format',
      'any.required': 'Record ID is required'
    })
});

// Get daily summary validation
export const dailySummarySchema = Joi.object({
  terminalId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid terminal ID format',
      'string.hex': 'Invalid terminal ID format',
      'any.required': 'Terminal ID is required'
    }),
  
  date: Joi.date()
    .default(new Date())
    .messages({
      'date.base': 'Invalid date format'
    })
});