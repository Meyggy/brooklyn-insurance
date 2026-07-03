// models/messageModel.js
const db = require('../config/db');

const Message = {
    create: async (data) => {
        const sql = `INSERT INTO messages (sender_name, message_text, receiver_name, room_id, created_at) 
                     VALUES (?, ?, ?, ?, NOW())`;
        
        const params = [
            data.sender_name, 
            data.message_text, 
            data.receiver_name, 
            data.room_id
        ];

        console.log("Model menerima data:", data);

        if (params.includes(undefined)) {
            throw new Error("Data yang dikirim ke database mengandung UNDEFINED!");
        }

        try {
            await db.query(sql, params);
            console.log("Database: Pesan berhasil disimpan!");
        } catch (err) {
            console.error("Database: Gagal menyimpan pesan!", err);
            throw err;
        }
    }
};

module.exports = Message;