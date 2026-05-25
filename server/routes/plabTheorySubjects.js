const express = require('express');
const router = express.Router();
const PlabTheorySubject = require('../models/PlabTheorySubject');
const { protect, authorize } = require('../middleware/auth');

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
const VALID_EXAM_TYPES = ['PLAB_1', 'PLAB_2'];

const normalizeExamType = (examType) => {
  if (!examType) return 'PLAB_1';
  return examType === 'PLAB_2' ? 'PLAB_2' : 'PLAB_1';
};

const getExamFilter = (examType) => {
  if (examType === 'PLAB_2') {
    return { examType: 'PLAB_2' };
  }

  // Keep older PLAB-1 records (without examType field) visible.
  return {
    $or: [
      { examType: 'PLAB_1' },
      { examType: { $exists: false } }
    ]
  };
};

// @route   GET /api/plab-theory-subjects
// @desc    Get all PLAB theory subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const examType = normalizeExamType(req.query.exam);
    const subjects = await PlabTheorySubject.find({
      isActive: true,
      ...getExamFilter(examType)
    })
      .sort({ weightageValue: -1, order: 1 })
      .select('-createdBy -updatedBy');

    const normalizedSubjects = subjects.map((subject) => {
      const safeWeightage = VALID_WEIGHTAGES.includes(subject.weightage)
        ? subject.weightage
        : 'MODERATE WEIGHTAGE';

      return {
        ...subject.toObject(),
        examType: subject.examType || 'PLAB_1',
        weightage: safeWeightage,
        weightageValue: WEIGHTAGE_VALUE_MAP[safeWeightage],
        color: WEIGHTAGE_COLOR_MAP[safeWeightage]
      };
    });

    res.json(normalizedSubjects);
  } catch (err) {
    console.error('Error fetching subjects:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/plab-theory-subjects
// @desc    Create a new PLAB theory subject
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { name, weightage, order } = req.body;
    const examType = normalizeExamType(req.body.examType);

    // Validate required fields
    if (!name || !weightage) {
      return res.status(400).json({ message: 'Name and weightage are required' });
    }

    if (!VALID_WEIGHTAGES.includes(weightage)) {
      return res.status(400).json({ message: 'Invalid weightage value' });
    }

    const subject = new PlabTheorySubject({
      examType,
      name,
      weightage,
      weightageValue: WEIGHTAGE_VALUE_MAP[weightage],
      order: order || 0,
      color: WEIGHTAGE_COLOR_MAP[weightage],
      createdBy: req.user.id
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.error('Error creating subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/plab-theory-subjects/:id
// @desc    Update a PLAB theory subject
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, weightage, order, isActive } = req.body;

    const subject = await PlabTheorySubject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (weightage !== undefined && !VALID_WEIGHTAGES.includes(weightage)) {
      return res.status(400).json({ message: 'Invalid weightage value' });
    }

    if (req.body.examType !== undefined && !VALID_EXAM_TYPES.includes(req.body.examType)) {
      return res.status(400).json({ message: 'Invalid exam type' });
    }

    const resolvedWeightage = weightage !== undefined ? weightage : (subject.weightage || 'MODERATE WEIGHTAGE');

    // Update fields
    if (name !== undefined) subject.name = name;
    if (req.body.examType !== undefined) subject.examType = req.body.examType;
    subject.weightage = resolvedWeightage;
    subject.weightageValue = WEIGHTAGE_VALUE_MAP[resolvedWeightage];
    subject.color = WEIGHTAGE_COLOR_MAP[resolvedWeightage];
    if (order !== undefined) subject.order = order;
    if (isActive !== undefined) subject.isActive = isActive;
    subject.updatedBy = req.user.id;

    await subject.save();
    res.json(subject);
  } catch (err) {
    console.error('Error updating subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/plab-theory-subjects/:id
// @desc    Delete a PLAB theory subject
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const subject = await PlabTheorySubject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await PlabTheorySubject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting subject:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
