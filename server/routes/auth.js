const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { User, Station } = require('../models');

// @route   POST /api/auth/send-otp
// @desc    Send OTP to user's email or phone
// @access  Public
router.post('/send-otp', authController.sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return JWT token
// @access  Public
router.post('/verify-otp', authController.verifyOTP);

// @route   GET /api/auth/me
// @desc    Get current user's info
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    // Get user with station information
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Station,
        as: 'station'
      }],
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      station_id: user.station_id,
      station: user.station ? {
        id: user.station.id,
        name: user.station.name,
        code: user.station.code,
        is_master: user.station.is_master
      } : null
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;