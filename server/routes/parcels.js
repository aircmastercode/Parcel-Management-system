const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcelController');
const { authenticate, isMaster } = require('../middlewares/auth');

// @route   GET /api/parcels
// @desc    Get all parcels
// @access  Private/Admin
router.get('/', authenticate, isMaster, parcelController.getParcels);

// @route   GET /api/parcels/station/:stationId
// @desc    Get parcels for a specific station
// @access  Private
router.get('/station/:stationId', authenticate, parcelController.getParcelsByStation);

// @route   GET /api/parcels/:id
// @desc    Get parcel by ID
// @access  Private
router.get('/:id', authenticate, parcelController.getParcelById);

// @route   POST /api/parcels
// @desc    Create a new parcel
// @access  Private
router.post('/', authenticate, parcelController.createParcel);

// @route   POST /api/parcels/:id/image
// @desc    Upload parcel image
// @access  Private
router.post('/:id/image', authenticate, parcelController.uploadParcelImage);

// @route   PUT /api/parcels/:id/status
// @desc    Update parcel status
// @access  Private
router.put('/:id/status', authenticate, parcelController.updateParcelStatus);

// @route   DELETE /api/parcels/:id
// @desc    Delete a parcel
// @access  Private/Admin
router.delete('/:id', authenticate, isMaster, parcelController.deleteParcel);

module.exports = router; 