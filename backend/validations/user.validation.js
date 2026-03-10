/**
 * User Validation Schemas
 */

import Joi from 'joi';

// Create admin validation schema (Superadmin only)
export const createAdminSchema = Joi.object({
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
  
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  role: Joi.string()
    .valid('Admin')
    .default('Admin')
    .messages({
      'any.only': 'Role must be Admin'
    }),
  
  terminalId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid terminal ID format',
      'string.hex': 'Invalid terminal ID format',
      'any.required': 'Terminal ID is required for admin users'
    }),
  
  status: Joi.string()
    .valid('Active', 'Suspended', 'Pending')
    .default('Active')
});

// Update admin validation schema
export const updateAdminSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s-']+$/),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim(),
  
  terminalId: Joi.string()
    .length(24)
    .hex(),
  
  status: Joi.string()
    .valid('Active', 'Suspended', 'Pending'),
  
  forcePasswordChange: Joi.boolean()
}).min(1); // At least one field must be provided

// Update profile validation schema (for admins updating themselves)
export const updateProfileSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s-']+$/),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
}).min(1);

// User ID param validation
export const userIdParamSchema = Joi.object({
  userId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid user ID format',
      'string.hex': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});