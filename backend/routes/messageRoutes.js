const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// Tambahkan auth di sini agar req.user terbaca
router.post('/', auth, messageController.createMessage);

// Route get sudah aman
router.get('/', auth, messageController.getAllMessages);

module.exports = router;