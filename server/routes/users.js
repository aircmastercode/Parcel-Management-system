const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isMaster } = require('../middlewares/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, isMaster, userController.getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', authenticate, isMaster, userController.getUserById);

// @route   POST /api/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/', authenticate, isMaster, userController.createUser);

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/:id', authenticate, isMaster, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', authenticate, isMaster, userController.deleteUser);

module.exports = router; 