const db = require('../config/db');

const Message = {
    getAll: async () => {
        const sql = 'SELECT * FROM messages ORDER BY created_at ASC LIMIT 50';
        const [rows] = await db.execute(sql);
        return rows;
    },

    create: async (data) => {
        const sql = 'INSERT INTO messages (sender_name, message_text, room_id, created_at) VALUES (?, ?, ?, NOW())';
        return await db.execute(sql, [data.user, data.text, data.user]);
    },

    // Mengambil pesan berdasarkan room (penting untuk histori per-nasabah)
    getByRoom: async (roomId) => {
        const sql = 'SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC LIMIT 50';
        const [rows] = await db.execute(sql, [roomId]);
        return rows;
    },

    // Mengambil semua user yang pernah chat (untuk sidebar admin)
    getUniqueRooms: async () => {
        const [rows] = await db.execute('SELECT DISTINCT room_id FROM messages');
        return rows;
    }
};

module.exports = Message;