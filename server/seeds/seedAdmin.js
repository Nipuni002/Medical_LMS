const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'thakshilaperera37@gmail.com' });

    if (adminExists) {
      console.log('❌ Admin user already exists!');
      console.log('Email:', adminExists.email);
      console.log('Role:', adminExists.role);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'thakshilaperera37@gmail.com',
      password: 'AdminN123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', admin.email);
    console.log('Password: AdminN123');
    console.log('Role:', admin.role);
    console.log('-----------------------------------');
    console.log('You can now login with these credentials');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
