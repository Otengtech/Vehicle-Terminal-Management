/**
 * Create Superadmin Script
 * Run this to create the first superadmin user
 * Usage: pnpm run seed:superadmin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User.model.js';
import { hashPassword } from '../services/password.service.js';
import logger from '../utils/logger.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createSuperadmin = async () => {
  try {
    console.log('\n🔧 Vehicle Terminal Management System - Superadmin Creation\n');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ role: 'Superadmin' });
    
    if (existingSuperadmin) {
      console.log('⚠️  A superadmin already exists in the system:');
      console.log(`   Name: ${existingSuperadmin.fullName}`);
      console.log(`   Email: ${existingSuperadmin.email}`);
      
      const overwrite = await question('\nDo you want to create another superadmin? (y/N): ');
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n❌ Superadmin creation cancelled.');
        process.exit(0);
      }
    }

    // Get superadmin details
    console.log('\n📝 Enter Superadmin Details:\n');
    
    const fullName = await question('Full Name: ');
    if (!fullName) throw new Error('Full name is required');

    const email = await question('Email: ');
    if (!email) throw new Error('Email is required');
    if (!email.includes('@')) throw new Error('Invalid email format');

    // Generate and display password
    const tempPassword = 'SuperAdmin@123'; // You can generate random here
    
    console.log('\n🔐 Password Information:');
    console.log(`   Temporary Password: ${tempPassword}`);
    console.log('   ⚠️  Please save this password. The superadmin will be required to change it on first login.\n');

    const confirm = await question('Create superadmin with these details? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Superadmin creation cancelled.');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await hashPassword(tempPassword);

    // Create superadmin
    const superadmin = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: 'Superadmin',
      status: 'Active',
      forcePasswordChange: true
    });

    console.log('\n✅ Superadmin created successfully!');
    console.log('----------------------------------------');
    console.log(`📋 Superadmin Details:`);
    console.log(`   ID: ${superadmin._id}`);
    console.log(`   Name: ${superadmin.fullName}`);
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Role: ${superadmin.role}`);
    console.log(`   Status: ${superadmin.status}`);
    console.log('----------------------------------------');
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Password: ${tempPassword}`);
    console.log('\n⚠️  IMPORTANT: Change password on first login!\n');

  } catch (error) {
    console.error('\n❌ Error creating superadmin:', error.message);
    logger.error('Superadmin creation failed:', error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the script
createSuperadmin();