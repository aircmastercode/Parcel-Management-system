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
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;