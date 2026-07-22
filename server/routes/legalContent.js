const express = require('express');
const router = express.Router();
const LegalContent = require('../models/LegalContent');
const { protect, authorize } = require('../middleware/auth');

// Seed helper function
const seedLegalDocuments = async () => {
  try {
    const count = await LegalContent.countDocuments();
    if (count === 0) {
      console.log('Seeding default legal documents...');
      const defaultDocs = [
        {
          documentType: 'disclaimer',
          title: 'Medical & Educational Disclaimer',
          lastUpdated: 'July 2026',
          content: `1. Educational and Informational Purposes Only
All content provided on https://medical-lms-nine.vercel.app, including but not limited to text, graphics, images, course modules, quizzes, downloads, and other material, is strictly for educational and informational purposes.

2. Not Medical Advice
The information on this Medical LMS platform is NOT intended to be a substitute for professional medical advice, clinical diagnosis, or treatment.
* For Students/Professionals: This material is designed to supplement formal academic or clinical training. It should not be used as a standalone guide for clinical decision-making or patient care.
* For the Public: Never disregard professional medical advice or delay seeking it because of something you have read, watched, or downloaded from this platform.

3. No Doctor-Patient Relationship
Your use of this Site, including registering for an account, taking courses, or interacting with instructors, does not establish a doctor-patient or professional-client relationship between you and [Insert Website/Company Name] or any associated individuals.

4. Accuracy of Information
Medical science is constantly evolving. While we make every effort to ensure the educational material is accurate and up to date at the time of publication, we make no representations or warranties regarding the completeness, accuracy, or currency of the information provided. You assume full responsibility for how you choose to apply this knowledge.

5. No Guarantee of Educational Outcomes or Exam Performance
This platform is intended solely as a supplemental study aid. [Insert Website Name] makes no guarantees, warranties, or representations regarding your academic performance, exam scores, or professional licensing outcomes.
* No Liability for Academic Outcomes: We are not responsible or liable for any low marks, failing grades, failed examinations, or lack of academic progress you may experience.
* Independent Study Required: Success in medical education requires comprehensive study from official university curricula, textbooks, and practical training. Relying on this platform does not guarantee passing scores on any test, board exam, or clinical assessment.`
        },
        {
          documentType: 'privacy-policy',
          title: 'Privacy Policy',
          lastUpdated: 'July 2026',
          content: `Welcome to [Insert Website Name] ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our Medical Learning Management System (LMS) at https://medical-lms-nine.vercel.app.

1. Information We Collect
We collect information that you voluntarily provide to us when you interact with our platform:
* Account Data: If you create an account, we collect your name, email address, password, and professional/student designation (if applicable).
* Usage and Learning Data: We track your progress through courses, modules viewed, quizzes taken, and materials downloaded to provide LMS functionality.
* Technical Data: Our website is hosted on Frontend-as-a-Service (FaaS) platform. We automatically collect certain technical information when you visit, including your IP address, browser type, operating system, and basic analytics data regarding how you navigate the site.

2. How We Use Your Information
We use your data to:
* Provide, operate, and maintain our educational platform.
* Track your learning progress and save your course history.
* Communicate with you regarding system updates, account notifications, or user support.
* Analyze site performance to improve our educational content.

3. Cookies and Tracking
We use essential cookies to keep you logged into your account and track your learning progress. If we use third-party analytics (like Google Analytics), those platforms may also deploy cookies to monitor traffic patterns. You can manage your cookie preferences through your browser settings.

4. Third-Party Services and Hosting
Our platform is hosted by Frontend-as-a-Service (FaaS) platform. Data may be processed and stored on Frontend-as-a-Service (FaaS) platform secure cloud infrastructure. We do not sell, trade, or rent your personal identification information to third parties.

5. Your Data Rights
Depending on your location (such as the UK, EU, or California), you may have rights under the GDPR or CCPA to access, correct, or request the deletion of the personal data we hold about you. To exercise these rights, please contact us at [Insert Contact Email].`
        },
        {
          documentType: 'terms-of-service',
          title: 'Terms of Service',
          lastUpdated: 'July 2026',
          content: `Please read these Terms of Service ("Terms") carefully before using the Medical LMS platform located at https://medical-lms-nine.vercel.app ("the Site"). By accessing or using the Site, you agree to be bound by these Terms.

1. Eligibility and Accounts
To access certain features, modules, or downloads on our LMS, you may be required to register for an account. You agree to provide accurate information and to keep your login credentials secure. You are fully responsible for all activities that occur under your account.

2. Intellectual Property Rights
Unless otherwise stated, all educational materials, texts, graphics, code, video lectures, and downloadable PDFs on this Site are the intellectual property of [Insert Website/Company Name] and are protected by copyright laws.

3. Permitted and Restricted Use
* Permitted: You are granted a limited, non-exclusive, non-transferable license to view, stream, download, and print materials strictly for your personal, non-commercial educational study.
* Restricted: You may NOT redistribute, resell, republish, alter, or use any of our content or medical diagrams for commercial purposes or on competitive platforms without explicit written consent.

4. User Conduct
You agree not to attempt to disrupt the platform's security, reverse-engineer the LMS code, scrape data automatically, or upload malicious files. Violation of these rules will result in immediate account termination.

5. Limitation of Liability & Governing Law
To the maximum extent permitted by law, [Insert Website Name] shall not be liable for any damages resulting from your use or inability to use the platform. These terms are governed by the laws of [Insert Your Country/State], without regard to conflict of law principles.`
        }
      ];
      await LegalContent.insertMany(defaultDocs);
      console.log('Seeding legal documents completed successfully!');
    }
  } catch (err) {
    console.error('Error seeding legal documents:', err.message);
  }
};

// Trigger seeding asynchronously
seedLegalDocuments();

// @route   GET /api/legal-content
// @desc    Get all legal documents
// @access  Public
router.get('/', async (req, res) => {
  try {
    const docs = await LegalContent.find();
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/legal-content/:documentType
// @desc    Get a specific legal document by type
// @access  Public
router.get('/:documentType', async (req, res) => {
  try {
    const doc = await LegalContent.findOne({ documentType: req.params.documentType });
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Document of type ${req.params.documentType} not found`
      });
    }
    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/legal-content/:documentType
// @desc    Update a specific legal document by type
// @access  Private/Admin
router.put('/:documentType', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, content, lastUpdated } = req.body;
    let doc = await LegalContent.findOne({ documentType: req.params.documentType });
    
    if (!doc) {
      doc = new LegalContent({
        documentType: req.params.documentType,
        title,
        content,
        lastUpdated,
        updatedBy: req.user.id
      });
      await doc.save();
    } else {
      doc.title = title || doc.title;
      doc.content = content || doc.content;
      doc.lastUpdated = lastUpdated || doc.lastUpdated;
      doc.updatedBy = req.user.id;
      await doc.save();
    }

    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
