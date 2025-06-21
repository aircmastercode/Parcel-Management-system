const { Admin, User, Station } = require('../models');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/otpGenerator');

// Send OTP to admin's email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log(`Attempting to send OTP to admin ${email}`);
    
    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });
    
    if (!admin) {
      console.log(`Admin not found for ${email}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    console.log(`Admin found: ${admin.username}`);
    
    // Generate OTP
    const otp = generateOTP(6);
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Save OTP to admin record
    admin.last_otp = otp;
    admin.otp_expires_at = expiryTime;
    await admin.save();
    
    // Send OTP via mock service
    await sendOTP(email, otp);
    
    console.log(`OTP sent successfully to ${email}`);
    
    res.status(200).json({
      message: 'OTP sent to email',
      expiresAt: expiryTime
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP and generate admin JWT token
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log(`Attempting to verify OTP for admin ${email}`);
    
    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });
    
    if (!admin) {
      console.log(`Admin not found for ${email}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    console.log(`Admin found: ${admin.username}, Stored OTP: ${admin.last_otp}, Provided OTP: ${otp}`);
    
    // Check if OTP is not set
    if (!admin.last_otp) {
      console.log('No OTP has been set for this admin');
      return res.status(400).json({ message: 'No OTP has been requested. Please request a new OTP.' });
    }
    
    // Check if OTP has expired
    const now = new Date();
    const expiryTime = new Date(admin.otp_expires_at);
    
    console.log(`Current time: ${now}, OTP expiry time: ${expiryTime}`);
    
    if (now > expiryTime) {
      console.log('OTP has expired');
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }
    
    // Compare OTPs
    if (admin.last_otp !== otp) {
      console.log('Invalid OTP provided');
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
    
    // Clear the OTP after successful verification
    admin.last_otp = null;
    admin.otp_expires_at = null;
    await admin.save();
    
    // Generate JWT token with admin flag
    const payload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      isAdmin: true // Special flag to indicate this is an admin token
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '24h' }
    );
    
    console.log(`Admin login successful for ${admin.username}`);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error getting admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code', 'location']
      }],
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code', 'location']
      }],
      attributes: { exclude: ['last_otp', 'otp_expires_at'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, station_id } = req.body;
    
    // Check if user with email or phone already exists
    const existingUser = await User.findOne({
      where: email ? { email } : { phone }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Check if station exists
    const station = await Station.findByPk(station_id);
    if (!station) {
      return res.status(400).json({ message: 'Station not found' });
    }
    
    // Create new user with default role 'user' (not 'master')
    const newUser = await User.create({
      name,
      email,
      phone,
      station_id,
      role: 'user'
    });
    
    const userWithoutSensitiveData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      station_id: newUser.station_id,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    
    res.status(201).json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, station_id } = req.body;
    
    // Find user
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if station exists if station_id is provided
    if (station_id) {
      const station = await Station.findByPk(station_id);
      if (!station) {
        return res.status(400).json({ message: 'Station not found' });
      }
    }
    
    // Update user fields (don't allow changing role to master)
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (station_id) user.station_id = station_id;
    
    await user.save();
    
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['last_otp', 'otp_expires_at'] },
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code', 'location']
      }]
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.findAll();
    res.status(200).json(stations);
  } catch (error) {
    console.error('Error getting stations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get station by ID
exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'phone', 'role']
        }
      ]
    });
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    res.status(200).json(station);
  } catch (error) {
    console.error('Error getting station:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new station
exports.createStation = async (req, res) => {
  try {
    const { name, location, code } = req.body;
    
    // Check if station with code already exists
    const existingStation = await Station.findOne({
      where: { code }
    });
    
    if (existingStation) {
      return res.status(400).json({ message: 'Station with this code already exists' });
    }
    
    // Create new station (always with is_master=false)
    const newStation = await Station.create({
      name,
      location,
      is_master: false,
      code
    });
    
    res.status(201).json(newStation);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update station
exports.updateStation = async (req, res) => {
  try {
    const { name, location, code } = req.body;
    
    // Find station
    const station = await Station.findByPk(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Check if code is being changed and if new code is already in use
    if (code && code !== station.code) {
      const existingStation = await Station.findOne({
        where: { code }
      });
      
      if (existingStation) {
        return res.status(400).json({ message: 'Station with this code already exists' });
      }
    }
    
    // Update station fields (don't allow changing master status)
    if (name) station.name = name;
    if (location) station.location = location;
    if (code) station.code = code;
    
    await station.save();
    
    res.status(200).json(station);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete station
exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Check if station has users
    const usersCount = await User.count({
      where: { station_id: station.id }
    });
    
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Station has associated users. Cannot delete' 
      });
    }
    
    await station.destroy();
    
    res.status(200).json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign user to station
exports.assignUserToStation = async (req, res) => {
  try {
    const { userId, stationId } = req.body;
    
    // Validate inputs
    if (!userId || !stationId) {
      return res.status(400).json({ message: 'User ID and Station ID are required' });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if station exists
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Assign user to station
    user.station_id = stationId;
    await user.save();
    
    res.status(200).json({
      message: 'User assigned to station successfully',
      user: {
        id: user.id,
        name: user.name,
        station_id: user.station_id
      },
      station: {
        id: station.id,
        name: station.name,
        code: station.code
      }
    });
  } catch (error) {
    console.error('Error assigning user to station:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 