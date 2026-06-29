const socket = io("http://localhost:3000");

// 1. Load histori chat saat buka halaman
async function loadHistory() {
    const res = await fetch('http://localhost:3000/messages');
    const data = await res.json();
    data.forEach(msg => appendMessage(msg.sender_name, msg.message_text));
}

// 2. Kirim pesan
function sendMessage() {
    const input = document.getElementById("messageInput");
    const user = localStorage.getItem("user_name") || "Nasabah";
    socket.emit("send_message", { user: user, text: input.value });
    input.value = "";
}

// 3. Terima pesan real-time
socket.on("receive_message", (data) => {
    appendMessage(data.user, data.text);
});

function appendMessage(user, text) {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="msg"><b>${user}:</b> ${text}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

loadHistory();