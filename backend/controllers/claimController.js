const db = require('../config/db');

const createClaim = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { policy_id, description } = req.body;
  const user_id = req.user.id;

  try {
    // 1. Insert klaim ke database
    const [result] = await db.query(
      "INSERT INTO claims (user_id, policy_id, description, status) VALUES (?, ?, ?, 'pending')",
      [user_id, policy_id, description]
    );

    // 2. Kirim balik claim_id yang baru saja di-generate oleh database
    res.json({ 
        success: true, 
        message: 'Claim berhasil dibuat', 
        claim_id: result.insertId 
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const getClaims = async (req, res) => {
    try {
        let query = "SELECT c.*, u.name as user_name FROM claims c JOIN users u ON c.user_id = u.id";
        let params = [];

        // Jika role BUKAN 'admin', baru tambahkan filter WHERE
        if (req.user.role.toLowerCase() !== 'admin') {
            query += " WHERE c.user_id = ?";
            params.push(req.user.id);
        }

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ success: false });
    }
};
// Pastikan fungsi getClaimById ada untuk dipanggil oleh claim-detail.html
const getClaimById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM claims WHERE id = ?", [req.params.id]);
        if(rows.length === 0) return res.status(404).json({message: "Not found"});
        res.json(rows[0]);
    } catch(err) {
        res.status(500).json({success: false});
    }
};

const updateClaimStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query("UPDATE claims SET status=? WHERE id=?", [status, id]);
    res.json({ success: true, message: 'Status berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createClaim, getClaims, getClaimById, updateClaimStatus };
