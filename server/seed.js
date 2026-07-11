/**
 * Seed Script — Creates the initial Central Faculty Coordinator account.
 *
 * Usage: node seed.js
 *
 * This creates:
 *   - User: admin@gmrit.edu.in / Admin@ISTE2024
 *   - Profile: "ISTE Admin" (Central Faculty Coordinator)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if central admin already exists
    const existingAdmin = await User.findOne({ role: 'central_faculty' });

    if (existingAdmin) {
      console.log('⚠️  Central Faculty Coordinator already exists.');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Skipping seed.');
      process.exit(0);
    }

    const adminEmail = 'admin@gmrit.edu.in';
    const adminPassword = 'Admin@ISTE2024';

    // Hash password
    const passwordHash = await User.hashPassword(adminPassword);

    // Create admin user
    const adminUser = await User.create({
      role: 'central_faculty',
      email: adminEmail,
      passwordHash,
      branch: 'CENTRAL',
      isActive: true,
    });

    // Create admin profile
    const adminProfile = await Profile.create({
      userId: adminUser._id,
      name: 'ISTE Admin',
      branch: 'CENTRAL',
      role: 'Central Faculty Coordinator',
      designation: 'Faculty Coordinator',
      bio: 'Central Faculty Coordinator for ISTE Student Chapter, GMRIT.',
      photoUrl: '',
      socialLinks: {
        linkedin: '',
        github: '',
        instagram: '',
      },
    });

    // Link profile to user
    adminUser.profileId = adminProfile._id;
    await adminUser.save();

    console.log('\n✅ Central Faculty Coordinator account created successfully!\n');
    console.log('   ┌────────────────────────────────────────┐');
    console.log('   │  Login Credentials                     │');
    console.log('   ├────────────────────────────────────────┤');
    console.log(`   │  Email:    ${adminEmail}      │`);
    console.log(`   │  Password: ${adminPassword}          │`);
    console.log('   └────────────────────────────────────────┘\n');
    console.log('   ⚠️  Change this password immediately after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedAdmin();
