const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AdminUser = require('../models/AdminUser'); 

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
  
      let userId;
      if (decoded.id) {
        userId = decoded.id; // Your admin token uses this: { id: '...', role: 'admin' }
      } else if (decoded._id) {
        userId = decoded._id;
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }
      
      console.log('Looking for user with ID:', userId); 
      
      let user = await User.findById(userId);
      console.log('Found in User model:', user ? 'Yes' : 'No');
      
      if (!user) {
      
        user = await AdminUser.findById(userId);
        console.log('Found in AdminUser model:', user ? 'Yes' : 'No');
      }
      
      // 🔥 FIX: Check 'user' not 'req.user'
      if (!user) {
        console.log('No user found with ID:', userId);
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }
      
      // Check if user is active (handle both models)
      if (user.isActive !== undefined && !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }
      
      // 🔥 FIX: Set req.user
      req.user = user;
      console.log('Authentication successful. User role:', req.user.role);
      
      next();
    } catch (error) {
      console.log('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};