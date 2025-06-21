const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Import admin controllers
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');

// Admin authentication routes
router.post('/send-otp', 
  [
    body('email').isEmail().withMessage('Please enter a valid email')
  ], 
  adminController.sendOTP
);

router.post('/verify-otp', 
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  adminController.verifyOTP
);

router.get('/me', authMiddleware.adminAuth, adminController.getCurrentAdmin);

// CRUD routes for admin users (protected by admin auth)
router.get('/users', authMiddleware.adminAuth, adminController.getAllUsers);
router.get('/users/:id', authMiddleware.adminAuth, adminController.getUserById);
router.post('/users', authMiddleware.adminAuth, adminController.createUser);
router.put('/users/:id', authMiddleware.adminAuth, adminController.updateUser);
router.delete('/users/:id', authMiddleware.adminAuth, adminController.deleteUser);

// CRUD routes for stations (protected by admin auth)
router.get('/stations', authMiddleware.adminAuth, adminController.getAllStations);
router.get('/stations/:id', authMiddleware.adminAuth, adminController.getStationById);
router.post('/stations', authMiddleware.adminAuth, adminController.createStation);
router.put('/stations/:id', authMiddleware.adminAuth, adminController.updateStation);
router.delete('/stations/:id', authMiddleware.adminAuth, adminController.deleteStation);

// Route to assign users to stations
router.post('/assign-user', authMiddleware.adminAuth, adminController.assignUserToStation);

module.exports = router; 