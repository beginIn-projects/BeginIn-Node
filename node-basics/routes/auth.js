const express = require('express');
const {
  signup,
  login,
  resetPassword,
  confirmResetPassword,
  getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Authentication routes (matching document)
router.post('/signup', signup);           
router.post('/login', login);             
router.post('/reset-password', resetPassword);  

// Additional route for completing password reset
router.put('/reset-password/:resettoken', confirmResetPassword);

// Protected route for testing (optional)
router.get('/me', protect, getMe);

module.exports = router;