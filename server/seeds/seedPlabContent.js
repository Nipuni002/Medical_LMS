const mongoose = require('mongoose');
const PlabContent = require('../models/PlabContent');
const User = require('../models/User');
require('dotenv').config();

const seedPlabContent = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Find admin user
    const admin = await User.findOne({ email: 'thakshilaperera37@gmail.com' });

    if (!admin) {
      console.log('❌ Admin user not found! Please run seedAdmin.js first.');
      process.exit(1);
    }

    // Check if content already exists
    const existingContent = await PlabContent.findOne({ pageType: 'what-is-plab' });

    if (existingContent) {
      console.log('❌ "What is PLAB" content already exists!');
      console.log('Content ID:', existingContent._id);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create "What is PLAB" content
    const plabContent = await PlabContent.create({
      pageType: 'what-is-plab',
      title: 'What is PLAB?',
      subtitle: 'Professional and Linguistic Assessments Board',
      description: 'The Professional and Linguistic Assessments Board (PLAB) test is the main route for International Medical Graduates (IMGs) who wish to practice medicine in the United Kingdom. The PLAB test is designed to ensure that doctors who qualified overseas have the necessary knowledge and skills to practice medicine safely in the UK.',
      sections: [
        {
          heading: 'Overview',
          content: 'PLAB is a two-part examination system consisting of PLAB 1 (knowledge-based test) and PLAB 2 (practical assessment). Both parts must be passed to be eligible for registration with the General Medical Council (GMC).',
          order: 1
        },
        {
          heading: 'PLAB 1',
          content: 'PLAB 1 is a computer-based exam consisting of 180 multiple-choice questions covering various medical specialties. The test assesses your medical knowledge and is available at test centers worldwide.',
          order: 2
        },
        {
          heading: 'PLAB 2',
          content: 'PLAB 2 is an Objective Structured Clinical Examination (OSCE) that tests practical clinical skills. It consists of 16 stations covering different clinical scenarios and must be taken at the GMC test center in the UK.',
          order: 3
        },
        {
          heading: 'Eligibility',
          content: 'To take PLAB, you must have a primary medical qualification that is acceptable to the GMC and demonstrate English language proficiency through an approved test such as OET or IELTS.',
          order: 4
        }
      ],
      imageUrl: '/images/PLAB.png',
      isPublished: true,
      createdBy: admin._id
    });

    console.log('✅ "What is PLAB" content created successfully!');
    console.log('-----------------------------------');
    console.log('Page Type:', plabContent.pageType);
    console.log('Title:', plabContent.title);
    console.log('Content ID:', plabContent._id);
    console.log('Sections:', plabContent.sections.length);
    console.log('-----------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedPlabContent();
