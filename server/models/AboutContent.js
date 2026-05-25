const mongoose = require('mongoose');

const aboutSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true
    },
    content: {
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

const aboutContentSchema = new mongoose.Schema(
  {
    pageType: {
      type: String,
      required: true,
      enum: ['home-about'],
      default: 'home-about',
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'About us'
    },
    sections: {
      type: [aboutSectionSchema],
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

module.exports = mongoose.model('AboutContent', aboutContentSchema);
