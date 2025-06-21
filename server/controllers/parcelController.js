const { Parcel, Station, Message } = require('../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Get all parcels
exports.getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.findAll({
      include: [
        {
          model: Station,
          as: 'senderStation',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Station,
          as: 'receiverStation',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    res.status(200).json(parcels);
  } catch (error) {
    console.error('Error getting parcels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get parcel by ID
exports.getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findByPk(req.params.id, {
      include: [
        {
          model: Station,
          as: 'senderStation',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Station,
          as: 'receiverStation',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: Station,
              as: 'sender',
              attributes: ['id', 'name', 'code']
            },
            {
              model: Station,
              as: 'receiver',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    res.status(200).json(parcel);
  } catch (error) {
    console.error('Error getting parcel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get parcels for a specific station
exports.getParcelsByStation = async (req, res) => {
  try {
    const stationId = req.params.stationId;
    
    // Check if station exists
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Find parcels where station is either sender or receiver
    const parcels = await Parcel.findAll({
      where: {
        [require('../models').Sequelize.Op.or]: [
          { sender_station_id: stationId },
          { receiver_station_id: stationId }
        ]
      },
      include: [
        {
          model: Station,
          as: 'senderStation',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Station,
          as: 'receiverStation',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    res.status(200).json(parcels);
  } catch (error) {
    console.error('Error getting station parcels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload parcel image
exports.uploadParcelImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const parcelId = req.params.id;
    const parcel = await Parcel.findByPk(parcelId);
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    const imageFile = req.files.image;
    const uploadDir = path.join(__dirname, '../uploads/parcels');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const uniqueFileName = `${parcel.tracking_number}-${Date.now()}${path.extname(imageFile.name)}`;
    const uploadPath = path.join(uploadDir, uniqueFileName);
    
    // Move the file to upload directory
    await imageFile.mv(uploadPath);
    
    // Update parcel with image URL
    const imageUrl = `/uploads/parcels/${uniqueFileName}`;
    parcel.image_url = imageUrl;
    await parcel.save();
    
    res.status(200).json({ 
      message: 'Image uploaded successfully', 
      image_url: imageUrl 
    });
  } catch (error) {
    console.error('Error uploading parcel image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new parcel
exports.createParcel = async (req, res) => {
  try {
    const sender_station_id = req.user.station_id; // Automatically set sender station from user's station
    const {
      receiver_station_id,
      weight,
      description,
      sender_name,
      receiver_name,
      sender_contact,
      receiver_contact,
      initial_message
    } = req.body;
    
    // Check if required fields are provided
    if (!receiver_station_id || !sender_name || !receiver_name || !initial_message) {
      return res.status(400).json({ 
        message: 'Missing required fields: receiver_station_id, sender_name, receiver_name, and initial_message are required' 
      });
    }
    
    // Check if sender station exists
    const senderStation = await Station.findByPk(sender_station_id);
    if (!senderStation) {
      return res.status(400).json({ message: 'Sender station not found' });
    }
    
    // Check if receiver station exists
    const receiverStation = await Station.findByPk(receiver_station_id);
    if (!receiverStation) {
      return res.status(400).json({ message: 'Receiver station not found' });
    }
    
    // Generate a tracking number
    const tracking_number = `PMS-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create the new parcel
    const newParcel = await Parcel.create({
      sender_station_id,
      receiver_station_id,
      tracking_number,
      weight,
      description,
      sender_name,
      receiver_name,
      sender_contact,
      receiver_contact,
      status: 'pending'
    });
    
    // Handle image upload if included in the request
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const uploadDir = path.join(__dirname, '../uploads/parcels');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const uniqueFileName = `${tracking_number}-${Date.now()}${path.extname(imageFile.name)}`;
      const uploadPath = path.join(uploadDir, uniqueFileName);
      
      // Move the file to upload directory
      await imageFile.mv(uploadPath);
      
      // Update parcel with image URL
      const imageUrl = `/uploads/parcels/${uniqueFileName}`;
      newParcel.image_url = imageUrl;
      await newParcel.save();
    }
    
    // Create messages for all stations
    const stations = await Station.findAll();
    for (const station of stations) {
      let content;
      if (station.id === sender_station_id) {
        // For the sender's station, include the sender's name
        content = `Parcel sent by ${sender_name} from ${senderStation.name}`;
      } else {
        // For other stations, only include the sending station's name
        content = `Parcel sent from ${senderStation.name}`;
      }
      await Message.create({
        from_station: sender_station_id,
        to_station: station.id,
        parcel_id: newParcel.id,
        content,
        read: false,
        is_master_copied: station.is_master
      });
    }
    
    // Get the created parcel with relations
    const parcelWithRelations = await Parcel.findByPk(newParcel.id, {
      include: [
        {
          model: Station,
          as: 'senderStation',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Station,
          as: 'receiverStation',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    res.status(201).json(parcelWithRelations);
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update parcel status
exports.updateParcelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in_transit', 'delivered', 'returned', 'lost'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find parcel
    const parcel = await Parcel.findByPk(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // Update status
    parcel.status = status;
    await parcel.save();
    
    // Create status update message
    await Message.create({
      from_station: req.user.station_id,
      to_station: parcel.receiver_station_id,
      parcel_id: parcel.id,
      content: `Parcel status updated to: ${status}`,
      read: false,
      is_master_copied: true
    });
    
    // If the sender station is different from the user's station, also notify the sender
    if (parcel.sender_station_id !== req.user.station_id) {
      await Message.create({
        from_station: req.user.station_id,
        to_station: parcel.sender_station_id,
        parcel_id: parcel.id,
        content: `Parcel status updated to: ${status}`,
        read: false,
        is_master_copied: true
      });
    }
    
    // Get master station
    const masterStation = await Station.findOne({
      where: { is_master: true }
    });
    
    // If user's station and sender/receiver are not master station, notify master station
    if (masterStation && 
        masterStation.id !== req.user.station_id &&
        masterStation.id !== parcel.sender_station_id &&
        masterStation.id !== parcel.receiver_station_id) {
      await Message.create({
        from_station: req.user.station_id,
        to_station: masterStation.id,
        parcel_id: parcel.id,
        content: `Parcel status updated to: ${status}`,
        read: false,
        is_master_copied: true
      });
    }
    
    res.status(200).json({
      id: parcel.id,
      tracking_number: parcel.tracking_number,
      status: parcel.status,
      updatedAt: parcel.updatedAt
    });
  } catch (error) {
    console.error('Error updating parcel status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete parcel
exports.deleteParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findByPk(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // Check if there are messages related to this parcel
    const messageCount = await Message.count({
      where: { parcel_id: parcel.id }
    });
    
    if (messageCount > 0) {
      // Delete related messages first
      await Message.destroy({
        where: { parcel_id: parcel.id }
      });
    }
    
    // Delete image if exists
    if (parcel.image_url) {
      const imagePath = path.join(__dirname, '..', parcel.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await parcel.destroy();
    
    res.status(200).json({ message: 'Parcel deleted successfully' });
  } catch (error) {
    console.error('Error deleting parcel:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 