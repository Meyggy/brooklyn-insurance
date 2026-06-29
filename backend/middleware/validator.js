const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }
  // Tambahkan validasi regex untuk email/password di sini jika perlu
  next();
};

module.exports = { validateRegister };