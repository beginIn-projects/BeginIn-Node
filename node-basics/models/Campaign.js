const mongoose = require("mongoose");

const DeliverableSchema = new mongoose.Schema({
  platform: { type: String, enum: ["instagram", "youtube", "tiktok", "twitter"], required: true },
  description: { type: String, required: true },
  deadline: { type: Date }
});

const ProofSchema = new mongoose.Schema({
  url: String,
  uploadedAt: { type: Date, default: Date.now }
});

const CampaignSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true },
  description: { type: String },

  budget: { type: Number, required: true },
  currency: { type: String, default: "USD" },

  images: [String],   // <-- Base64 images stored here

  influencers: [{
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["invited", "accepted", "rejected", "completed"], default: "invited" },
    agreedAmount: Number,
    proofs: [ProofSchema]
  }],

  deliverables: [DeliverableSchema],

  status: {
    type: String,
    enum: ["open", "ongoing", "completed", "cancelled"],
    default: "open"
  },

}, { timestamps: true });

module.exports = mongoose.model("Campaign", CampaignSchema);
