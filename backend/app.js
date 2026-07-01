require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./config/db'); // <--- PASTIKAN INI ADA
const Message = require('./models/messageModel'); // Model pesan

const app = express();// Membungkus express dalam http server
const server = http.createServer(app); // Membungkus express dalam http server

// Inisialisasi Socket.io
const io = new Server(server, {
    cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/policies', require('./routes/policyRoutes'));
app.use('/claims', require('./routes/claimRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.send('Brooklyn Insurance API Running');
});

// --- FITUR LIVE CHAT (SOCKET.IO) ---
// --- FITUR LIVE CHAT (SOCKET.IO) ---
// app.js
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        socket.join(userId);
    });

    socket.on('send_message', async (data) => {
        try {
            // Gunakan Model Message yang sudah di-import di atas
            // Ini jauh lebih rapi dan menghindari error 'db is not defined'
            await Message.create({ 
                user: data.user, 
                text: data.text 
            });

            // Broadcast pesan ke target
            io.to(data.target).emit('receive_message', { 
                user: data.user, 
                text: data.text 
            });
            
        } catch (err) {
            console.error("Gagal simpan chat:", err);
        }
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});
// Error Handling Global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

// PENTING: Gunakan server.listen, BUKAN app.listen
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});