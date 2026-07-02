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
    console.log(`User tersambung: ${socket.id}`);

    // Event saat user masuk ke room-nya masing-masing
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`Socket ${socket.id} berhasil masuk ke room: ${roomName}`);
    });

    // A. LOGIKA: NASABAH KIRIM PESAN KE ADMIN
    socket.on('send_message', async (data) => {
        console.log("Data diterima dari Nasabah:", data);
        try {
            if (!data.user || !data.text) {
                console.error("Gagal simpan: Nama pengirim atau isi pesan kosong!");
                return;
            }

            // Simpan permanen ke Database
            await Message.create({ 
                sender_name: data.user, 
                message_text: data.text,
                receiver_name: 'Admin', 
                room_id: data.user // Kamar chat menggunakan nama nasabah
            });

            // Teruskan pesan secara real-time ke layar Admin
            io.to('Admin').emit('receive_message', { 
                user: data.user, 
                text: data.text 
            });
        } catch (err) {
            console.error("ERROR SAAT SIMPAN CHAT NASABAH:", err.message);
        }
    });

    // B. LOGIKA: ADMIN BALAS PESAN KE NASABAH SPESIFIK
    socket.on('admin_send_to_user', async (data) => {
        console.log("Data diterima dari Admin:", data);
        try {
            if (!data.target || !data.text) {
                console.error("Gagal meneruskan: Target nasabah atau isi pesan kosong!");
                return;
            }

            // Simpan permanen ke Database
            await Message.create({ 
                sender_name: 'Admin', 
                message_text: data.text,
                receiver_name: data.target, 
                room_id: data.target // Room ID tetap nama nasabah supaya satu riwayat
            });

            // Teruskan pesan secara real-time ke layar nasabah yang dituju
            io.to(data.target).emit('receive_message', { 
                user: 'Admin', 
                text: data.text 
            });
        } catch (err) {
            console.error("ERROR SAAT SIMPAN CHAT ADMIN:", err.message);
        }
    });

    socket.on('disconnect', () => console.log('User terputus'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});