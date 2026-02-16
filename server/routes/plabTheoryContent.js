const express = require('express');
const router = express.Router();
const PlabTheoryContent = require('../models/PlabTheoryContent');
const PlabTheorySubject = require('../models/PlabTheorySubject');
const { protect } = require('../middleware/auth');

// @route   GET /api/plab-theory-content
// @desc    Get all theory content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await PlabTheoryContent.find({ isPublished: true })
      .populate('subjectId', 'name weightage color')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching theory content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/plab-theory-content/subject/:subjectId
// @desc    Get content for a specific subject
// @access  Public
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const content = await PlabTheoryContent.findOne({ 
      subjectId: req.params.subjectId,
      isPublished: true 
    }).populate('subjectId', 'name weightage color weightageValue');
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching subject content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/plab-theory-content/:id
// @desc    Get single theory content by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const content = await PlabTheoryContent.findById(req.params.id)
      .populate('subjectId', 'name weightage color');
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/plab-theory-content
// @desc    Create new theory content
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { subjectId, title, description, topics, isPublished } = req.body;

    // Validate required fields
    if (!subjectId || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject ID and title are required' 
      });
    }

    // Check if subject exists
    const subject = await PlabTheorySubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subject not found' 
      });
    }

    // Check if content already exists for this subject
    const existingContent = await PlabTheoryContent.findOne({ subjectId });
    if (existingContent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content already exists for this subject' 
      });
    }

    const content = new PlabTheoryContent({
      subjectId,
      title,
      description: description || '',
      topics: topics || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user.id
    });

    await content.save();
    
    const populatedContent = await PlabTheoryContent.findById(content._id)
      .populate('subjectId', 'name weightage color');
    
    res.status(201).json({ 
      success: true, 
      data: populatedContent 
    });
  } catch (err) {
    console.error('Error creating content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/plab-theory-content/:id
// @desc    Update theory content
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, topics, isPublished } = req.body;

    const content = await PlabTheoryContent.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }

    // Update fields
    if (title !== undefined) content.title = title;
    if (description !== undefined) content.description = description;
    if (topics !== undefined) content.topics = topics;
    if (isPublished !== undefined) content.isPublished = isPublished;
    content.updatedBy = req.user.id;

    await content.save();
    
    const populatedContent = await PlabTheoryContent.findById(content._id)
      .populate('subjectId', 'name weightage color');
    
    res.json({ 
      success: true, 
      data: populatedContent 
    });
  } catch (err) {
    console.error('Error updating content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/plab-theory-content/:id
// @desc    Delete theory content
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const content = await PlabTheoryContent.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }

    await PlabTheoryContent.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Content deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
