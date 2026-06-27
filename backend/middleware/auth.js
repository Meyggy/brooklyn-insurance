const auth = (req, res, next) => {
  const user_id = req.headers['user_id'];

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user_id = user_id;

  console.log("AUTH OK, USER:", user_id);

  next();
};

const isAdmin = (req, res, next) => {
  const role = req.headers['role'];

  if (!role) {
    return res.status(403).json({ message: 'Role tidak ditemukan' });
  }

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  console.log("ADMIN ACCESS");

  next();
};

module.exports = { auth, isAdmin };