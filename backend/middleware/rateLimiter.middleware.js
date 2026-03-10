/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * General API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits login attempts to 5 per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests towards limit
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  keyGenerator: (req) => {
    // Use both IP and email to prevent brute force on specific accounts
    return req.body.email ? `${req.ip}-${req.body.email}` : req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}${req.body.email ? `, email: ${req.body.email}` : ''}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Your account has been temporarily locked. Please try again later.'
    });
  }
});

/**
 * Create account rate limiter
 * Prevents mass account creation
 */
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 account creations per hour
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour'
  },
  handler: (req, res) => {
    logger.warn(`Account creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many account creation attempts. Please try again later.'
    });
  }
});