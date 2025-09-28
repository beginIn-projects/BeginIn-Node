// models/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // one brand profile per user
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', brandSchema);
