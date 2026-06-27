const db = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products');
    
    res.json(results); 
  } catch (err) {
    console.error("DATABASE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts };