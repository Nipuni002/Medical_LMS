const mongoose = require('mongoose');

const nextSubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  step: {
    type: String,
    enum: ['STEP_1', 'STEP_2'],
    required: true
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
  color: {
    type: String,
    default: '#1d4ed8'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

nextSubjectSchema.index({ step: 1, weightageValue: -1, order: 1, name: 1 });
nextSubjectSchema.index({ isActive: 1 });

module.exports = mongoose.model('NextSubject', nextSubjectSchema);
