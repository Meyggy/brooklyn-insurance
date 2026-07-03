// --- CONFIGURATION ---
const API_BASE = 'http://localhost:3000';

// --- CORE: AUTH & API UTILITIES ---
function getToken() { return localStorage.getItem('token'); }

async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(url, { ...options, headers });
    
    // Auto-logout jika token expired/unauthorized
    if (response.status === 401) {
        logout();
        throw new Error("Sesi berakhir");
    }
    return response;
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// --- UI HELPERS ---
function loadNavbar() {
    const navMenu = document.getElementById('navMenu');
    const navRight = document.getElementById('navRight');
    const token = getToken();
    const role = localStorage.getItem('role');

    if (navMenu) {
        navMenu.innerHTML = `
            <a href="index.html">Beranda</a>
            <a href="products.html">Produk</a>
            <a href="article.html">Artikel</a>
            <a href="about.html">Tentang</a>
            <a href="services.html">Layanan</a>
            <a href="contact.html">Kontak</a>
            ${role === 'admin' ? '<a href="admin-dashboard.html">Admin</a>' : ''}
        `;
    }

    if (navRight) {
        if (token) {
            const name = localStorage.getItem('user_name') || "User";
            navRight.innerHTML = `
                <div class="user-box" onclick="toggleDropdown()">
                    <span>${name}</span>
                    <div class="user-avatar">${name.charAt(0).toUpperCase()}</div>
                    <div class="dropdown" id="dropdownMenu">
                        <a href="profile.html">Profil</a>
                        <a href="history.html">Riwayat</a>
                        <a href="#" onclick="logout()">Logout</a>
                    </div>
                </div>
            `;
        } else {
            navRight.innerHTML = ``;
        }
    }
}

function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// --- AUTH LOGIC ---
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) return alert("Isi semua field");

    const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('role', data.user.role);
        window.location.href = data.user.role === 'admin' ? 'admin-dashboard.html' : 'products.html';
    } else {
        alert(data.message || "Login gagal");
    }
}

// --- PAGE SPECIFIC LOGICS (Dipanggil sesuai kebutuhan) ---
async function loadProducts() {
    const container = document.getElementById('product-list');
    if (!container) return;
    try {
        const res = await apiFetch(`${API_BASE}/products`);
        const data = await res.json();
        container.innerHTML = data.map(p => `
            <div class="card">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p><b>Rp ${Number(p.price).toLocaleString()}</b></p>
                <button onclick="localStorage.setItem('product_id', ${p.id}); window.location.href='payment.html'">Pilih</button>
            </div>
        `).join('');
    } catch (e) { alert("Gagal memuat produk"); }
}

async function loadAdminDashboard() {
    if (localStorage.getItem('role') !== 'admin') window.location.href = "index.html";
    
    // Gabungkan loadDashboard, loadClaims, dll jadi satu fungsi jika perlu
    // Contoh mengambil statistik:
    try {
        const res = await apiFetch(`${API_BASE}/admin/dashboard`);
        // update UI dashboard...
    } catch(e) { console.error(e); }
}

async function loadAirQualityChart() {
    const canvas = document.getElementById('airChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // PERBAIKAN 1: Tambahkan past_days=1 di URL agar data selalu cukup
    const apiUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-6.2088&longitude=106.8456&hourly=pm2_5&timezone=Asia%2FJakarta&past_days=1&forecast_days=0';

    let labels = [];
    let pm25Values = [];
    let latestAQI = 0;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Gagal terhubung ke API");
        const data = await response.json();

        // PERBAIKAN 2: Saring (filter) data yang isinya null (jam masa depan)
        let validTimes = [];
        let validPM25 = [];
        
        for (let i = 0; i < data.hourly.pm2_5.length; i++) {
            if (data.hourly.pm2_5[i] !== null && data.hourly.pm2_5[i] !== undefined) {
                validTimes.push(data.hourly.time[i]);
                validPM25.push(data.hourly.pm2_5[i]);
            }
        }

        // Ambil 10 data PALING AKHIR dari data yang sudah valid
        const recentTimes = validTimes.slice(-10);
        pm25Values = validPM25.slice(-10);

        // Format waktu menjadi Jam:Menit (contoh: 14:00)
        labels = recentTimes.map(dateStr => {
            const date = new Date(dateStr);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        });
        
        latestAQI = pm25Values[pm25Values.length - 1];

    } catch (err) {
        console.warn("API Error, menggunakan Mock Data:", err.message);
        labels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        pm25Values = [45, 50, 55, 62, 70, 75, 68, 60, 58, 65];
        latestAQI = 65;
    }

    // --- RENDER UI ---
    
    // Pastikan angka ditampilkan tanpa desimal berlebih jika ada
    let displayAQI = Math.round(latestAQI);
    let statusText = displayAQI > 50 ? "Tidak Sehat ⚠️" : "Sedang ☁️";
    document.getElementById('todayAQI').innerText = `${displayAQI} µg/m³ - ${statusText}`;

    // Hapus grafik lama jika sudah ada (mencegah bug gambar bertumpuk jika di-refresh)
    if (window.myAirChart instanceof Chart) {
        window.myAirChart.destroy();
    }

    let gradientColor = ctx.createLinearGradient(0, 0, 0, 400);
    gradientColor.addColorStop(0, 'rgba(230, 81, 0, 0.6)');
    gradientColor.addColorStop(1, 'rgba(255, 183, 77, 0.0)');

    window.myAirChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tingkat PM 2.5 (Polusi Udara)',
                data: pm25Values,
                borderColor: '#e65100',
                backgroundColor: gradientColor,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#e65100',
                pointBorderWidth: 2,
                pointRadius: 5,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { 
                    beginAtZero: true,
                    grid: { borderDash: [5, 5] } 
                }
            }
        }
    });
}
// Di dalam assets/js/script.js
function checkLoginUI() {
    const box = document.getElementById('loginBox');
    if (!box) return; // Kalau tidak ketemu kotak login, berhenti

    // Cek apakah token ada (bukan sekadar user_id)
    const token = localStorage.getItem('token');

    if (token) {
        // Ganti tampilan kotak login jadi tombol pintasan
        box.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2>Selamat datang kembali, ${localStorage.getItem('user_name')}!</h2>
                <p>Senang melihatmu lagi.</p>
                <button class="login-btn" onclick="window.location.href='products.html'" style="margin-bottom: 10px; width: 100%;">Lihat Produk</button>
                <button class="login-btn" onclick="window.location.href='history.html'" style="width: 100%; background: #66bb6a;">Riwayat Polis</button>
            </div>
        `;
    }
}
// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    if (document.getElementById('product-list')) loadProducts();
    // Tambahkan pemicu fungsi lain sesuai halaman...
    if (document.getElementById('airChart')) {
        loadAirQualityChart();
    }

});