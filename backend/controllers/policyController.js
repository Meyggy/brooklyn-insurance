const db = require('../config/db');

const createPolicy = async (req, res) => {
  const { product_id, premium } = req.body;
  try {
    // PERBAIKAN: Gunakan req.user.id bukan req.user_id
    await db.query(
      "INSERT INTO policies (user_id, product_id, premium, status) VALUES (?, ?, ?, 'active')", 
      [req.user.id, product_id, premium]
    );
    res.json({ success: true, message: 'Polis berhasil dibuat' });
  } catch (err) {
    console.error("Error Create Policy:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserPolicies = async (req, res) => {
  try {
    // PERBAIKAN: Gunakan req.user.id
    const [rows] = await db.query(
      "SELECT * FROM policies WHERE user_id = ?", 
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error Get User Policies:", err);
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