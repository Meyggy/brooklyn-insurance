const socket = io("http://localhost:3000");
const username = localStorage.getItem("user_name") || "Nasabah";
socket.emit('join_room', username);

// 1. Load history
async function loadHistory() {
    const res = await fetch('http://localhost:3000/messages');
    const data = await res.json();
    data.forEach(msg => {
        // Sesuaikan dengan nama kolom di database (sender_name/message_text)
        appendMessage(msg.sender_name, msg.message_text, msg.sender_name === username ? 'user' : 'admin');
    });
}

// 2. Kirim pesan
function sendMessage() {
    const input = document.getElementById("messageInput");
    if (!input.value.trim()) return;

    // Pastikan payload sama dengan yang diterima backend (data.user, data.text, data.target)
    socket.emit("send_message", { user: username, text: input.value, target: 'Admin' });
    
    appendMessage(username, input.value, 'user');
    input.value = "";
}

// 3. Terima pesan real-time
socket.on("receive_message", (data) => {
    appendMessage(data.user, data.text, 'admin');
});

function appendMessage(user, text, type) {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="msg ${type}"><b>${user}:</b> ${text}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

loadHistory(); // Panggil fungsi ini!