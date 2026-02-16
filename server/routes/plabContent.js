const express = require('express');
const router = express.Router();
const PlabContent = require('../models/PlabContent');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/plab-content
// @desc    Get all PLAB content pages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await PlabContent.find({ isPublished: true })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/plab-content/:pageType
// @desc    Get PLAB content by page type
// @access  Public
router.get('/:pageType', async (req, res) => {
  try {
    const content = await PlabContent.findOne({ 
      pageType: req.params.pageType,
      isPublished: true 
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
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

// @route   POST /api/plab-content
// @desc    Create new PLAB content
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Add the user ID as createdBy
    req.body.createdBy = req.user.id;

    const content = await PlabContent.create(req.body);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    // Handle duplicate pageType error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Content for this page type already exists. Use update instead.'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/plab-content/:id
// @desc    Update PLAB content
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Add the user ID as updatedBy
    req.body.updatedBy = req.user.id;

    const content = await PlabContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
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

// @route   PUT /api/plab-content/page/:pageType
// @desc    Update PLAB content by page type
// @access  Private/Admin
router.put('/page/:pageType', protect, authorize('admin'), async (req, res) => {
  try {
    // Add the user ID as updatedBy
    req.body.updatedBy = req.user.id;

    const content = await PlabContent.findOneAndUpdate(
      { pageType: req.params.pageType },
      req.body,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
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

// @route   DELETE /api/plab-content/:id
// @desc    Delete PLAB content
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await PlabContent.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/plab-content/admin/all
// @desc    Get all PLAB content including unpublished (Admin only)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await PlabContent.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/plab-content/:id/publish
// @desc    Toggle publish status
// @access  Private/Admin
router.patch('/:id/publish', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await PlabContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    content.isPublished = !content.isPublished;
    content.updatedBy = req.user.id;
    await content.save();

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

module.exports = router;
