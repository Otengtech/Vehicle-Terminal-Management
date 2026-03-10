/**
 * Vehicle Routes
 * Handles vehicle management
 */

import express from 'express';
import { 
  createVehicle, 
  getVehicles, 
  getVehicleById, 
  updateVehicle, 
  deleteVehicle,
  searchVehicles,
  getVehiclesByStatus,
  getVehiclesByTerminal,
  reportDamage,
  updateLocation,
  checkIn,
  checkOut
} from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { restrictToUserTerminal, checkTerminalCapacity } from '../middleware/terminal.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import { 
  createVehicleSchema, 
  updateVehicleSchema,
  vehicleIdParamSchema,
  reportDamageSchema,
  searchVehiclesSchema
} from '../validations/vehicle.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(allowRoles('Superadmin', 'Admin'));

// Apply terminal restriction for Admins
router.use(restrictToUserTerminal);

// Vehicle routes
router.post('/', validate(createVehicleSchema), checkTerminalCapacity, createVehicle);
router.get('/', validate(searchVehiclesSchema, 'query'), getVehicles);
router.get('/status/:status', getVehiclesByStatus);
router.get('/terminal/:terminalId', validateObjectId('terminalId'), getVehiclesByTerminal);
router.get('/search', validate(searchVehiclesSchema, 'query'), searchVehicles);
router.get('/:vehicleId', validateObjectId('vehicleId'), validate(vehicleIdParamSchema, 'params'), getVehicleById);
router.patch('/:vehicleId', validateObjectId('vehicleId'), validate(updateVehicleSchema), updateVehicle);
router.delete('/:vehicleId', allowRoles('Superadmin'), validateObjectId('vehicleId'), validate(vehicleIdParamSchema, 'params'), deleteVehicle);

// Vehicle operation routes
router.post('/:vehicleId/check-in', validateObjectId('vehicleId'), checkTerminalCapacity, checkIn);
router.post('/:vehicleId/check-out', validateObjectId('vehicleId'), checkOut);
router.post('/:vehicleId/damage', validateObjectId('vehicleId'), validate(reportDamageSchema), reportDamage);
router.patch('/:vehicleId/location', validateObjectId('vehicleId'), updateLocation);

export default router;