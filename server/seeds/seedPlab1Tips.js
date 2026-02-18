require('dotenv').config();
const mongoose = require('mongoose');
const PlabContent = require('../models/PlabContent');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const seedPlab1Tips = async () => {
  try {
    await connectDB();

    // Find admin user
    const adminUser = await User.findOne({ email: 'thakshilaperera37@gmail.com' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Check if PLAB 1 Tips content already exists
    const existingContent = await PlabContent.findOne({ pageType: 'plab1-tips' });
    
    if (existingContent) {
      console.log('PLAB 1 Tips content already exists');
      process.exit(0);
    }

    // Create PLAB 1 Tips content
    const plab1Tips = new PlabContent({
      pageType: 'plab1-tips',
      title: 'PLAB 1 TIPS',
      subtitle: '(Principles to follow throughout preparation & the exam)',
      description: 'Essential tips and strategies to excel in your PLAB 1 examination. Follow these proven principles throughout your preparation and on exam day.',
      sections: [
        {
          heading: '1. Think Like a UK Doctor',
          content: `• Follow NICE / GMC logic, not home-country practice
• Conservative, safe, patient-centred answers score best
• First-line > second-line > specialist treatment`,
          order: 1
        },
        {
          heading: '2. Safety Beats Cleverness',
          content: `• Any option that prevents immediate harm is usually correct
• Unstable patient → treat first, investigate later`,
          order: 2
        },
        {
          heading: '3. Red Flags = Urgent Action',
          content: `If red flags are present, never reassure or delay. Examples:
• Weight loss, night sweats
• New neurological deficit
• Haemoptysis
• Post-menopausal bleeding`,
          order: 3
        },
        {
          heading: '4. Investigation Hierarchy',
          content: `• Start simple: History & Examination → Blood tests → X-ray → Ultrasound
• Avoid jumping to CT/MRI unless red flags
• Don't over-investigate stable patients`,
          order: 4
        },
        {
          heading: '5. Communication is Key',
          content: `• Always explain diagnosis and management plan
• Gain consent before procedures
• Address patient concerns empathetically`,
          order: 5
        }
      ],
      imageUrl: '/images/PLAB1Tips.png',
      isPublished: true,
      createdBy: adminUser._id
    });

    await plab1Tips.save();
    console.log('PLAB 1 Tips content created successfully!');
    console.log('Content ID:', plab1Tips._id);
    console.log('Sections created:', plab1Tips.sections.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding PLAB 1 Tips:', error);
    process.exit(1);
  }
};

seedPlab1Tips();
