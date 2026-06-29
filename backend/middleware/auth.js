const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token
const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Mengambil token dari format "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak tersedia' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid' });
    }
    
    // Menyimpan user_id dan role ke dalam request agar bisa dipakai di controller
    req.user_id = decoded.id;
    req.role = decoded.role; 
    next();
  });
};

// Middleware khusus Admin
const isAdmin = (req, res, next) => {
  // Kita cek role dari token yang sudah diverifikasi di middleware 'auth' sebelumnya
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Admin only' });
  }
  next();
};

module.exports = { auth, isAdmin };