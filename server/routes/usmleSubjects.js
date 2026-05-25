const express = require('express');
const router = express.Router();
const UsmleSubject = require('../models/UsmleSubject');
const { protect } = require('../middleware/auth');

const VALID_STEPS = ['STEP_1', 'STEP_2', 'STEP_3'];
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

// @route   GET /api/usmle-subjects
// @desc    Get USMLE subjects (optionally filtered by step)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.step) {
      if (!VALID_STEPS.includes(req.query.step)) {
        return res.status(400).json({ message: 'Invalid step value' });
      }
      query.step = req.query.step;
    }

    const subjects = await UsmleSubject.find(query)
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
    console.error('Error fetching USMLE subjects:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/usmle-subjects
// @desc    Create a new USMLE subject
// @access  Private (Admin only)
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

    const existingSubject = await UsmleSubject.findOne({
      step,
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    });

    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists for this step' });
    }

    const subject = new UsmleSubject({
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
    console.error('Error creating USMLE subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/usmle-subjects/:id
// @desc    Update a USMLE subject
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, step, order, isActive, weightage } = req.body;
    const subject = await UsmleSubject.findById(req.params.id);

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

    const duplicate = await UsmleSubject.findOne({
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
    console.error('Error updating USMLE subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/usmle-subjects/:id
// @desc    Delete a USMLE subject
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const subject = await UsmleSubject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await UsmleSubject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting USMLE subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;