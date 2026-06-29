const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token
const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak tersedia' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    
    // Simpan objek user lengkap ke dalam req.user
    req.user = {
        id: decoded.id,
        role: decoded.role // Pastikan 'role' ada di dalam payload JWT saat login
    };
    next();
  });
};

// Middleware khusus Admin
const isAdmin = (req, res, next) => {
  // PERBAIKAN: Cek role dari req.user.role, bukan req.role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Admin only' });
  }
  next();
};

module.exports = { auth, isAdmin };