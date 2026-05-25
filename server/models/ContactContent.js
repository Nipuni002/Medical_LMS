const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const contactContentSchema = new mongoose.Schema(
  {
    pageType: {
      type: String,
      required: true,
      enum: ['home-contact'],
      default: 'home-contact',
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Contact Us'
    },
    subtitle: {
      type: String,
      trim: true,
      default: 'Access free medical education resources and support'
    },
    supportHeading: {
      type: String,
      trim: true,
      default: 'Educational Support'
    },
    supportEmail: {
      type: String,
      trim: true,
      default: 'education@enhancemedical.com'
    },
    freeResources: {
      type: [resourceSchema],
      default: []
    },
    faqs: {
      type: [faqSchema],
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ContactContent', contactContentSchema);
