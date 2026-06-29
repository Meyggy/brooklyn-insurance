const db = require('../config/db');

const createClaim = async (req, res) => {
  // Tambahkan pengecekan keamanan agar tidak crash jika req.user kosong
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized: User tidak ditemukan' });
  }

  const { policy_id, description } = req.body;
  const user_id = req.user.id; 

  try {
    await db.query(
      "INSERT INTO claims (user_id, policy_id, description, status) VALUES (?, ?, ?, 'pending')", 
      [user_id, policy_id, description]
    );
    res.json({ success: true, message: 'Claim berhasil dibuat' });
  } catch (err) {
    console.error("Database Error (createClaim):", err); // Penting untuk debugging
    res.status(500).json({ success: false, message: 'Server error saat menyimpan klaim' });
  }
};

const getClaims = async (req, res) => {
  try {
    // Pastikan req.user tersedia
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let query = "SELECT c.* FROM claims c";
    let params = [];
    
    // Pastikan pengecekan role sinkron dengan apa yang diset di middleware
    // Biasanya role disimpan di dalam req.user.role
    const role = req.user.role || req.role; 

    if (role !== 'admin') {
      query += " WHERE c.user_id = ?"; // Lebih efisien daripada JOIN jika user_id ada di tabel claims
      params.push(req.user.id);
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error("Database Error (getClaims):", err);
    res.status(500).json({ success: false, message: 'Server error saat mengambil data' });
  }
};
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
