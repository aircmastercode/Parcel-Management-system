const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { authenticate, isMaster } = require('../middlewares/auth');

// @route   GET /api/stations
// @desc    Get all stations
// @access  Private
router.get('/', authenticate, stationController.getStations);

// @route   GET /api/stations/:id
// @desc    Get station by ID
// @access  Private
router.get('/:id', authenticate, stationController.getStationById);

// @route   POST /api/stations
// @desc    Create a new station
// @access  Private/Admin
router.post('/', authenticate, isMaster, stationController.createStation);

// @route   PUT /api/stations/:id
// @desc    Update a station
// @access  Private/Admin
router.put('/:id', authenticate, isMaster, stationController.updateStation);

// @route   DELETE /api/stations/:id
// @desc    Delete a station
// @access  Private/Admin
router.delete('/:id', authenticate, isMaster, stationController.deleteStation);

module.exports = router; 