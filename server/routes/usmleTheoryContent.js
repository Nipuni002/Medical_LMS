const express = require('express');
const router = express.Router();
const UsmleTheoryContent = require('../models/UsmleTheoryContent');
const UsmleSubject = require('../models/UsmleSubject');
const { protect } = require('../middleware/auth');

// @route   GET /api/usmle-theory-content
// @desc    Get all USMLE theory content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await UsmleTheoryContent.find({ isPublished: true })
      .populate('subjectId', 'name step color weightage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching USMLE theory content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/usmle-theory-content/subject/:subjectId
// @desc    Get content for a specific USMLE subject
// @access  Public
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const content = await UsmleTheoryContent.findOne({
      subjectId: req.params.subjectId,
      isPublished: true
    }).populate('subjectId', 'name step color weightage');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching USMLE subject content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/usmle-theory-content/:id
// @desc    Get single USMLE theory content by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const content = await UsmleTheoryContent.findById(req.params.id)
      .populate('subjectId', 'name step color weightage');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching USMLE content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/usmle-theory-content
// @desc    Create new USMLE theory content
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { subjectId, title, description, topics, isPublished } = req.body;

    if (!subjectId || !title) {
      return res.status(400).json({ success: false, message: 'Subject ID and title are required' });
    }

    const subject = await UsmleSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const existingContent = await UsmleTheoryContent.findOne({ subjectId });
    if (existingContent) {
      return res.status(400).json({ success: false, message: 'Content already exists for this subject' });
    }

    const content = new UsmleTheoryContent({
      subjectId,
      title,
      description: description || '',
      topics: topics || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user.id
    });

    await content.save();

    const populatedContent = await UsmleTheoryContent.findById(content._id)
      .populate('subjectId', 'name step color weightage');

    res.status(201).json({ success: true, data: populatedContent });
  } catch (err) {
    console.error('Error creating USMLE content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/usmle-theory-content/:id
// @desc    Update USMLE theory content
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, topics, isPublished } = req.body;

    const content = await UsmleTheoryContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    if (title !== undefined) content.title = title;
    if (description !== undefined) content.description = description;
    if (topics !== undefined) content.topics = topics;
    if (isPublished !== undefined) content.isPublished = isPublished;
    content.updatedBy = req.user.id;

    await content.save();

    const populatedContent = await UsmleTheoryContent.findById(content._id)
      .populate('subjectId', 'name step color weightage');

    res.json({ success: true, data: populatedContent });
  } catch (err) {
    console.error('Error updating USMLE content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/usmle-theory-content/:id
// @desc    Delete USMLE theory content
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const content = await UsmleTheoryContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await UsmleTheoryContent.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (err) {
    console.error('Error deleting USMLE content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;