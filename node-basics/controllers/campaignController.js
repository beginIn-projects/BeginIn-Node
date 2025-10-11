const Campaign = require("../models/Campaign");

exports.createCampaign = async (req, res) => {
  try {
    const brandId = req.user._id; // from auth middleware
    const { title, description, budget, currency, deliverables } = req.body;
    if (!title || !budget) {
      return res.status(400).json({ success: false, message: "Title and budget are required" });
    }
    const images = [];
    if (req.files) {
      req.files.forEach(file => {
        const base64 = file.buffer.toString("base64");
        const mimeType = file.mimetype;
        images.push(`data:${mimeType};base64,${base64}`);
      });
    }
    // Parse deliverables JSON (if provided)
    let parsedDeliverables = [];
    if (deliverables) {
      parsedDeliverables = typeof deliverables === "string" ? JSON.parse(deliverables) : deliverables;
    }

    const campaign = await Campaign.create({
      brandId,
      title,
      description,
      budget,
      currency: currency || "USD",
      deliverables: parsedDeliverables,
      images,
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ single campaign
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("brandId", "companyName email");
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("brandId", "companyName email")  // optional
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (err) {
    console.error("getAllCampaigns error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// UPDATE campaign (only by the brand who owns it)
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, brandId: req.user._id });
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found or not yours" });

    const updates = ["title", "description", "budget", "currency", "status"];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });

    // Replace deliverables if new provided
    if (req.body.deliverables) {
      campaign.deliverables = typeof req.body.deliverables === "string"
        ? JSON.parse(req.body.deliverables)
        : req.body.deliverables;
    }

    // Add new images (append)
    if (req.files) {
      req.files.forEach(file => {
        const base64 = file.buffer.toString("base64");
        const mimeType = file.mimetype;
        campaign.images.push(`data:${mimeType};base64,${base64}`);
      });
    }

    await campaign.save();
    res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, brandId: req.user._id });
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found or not yours" });

    res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
