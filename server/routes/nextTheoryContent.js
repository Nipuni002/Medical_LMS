const express = require('express');
const router = express.Router();
const NextTheoryContent = require('../models/NextTheoryContent');
const NextSubject = require('../models/NextSubject');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const content = await NextTheoryContent.find({ isPublished: true })
      .populate('subjectId', 'name step color weightage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching NExT theory content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/subject/:subjectId', async (req, res) => {
  try {
    const content = await NextTheoryContent.findOne({
      subjectId: req.params.subjectId,
      isPublished: true
    }).populate('subjectId', 'name step color weightage');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching NExT subject content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const content = await NextTheoryContent.findById(req.params.id)
      .populate('subjectId', 'name step color weightage');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('Error fetching NExT content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { subjectId, title, description, topics, isPublished } = req.body;

    if (!subjectId || !title) {
      return res.status(400).json({ success: false, message: 'Subject ID and title are required' });
    }

    const subject = await NextSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const existingContent = await NextTheoryContent.findOne({ subjectId });
    if (existingContent) {
      return res.status(400).json({ success: false, message: 'Content already exists for this subject' });
    }

    const content = new NextTheoryContent({
      subjectId,
      title,
      description: description || '',
      topics: topics || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user.id
    });

    await content.save();

    const populatedContent = await NextTheoryContent.findById(content._id)
      .populate('subjectId', 'name step color weightage');

    res.status(201).json({ success: true, data: populatedContent });
  } catch (err) {
    console.error('Error creating NExT content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, topics, isPublished } = req.body;

    const content = await NextTheoryContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    if (title !== undefined) content.title = title;
    if (description !== undefined) content.description = description;
    if (topics !== undefined) content.topics = topics;
    if (isPublished !== undefined) content.isPublished = isPublished;
    content.updatedBy = req.user.id;

    await content.save();

    const populatedContent = await NextTheoryContent.findById(content._id)
      .populate('subjectId', 'name step color weightage');

    res.json({ success: true, data: populatedContent });
  } catch (err) {
    console.error('Error updating NExT content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const content = await NextTheoryContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await NextTheoryContent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (err) {
    console.error('Error deleting NExT content:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
