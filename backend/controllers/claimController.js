const db = require('../config/db');

const createClaim = (req, res) => {
  const { policy_id, description } = req.body;

  if (!policy_id || !description) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  db.query(
    'INSERT INTO claims (policy_id, description, status) VALUES (?, ?, ?)',
    [policy_id, description, 'pending'],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Claim berhasil dibuat' });
    }
  );
};

const getClaims = (req, res) => {
  const user_id = req.headers['user_id'];

  db.query(
    `
    SELECT c.*
    FROM claims c
    JOIN policies p ON c.policy_id = p.id
    WHERE p.user_id = ?
    `,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};
const updateClaimStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    'UPDATE claims SET status=? WHERE id=?',
    [status, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Status berhasil diupdate' });
    }
  );
};

const getDashboard = (req, res) => {
  db.query(
    `
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM policies) AS total_policies,
      (SELECT COUNT(*) FROM claims) AS total_claims
    `,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
};

module.exports = {
  createClaim,
  getClaims,
  updateClaimStatus,
  getDashboard
};