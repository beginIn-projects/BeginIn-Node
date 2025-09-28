// controllers/brandController.js
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const User = require('../models/user'); // adjust path/casing if needed

// helper to get authenticated user id (flexible for different token shapes)
const getAuthUserId = (req) => {
  return (
    (req.user && (req.user.id || req.user._id || req.user.userId)) ||
    req.userId ||
    null
  );
};

// Optional role check helper
const ensureRole = (req, role) => {
  if (!req.user) return false;
  if (req.user.role) return req.user.role === role;
  return true; // if your token doesn't contain role, skip enforcement (or you can fetch User)
};

// POST /brand/onboard
exports.onboardBrand = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

   
    // Prevent duplicate
    const exists = await Brand.findOne({ userId: authUserId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Brand profile already exists. Use update endpoint.' });
    }

    const { companyName, website, industry } = req.body;
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'companyName is required' });
    }

    const brand = new Brand({
      userId: authUserId,
      companyName,
      website,
      industry,
      subscriptionStatus: 'inactive'
    });

    await brand.save();

    return res.status(201).json({ success: true, data: brand });
  } catch (err) {
    console.error('onboardBrand err:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET /brand/profile/:id  (accepts brand _id or userId)
exports.getBrandProfile = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    const query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { userId: id }];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const brand = await Brand.findOne(query).populate('userId', 'email role'); // populate if you want user email/role
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    return res.status(200).json({ success: true, data: brand });
  } catch (err) {
    console.error('getBrandProfile err:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PUT /brand/update  (update authenticated user's brand profile)
exports.updateBrand = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const brand = await Brand.findOne({ userId: authUserId });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand profile not found' });

    const { companyName, website, industry, subscriptionStatus } = req.body;

    if (companyName !== undefined) brand.companyName = companyName;
    if (website !== undefined) brand.website = website;
    if (industry !== undefined) brand.industry = industry;

    // Allow admin to change subscriptionStatus in future; for now allow brand to set (or skip)
    if (subscriptionStatus !== undefined && ['active', 'inactive'].includes(subscriptionStatus)) {
      brand.subscriptionStatus = subscriptionStatus;
    }

    await brand.save();
    return res.status(200).json({ success: true, data: brand });
  } catch (err) {
    console.error('updateBrand err:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
