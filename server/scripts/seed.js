require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

const connectDB = require('../config/db');

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to Database via connectDB');

    // Clear existing seed users (not all users)
    await User.deleteMany({
      email: {
        $in: [
          'admin@voltkart.in',
          'agent1@voltkart.in', 'agent2@voltkart.in',
          'engineer1@voltkart.in', 'engineer2@voltkart.in',
          'seller_test@voltkart.in', 'buyer_test@voltkart.in',
        ],
      },
    });
    console.log('Cleared old seed users');

    const users = [
      {
        name: 'Super Admin',
        email: 'admin@voltkart.in',
        passwordHash: 'Admin@1234',
        role: 'admin',
      },
      {
        name: 'Ravi Kumar (Agent)',
        email: 'agent1@voltkart.in',
        passwordHash: 'Agent@1234',
        role: 'agent',
      },
      {
        name: 'Priya Singh (Agent)',
        email: 'agent2@voltkart.in',
        passwordHash: 'Agent@1234',
        role: 'agent',
      },
      {
        name: 'Arjun Sharma (Engineer)',
        email: 'engineer1@voltkart.in',
        passwordHash: 'Engineer@1234',
        role: 'engineer',
      },
      {
        name: 'Divya Nair (Engineer)',
        email: 'engineer2@voltkart.in',
        passwordHash: 'Engineer@1234',
        role: 'engineer',
      },
      {
        name: 'Test Seller',
        email: 'seller_test@voltkart.in',
        passwordHash: 'Seller@1234',
        role: 'seller',
      },
      {
        name: 'Test Buyer',
        email: 'buyer_test@voltkart.in',
        passwordHash: 'Buyer@1234',
        role: 'buyer',
      },
    ];

    const created = [];
    for (const u of users) {
      const user = new User(u);
      await user.save(); // triggers bcrypt pre-save
      created.push(user);
      console.log(`Created ${u.role}: ${u.email}`);

      if (u.role === 'seller') {
        await SellerProfile.create({
          userId: user._id,
          phone: '+91 98765 43210',
          pincode: '560038',
          city: 'Bengaluru',
          state: 'Karnataka',
        });
      }
    }

    console.log('\nSeed complete!\n');
    console.log('='.repeat(50));
    console.log('Test Credentials:');
    console.log('='.repeat(50));
    users.forEach((u) => {
      console.log(`${u.role.toUpperCase().padEnd(10)} ${u.email} / ${u.passwordHash}`);
    });
    console.log('='.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
