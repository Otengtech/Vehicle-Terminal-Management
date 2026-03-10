/**
 * Terminal Validation Schemas
 */

import Joi from 'joi';

// Create terminal validation schema
export const createTerminalSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Terminal name must be at least 3 characters',
      'string.max': 'Terminal name cannot exceed 100 characters',
      'any.required': 'Terminal name is required'
    }),
  
  location: Joi.string()
    .required()
    .trim()
    .max(200)
    .messages({
      'string.max': 'Location cannot exceed 200 characters',
      'any.required': 'Location is required'
    }),
  
  address: Joi.object({
    street: Joi.string().trim().max(100),
    city: Joi.string().trim().max(50),
    state: Joi.string().trim().max(50),
    country: Joi.string().trim().max(50),
    zipCode: Joi.string().trim().max(20)
  }),
  
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }),
  
  capacity: Joi.number()
    .required()
    .integer()
    .min(1)
    .max(10000)
    .messages({
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity cannot exceed 10000',
      'any.required': 'Capacity is required'
    }),
  
  contactNumber: Joi.string()
    .pattern(/^\+\d{1,3}\d{10,}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number with country code (e.g., +12345678900)'
    }),
  
  contactEmail: Joi.string()
    .email()
    .lowercase()
    .trim(),
  
  status: Joi.string()
    .valid('Operational', 'Under Maintenance', 'Closed')
    .default('Operational'),
  
  operatingHours: Joi.object({
    monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    sunday: Joi.object({ open: Joi.string(), close: Joi.string() })
  })
});

// Update terminal validation schema
export const updateTerminalSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim(),
  location: Joi.string().trim().max(200),
  address: Joi.object({
    street: Joi.string().trim().max(100),
    city: Joi.string().trim().max(50),
    state: Joi.string().trim().max(50),
    country: Joi.string().trim().max(50),
    zipCode: Joi.string().trim().max(20)
  }),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }),
  capacity: Joi.number().integer().min(1).max(10000),
  contactNumber: Joi.string().pattern(/^\+\d{1,3}\d{10,}$/),
  contactEmail: Joi.string().email().lowercase().trim(),
  status: Joi.string().valid('Operational', 'Under Maintenance', 'Closed'),
  operatingHours: Joi.object({
    monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    sunday: Joi.object({ open: Joi.string(), close: Joi.string() })
  })
}).min(1);

// Terminal ID param validation
export const terminalIdParamSchema = Joi.object({
  terminalId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid terminal ID format',
      'string.hex': 'Invalid terminal ID format',
      'any.required': 'Terminal ID is required'
    })
});