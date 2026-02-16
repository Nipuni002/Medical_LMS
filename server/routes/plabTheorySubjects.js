const express = require('express');
const router = express.Router();
const PlabTheorySubject = require('../models/PlabTheorySubject');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/plab-theory-subjects
// @desc    Get all PLAB theory subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const subjects = await PlabTheorySubject.find({ isActive: true })
      .sort({ weightageValue: -1, order: 1 })
      .select('-createdBy -updatedBy');
    
    res.json(subjects);
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
    const { name, weightage, weightageValue, order, color } = req.body;

    // Validate required fields
    if (!name || !weightage || !weightageValue) {
      return res.status(400).json({ message: 'Name, weightage, and weightageValue are required' });
    }

    const subject = new PlabTheorySubject({
      name,
      weightage,
      weightageValue,
      order: order || 0,
      color: color || '#8B2C8B',
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
    const { name, weightage, weightageValue, order, color, isActive } = req.body;

    const subject = await PlabTheorySubject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Update fields
    if (name !== undefined) subject.name = name;
    if (weightage !== undefined) subject.weightage = weightage;
    if (weightageValue !== undefined) subject.weightageValue = weightageValue;
    if (order !== undefined) subject.order = order;
    if (color !== undefined) subject.color = color;
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
