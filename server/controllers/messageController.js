const { Message, Station, User, Parcel } = require('../models');

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
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
        },
        {
          model: Parcel,
          as: 'parcel',
          attributes: ['id', 'tracking_number', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a specific station
exports.getStationMessages = async (req, res) => {
  try {
    const stationId = req.params.stationId;
    
    // Check if station exists
    const station = await Station.findByPk(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Find messages where station is either sender or receiver
    const messages = await Message.findAll({
      where: {
        [require('../models').Sequelize.Op.or]: [
          { from_station: stationId },
          { to_station: stationId }
        ]
      },
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
        },
        {
          model: Parcel,
          as: 'parcel',
          attributes: ['id', 'tracking_number', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting station messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all unread messages for a station
exports.getUnreadMessages = async (req, res) => {
  try {
    const stationId = req.params.stationId;
    
    // Find unread messages where station is the receiver
    const messages = await Message.findAll({
      where: {
        to_station: stationId,
        read: false
      },
      include: [
        {
          model: Station,
          as: 'sender',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Parcel,
          as: 'parcel',
          attributes: ['id', 'tracking_number', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting unread messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { to_station, parcel_id, content } = req.body;
    const from_station = req.user.station_id;
    
    // Check if recipient station exists
    const receiverStation = await Station.findByPk(to_station);
    if (!receiverStation) {
      return res.status(400).json({ message: 'Recipient station not found' });
    }
    
    // Check if parcel exists
    const parcel = await Parcel.findByPk(parcel_id);
    if (!parcel) {
      return res.status(400).json({ message: 'Parcel not found' });
    }
    
    // Check if user's station is related to this parcel (sender or receiver)
    // Only exception is master station users who can message any station
    const userStation = await Station.findByPk(from_station);
    if (!userStation.is_master && 
        from_station !== parcel.sender_station_id && 
        from_station !== parcel.receiver_station_id) {
      return res.status(403).json({ 
        message: 'Your station is not associated with this parcel' 
      });
    }
    
    // Create the message
    const newMessage = await Message.create({
      from_station,
      to_station,
      parcel_id,
      content,
      read: false
    });
    
    // If the user is from master station or we need to copy master station,
    // create copy for master station if it's not already sent to/from master
    const masterStation = await Station.findOne({ where: { is_master: true } });
    if (masterStation && masterStation.id !== from_station && masterStation.id !== to_station) {
      // Create a copy for the master station
      await Message.create({
        from_station,
        to_station: masterStation.id,
        parcel_id,
        content,
        read: false,
        is_master_copied: true
      });
    }
    
    // Get the created message with relations
    const messageWithRelations = await Message.findByPk(newMessage.id, {
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
        },
        {
          model: Parcel,
          as: 'parcel',
          attributes: ['id', 'tracking_number', 'status']
        }
      ]
    });
    
    res.status(201).json(messageWithRelations);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Find message
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user's station is the recipient
    if (message.to_station !== req.user.station_id) {
      return res.status(403).json({ 
        message: 'You can only mark messages sent to your station as read' 
      });
    }
    
    // Update read status
    message.read = true;
    await message.save();
    
    res.status(200).json({
      id: message.id,
      read: message.read,
      updatedAt: message.updatedAt
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Find message
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user's station is the sender
    if (message.from_station !== req.user.station_id && req.user.role !== 'master') {
      return res.status(403).json({ 
        message: 'You can only delete messages sent from your station' 
      });
    }
    
    await message.destroy();
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 