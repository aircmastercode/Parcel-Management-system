const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/otpGenerator');

// Send OTP to user's phone or email
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }
    
    // Find user by email or phone
    const query = email ? { email } : { phone };
    const user = await User.findOne({ where: query });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate OTP
    const otp = generateOTP(6);
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Save OTP to user record
    user.last_otp = otp;
    user.otp_expires_at = expiryTime;
    await user.save();
    
    // Send OTP via mock service
    const recipient = email || phone;
    await sendOTP(recipient, otp);
    
    res.status(200).json({
      message: `OTP sent to ${email ? 'email' : 'phone'}`,
      expiresAt: expiryTime
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP and generate JWT token
exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }
    
    // Find user by email or phone
    const query = email ? { email } : { phone };
    const user = await User.findOne({ 
      where: query,
      include: ['station']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify OTP
    const isValidOTP = verifyOTP(user.last_otp, otp, user.otp_expires_at);
    
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Clear the OTP after successful verification
    user.last_otp = null;
    user.otp_expires_at = null;
    await user.save();
    
    // Generate JWT token
    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
      station_id: user.station_id
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        station: user.station ? {
          id: user.station.id,
          name: user.station.name,
          code: user.station.code,
          is_master: user.station.is_master
        } : null
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 