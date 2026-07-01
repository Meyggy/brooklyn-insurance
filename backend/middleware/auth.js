const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token
const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Memastikan format header adalah 'Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak tersedia' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token tidak valid" });
        
        // Data user disimpan di sini
        req.user = { id: decoded.id, role: decoded.role }; 
        next();
    });
};

// Middleware khusus Admin
const isAdmin = (req, res, next) => {
  // Ubah ke lowercase agar aman dari perbedaan huruf besar/kecil
  const userRole = req.user.role ? req.user.role.toLowerCase() : '';
  if (!req.user || userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  next();
};
module.exports = { auth, isAdmin };