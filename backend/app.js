require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Message = require('./models/messageModel');
const db = require('./config/db');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});
app.use(express.static(path.join(__dirname, '../frontend')));
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
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

io.on('connection', (socket) => {
    console.log(`User tersambung: ${socket.id}`);

    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`Socket ${socket.id} berhasil masuk ke room: ${roomName}`);
    });

    socket.on('send_message', async (data) => {
        console.log("Data diterima dari Nasabah:", data);
        try {
            if (!data.user || !data.text) {
                console.error("Gagal simpan: Nama pengirim atau isi pesan kosong!");
                return;
            }

            await Message.create({ 
                sender_name: data.user, 
                message_text: data.text,
                receiver_name: 'Admin', 
                room_id: data.user 
            });

            io.to('Admin').emit('receive_message', { 
                user: data.user, 
                text: data.text 
            });
        } catch (err) {
            console.error("ERROR SAAT SIMPAN CHAT NASABAH:", err.message);
        }
    });

    socket.on('admin_send_to_user', async (data) => {
        console.log("Data diterima dari Admin:", data);
        try {
            if (!data.target || !data.text) {
                console.error("Gagal meneruskan: Target nasabah atau isi pesan kosong!");
                return;
            }

            await Message.create({ 
                sender_name: 'Admin', 
                message_text: data.text,
                receiver_name: data.target, 
                room_id: data.target 
            });

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
