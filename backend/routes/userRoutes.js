const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, userController.getProfile);

module.exports = router;