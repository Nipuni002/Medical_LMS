const express = require('express');
const router = express.Router();
const UsmleIntroductionContent = require('../models/UsmleIntroductionContent');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/usmle-introduction-content/step1
// @desc    Get published USMLE Step 1 introduction content
// @access  Public
router.get('/step1', async (req, res) => {
  try {
    const content = await UsmleIntroductionContent.findOne({
      step: 'STEP_1',
      isPublished: true
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'USMLE Step 1 introduction content not found'
      });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching USMLE introduction content:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/usmle-introduction-content/admin/step1
// @desc    Get USMLE Step 1 introduction content (including unpublished)
// @access  Private/Admin
router.get('/admin/step1', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await UsmleIntroductionContent.findOne({ step: 'STEP_1' });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'USMLE Step 1 introduction content not found'
      });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching USMLE introduction content for admin:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/usmle-introduction-content/step1
// @desc    Create or update USMLE Step 1 introduction content
// @access  Private/Admin
router.put('/step1', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, subtitle, sections, isPublished } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const normalizedSections = Array.isArray(sections)
      ? sections.map((section, index) => ({
          heading: section.heading,
          content: section.content,
          order: Number.isFinite(Number(section.order)) ? Number(section.order) : index + 1
        }))
      : [];

    const updatePayload = {
      step: 'STEP_1',
      title: title.trim(),
      subtitle: subtitle || '',
      sections: normalizedSections,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      updatedBy: req.user.id
    };

    const existing = await UsmleIntroductionContent.findOne({ step: 'STEP_1' });
    if (!existing) {
      updatePayload.createdBy = req.user.id;
    }

    const content = await UsmleIntroductionContent.findOneAndUpdate(
      { step: 'STEP_1' },
      updatePayload,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error saving USMLE introduction content:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;