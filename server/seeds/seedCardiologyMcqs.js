const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');

const PlabTheorySubject = require('../models/PlabTheorySubject');
const PlabTheoryContent = require('../models/PlabTheoryContent');
const User = require('../models/User');

const cardiologyTopics = [
  {
    title: '1. Ischaemic Heart Disease & ACS',
    order: 1,
    description: 'Master the clinical presentation, emergency management, ECG changes, antiplatelet therapy, and secondary prevention for STEMI, NSTEMI, and Angina.',
    videoLinks: [
      'https://www.youtube.com/watch?v=9g6T4qLwB1w',
      'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      'https://www.youtube.com/watch?v=3K0wJ6v3g2Y'
    ],
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    content: '<p>High-yield notes on STEMI, NSTEMI, Unstable Angina, antiplatelet therapy, and secondary prevention.</p>',
    mcqs: [
      {
        question: 'A 62-year-old male presents to ED with severe central chest pain radiating to his left arm for 45 minutes. ECG shows 2mm ST-elevation in leads II, III, and aVF. What is the most appropriate immediate definitive management?',
        options: [
          'Immediate Primary Percutaneous Coronary Intervention (PPCI)',
          'Sublingual Glyceryl Trinitrate (GTN) only',
          'Oral Clopidogrel 75mg daily',
          'Urgent Thrombolysis after 12 hours',
          'Diagnostic Echocardiography'
        ],
        correctOption: 0,
        explanation: 'The clinical presentation and ECG indicate an Inferior STEMI. Immediate Primary PCI (within 120 minutes of diagnosis) is the gold standard definitive management for STEMI.'
      },
      {
        question: 'A 58-year-old female with stable angina experiences chest tightness on walking uphill, relieved by rest. Which medication is first-line for symptomatic prevention of stable angina?',
        options: [
          'Beta-blocker (e.g., Bisoprolol) or Calcium Channel Blocker (e.g., Amlodipine)',
          'Sublingual Nitroglycerin before every walk',
          'High-dose Aspirin alone',
          'Furosemide 40mg daily',
          'Digoxin 125mcg daily'
        ],
        correctOption: 0,
        explanation: 'NICE guidelines recommend a beta-blocker or a calcium channel blocker as first-line anti-anginal treatment for stable angina.'
      }
    ]
  },
  {
    title: '2. Heart Failure & Cardiomyopathies',
    order: 2,
    content: '<p>Comprehensive guidance on HFrEF, HFpEF, ACE inhibitors, ARNI, SGLT2 inhibitors, and acute pulmonary oedema management.</p>',
    mcqs: [
      {
        question: 'A 70-year-old man with chronic heart failure (ejection fraction 32%) remains symptomatic despite Bisoprolol and Ramipril. Which drug class reduces mortality and hospitalizations in HFrEF when added to therapy?',
        options: [
          'SGLT2 inhibitor (e.g., Dapagliflozin or Empagliflozin)',
          'Loop diuretic dosage doubling',
          'Immediate Pacemaker insertion',
          'Oral Calcium Supplementation',
          'Short-acting Nitrate tablets'
        ],
        correctOption: 0,
        explanation: 'SGLT2 inhibitors (Dapagliflozin/Empagliflozin) are now recommended for all patients with HFrEF alongside beta-blockers, ACEi/ARNI, and MRAs to reduce mortality and heart failure hospitalization.'
      },
      {
        question: 'A 75-year-old female presents with acute severe breathlessness, orthopnea, pink frothy sputum, and bilateral lung crepitations. What is the most urgent initial step?',
        options: [
          'Sit upright, high-flow oxygen, IV Furosemide, and sublingual nitrate',
          'Lie flat and start IV fluids',
          'Urgent Coronary Angiogram',
          'Oral Metoprolol 100mg',
          'Chest Drain Insertion'
        ],
        correctOption: 0,
        explanation: 'This patient has acute pulmonary oedema. Immediate management includes sitting upright, oxygen therapy, IV Furosemide, and nitrate therapy if blood pressure permits.'
      }
    ]
  },
  {
    title: '3. Cardiac Arrhythmias & ECG Analysis',
    order: 3,
    content: '<p>Atrial fibrillation, CHADS-VASc scoring, Narrow vs Wide Complex Tachycardia, and Bradyarrhythmias.</p>',
    mcqs: [
      {
        question: 'An 82-year-old female presents with palpitations. ECG demonstrates irregularly irregular rhythm without distinct P waves and a ventricular rate of 125 bpm. What tool is used to assess stroke risk?',
        options: [
          'CHA2DS2-VASc score',
          'HAS-BLED score',
          'WELLS score',
          'CURB-65 score',
          'TIMI risk score'
        ],
        correctOption: 0,
        explanation: 'The CHA2DS2-VASc score is used to assess thromboembolic stroke risk in Atrial Fibrillation to decide on oral anticoagulation.'
      },
      {
        question: 'A 65-year-old male with Atrial Fibrillation has a CHA2DS2-VASc score of 3. What is the recommended first-line anticoagulant in non-valvular AF?',
        options: [
          'Direct Oral Anticoagulant (DOAC) such as Apixaban or Rivaroxaban',
          'Aspirin 75mg daily',
          'Clopidogrel 75mg daily',
          'Warfarin with INR target 3.5-4.5',
          'Unfractionated Heparin infusion'
        ],
        correctOption: 0,
        explanation: 'DOACs (Apixaban, Edoxaban, Rivaroxaban, Dabigatran) are first-line over Warfarin for stroke prevention in non-valvular AF.'
      }
    ]
  },
  {
    title: '4. Valvular Heart Disease',
    order: 4,
    content: '<p>Aortic Stenosis, Mitral Regurgitation, Aortic Regurgitation, and Mitral Stenosis murmur characteristics and management.</p>',
    mcqs: [
      {
        question: 'An 80-year-old male presents with exertional syncope and dyspnoea. Auscultation reveals a crescendo-decrescendo ejection systolic murmur at the upper right sternal border radiating to the carotids. What is the most likely diagnosis?',
        options: [
          'Severe Aortic Stenosis',
          'Mitral Valve Prolapse',
          'Pulmonary Embolism',
          'Tricuspid Regurgitation',
          'Coarctation of the Aorta'
        ],
        correctOption: 0,
        explanation: 'Classical triad of Aortic Stenosis is Angina, Syncope, and Heart Failure. The crescendo-decrescendo ejection systolic murmur radiating to the carotids is diagnostic.'
      },
      {
        question: 'A 34-year-old female with history of rheumatic fever presents with dyspnoea. Auscultation reveals a mid-diastolic murmur with an opening snap at the apex. What valvular lesion is this?',
        options: [
          'Mitral Stenosis',
          'Aortic Regurgitation',
          'Mitral Regurgitation',
          'Pulmonary Stenosis',
          'Ventricular Septal Defect'
        ],
        correctOption: 0,
        explanation: 'Rheumatic heart disease is the primary cause of Mitral Stenosis, characterized by an opening snap followed by a mid-diastolic low-pitched rumbling murmur.'
      }
    ]
  },
  {
    title: '5. Hypertension & Hypertensive Emergencies',
    order: 5,
    content: '<p>NICE Hypertension management flowchart, Stage 1/2/3 criteria, secondary hypertension, and malignant hypertension.</p>',
    mcqs: [
      {
        question: 'A 45-year-old Afro-Caribbean male with no co-morbidities has clinic blood pressure of 152/96 mmHg (confirmed on ABPM as 148/92 mmHg). What is the appropriate initial antihypertensive therapy under NICE guidelines?',
        options: [
          'Calcium Channel Blocker (e.g. Amlodipine 5mg)',
          'ACE Inhibitor (e.g. Lisinopril 10mg)',
          'Beta Blocker (e.g. Atenolol 50mg)',
          'Loop Diuretic (e.g. Furosemide 40mg)',
          'Alpha Blocker (e.g. Doxazosin 1mg)'
        ],
        correctOption: 0,
        explanation: 'For patients aged <55 years of Black African or African-Caribbean family origin, first-line antihypertensive therapy is a Calcium Channel Blocker (CCB).'
      },
      {
        question: 'A 50-year-old Caucasian female with Type 2 Diabetes mellitus is diagnosed with Stage 1 Hypertension. What is the first-line medication?',
        options: [
          'ACE Inhibitor or ARB',
          'Calcium Channel Blocker',
          'Thiazide-like Diuretic',
          'Beta-blocker',
          'Spironolactone'
        ],
        correctOption: 0,
        explanation: 'For any patient with Type 2 Diabetes (regardless of age or ethnicity), an ACE inhibitor or ARB is first-line antihypertensive treatment to protect renal function.'
      }
    ]
  },
  {
    title: '6. Pericardial Diseases & Myocarditis',
    order: 6,
    content: '<p>Acute Pericarditis, Cardiac Tamponade, Constrictive Pericarditis, and Viral Myocarditis.</p>',
    mcqs: [
      {
        question: 'A 28-year-old male presents with sharp chest pain that worsens on lying flat and improves when leaning forward. ECG shows widespread saddle-shaped ST-elevation and PR depression. What is the first-line therapy?',
        options: [
          'NSAID (e.g., Ibuprofen) + Colchicine',
          'Urgent Thrombolysis',
          'Sublingual Nitrates',
          'High-dose Steroids alone',
          'Immediate Pericardiocentesis'
        ],
        correctOption: 0,
        explanation: 'Acute pericarditis is treated first-line with NSAIDs plus Colchicine to reduce symptoms and prevent recurrence.'
      },
      {
        question: 'A patient with pericardial effusion develops hypotension, muffled heart sounds, and elevated JVP (Beck\'s triad). Pulsus paradoxus is present. What is the immediate life-saving procedure?',
        options: [
          'Emergency Pericardiocentesis',
          'IV Bolus Nitroglycerin',
          'Chest Tube Insertion',
          'High-dose Furosemide',
          'Intubation and PEEP'
        ],
        correctOption: 0,
        explanation: 'Beck\'s triad (hypotension, JVP elevation, muffled heart sounds) indicates Cardiac Tamponade. Emergency pericardiocentesis is life-saving.'
      }
    ]
  },
  {
    title: '7. Infective Endocarditis',
    order: 7,
    content: '<p>Modified Duke Criteria, Native vs Prosthetic valve endocarditis, IV drug use pathogens, and antibiotic regimens.</p>',
    mcqs: [
      {
        question: 'A 32-year-old IV drug user presents with fever, new pansystolic murmur at tricuspid area, and multiple pulmonary infiltrates on chest X-ray. What is the most common causative organism?',
        options: [
          'Staphylococcus aureus',
          'Streptococcus viridans',
          'Enterococcus faecalis',
          'Pseudomonas aeruginosa',
          'Candida albicans'
        ],
        correctOption: 0,
        explanation: 'Infective endocarditis in IV drug users primarily affects the tricuspid valve, and Staphylococcus aureus is the most common organism.'
      }
    ]
  },
  {
    title: '8. Adult Congenital Heart Disease',
    order: 8,
    content: '<p>ASD, VSD, Coarctation of Aorta, Tetralogy of Fallot, and Eisenmenger syndrome in adult practice.</p>',
    mcqs: [
      {
        question: 'A 24-year-old female presents with fixed split second heart sound (S2) and an ejection systolic murmur at the pulmonary area. Echocardiogram confirms an Atrial Septal Defect. What type of ASD is most common?',
        options: [
          'Ostium secundum',
          'Ostium primum',
          'Sinus venosus',
          'Coronary sinus defect',
          'Patent ductus arteriosus'
        ],
        correctOption: 0,
        explanation: 'Ostium secundum defect is the most common type of Atrial Septal Defect (70-80% of all ASDs).'
      }
    ]
  },
  {
    title: '9. Aortic & Peripheral Vascular Diseases',
    order: 9,
    content: '<p>Aortic Dissection, Abdominal Aortic Aneurysm (AAA) screening/repair criteria, and Peripheral Arterial Disease (PAD).</p>',
    mcqs: [
      {
        question: 'A 68-year-old hypertensive male presents with sudden-onset severe tearing chest pain radiating to the back between scapulae. CT Angiogram confirms Stanford Type A Aortic Dissection. What is the immediate treatment?',
        options: [
          'Emergency Surgical Repair + Blood pressure control (IV Labetalol)',
          'Conservative outpatient management',
          'Oral Aspirin and Ticagrelor',
          'Thrombolytic infusion',
          'Routine ultrasound follow-up'
        ],
        correctOption: 0,
        explanation: 'Stanford Type A dissection involves the ascending aorta and requires emergency surgical repair alongside IV beta-blockers (e.g. Labetalol) to control heart rate and BP.'
      }
    ]
  },
  {
    title: '10. Cardiac Pharmacology & Resuscitation',
    order: 10,
    content: '<p>ALS Algorithm, VF/pVT vs Asystole/PEA, Antiarrhythmics classification, and Digoxin toxicity.</p>',
    mcqs: [
      {
        question: 'During cardiac arrest resuscitation, the monitor shows Ventricular Fibrillation (VF). After delivering 3 shocks and 2 minutes of CPR, what drugs should be administered?',
        options: [
          'Adrenaline 1mg IV and Amiodarone 300mg IV',
          'Atropine 3mg IV',
          'Calcium Chloride 10ml IV',
          'Sodium Bicarbonate 50ml IV',
          'Adenosine 6mg rapid IV push'
        ],
        correctOption: 0,
        explanation: 'In shockable rhythms (VF/pVT), Adrenaline 1mg and Amiodarone 300mg are given after the 3rd shock according to Resuscitation Council UK (ALS) guidelines.'
      }
    ]
  }
];

const seedCardiology = async () => {
  try {
    await connectDB();
    console.log('🔌 Connected to database');

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    // Find or create Cardiology subject
    let cardiologySubject = await PlabTheorySubject.findOne({ name: /cardiology/i });
    if (!cardiologySubject) {
      cardiologySubject = new PlabTheorySubject({
        examType: 'PLAB_1',
        name: 'Cardiology',
        weightage: 'VERY HIGH WEIGHTAGE',
        weightageValue: 10,
        order: 2,
        color: '#0A2463',
        createdBy: adminUser._id
      });
      await cardiologySubject.save();
      console.log('✅ Created Cardiology Subject in PlabTheorySubject');
    }

    // Find or update Cardiology content in PlabTheoryContent
    let plabContent = await PlabTheoryContent.findOne({ subjectId: cardiologySubject._id });
    if (!plabContent) {
      plabContent = new PlabTheoryContent({
        examType: 'PLAB_1',
        subjectId: cardiologySubject._id,
        title: 'Cardiology Theory & MCQ Bank',
        description: 'Comprehensive Cardiology PLAB-1 High-Yield Theory and Section-Based MCQ Practice.',
        topics: cardiologyTopics,
        isPublished: true,
        createdBy: adminUser._id
      });
    } else {
      plabContent.title = 'Cardiology Theory & MCQ Bank';
      plabContent.description = 'Comprehensive Cardiology PLAB-1 High-Yield Theory and Section-Based MCQ Practice.';
      plabContent.topics = cardiologyTopics;
      plabContent.isPublished = true;
      plabContent.updatedBy = adminUser._id;
    }

    await plabContent.save();
    console.log(`🎉 Successfully seeded Cardiology with ${cardiologyTopics.length} sections and MCQs!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Cardiology MCQs:', error);
    process.exit(1);
  }
};

seedCardiology();
