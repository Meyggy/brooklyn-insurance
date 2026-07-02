const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak tersedia' });
    }

// auth.js
jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    
    // TAMBAHKAN name di sini
    req.user = { 
        id: decoded.id, 
        role: decoded.role,
        name: decoded.name // <--- INI KUNCINYA
    }; 
    next();


    });
};

const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Admin only' });
  }
  next();
};

module.exports = { auth, isAdmin };