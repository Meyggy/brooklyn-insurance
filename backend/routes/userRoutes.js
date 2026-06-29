const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Import dari controller yang tepat
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Routes Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes User
router.get('/profile', auth, userController.getProfile);

module.exports = router;