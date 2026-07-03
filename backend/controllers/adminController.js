const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM policies) AS total_policies,
        (SELECT COUNT(*) FROM claims) AS total_claims
    `);

    const [pendingClaims] = await db.query(`
      SELECT c.*, u.name as user_name 
      FROM claims c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.status = 'pending'
      ORDER BY c.id DESC
    `);

    res.json({
        success: true,
        stats: stats[0],
        pending_claims: pendingClaims
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal ambil data dashboard' });
  }
};

module.exports = { getDashboard };