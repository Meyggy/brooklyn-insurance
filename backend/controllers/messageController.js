const db = require('../config/db');

const createMessage = async (req, res) => {
  const { message, target } = req.body; 
  const sender = req.user.name; // Didapat dari auth JWT
  const role = req.user.role.toLowerCase();

  // Logika Kunci: Jika admin yang kirim, kamarnya adalah nama target (customer).
  // Jika customer yang kirim, kamarnya adalah namanya sendiri.
  const room_id = role === 'admin' ? target : sender;
  const receiver = role === 'admin' ? target : 'Admin';

  try {
    await db.query(
      "INSERT INTO messages (sender_name, message_text, receiver_name, room_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [sender, message, receiver, room_id]
    );
    res.json({ success: true, message: 'Pesan terkirim' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

const getAllMessages = async (req, res) => {
    try {
        const user = req.user; 
        let query;
        let params;

        // PERBAIKAN UTAMA: Gunakan .toLowerCase() agar tidak sensitif huruf besar/kecil
        if (user.role && user.role.toLowerCase() === 'admin') {
            // Admin: Mengambil semua riwayat pesan untuk dikelompokkan di dashboard
            query = "SELECT * FROM messages ORDER BY created_at ASC";
            params = [];
        } else {
            // Nasabah: Hanya mengambil chat di room miliknya sendiri
            query = "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC";
            params = [user.name]; 
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesan' });
    }
};

module.exports = { createMessage, getAllMessages };