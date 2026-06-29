const db = require('../config/db');

const createPolicy = async (req, res) => {
  const { product_id, premium } = req.body;
  try {
    await db.query("INSERT INTO policies (user_id, product_id, premium, status) VALUES (?, ?, ?, 'active')", [req.user_id, product_id, premium]);
    res.json({ success: true, message: 'Polis berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserPolicies = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM policies WHERE user_id = ?", [req.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data' });
  }
};

const getAllPolicies = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM policies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data' });
  }
};

module.exports = { createPolicy, getUserPolicies, getAllPolicies };