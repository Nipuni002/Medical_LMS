const mongoose = require('mongoose');

const amcSubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  step: {
    type: String,
    required: true,
    enum: ['STEP_1', 'STEP_2']
  },
  weightage: {
    type: String,
    required: true,
    enum: ['VERY HIGH WEIGHTAGE', 'HIGH WEIGHTAGE', 'MODERATE WEIGHTAGE', 'LOW WEIGHTAGE'],
    default: 'MODERATE WEIGHTAGE'
  },
  weightageValue: {
    type: Number,
    required: true,
    default: 5
  },
  order: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#1d4ed8'
  },
  isActive: {
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

amcSubjectSchema.index({ step: 1, weightageValue: -1, order: 1, name: 1 });

module.exports = mongoose.model('AmcSubject', amcSubjectSchema);