
async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) return alert("Isi semua field");

  try {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {

      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('user_name', data.user.name);

      localStorage.removeItem('token');

      if (data.user.role === 'admin') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'index.html';
      }

    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

async function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:3000/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if(data.success){
    alert("Register berhasil!");
    window.location.href = "index.html";
  } else {
    alert(data.message);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function loadNavbar() {
  const navMenu = document.getElementById('navMenu');
  const navRight = document.getElementById('navRight');
  const user = localStorage.getItem('user_id');

  if (navMenu) {
    navMenu.innerHTML = `
      <a href="index.html">Beranda</a>
      <a href="products.html">Produk</a>
      <a href="article.html">Artikel</a>
      <a href="about.html">Tentang Kami</a>
      <a href="services.html">Layanan</a>
      <a href="contact.html">Hubungi</a>
    `;
  }

  if (navRight) {
    if (user) {
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
      navRight.innerHTML = `<a href="index.html">Login</a>`;
    }
  }
}

function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function checkLoginUI() {
  const box = document.getElementById('loginBox');
  if (!box) return;

  const user = localStorage.getItem('user_id');

  if (user) {
    box.innerHTML = `
      <h2>Selamat datang!</h2>
      <p>Anda sudah login</p>
      <button class="login-btn" onclick="window.location.href='products.html'">Lihat Produk</button>
      <button class="login-btn" onclick="window.location.href='history.html'" style="margin-top:10px;">Riwayat Polis</button>
    `;
  }
}


async function loadProducts() {
  const container = document.getElementById('product-list'); 
  if (!container) return;

  try {
    const res = await fetch('http://localhost:3000/products');
    const data = await res.json();

    if (!Array.isArray(data)) {
        console.error("Data bukan array:", data);
        container.innerHTML = "<p>Gagal memuat produk: Format data salah.</p>";
        return;
    }

    let html = "";
    data.forEach(p => {
      html += `
        <div class="card">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p><b>Rp ${Number(p.price || 0).toLocaleString()}</b></p>
          <button onclick="buyPolicy(${p.id})">Pilih Produk</button>
        </div>
      `;
    });
    container.innerHTML = html;

  } catch (err) {
    console.error("Gagal load produk:", err);
    container.innerHTML = "<p>Server sedang bermasalah. Coba lagi nanti.</p>";
  }
}

function buyPolicy(id, price) {
    localStorage.setItem('product_id', id);
    localStorage.setItem('product_price', price);
    

    window.location.href = "payment.html";
}

function submitForm() {
  localStorage.setItem('name', document.getElementById('name').value);
  localStorage.setItem('age', document.getElementById('age').value);
  window.location.href = "payment.html";
}

async function loadPolicies() {
  const el = document.getElementById('policies');
  if (!el) return;

  try {
    const res = await fetch('http://localhost:3000/policies', {
      headers: { 'user_id': localStorage.getItem('user_id') }
    });
    const data = await res.json();
    let html = "";
    data.forEach(p => {
      html += `
        <div class="card">
          <h4>Produk: ${p.product_id}</h4>
          <p>Premium: Rp ${Number(p.premium).toLocaleString()}</p>
          <p>Status: ${p.status}</p>
        </div>
      `;
    });
    el.innerHTML = html;
  } catch (err) {
    console.log(err);
  }
}

async function submitClaim() {
  const policy_id = document.getElementById('policy_id').value;
  const description = document.getElementById('desc').value;

  if (!policy_id || !description) {
    alert("Lengkapi data!");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user_id': localStorage.getItem('user_id')
      },
      body: JSON.stringify({ policy_id, description })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('claim_id', data.claim_id);
      window.location.href = "claim-detail.html";
    }
  } catch (err) {
    alert("Gagal kirim klaim");
  }
}

async function loadDashboard(){
  try{

    const resUser = await fetch('http://localhost:3000/users',{
      headers:{
        'user_id': localStorage.getItem('user_id'),
        'role': localStorage.getItem('role')
      }
    });

    const users = await resUser.json();
    document.getElementById('users').innerText = "Users: " + users.length;


    const resPol = await fetch('http://localhost:3000/policies',{
      headers:{
        'user_id': localStorage.getItem('user_id'),
        'role': localStorage.getItem('role')
      }
    });

    const policies = await resPol.json();
    document.getElementById('policies').innerText = "Policies: " + policies.length;


    const resCl = await fetch('http://localhost:3000/claims',{
      headers:{
        'user_id': localStorage.getItem('user_id'),
        'role': localStorage.getItem('role')
      }
    });

    const claims = await resCl.json();
    document.getElementById('claims').innerText = "Claims: " + claims.length;

  }catch(err){
    console.log(err);
  }
}

async function loadClaims() {
  const table = document.getElementById('claimTable');
  if (!table) return;

  try {
    const res = await fetch('http://localhost:3000/claims', {
      headers: {
        'user_id': localStorage.getItem('user_id'),
        'role': localStorage.getItem('role')
      }
    });
    const data = await res.json();
    let html = "";
    data.forEach(c => {
      html += `
        <tr>
          <td>${c.id}</td>
          <td>${c.policy_id}</td>
          <td>${c.description}</td>
          <td>${c.status}</td>
          <td>
            <button onclick="updateStatus(${c.id},'approved')">Approve</button>
            <button onclick="updateStatus(${c.id},'rejected')">Reject</button>
          </td>
        </tr>
      `;
    });
    table.innerHTML = html;
  } catch (err) {
    console.log(err);
  }
}

async function updateStatus(id, status) {
  await fetch(`http://localhost:3000/claims/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'user_id': localStorage.getItem('user_id'),
      'role': localStorage.getItem('role')
    },
    body: JSON.stringify({ status })
  });
  alert("Status diupdate");
  loadClaims();
}

function protectAdmin() {
  if (document.getElementById('claimTable')) {
    if (localStorage.getItem('role') !== 'admin') {
      alert("Akses ditolak");
      window.location.href = "index.html";
    }
  }
}

async function processPayment() {
  const userId = localStorage.getItem('user_id');
  const productId = localStorage.getItem('product_id');
  const price = localStorage.getItem('product_price');

  if (!userId || !productId) {
    alert("Data tidak lengkap. Silakan pilih produk kembali.");
    window.location.href = "products.html";
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        premium: price,
        status: 'active'
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert("🎉 Pembayaran Berhasil! Polis Anda telah aktif.");
      window.location.href = "history.html";
    } else {
      alert("Pembayaran Gagal: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Gagal terhubung ke server.");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  checkLoginUI();
  protectAdmin();
  
  if (document.getElementById('product-list')) loadProducts(); // 🔥 Panggil ini
  if (document.getElementById('policies')) loadPolicies();
  if (document.getElementById('claimTable')) loadClaims();
  if (document.getElementById('users')) loadDashboard();
});

window.onclick = function(e) {
  if (!e.target.closest('.user-box')) {
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.style.display = 'none';
  }
};