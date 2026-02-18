const mongoose = require('mongoose');

const plabTheorySubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  weightage: {
    type: String,
    required: true,
    enum: ['VERY HIGH WEIGHTAGE', 'HIGH WEIGHTAGE', 'MODERATE WEIGHTAGE', 'LOW WEIGHTAGE']
  },
  weightageValue: {
    type: Number,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#8B2C8B' // Purple color
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

// Index for faster queries
plabTheorySubjectSchema.index({ weightage: 1, order: 1 });

module.exports = mongoose.model('PlabTheorySubject', plabTheorySubjectSchema);
