const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const role = user.role ? user.role.toLowerCase() : 'user';

const token = jwt.sign(
    { 
        id: user.id, 
        role: user.role, 
        name: user.name // <--- INI WAJIB ADA SAAT LOGIN
    }, 
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1h' }
);

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, role: role } 
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')", 
      [name, email, hashedPassword]
    );

    res.status(201).json({ success: true, message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { login, register };