/**
 * Authentication Routes
 */

import express from 'express';
import { login, changePassword, logout } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { loginSchema, changePasswordSchema } from '../validations/auth.validation.js';

const router = express.Router();

// Public routes (with rate limiting)
router.post('/login', authLimiter, validate(loginSchema), login);

// Protected routes
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/logout', authenticate, logout);

export default router;