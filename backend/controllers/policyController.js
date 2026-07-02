const db = require('../config/db');

const createPolicy = async (req, res) => {
  let { product_id, premium } = req.body;
  
  premium = parseFloat(premium);

  if (isNaN(premium)) {
    return res.status(400).json({ success: false, message: 'Data premi tidak valid atau tidak lengkap' });
  }

  try {
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
    const [rows] = await db.query("SELECT * FROM policies WHERE user_id = ?", [req.user.id]);
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
    res.status(500).json({ success: false, message: 'Gagal mengambil semua data' });
  }
};

const calculatePremium = async (req, res) => {
    const { product_id, age, plan_multiplier } = req.body;
    try {
        const [products] = await db.query("SELECT price FROM products WHERE id = ?", [product_id]);
        const basePrice = products[0].price;
        const premium = basePrice * plan_multiplier * (1 + (age / 100));
        res.json({ success: true, premium });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal kalkulasi' });
    }
};

module.exports = { createPolicy, getUserPolicies, getAllPolicies, calculatePremium };