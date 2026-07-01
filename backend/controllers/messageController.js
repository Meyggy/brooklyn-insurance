const db = require('../config/db');

const createMessage = async (req, res) => {
  // Frontend harus mengirim: sender, message, target (sebagai receiver_name)
  const { sender, message, target } = req.body; 
  try {
    await db.query(
      "INSERT INTO messages (sender_name, message_text, receiver_name, room_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [sender, message, target, sender, NOW()] // room_id disamakan dengan sender agar mudah di-track
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

const getAllMessages = async (req, res) => {
  try {
    // Sesuaikan dengan nama kolom Anda
    const [rows] = await db.query("SELECT * FROM messages ORDER BY created_at ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

module.exports = { createMessage, getAllMessages };