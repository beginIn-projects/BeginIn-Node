// routes/brand.js
const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const auth = require('../middleware/auth'); // your existing auth middleware

router.post('/onboard', auth.protect, brandController.onboardBrand);
router.get('/profile/:id', brandController.getBrandProfile);
router.put('/update', auth.protect, brandController.updateBrand);

module.exports = router;
