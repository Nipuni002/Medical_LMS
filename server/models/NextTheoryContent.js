const mongoose = require('mongoose');

const nextTheoryContentSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NextSubject',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  topics: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    videoLink: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

nextTheoryContentSchema.index({ subjectId: 1 });
nextTheoryContentSchema.index({ isPublished: 1 });

module.exports = mongoose.model('NextTheoryContent', nextTheoryContentSchema);
