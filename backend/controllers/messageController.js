const db = require('../config/db');

exports.createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await db.query(
      "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM messages ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
};