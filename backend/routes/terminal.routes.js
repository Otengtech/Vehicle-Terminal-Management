/**
 * Terminal Routes
 * Handles terminal management
 */

import express from 'express';
import { 
  createTerminal, 
  getTerminals, 
  getTerminalById, 
  updateTerminal, 
  deleteTerminal,
  getTerminalStats
} from '../controllers/terminal.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import { 
  createTerminalSchema, 
  updateTerminalSchema,
  terminalIdParamSchema 
} from '../validations/terminal.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Terminal routes (accessible by both Superadmin and Admin)
router.post('/', allowRoles('Superadmin', 'Admin'), validate(createTerminalSchema), createTerminal);
router.get('/', allowRoles('Superadmin', 'Admin'), getTerminals);
router.get('/stats', allowRoles('Superadmin', 'Admin'), getTerminalStats);
router.get('/:terminalId', allowRoles('Superadmin', 'Admin'), validateObjectId('terminalId'), validate(terminalIdParamSchema, 'params'), getTerminalById);
router.patch('/:terminalId', allowRoles('Superadmin', 'Admin'), validateObjectId('terminalId'), validate(updateTerminalSchema), updateTerminal);
router.delete('/:terminalId', allowRoles('Superadmin'), validateObjectId('terminalId'), validate(terminalIdParamSchema, 'params'), deleteTerminal);

export default router;