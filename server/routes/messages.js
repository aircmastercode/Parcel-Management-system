const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, isMaster } = require('../middlewares/auth');

// @route   GET /api/messages
// @desc    Get all messages (admin only)
// @access  Private/Admin
router.get('/', authenticate, isMaster, messageController.getMessages);

// @route   GET /api/messages/all
// @desc    Get all messages (accessible by all stations)
// @access  Private
router.get('/all', authenticate, messageController.getAllMessages);

// @route   GET /api/messages/station/:stationId
// @desc    Get messages for a specific station
// @access  Private
router.get('/station/:stationId', authenticate, messageController.getStationMessages);

// @route   GET /api/messages/unread/:stationId
// @desc    Get unread messages for a station
// @access  Private
router.get('/unread/:stationId', authenticate, messageController.getUnreadMessages);

// @route   POST /api/messages
// @desc    Create a new message
// @access  Private
router.post('/', authenticate, messageController.createMessage);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authenticate, messageController.markAsRead);

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', authenticate, messageController.deleteMessage);

module.exports = router; 