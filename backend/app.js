require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Message = require('./models/messageModel');
const db = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/policies', require('./routes/policyRoutes'));
app.use('/claims', require('./routes/claimRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.send('Brooklyn Insurance API Running');
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        socket.join(userId);
    });

   socket.on('send_message', async (data) => {
        try {
            // PERBAIKAN: Sesuaikan field dengan kebutuhan messageModel.js
            await Message.create({ 
                sender_name: data.user, 
                message_text: data.text,
                receiver_name: data.target || 'Admin', // Jika nasabah kirim, otomatis ke Admin
                room_id: data.user // Room menggunakan nama nasabah agar kamarnya konsisten
            });

            // Broadcast pesan ke target (Admin)
            io.to(data.target || 'Admin').emit('receive_message', { 
                user: data.user, 
                text: data.text 
            });
            
            console.log(`Pesan sukses dikirim dari ${data.user} ke Admin`);
        } catch (err) {
            console.error("Gagal simpan chat nasabah:", err);
        }
    });
    socket.on('admin_send_to_user', async (data) => {
        try {
            // DEBUG: Cek apa yang dikirim admin
            console.log("Data diterima dari Admin:", data);

            // Validasi: Jika data kosong, jangan lanjut
            if (!data.target || !data.text) {
                console.error("Data tidak lengkap! Target:", data.target, "Text:", data.text);
                return;
            }

            // SIMPAN KE DB: Pastikan nama kolom SAMA PERSIS dengan di messageModel.js
            // Gunakan string 'Admin' untuk sender, jangan data.user (karena sering undefined)
            await Message.create({ 
                sender_name: 'Admin', 
                message_text: data.text,
                receiver_name: data.target, // target dari frontend
                room_id: data.target        // room_id dari frontend
            });

            // KIRIM KE NASABAH
            io.to(data.target).emit('receive_message', { 
                user: 'Admin', 
                text: data.text 
            });
            
            console.log(`Pesan sukses diteruskan ke: ${data.target}`);
        } catch (err) {
            console.error("GAGAL SIMPAN CHAT ADMIN:", err);
        }
    });
    socket.on('disconnect', () => console.log('User disconnected'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});