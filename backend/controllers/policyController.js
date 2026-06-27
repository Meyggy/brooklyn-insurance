const db = require('../config/db');

const createPolicy = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { product_id, premium } = req.body;

    console.log("MASUK CREATE POLICY");
    console.log("USER:", user_id);
    console.log("DATA:", product_id, premium);

    await db.query(
      "INSERT INTO policies (user_id, product_id, premium, status) VALUES (?, ?, ?, 'active')",
      [user_id, product_id, premium]
    );

    res.json({ success: true });

  } catch (err) {
    console.log("ERROR INSERT:", err);
    res.json({ success: false });
  }
};

const getUserPolicies = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM policies WHERE user_id = ?",
      [req.user_id]
    );
    res.json(rows);
  } catch {
    res.json([]);
  }
};

const getAllPolicies = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM policies");
    res.json(rows);
  } catch {
    res.json([]);
  }
};

module.exports = {
  createPolicy,
  getUserPolicies,
  getAllPolicies
};