const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

const PlabTheorySubject = require('../models/PlabTheorySubject');
const User = require('../models/User');

// Sample subjects based on the image
const subjects = [
  // VERY HIGH WEIGHTAGE (10)
  { name: 'Ethics, Law & Communication', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 1, color: '#0A2463' },
  { name: 'Cardiology', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 2, color: '#0A2463' },
  { name: 'Respiratory Medicine', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 3, color: '#0A2463' },
  { name: 'Neurology', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 4, color: '#0A2463' },
  { name: 'Endocrinology', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 5, color: '#0A2463' },
  { name: 'Obstetrics', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 6, color: '#0A2463' },
  { name: 'Gynaecology', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 7, color: '#0A2463' },
  { name: 'Psychiatry', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 8, color: '#0A2463' },
  { name: 'Infectious Disease', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 9, color: '#0A2463' },
  { name: 'Emergency & Acute Medicine', weightage: 'VERY HIGH WEIGHTAGE', weightageValue: 10, order: 10, color: '#0A2463' },
  
  // HIGH WEIGHTAGE (8)
  { name: 'Paediatrics', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 11, color: '#8B2C8B' },
  { name: 'General Surgery', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 12, color: '#8B2C8B' },
  { name: 'Renal Medicine', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 13, color: '#8B2C8B' },
  { name: 'Haematology', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 14, color: '#8B2C8B' },
  { name: 'Orthopaedics', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 15, color: '#8B2C8B' },
  { name: 'Electrolyte Disorders', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 16, color: '#8B2C8B' },
  { name: 'Gastroenterology', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 17, color: '#8B2C8B' },
  { name: 'Trauma', weightage: 'HIGH WEIGHTAGE', weightageValue: 8, order: 18, color: '#8B2C8B' },
  
  // MODERATE WEIGHTAGE (5)
  { name: 'Dermatology', weightage: 'MODERATE WEIGHTAGE', weightageValue: 5, order: 19, color: '#8B2C8B' },
  { name: 'Ophthalmology', weightage: 'MODERATE WEIGHTAGE', weightageValue: 5, order: 20, color: '#8B2C8B' },
  { name: 'ENT', weightage: 'MODERATE WEIGHTAGE', weightageValue: 5, order: 21, color: '#8B2C8B' },
  { name: 'Rheumatology', weightage: 'MODERATE WEIGHTAGE', weightageValue: 5, order: 22, color: '#8B2C8B' },
  { name: 'Immunology', weightage: 'MODERATE WEIGHTAGE', weightageValue: 5, order: 23, color: '#8B2C8B' },
  
  // LOW WEIGHTAGE (4)
  { name: 'Oncology', weightage: 'LOW WEIGHTAGE', weightageValue: 4, order: 24, color: '#8B2C8B' },
  { name: 'Geriatric Medicine', weightage: 'LOW WEIGHTAGE', weightageValue: 4, order: 25, color: '#8B2C8B' },
  { name: 'Palliative Care', weightage: 'LOW WEIGHTAGE', weightageValue: 4, order: 26, color: '#8B2C8B' },
  { name: 'Sexual Health/GUM', weightage: 'LOW WEIGHTAGE', weightageValue: 4, order: 27, color: '#8B2C8B' },
];

const seedTheorySubjects = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Find an admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please run seedAdmin.js first');
      process.exit(1);
    }

    // Clear existing subjects
    await PlabTheorySubject.deleteMany({});
    console.log('🗑️  Cleared existing theory subjects');

    // Add creator to each subject
    const subjectsWithCreator = subjects.map(subject => ({
      ...subject,
      createdBy: adminUser._id
    }));

    // Insert subjects
    await PlabTheorySubject.insertMany(subjectsWithCreator);
    console.log(`✅ Successfully seeded ${subjects.length} theory subjects`);

    // Display summary
    const grouped = {
      'VERY HIGH WEIGHTAGE': 0,
      'HIGH WEIGHTAGE': 0,
      'MODERATE WEIGHTAGE': 0,
      'LOW WEIGHTAGE': 0
    };

    subjects.forEach(subject => {
      grouped[subject.weightage]++;
    });

    console.log('\n📊 Summary:');
    Object.keys(grouped).forEach(key => {
      console.log(`   ${key}: ${grouped[key]} subjects`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding theory subjects:', error);
    process.exit(1);
  }
};

seedTheorySubjects();
