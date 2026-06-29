const db = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products');
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProducts };