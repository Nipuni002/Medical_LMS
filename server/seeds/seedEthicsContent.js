const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const PlabTheoryContent = require('../models/PlabTheoryContent');
const PlabTheorySubject = require('../models/PlabTheorySubject');
const User = require('../models/User');

// Sample data for Ethics, Law & Communication
const ethicsContent = {
  title: 'Ethics, Law & Communication',
  description: 'Essential medical ethics, legal principles, and communication skills for PLAB',
  topics: [
    {
      title: 'Consent and Capacity',
      content: `Understanding consent is fundamental to medical practice. Valid consent requires:

1. The patient must have capacity
2. The patient must be adequately informed
3. The consent must be given voluntarily

Capacity Assessment:
- Can the patient understand the information?
- Can they retain the information?
- Can they weigh the information in the balance?
- Can they communicate their decision?

Adults are presumed to have capacity unless proven otherwise. For patients lacking capacity, decisions should be made in their best interests following the Mental Capacity Act 2005.

Key Points:
- Written consent is required for general anaesthesia and procedures with significant risks
- Consent can be withdrawn at any time
- Emergency treatment without consent is permitted when it's in the patient's best interests
- Children aged 16-17 can consent to treatment but cannot refuse life-saving treatment`,
      videoLink: 'https://www.youtube.com/watch?v=example1',
      order: 0
    },
    {
      title: 'Confidentiality',
      content: `Confidentiality is a cornerstone of the doctor-patient relationship. All patient information must be kept confidential unless there are legal or ethical grounds to breach it.

When to Breach Confidentiality:
- Patient gives explicit consent
- Required by law (e.g., notifiable diseases, terrorism)
- In the public interest (serious crime, risk to others)
- For the protection of children or vulnerable adults

GMC Guidance:
- Always justify breaches of confidentiality
- Inform the patient when possible before disclosure
- Only disclose necessary information
- Document your decision-making process

Special Situations:
- Discussing with the healthcare team is not a breach
- Writing in medical records must be done carefully
- Protect patient information in all formats (paper, electronic, verbal)
- Be particularly careful with high-profile patients`,
      videoLink: 'https://www.youtube.com/watch?v=example2',
      order: 1
    },
    {
      title: 'Breaking Bad News',
      content: `Breaking bad news requires skill, empathy, and following a structured approach. The SPIKES protocol is widely used:

SPIKES Protocol:
S - Setting: Arrange privacy, sit down, ensure adequate time
P - Perception: Assess what the patient knows/suspects
I - Invitation: Ask how much the patient wants to know
K - Knowledge: Give information in clear, simple terms
E - Emotions: Respond empathetically to emotions
S - Strategy/Summary: Discuss next steps and provide support

Key Communication Skills:
- Use clear, jargon-free language
- Allow silence for information to sink in
- Watch for verbal and non-verbal cues
- Offer written information and further appointments
- Provide emotional support and practical help

Common Mistakes to Avoid:
- Using euphemisms that confuse patients
- Giving too much information at once
- Not checking understanding
- Rushing through the conversation
- Not addressing emotions`,
      videoLink: 'https://www.youtube.com/watch?v=example3',
      order: 2
    },
    {
      title: 'Complaints and Clinical Incidents',
      content: `Handling complaints professionally and learning from clinical incidents are essential aspects of good medical practice.

GMC Guidance on Complaints:
- Take all complaints seriously
- Listen to the patient's concerns without being defensive
- Apologize when appropriate (saying sorry is not an admission of guilt)
- Investigate thoroughly and respond promptly
- Learn from complaints to improve care

Clinical Incident Reporting:
- Report all adverse events and near misses
- Be honest and open with patients about what happened
- Follow the Duty of Candour requirements
- Document everything clearly
- Support staff involved in incidents

Duty of Candour Requirements:
- Tell the patient when something goes wrong
- Apologize to the patient
- Offer an appropriate remedy or support
- Explain fully to the patient the short and long-term effects

Remember: The primary aim is patient safety and learning, not blame`,
      videoLink: 'https://www.youtube.com/watch?v=example4',
      order: 3
    },
    {
      title: 'Mental Capacity Act and Deprivation of Liberty',
      content: `The Mental Capacity Act (MCA) 2005 provides a framework for making decisions on behalf of people who lack capacity.

Five Principles of MCA:
1. Presumption of capacity
2. Support to make own decisions
3. Right to make unwise decisions
4. Best interests
5. Least restrictive option

Best Interests Checklist:
- Encourage participation of the person
- Consider their past and present wishes
- Consult with family, carers, and relevant others
- Consider all relevant circumstances
- Will they regain capacity?

Deprivation of Liberty Safeguards (DoLS):
- Protects people in hospitals and care homes from being inappropriately deprived of liberty
- Requirements for DoLS authorization
- Regular reviews and appeals process
- Difference between restriction and deprivation

Advance Decisions and Lasting Power of Attorney:
- Advance decisions must be respected if valid
- LPA for health and welfare covers treatment decisions
- Document discussions carefully`,
      videoLink: 'https://www.youtube.com/watch?v=example5',
      order: 4
    }
  ],
  isPublished: true
};

async function seedEthicsContent() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Find the Ethics, Law & Communication subject
    const ethicsSubject = await PlabTheorySubject.findOne({ 
      name: { $regex: /ethics.*law.*communication/i }
    });

    if (!ethicsSubject) {
      console.log('Ethics, Law & Communication subject not found.');
      console.log('Please create the subject first in the Admin Theory Subjects page.');
      process.exit(1);
    }

    console.log(`Found subject: ${ethicsSubject.name}`);

    // Find an admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Check if content already exists
    const existingContent = await PlabTheoryContent.findOne({ 
      subjectId: ethicsSubject._id 
    });

    if (existingContent) {
      console.log('Content already exists for this subject.');
      console.log('Updating existing content...');
      
      existingContent.title = ethicsContent.title;
      existingContent.description = ethicsContent.description;
      existingContent.topics = ethicsContent.topics;
      existingContent.isPublished = ethicsContent.isPublished;
      existingContent.updatedBy = adminUser._id;
      
      await existingContent.save();
      console.log('Content updated successfully!');
    } else {
      // Create new content
      const newContent = new PlabTheoryContent({
        subjectId: ethicsSubject._id,
        title: ethicsContent.title,
        description: ethicsContent.description,
        topics: ethicsContent.topics,
        isPublished: ethicsContent.isPublished,
        createdBy: adminUser._id
      });

      await newContent.save();
      console.log('Content created successfully!');
    }

    console.log('\n✅ Ethics, Law & Communication content seeded successfully!');
    console.log(`   - ${ethicsContent.topics.length} topics added`);
    console.log('\nYou can now view this content at: /theory/${ethicsSubject._id}');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding content:', error);
    process.exit(1);
  }
}

// Run the seed function
seedEthicsContent();
