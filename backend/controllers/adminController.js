const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM policies) AS total_policies,
        (SELECT COUNT(*) FROM claims) AS total_claims
    `);
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal ambil data dashboard' });
  }
};

module.exports = { getDashboard };