const mongoose = require('mongoose');

const plabTestQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    options: [
      {
        key: {
          type: String,
          required: true,
          enum: ['A', 'B', 'C', 'D', 'E']
        },
        text: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    correctOption: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D', 'E']
    },
    explanation: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    examDay: {
      type: String,
      enum: ['DAY_1', 'DAY_2'],
      default: 'DAY_1'
    },
    blockNumber: {
      type: Number,
      min: 1,
      max: 8,
      default: 1
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

const plabTestSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    default: 'plab1-sba',
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Revision questions'
  },
  instructions: {
    type: String,
    required: true,
    default:
      'Tick the most appropriate answer. Each question has 1 minute to answer. When time expires question page automatically goes to review page.'
  },
  questionTimeSeconds: {
    type: Number,
    default: 60,
    min: 15,
    // increase maximum to allow longer station durations (e.g., 600s = 10 minutes)
    max: 3600
  },
  questions: {
    type: [plabTestQuestionSchema],
    default: []
  },
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

plabTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  if (Array.isArray(this.questions)) {
    this.questions = this.questions
      .map((question, index) => ({
        ...question.toObject?.() || question,
        examDay: ['DAY_1', 'DAY_2'].includes(question.examDay) ? question.examDay : 'DAY_1',
        blockNumber: Number.isFinite(Number(question.blockNumber)) ? Number(question.blockNumber) : 1,
        order: typeof question.order === 'number' ? question.order : index + 1
      }))
      .sort((a, b) => {
        if (a.examDay !== b.examDay) {
          return a.examDay === 'DAY_1' ? -1 : 1;
        }
        if (a.blockNumber !== b.blockNumber) {
          return a.blockNumber - b.blockNumber;
        }
        return a.order - b.order;
      });
  }

  next();
});

module.exports = mongoose.model('PlabTest', plabTestSchema);
