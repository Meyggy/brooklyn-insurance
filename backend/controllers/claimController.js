const db = require('../config/db');

// Gunakan req.user.id yang sudah diset oleh middleware auth
const createClaim = async (req, res) => {
  const { policy_id, description } = req.body;
  const user_id = req.user.id; 

  try {
    await db.query("INSERT INTO claims (user_id, policy_id, description, status) VALUES (?, ?, ?, 'pending')", 
      [user_id, policy_id, description]);
    res.json({ success: true, message: 'Claim berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getClaims = async (req, res) => {
  try {
    let query = "SELECT c.* FROM claims c";
    let params = [];
    
    // Jika bukan admin, hanya ambil data miliknya
    if (req.role !== 'admin') {
      query += " JOIN policies p ON c.policy_id = p.id WHERE p.user_id = ?";
      params.push(req.user.id);
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Pastikan fungsi ini ada sesuai route tadi
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
