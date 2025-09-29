const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { 
  sendWelcomeEmail, 
  sendPasswordResetEmail 
} = require('../utils/sendEmail');

const signToken = (id,role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  
  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
};
const signup = async (req, res) => {
  try {
    const { name, email, password,confirmPassword, role} = req.body;
    
    // Validation
    if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide password'
    });
  }
  if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm your password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide role'
    });
  }
      
  const validRoles = ['influencer', 'brand'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either influencer, or admin'
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (error) {
      console.error('Welcome email failed:', error);
    }
    
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }
    
    // Check for user (include password)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }
    
    // Get reset token
    const resetToken = user.createPasswordResetToken();
    
    await user.save({ validateBeforeSave: false });
    
    try {
      await sendPasswordResetEmail(user, resetToken);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Reset email error:', error);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const confirmResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }
    
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  resetPassword,
  confirmResetPassword,
  getMe
};