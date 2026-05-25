const express = require('express');
const router = express.Router();
const ContactContent = require('../models/ContactContent');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/contact-content/home-contact
// @desc    Get published Contact Us content for home page
// @access  Public
router.get('/home-contact', async (req, res) => {
  try {
    const content = await ContactContent.findOne({
      pageType: 'home-contact',
      isPublished: true
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Contact Us content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/contact-content/admin/home-contact
// @desc    Get Contact Us content for admin
// @access  Private/Admin
router.get('/admin/home-contact', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await ContactContent.findOne({ pageType: 'home-contact' })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Contact Us content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/contact-content
// @desc    Create Contact Us content
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const payload = {
      ...req.body,
      pageType: 'home-contact',
      createdBy: req.user.id
    };

    const content = await ContactContent.create(payload);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Contact Us content already exists. Use update instead.'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/contact-content/:id
// @desc    Update Contact Us content
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const payload = {
      ...req.body,
      pageType: 'home-contact',
      updatedBy: req.user.id
    };

    const content = await ContactContent.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Contact Us content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
