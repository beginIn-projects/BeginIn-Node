const mongoose = require('mongoose');
const Influencer = require('../models/influencer');
const User = require('../models/user'); // adjust path/casing if your file is named differently

// helper: flexible extraction of authenticated user id
const getAuthUserId = (req) => {
  return (
    (req.user && (req.user.id || req.user._id || req.user.userId)) ||
    req.userId ||
    null
  );
};

// POST /influencer/onboard
exports.onboardInfluencer = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // do not allow duplicate profile
    const exists = await Influencer.findOne({ userId: authUserId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Influencer profile already exists. Use update endpoint.' });
    }

    const { name, niche, bio,email, phone, city, socialAccounts = {} } = req.body;

    // validation
    if (!name || !niche || !bio|| !email || !phone || !city) {
      return res.status(400).json({ success: false, message: 'name, niche, bio, email, phone, and city are required' });
    }

    const influencer = new Influencer({
      userId: authUserId,
      name,
      niche,
      bio,
      email,     
      phone,      
      city, 
      socialAccounts: {
        instagram: {
          username: socialAccounts.instagram?.username,
          profileUrl: socialAccounts.instagram?.profileUrl,
        },
      },
    });

    await influencer.save();

    return res.status(201).json({ success: true, data: influencer });
  } catch (err) {
    console.error('onboardInfluencer err:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET /influencer/profile/:id
// Accepts either influencer _id OR userId
exports.getInfluencerProfile = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    // check if id is a valid ObjectId
    const query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { userId: id }];
    } else {
      // not an ObjectId → treat as username or invalid; keep simple and return 400
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const influencer = await Influencer.findOne(query).populate('userId', 'name email');

    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    return res.status(200).json({ success: true, data: influencer });
  } catch (err) {
    console.error('getInfluencerProfile err:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PUT /influencer/update
// Auth required; updates the authenticated user's influencer profile
exports.updateInfluencer = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const influencer = await Influencer.findOne({ userId: authUserId });
    if (!influencer) return res.status(404).json({ success: false, message: 'Influencer profile not found' });

    const { niche, bio, email, phone, city, socialAccounts } = req.body;

    if (niche !== undefined) influencer.niche = niche;
    if (bio !== undefined) influencer.bio = bio;
    if (email !== undefined) influencer.email = email;
    if (phone !== undefined) influencer.phone = phone;
    if (city !== undefined) influencer.city = city;

    if (socialAccounts && socialAccounts.instagram) {
      influencer.socialAccounts = influencer.socialAccounts || {};
      influencer.socialAccounts.instagram = influencer.socialAccounts.instagram || {};
      if (socialAccounts.instagram.username !== undefined) influencer.socialAccounts.instagram.username = socialAccounts.instagram.username;
      if (socialAccounts.instagram.profileUrl !== undefined) influencer.socialAccounts.instagram.profileUrl = socialAccounts.instagram.profileUrl;
    }

    await influencer.save();

    return res.status(200).json({ success: true, data: influencer });
  } catch (err) {
    console.error('updateInfluencer err:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
