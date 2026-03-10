/**
 * JWT authentication configuration
 * Centralizes token settings and exports utility functions
 */

import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

// JWT configuration object
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '12h', // Default to 12 hours if not specified
  algorithm: 'HS256'
};

/**
 * Generate JWT token for authenticated user
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT token
 */
export const generateToken = (payload) => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm
    });
  } catch (error) {
    logger.error(`Token generation failed: ${error.message}`);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm]
    });
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Extract token from authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

export default jwtConfig;