/**
 * Password Service
 * Handles password hashing and verification
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import logger from '../utils/logger.js';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error(`Password hashing failed: ${error.message}`);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare plain text password with hashed password
 * @param {String} candidatePassword - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Promise<Boolean>} True if matches
 */
export const comparePassword = async (candidatePassword, hashedPassword) => {
  try {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  } catch (error) {
    logger.error(`Password comparison failed: ${error.message}`);
    throw new Error('Failed to verify password');
  }
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length check
  if (password.length > 50) {
    errors.push('Password cannot exceed 50 characters');
  }
  
  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Common password check (basic)
  const commonPasswords = ['password123', 'admin123', '12345678', 'qwerty123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a more secure password');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate a secure hash for email verification or other tokens
 * @returns {String} Random token
 */
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate password entropy (security strength)
 * @param {String} password - Password to check
 * @returns {Number} Entropy score
 */
export const calculatePasswordEntropy = (password) => {
  const charset = {
    lowercase: 26,
    uppercase: 26,
    numbers: 10,
    symbols: 32
  };
  
  let pool = 0;
  if (/[a-z]/.test(password)) pool += charset.lowercase;
  if (/[A-Z]/.test(password)) pool += charset.uppercase;
  if (/\d/.test(password)) pool += charset.numbers;
  if (/[^a-zA-Z0-9]/.test(password)) pool += charset.symbols;
  
  const entropy = Math.log2(pool) * password.length;
  return Math.round(entropy * 100) / 100;
};