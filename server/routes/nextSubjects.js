const express = require('express');
const router = express.Router();
const NextSubject = require('../models/NextSubject');
const { protect } = require('../middleware/auth');

const VALID_STEPS = ['STEP_1', 'STEP_2'];
const WEIGHTAGE_VALUE_MAP = {
  'VERY HIGH WEIGHTAGE': 10,
  'HIGH WEIGHTAGE': 8,
  'MODERATE WEIGHTAGE': 5,
  'LOW WEIGHTAGE': 4
};
const WEIGHTAGE_COLOR_MAP = {
  'VERY HIGH WEIGHTAGE': '#1d4ed8',
  'HIGH WEIGHTAGE': '#f97316',
  'MODERATE WEIGHTAGE': '#16a34a',
  'LOW WEIGHTAGE': '#7c3aed'
};
const VALID_WEIGHTAGES = Object.keys(WEIGHTAGE_VALUE_MAP);

router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.step) {
      if (!VALID_STEPS.includes(req.query.step)) {
        return res.status(400).json({ message: 'Invalid step value' });
      }
      query.step = req.query.step;
    }

    const subjects = await NextSubject.find(query)
      .sort({ step: 1, weightageValue: -1, order: 1, name: 1 })
      .select('-createdBy -updatedBy');

    const normalizedSubjects = subjects.map((subject) => {
      const safeWeightage = VALID_WEIGHTAGES.includes(subject.weightage)
        ? subject.weightage
        : 'MODERATE WEIGHTAGE';

      return {
        ...subject.toObject(),
        weightage: safeWeightage,
        weightageValue: WEIGHTAGE_VALUE_MAP[safeWeightage],
        color: WEIGHTAGE_COLOR_MAP[safeWeightage]
      };
    });

    res.json(normalizedSubjects);
  } catch (err) {
    console.error('Error fetching NExT subjects:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, step, order, weightage } = req.body;

    if (!name || !step) {
      return res.status(400).json({ message: 'Name and step are required' });
    }

    if (!VALID_STEPS.includes(step)) {
      return res.status(400).json({ message: 'Invalid step value' });
    }

    if (weightage && !VALID_WEIGHTAGES.includes(weightage)) {
      return res.status(400).json({ message: 'Invalid weightage value' });
    }

    const resolvedWeightage = weightage || 'MODERATE WEIGHTAGE';
    const resolvedWeightageValue = WEIGHTAGE_VALUE_MAP[resolvedWeightage];
    const resolvedColor = WEIGHTAGE_COLOR_MAP[resolvedWeightage];

    const existingSubject = await NextSubject.findOne({
      step,
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    });

    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists for this step' });
    }

    const subject = new NextSubject({
      name: name.trim(),
      step,
      weightage: resolvedWeightage,
      weightageValue: resolvedWeightageValue,
      order: order || 0,
      color: resolvedColor,
      createdBy: req.user.id
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.error('Error creating NExT subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { name, step, order, isActive, weightage } = req.body;
    const subject = await NextSubject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (step !== undefined && !VALID_STEPS.includes(step)) {
      return res.status(400).json({ message: 'Invalid step value' });
    }

    if (weightage !== undefined && !VALID_WEIGHTAGES.includes(weightage)) {
      return res.status(400).json({ message: 'Invalid weightage value' });
    }

    const targetStep = step !== undefined ? step : subject.step;
    const targetName = name !== undefined ? name.trim() : subject.name;
    const resolvedWeightage = weightage !== undefined ? weightage : (subject.weightage || 'MODERATE WEIGHTAGE');

    const duplicate = await NextSubject.findOne({
      _id: { $ne: subject._id },
      step: targetStep,
      name: { $regex: `^${targetName}$`, $options: 'i' }
    });

    if (duplicate) {
      return res.status(400).json({ message: 'Subject already exists for this step' });
    }

    if (name !== undefined) subject.name = targetName;
    if (step !== undefined) subject.step = step;
    subject.weightage = resolvedWeightage;
    subject.weightageValue = WEIGHTAGE_VALUE_MAP[resolvedWeightage];
    subject.color = WEIGHTAGE_COLOR_MAP[resolvedWeightage];
    if (order !== undefined) subject.order = order;
    if (isActive !== undefined) subject.isActive = isActive;
    subject.updatedBy = req.user.id;

    await subject.save();
    res.json(subject);
  } catch (err) {
    console.error('Error updating NExT subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const subject = await NextSubject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await NextSubject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting NExT subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
