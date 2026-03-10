/**
 * Driver Routes
 * Handles driver management
 */

import express from 'express';
import { 
  createDriver, 
  getDrivers, 
  getDriverById, 
  updateDriver, 
  deleteDriver,
  searchDrivers,
  getAvailableDrivers,
  assignVehicle,
  unassignVehicle
} from '../controllers/driver.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { restrictToUserTerminal } from '../middleware/terminal.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import { 
  createDriverSchema, 
  updateDriverSchema,
  driverIdParamSchema,
  searchDriversSchema
} from '../validations/driver.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(allowRoles('Superadmin', 'Admin'));

// Apply terminal restriction for Admins (automatically adds terminal filter)
router.use(restrictToUserTerminal);

// Driver routes
router.post('/', validate(createDriverSchema), createDriver);
router.get('/', validate(searchDriversSchema, 'query'), getDrivers);
router.get('/available', getAvailableDrivers);
router.get('/search', validate(searchDriversSchema, 'query'), searchDrivers);
router.get('/:driverId', validateObjectId('driverId'), validate(driverIdParamSchema, 'params'), getDriverById);
router.patch('/:driverId', validateObjectId('driverId'), validate(updateDriverSchema), updateDriver);
router.delete('/:driverId', validateObjectId('driverId'), validate(driverIdParamSchema, 'params'), deleteDriver);

// Driver assignment routes
router.post('/:driverId/assign/:vehicleId', 
  validateObjectId('driverId'), 
  validateObjectId('vehicleId'), 
  assignVehicle
);
router.post('/:driverId/unassign', 
  validateObjectId('driverId'), 
  unassignVehicle
);

export default router;