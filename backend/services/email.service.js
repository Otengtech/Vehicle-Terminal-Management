/**
 * Email Service
 * Handles all email communications
 */

import { sendEmail } from '../config/email.js';
import logger from '../utils/logger.js';

/**
 * Send temporary password email to new admin
 * @param {Object} user - User object
 * @param {String} tempPassword - Temporary password
 */
export const sendTemporaryPasswordEmail = async (user, tempPassword) => {
  try {
    const subject = 'Your Vehicle Terminal System Account Credentials';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Vehicle Terminal Management System</h2>
        
        <p style="font-size: 16px;">Hello <strong>${user.fullName}</strong>,</p>
        
        <p>An administrator has created an account for you. Please use the following credentials to log in:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> 
            <span style="font-family: monospace; background: #e9ecef; padding: 3px 6px; border-radius: 3px;">${tempPassword}</span>
          </p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Important:</strong> You will be required to change this password on first login.
          </p>
        </div>
        
        <p>Login here: <a href="${process.env.FRONTEND_URL}/login" style="color: #007bff;">${process.env.FRONTEND_URL}/login</a></p>
        
        <p style="color: #6c757d; font-size: 14px;">For security reasons, do not share this password with anyone.</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject, html });
    logger.info(`Temporary password email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send temporary password email: ${error.message}`);
    throw new Error('Failed to send welcome email');
  }
};

/**
 * Send password reset confirmation email
 * @param {String} email - User email
 * @param {String} name - User name
 */
export const sendPasswordResetConfirmation = async (email, name) => {
  try {
    const subject = 'Your Password Has Been Changed';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Change Confirmation</h2>
        
        <p>Hello <strong>${name}</strong>,</p>
        
        <p>Your password for the Vehicle Terminal Management System was successfully changed.</p>
        
        <p>If you did not make this change, please contact your system administrator immediately.</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });
    logger.info(`Password reset confirmation sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset confirmation: ${error.message}`);
  }
};

/**
 * Send account status change notification
 * @param {Object} user - User object
 * @param {String} newStatus - New account status
 * @param {String} reason - Reason for change
 */
export const sendAccountStatusNotification = async (user, newStatus, reason) => {
  try {
    const subject = `Account ${newStatus}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Account Status Update</h2>
        
        <p>Hello <strong>${user.fullName}</strong>,</p>
        
        <p>Your account status has been changed to: <strong>${newStatus}</strong></p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        ${newStatus === 'Suspended' 
          ? '<p>Please contact your system administrator for more information.</p>' 
          : ''}
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject, html });
    logger.info(`Account status notification sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send account status notification: ${error.message}`);
  }
};