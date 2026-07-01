const db = require('../config/db');

const getProfile = async (req, res) => {
  try {
    // Perbaikan: Gunakan req.user.id
    const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal ambil profile" });
  }
};

module.exports = { getProfile };