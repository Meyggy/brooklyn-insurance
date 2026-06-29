const db = require('../config/db');

const createMessage = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await db.query("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
    res.json({ success: true, message: 'Pesan berhasil dikirim' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM messages ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createMessage, getMessages };