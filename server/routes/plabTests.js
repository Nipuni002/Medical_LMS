const express = require('express');
const router = express.Router();
const PlabTest = require('../models/PlabTest');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/plab-tests/admin/:slug
// @desc    Get PLAB test by slug including unpublished
// @access  Private/Admin
router.get('/admin/:slug', protect, authorize('admin'), async (req, res) => {
  try {
    const test = await PlabTest.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/plab-tests/:slug
// @desc    Get published PLAB test by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const test = await PlabTest.findOne({ slug: req.params.slug, isPublished: true })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/plab-tests
// @desc    Create PLAB test
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const test = await PlabTest.create(req.body);

    res.status(201).json({
      success: true,
      data: test
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Test for this slug already exists. Use update instead.'
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/plab-tests/:id
// @desc    Update PLAB test by id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    req.body.updatedBy = req.user.id;

    const test = await PlabTest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PATCH /api/plab-tests/:id/publish
// @desc    Toggle publish status
// @access  Private/Admin
router.patch('/:id/publish', protect, authorize('admin'), async (req, res) => {
  try {
    const test = await PlabTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    test.isPublished = !test.isPublished;
    test.updatedBy = req.user.id;
    await test.save();

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
