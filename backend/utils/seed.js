const mongoose = require('mongoose');
const { User } = require('../models/User');
require('dotenv').config();

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'Manager@123',
    role: 'manager',
    status: 'active',
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'User@123',
    role: 'user',
    status: 'active',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Jane@123',
    role: 'user',
    status: 'active',
  },
  {
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: 'Inactive@123',
    role: 'user',
    status: 'inactive',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin first to set createdBy for others
    const admin = await User.create(seedUsers[0]);

    for (let i = 1; i < seedUsers.length; i++) {
      await User.create({ ...seedUsers[i], createdBy: admin._id, updatedBy: admin._id });
    }

    console.log('✅ Seed data inserted successfully');
    console.log('\nTest Credentials:');
    console.log('Admin:   admin@example.com   / Admin@123');
    console.log('Manager: manager@example.com / Manager@123');
    console.log('User:    user@example.com    / User@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
