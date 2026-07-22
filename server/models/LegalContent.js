const mongoose = require('mongoose');

const legalContentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      enum: ['disclaimer', 'privacy-policy', 'terms-of-service'],
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    lastUpdated: {
      type: String,
      required: true,
      default: () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LegalContent', legalContentSchema);
