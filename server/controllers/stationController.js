const { Station, User } = require('../models');

// Get all stations
exports.getStations = async (req, res) => {
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
    const { name, location, is_master, code } = req.body;
    
    // Check if station with code already exists
    const existingStation = await Station.findOne({
      where: { code }
    });
    
    if (existingStation) {
      return res.status(400).json({ message: 'Station with this code already exists' });
    }
    
    // Create new station
    const newStation = await Station.create({
      name,
      location,
      is_master: is_master || false,
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
    const { name, location, is_master, code } = req.body;
    
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
    
    // Update station fields
    if (name) station.name = name;
    if (location) station.location = location;
    if (is_master !== undefined) station.is_master = is_master;
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