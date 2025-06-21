const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    
    // Add user from payload
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.adminAuth = async (req, res, next) => {
  try {
    console.log('Admin token verification started');
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    
    // Check if token has admin flag
    if (!decoded.isAdmin) {
      console.log('Token does not have admin privileges');
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    // Add admin from payload
    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    if (!admin) {
      console.log('Admin not found for token');
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    console.log('Admin verified:', admin.username);
    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.isMaster = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== 'master') {
      return res.status(403).json({ message: 'Access denied. Master role required.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
}; 