const mongoose = require('mongoose');

const usmleIntroductionContentSchema = new mongoose.Schema({
  step: {
    type: String,
    enum: ['STEP_1'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  sections: [{
    heading: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
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

usmleIntroductionContentSchema.index({ step: 1 }, { unique: true });
usmleIntroductionContentSchema.index({ isPublished: 1 });

module.exports = mongoose.model('UsmleIntroductionContent', usmleIntroductionContentSchema);