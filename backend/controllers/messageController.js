const db = require('../config/db');

const createMessage = async (req, res) => {
  const { message, target } = req.body; 
  const sender = req.user.name; 
  const role = req.user.role.toLowerCase();


  const room_id = role === 'admin' ? target : sender;
  const receiver = role === 'admin' ? target : 'Admin';

  try {
    await db.query(
      "INSERT INTO messages (sender_name, message_text, receiver_name, room_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [sender, message, receiver, room_id]
    );
    res.json({ success: true, message: 'Pesan terkirim' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

const getAllMessages = async (req, res) => {
    try {
        const user = req.user; 
        let query;
        let params;

        if (user.role && user.role.toLowerCase() === 'admin') {
            query = "SELECT * FROM messages ORDER BY created_at ASC";
            params = [];
        } else {
            query = "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC";
            params = [user.name]; 
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesan' });
    }
};

module.exports = { createMessage, getAllMessages };