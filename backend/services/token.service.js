/**
 * Token Service
 * Handles JWT token generation and management
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
export const generateAuthToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    terminalId: user.terminalId
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE || '12h',
    algorithm: 'HS256'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Generate a secure random temporary password
 * @returns {String} Temporary password
 */
export const generateTemporaryPassword = () => {
  // Generate a random 12-character password
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Generate password reset token (for future use)
 * @param {String} userId - User ID
 * @returns {Object} Reset token and expiry
 */
export const generateResetToken = (userId) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour
  
  return { resetToken, resetTokenExpiry };
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Extract token from authorization header
 * @param {String} authHeader - Authorization header
 * @returns {String|null} Extracted token
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};