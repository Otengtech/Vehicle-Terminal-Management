/**
 * Vehicle Validation Schemas
 */

import Joi from 'joi';

// Create vehicle validation schema
export const createVehicleSchema = Joi.object({
  vin: Joi.string()
    .uppercase()
    .trim()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .messages({
      'string.length': 'VIN must be exactly 17 characters',
      'string.pattern.base': 'VIN contains invalid characters'
    }),
  
  licensePlate: Joi.string()
    .required()
    .uppercase()
    .trim()
    .min(2)
    .max(15)
    .pattern(/^[A-Z0-9-]+$/)
    .messages({
      'string.min': 'License plate must be at least 2 characters',
      'string.max': 'License plate cannot exceed 15 characters',
      'string.pattern.base': 'License plate can only contain uppercase letters, numbers, and hyphens',
      'any.required': 'License plate is required'
    }),
  
  make: Joi.string()
    .required()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Make cannot exceed 50 characters',
      'any.required': 'Make is required'
    }),
  
  model: Joi.string()
    .required()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Model cannot exceed 50 characters',
      'any.required': 'Model is required'
    }),
  
  year: Joi.number()
    .required()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .messages({
      'number.min': 'Year must be after 1900',
      'number.max': `Year cannot be beyond ${new Date().getFullYear() + 1}`,
      'any.required': 'Year is required'
    }),
  
  color: Joi.string()
    .trim()
    .max(30),
  
  vehicleType: Joi.string()
    .required()
    .valid('Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Heavy Machinery', 'Trailer', 'Other')
    .messages({
      'any.only': 'Invalid vehicle type',
      'any.required': 'Vehicle type is required'
    }),
  
  currentStatus: Joi.string()
    .valid('Checked-In', 'Checked-Out', 'In Transit', 'Under Inspection', 'Maintenance', 'Reserved', 'Available')
    .default('Available'),
  
  assignedDriverId: Joi.string()
    .length(24)
    .hex(),
  
  locationInYard: Joi.object({
    zone: Joi.string().max(10),
    row: Joi.string().max(10),
    spot: Joi.string().max(10)
  }),
  
  fuelLevel: Joi.string()
    .valid('Empty', '1/4', '1/2', '3/4', 'Full')
    .default('Full'),
  
  mileage: Joi.number()
    .integer()
    .min(0),
  
  condition: Joi.string()
    .valid('Excellent', 'Good', 'Fair', 'Poor', 'Damaged')
    .default('Good'),
  
  expectedCheckOutDate: Joi.date()
    .greater('now')
    .messages({
      'date.greater': 'Expected check-out date must be in the future'
    })
});

// Update vehicle validation schema
export const updateVehicleSchema = Joi.object({
  vin: Joi.string()
    .uppercase()
    .trim()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/),
  
  licensePlate: Joi.string()
    .uppercase()
    .trim()
    .min(2)
    .max(15)
    .pattern(/^[A-Z0-9-]+$/),
  
  make: Joi.string().trim().max(50),
  model: Joi.string().trim().max(50),
  
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  
  color: Joi.string().trim().max(30),
  
  vehicleType: Joi.string()
    .valid('Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Heavy Machinery', 'Trailer', 'Other'),
  
  currentStatus: Joi.string()
    .valid('Checked-In', 'Checked-Out', 'In Transit', 'Under Inspection', 'Maintenance', 'Reserved', 'Available'),
  
  assignedDriverId: Joi.string()
    .length(24)
    .hex()
    .allow(null),
  
  locationInYard: Joi.object({
    zone: Joi.string().max(10),
    row: Joi.string().max(10),
    spot: Joi.string().max(10)
  }),
  
  fuelLevel: Joi.string()
    .valid('Empty', '1/4', '1/2', '3/4', 'Full'),
  
  mileage: Joi.number().integer().min(0),
  
  condition: Joi.string()
    .valid('Excellent', 'Good', 'Fair', 'Poor', 'Damaged'),
  
  expectedCheckOutDate: Joi.date().greater('now').allow(null)
}).min(1);

// Vehicle ID param validation
export const vehicleIdParamSchema = Joi.object({
  vehicleId: Joi.string()
    .required()
    .length(24)
    .hex()
    .messages({
      'string.length': 'Invalid vehicle ID format',
      'string.hex': 'Invalid vehicle ID format',
      'any.required': 'Vehicle ID is required'
    })
});

// Report damage validation schema
export const reportDamageSchema = Joi.object({
  description: Joi.string()
    .required()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Damage description is required'
    }),
  
  location: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.max': 'Location cannot exceed 100 characters',
      'any.required': 'Damage location is required'
    }),
  
  severity: Joi.string()
    .required()
    .valid('Minor', 'Moderate', 'Severe')
    .messages({
      'any.only': 'Severity must be Minor, Moderate, or Severe',
      'any.required': 'Severity is required'
    })
});

// Search vehicles query validation
export const searchVehiclesSchema = Joi.object({
  search: Joi.string().trim().max(50),
  status: Joi.string().valid('Checked-In', 'Checked-Out', 'In Transit', 'Under Inspection', 'Maintenance', 'Reserved', 'Available'),
  terminalId: Joi.string().length(24).hex(),
  driverId: Joi.string().length(24).hex(),
  vehicleType: Joi.string().valid('Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Heavy Machinery', 'Trailer', 'Other'),
  make: Joi.string().trim(),
  yearFrom: Joi.number().integer().min(1900),
  yearTo: Joi.number().integer().min(1900),
  condition: Joi.string().valid('Excellent', 'Good', 'Fair', 'Poor', 'Damaged'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('licensePlate', 'make', 'model', 'year', 'createdAt', 'currentStatus'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});