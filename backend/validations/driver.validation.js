/**
 * Driver Validation Schemas
 */

import Joi from 'joi';

// Create driver validation schema
export const createDriverSchema = Joi.object({
  fullName: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s-']+$/)
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Full name is required'
    }),
  
  licenseNumber: Joi.string()
    .required()
    .uppercase()
    .trim()
    .min(5)
    .max(20)
    .pattern(/^[A-Z0-9-]+$/)
    .messages({
      'string.min': 'License number must be at least 5 characters',
      'string.max': 'License number cannot exceed 20 characters',
      'string.pattern.base': 'License number can only contain uppercase letters, numbers, and hyphens',
      'any.required': 'License number is required'
    }),
  
  licenseExpiryDate: Joi.date()
    .required()
    .greater('now')
    .messages({
      'date.greater': 'License expiry date must be in the future',
      'any.required': 'License expiry date is required'
    }),
  
  licenseClass: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E', 'CDL')
    .default('D'),
  
  phoneNumber: Joi.string()
    .required()
    .pattern(/^\+\d{1,3}\d{9,}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number with country code (e.g., +12345678900)',
      'any.required': 'Phone number is required'
    }),
  
  alternatePhoneNumber: Joi.string()
    .pattern(/^\+\d{1,3}\d{9,}$/),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim(),
  
  emergencyContact: Joi.object({
    name: Joi.string().required().max(100),
    relationship: Joi.string().max(50),
    phoneNumber: Joi.string().required().pattern(/^\+\d{1,3}\d{9,}$/)
  }).required(),
  
  address: Joi.object({
    street: Joi.string().max(100),
    city: Joi.string().max(50),
    state: Joi.string().max(50),
    country: Joi.string().max(50),
    zipCode: Joi.string().max(20)
  }),
  
  dateOfBirth: Joi.date()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))) // Must be at least 18
    .messages({
      'date.max': 'Driver must be at least 18 years old'
    }),
  
  status: Joi.string()
    .valid('Available', 'On Route', 'Off Duty', 'On Leave', 'Suspended', 'Terminated')
    .default('Available'),
  
  notes: Joi.string().max(500)
});

// Update driver validation schema
export const updateDriverSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s-']+$/),
  
  licenseNumber: Joi.string()
    .uppercase()
    .trim()
    .min(5)
    .max(20)
    .pattern(/^[A-Z0-9-]+$/),
  
  licenseExpiryDate: Joi.date().greater('now'),
  
  licenseClass: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E', 'CDL'),
  
  phoneNumber: Joi.string()
    .pattern(/^\+\d{1,3}\d{9,}$/),
  
  alternatePhoneNumber: Joi.string()
    .pattern(/^\+\d{1,3}\d{9,}$/),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim(),
  
  emergencyContact: Joi.object({
    name: Joi.string().max(100),
    relationship: Joi.string().max(50),
    phoneNumber: Joi.string().pattern(/^\+\d{1,3}\d{9,}$/)
  }),
  
  address: Joi.object({
    street: Joi.string().max(100),
    city: Joi.string().max(50),
    state: Joi.string().max(50),
    country: Joi.string().max(50),
    zipCode: Joi.string().max(20)
  }),
  
  dateOfBirth: Joi.date()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))),
  
  status: Joi.string()
    .valid('Available', 'On Route', 'Off Duty', 'On Leave', 'Suspended', 'Terminated'),
  
  notes: Joi.string().max(500)
}).min(1);

// Driver ID param validation
export const driverIdParamSchema = Joi.object({
  driverId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid driver ID format',
      'string.hex': 'Invalid driver ID format',
      'any.required': 'Driver ID is required'
    })
});

// Search drivers query validation
export const searchDriversSchema = Joi.object({
  search: Joi.string().trim().max(50),
  status: Joi.string().valid('Available', 'On Route', 'Off Duty', 'On Leave', 'Suspended', 'Terminated'),
  terminalId: Joi.string().length(24).hex(),
  licenseClass: Joi.string().valid('A', 'B', 'C', 'D', 'E', 'CDL'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('fullName', 'licenseNumber', 'createdAt', 'status'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});