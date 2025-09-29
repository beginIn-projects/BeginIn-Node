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
router.post('/signup', signup);           
router.post('/login', login);             
router.post('/reset-password', resetPassword);  


router.put('/reset-password/:resettoken', confirmResetPassword);

router.get('/me', protect, getMe);

module.exports = router;