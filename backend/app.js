require('dotenv').config();
const express = require('express');
const http = require('http'); // Wajib ada
const { Server } = require('socket.io'); // Wajib ada
const cors = require('cors');
const Message = require('./models/messageModel'); // Model untuk simpan chat

const app = express();
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
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. TAMBAHAN: Saat nasabah/admin masuk, kirim history dari database
    socket.on('load_history', async (username) => {
        try {
            // Ambil histori dari database
            const history = await Message.getAll(); 
        
        socket.emit('previous_messages', history);
        } catch (err) {
            console.error("Gagal load history:", err);
        }
    });

    // 2. LOGIKA ROOM (Agar admin bisa balas nasabah spesifik)
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
    });

    // Di dalam io.on('connection', ...)
    socket.on('send_message', async (data) => {
    try {
        // Simpan pakai Model
        await Message.create({ user: data.user, text: data.text });
        console.log("Pesan tersimpan ke DB:", data.text);

        // Kirim ke Admin
        io.emit('receive_message', data);
    } catch (err) {
        console.error("ERROR DB:", err);
    }
});

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
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