const express = require('express');
const router = express.Router();
const AboutContent = require('../models/AboutContent');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/about-content/home-about
// @desc    Get published About Us content for home page
// @access  Public
router.get('/home-about', async (req, res) => {
  try {
    const content = await AboutContent.findOne({
      pageType: 'home-about',
      isPublished: true
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'About Us content not found'
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

// @route   GET /api/about-content/admin/home-about
// @desc    Get About Us content for admin (published/unpublished)
// @access  Private/Admin
router.get('/admin/home-about', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await AboutContent.findOne({ pageType: 'home-about' })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'About Us content not found'
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

// @route   POST /api/about-content
// @desc    Create About Us content
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const payload = {
      ...req.body,
      pageType: 'home-about',
      createdBy: req.user.id
    };

    const content = await AboutContent.create(payload);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'About Us content already exists. Use update instead.'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/about-content/:id
// @desc    Update About Us content
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const payload = {
      ...req.body,
      pageType: 'home-about',
      updatedBy: req.user.id
    };

    const content = await AboutContent.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'About Us content not found'
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
