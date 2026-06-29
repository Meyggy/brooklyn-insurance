const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth, isAdmin } = require('../middleware/auth');

// Customer bisa kirim pesan (tidak perlu auth)
router.post('/', messageController.createMessage);

// Hanya Admin yang bisa melihat daftar pesan
router.get('/', auth, isAdmin, messageController.getMessages);

module.exports = router;