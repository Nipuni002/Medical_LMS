const mongoose = require('mongoose');

const usmleTheoryContentSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UsmleSubject',
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
    description: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    videoLink: {
      type: String,
      trim: true
    },
    videoLinks: [{
      type: String,
      trim: true
    }],
    pdfUrl: {
      type: String,
      trim: true,
      default: ''
    },
    pdfs: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true
      }
    }],
    order: {
      type: Number,
      default: 0
    },
    mcqs: [{
      question: {
        type: String,
        required: true,
        trim: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctOption: {
        type: Number,
        default: 0
      },
      explanation: {
        type: String,
        default: ''
      }
    }],
    mcqSections: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      mcqs: [{
        question: {
          type: String,
          required: true,
          trim: true
        },
        options: [{
          type: String,
          required: true
        }],
        correctOption: {
          type: Number,
          default: 0
        },
        explanation: {
          type: String,
          default: ''
        }
      }]
    }]
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

usmleTheoryContentSchema.index({ subjectId: 1 });
usmleTheoryContentSchema.index({ isPublished: 1 });

module.exports = mongoose.model('UsmleTheoryContent', usmleTheoryContentSchema);