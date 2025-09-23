const mongoose = require('mongoose');
const influencerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one influencer profile per user
    },
    name: {
      type: String,
      trim: true,
    },
    niche: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
        /^[\w.-]+@[\w.-]+\.\w{2,}$/,
        'Please provide a valid email'
    ]
    },
    phone: {
    type: String,
    trim: true,
    match: [
        /^[+]?[\d\s-()]{10,15}$/,
        'Please provide a valid phone number'
    ]
    },
    city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
    },
    socialAccounts: {
      instagram: {
        username: { type: String, trim: true },
        profileUrl: { type: String, trim: true },
      },
    },
    status: {
      type: String,
      enum: ['pending_verification', 'approved', 'rejected'],
      default: 'pending_verification',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Influencer', influencerSchema);
