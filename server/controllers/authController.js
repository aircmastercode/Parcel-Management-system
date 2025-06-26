const { User, Station } = require('../models');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/otpGenerator');

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code', 'location', 'is_master']
      }],
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user's station still exists
    if (!user.station) {
      return res.status(400).json({ message: 'Your account is not associated with any station. Please contact an administrator.' });
    }
    
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      station_id: user.station_id,
      station: {
        id: user.station.id,
        name: user.station.name,
        code: user.station.code,
        location: user.station.location,
        is_master: user.station.is_master
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP to user's phone or email
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone, station_code } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }
    
    console.log(`Attempting to send OTP to ${email || phone}`);
    
    // Find user by email or phone
    const query = email ? { email } : { phone };
    console.log('Looking for user with query:', query);
    
    const user = await User.findOne({ 
      where: query,
      include: [{
        model: Station,
        as: 'station'
      }]
    });
    
    if (!user) {
      console.log(`User not found for ${email || phone}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user's station still exists
    if (!user.station) {
      console.log(`User ${user.name} (ID: ${user.id}) has no associated station`);
      return res.status(400).json({ message: 'Your account is not associated with any station. Please contact an administrator.' });
    }
    
    console.log(`User found: ${user.name}, Station: ${user.station?.name || 'Unknown'}`);
    
    // Verify that the user belongs to the station they claim to be from
    if (station_code && user.station && user.station.code !== station_code) {
      console.log(`Station code mismatch: User belongs to ${user.station.code}, but tried to log in to ${station_code}`);
      return res.status(403).json({ 
        message: 'You are not authorized to access this station',
        correctStation: user.station.code
      });
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
    
    console.log(`OTP sent successfully to ${recipient}`);
    
    res.status(200).json({
      message: `OTP sent to ${email ? 'email' : 'phone'}`,
      expiresAt: expiryTime,
      stationInfo: {
        code: user.station?.code,
        name: user.station?.name
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    
    console.log(`Attempting to verify OTP for ${email || phone}`);
    
    // Find user by email or phone
    const query = email ? { email } : { phone };
    const user = await User.findOne({ 
      where: query,
      include: ['station']
    });
    
    if (!user) {
      console.log(`User not found for ${email || phone}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user's station still exists
    if (!user.station) {
      console.log(`User ${user.name} (ID: ${user.id}) has no associated station`);
      return res.status(400).json({ message: 'Your account is not associated with any station. Please contact an administrator.' });
    }
    
    console.log(`User found: ${user.name}, Stored OTP: ${user.last_otp}, Provided OTP: ${otp}`);
    
    // Check if OTP is not set
    if (!user.last_otp) {
      console.log('No OTP has been set for this user');
      return res.status(400).json({ message: 'No OTP has been requested. Please request a new OTP.' });
    }
    
    // Check if OTP has expired
    const now = new Date();
    const expiryTime = new Date(user.otp_expires_at);
    
    console.log(`Current time: ${now}, OTP expiry time: ${expiryTime}`);
    
    if (now > expiryTime) {
      console.log('OTP has expired');
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }
    
    // Compare OTPs
    if (user.last_otp !== otp) {
      console.log('Invalid OTP provided');
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
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
    
    console.log(`Login successful for ${user.name}`);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
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
          location: user.station.location,
          is_master: user.station.is_master
        } : null
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 