/**
 * User Routes
 * Handles admin user management (Superadmin only)
 */

import express from 'express';
import { 
  createAdmin, 
  getAdmins, 
  getAdminById, 
  updateAdmin, 
  deleteAdmin,
  getProfile,
  updateProfile
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireSuperadmin, allowRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import { 
  createAdminSchema, 
  updateAdminSchema, 
  updateProfileSchema,
  userIdParamSchema 
} from '../validations/user.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes (accessible by both Superadmin and Admin)
router.get('/profile', allowRoles('Superadmin', 'Admin'), getProfile);
router.patch('/profile', allowRoles('Superadmin', 'Admin'), validate(updateProfileSchema), updateProfile);

// Admin management routes (Superadmin only)
router.post('/', requireSuperadmin, validate(createAdminSchema), createAdmin);
router.get('/', requireSuperadmin, getAdmins);
router.get('/:userId', requireSuperadmin, validateObjectId('userId'), validate(userIdParamSchema, 'params'), getAdminById);
router.patch('/:userId', requireSuperadmin, validateObjectId('userId'), validate(updateAdminSchema), updateAdmin);
router.delete('/:userId', requireSuperadmin, validateObjectId('userId'), validate(userIdParamSchema, 'params'), deleteAdmin);

export default router;