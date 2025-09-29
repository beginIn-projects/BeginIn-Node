// controllers/adminInfluencerController.js
const Influencer = require("../models/influencer");
exports.getPendingInfluencers = async (req, res) => {
  try {
    const pending = await Influencer.find({ status: "pending_verification" });
    return res.status(200).json({ success: true, data: pending });
  } catch (err) {
    console.error("getPendingInfluencers error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateInfluencerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const influencer = await Influencer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!influencer) {
      return res.status(404).json({ success: false, message: "Influencer not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Influencer ${status}`,
      data: influencer
    });
  } catch (err) {
    console.error("updateInfluencerStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
