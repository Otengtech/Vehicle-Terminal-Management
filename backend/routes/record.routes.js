/**
 * Record Routes
 * Handles audit trail and history
 */

import express from 'express';
import { 
  createRecord, 
  getRecords, 
  getRecordById,
  getVehicleHistory,
  getTerminalSummary,
  getDailyReport,
  getUserActivity
} from '../controllers/record.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { restrictToUserTerminal } from '../middleware/terminal.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import { 
  createRecordSchema, 
  getRecordsSchema,
  recordIdParamSchema,
  dailySummarySchema
} from '../validations/record.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(allowRoles('Superadmin', 'Admin'));

// Apply terminal restriction for Admins
router.use(restrictToUserTerminal);

// Record routes
router.post('/', validate(createRecordSchema), createRecord);
router.get('/', validate(getRecordsSchema, 'query'), getRecords);
router.get('/vehicle/:vehicleId', validateObjectId('vehicleId'), getVehicleHistory);
router.get('/terminal/:terminalId/summary', validateObjectId('terminalId'), getTerminalSummary);
router.get('/terminal/:terminalId/daily', validateObjectId('terminalId'), validate(dailySummarySchema, 'query'), getDailyReport);
router.get('/user/:userId/activity', validateObjectId('userId'), getUserActivity);
router.get('/:recordId', validateObjectId('recordId'), validate(recordIdParamSchema, 'params'), getRecordById);

export default router;