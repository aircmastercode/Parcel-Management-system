const { User, Station } = require('../models');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['last_otp', 'otp_expires_at'] },
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code', 'location']
      }]
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
      attributes: { exclude: ['last_otp', 'otp_expires_at'] },
      include: [{
        model: Station,
        as: 'station',
        attributes: ['id', 'name', 'code', 'location']
      }]
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
    const { name, email, phone, station_id, role } = req.body;
    
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
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      phone,
      station_id,
      role: role || 'user'
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
    const { name, email, phone, station_id, role } = req.body;
    
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
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (station_id) user.station_id = station_id;
    if (role) user.role = role;
    
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