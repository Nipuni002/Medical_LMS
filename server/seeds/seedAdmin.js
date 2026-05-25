const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const ADMIN_USERS = [
  {
    name: 'Admin User',
    email: 'thakshilaperera37@gmail.com',
    password: 'AdminN123'
  },
  {
    name: 'Admin User 2',
    email: 'uth3000@yahoo.com',
    password: 'AdminN123'
  }
];

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    const createdAdmins = [];
    const updatedAdmins = [];
    const existingAdmins = [];

    for (const adminUser of ADMIN_USERS) {
      const existingUser = await User.findOne({ email: adminUser.email });

      if (!existingUser) {
        const createdUser = await User.create({
          name: adminUser.name,
          email: adminUser.email,
          password: adminUser.password,
          role: 'admin'
        });
        createdAdmins.push(createdUser.email);
        continue;
      }

      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        updatedAdmins.push(existingUser.email);
      } else {
        existingAdmins.push(existingUser.email);
      }
    }

    console.log('✅ Admin seeding completed.');
    console.log('-----------------------------------');

    if (createdAdmins.length > 0) {
      console.log('Created admin users:', createdAdmins.join(', '));
      console.log('Default password for new users: AdminN123');
    }

    if (updatedAdmins.length > 0) {
      console.log('Updated role to admin for:', updatedAdmins.join(', '));
    }

    if (existingAdmins.length > 0) {
      console.log('Already admin users:', existingAdmins.join(', '));
    }

    console.log('Allowed admin emails:', ADMIN_USERS.map((user) => user.email).join(', '));
    console.log('-----------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
