const socket = io("http://localhost:3000");
const username = localStorage.getItem("user_name") || "Nasabah";

socket.emit('join_room', username);

async function loadHistory() {
    const token = localStorage.getItem('token');
    
    // Pastikan header Authorization dikirim
    const res = await fetch('http://localhost:3000/messages', {
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    });

    if (!res.ok) {
        console.error("Gagal memuat history");
        return;
    }
    
    const data = await res.json();
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = ""; 

    data.forEach(msg => {
        // Gunakan logic: apakah pesan ini milik user atau admin
        appendMessage(msg.sender_name, msg.message_text, msg.sender_name === username ? 'user' : 'admin');
    });
}
function sendMessage() {
    const input = document.getElementById("messageInput");
    if (!input.value.trim()) return;

    // Payload harus sama dengan struktur di app.js
    const payload = { user: username, text: input.value, target: 'Admin' };
    socket.emit("send_message", payload);
    
    appendMessage(username, input.value, 'user');
    input.value = "";
}

socket.on("receive_message", (data) => {
    if(data.user !== username) {
        appendMessage(data.user, data.text, 'admin');
    }
});

function appendMessage(sender, text, type) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    msgDiv.innerHTML = `<b>${sender}:</b> ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

loadHistory();