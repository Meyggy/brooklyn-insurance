const db = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.register = async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 TAMBAH INI

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Semua field wajib diisi"
      });
    }

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, password]
    );

    console.log("INSERT BERHASIL"); // 🔥 TAMBAH INI

    res.json({ success: true });

  } catch (err) {
    console.log("ERROR REGISTER:", err); // 🔥 WAJIB
    res.json({ success: false });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user_id = req.user_id;

    const [rows] = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.json({ message: "User tidak ditemukan" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    res.json({ message: "Gagal ambil profile" });
  }
};