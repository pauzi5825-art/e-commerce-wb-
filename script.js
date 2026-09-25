// ==========================================
// KONFIGURASI SUPABASE DATABASE
// ==========================================
const SUPABASE_URL = "https://qnwaxgqmnlfvlxuseuoi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2F4Z3Ftbmxmdmx4dXNldW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjg4NzIsImV4cCI6MjEwNTkwNDg3Mn0.0SasgtMej2vTuWugLIugAZOEmXILeA4xMwaJlYLtAsU";

// Inisialisasi SDK Supabase Client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Header untuk Akses Supabase REST API
const SUPABASE_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

// 1. DATA PRODUK BAWAAN (DUMMY)
let defaultProducts = [
  {
    id: "1",
    name: "Headphone Bluetooth Wireless Bass",
    price: 249000,
    promo: true,
    badge: "Cashback 10%",
    seller: "SoundTech Official",
    desc: "Suara jernih dengan fitur noise cancellation dan baterai tahan hingga 20 jam.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Sepatu Running Sport Light",
    price: 189000,
    promo: true,
    badge: "Diskon 30%",
    seller: "AeroSport Store",
    desc: "Ringan, empuk, dan sangat nyaman dipakai untuk olahraga lari atau harian.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Jam Tangan Minimalis Modern",
    price: 320000,
    promo: false,
    badge: "Garansi 1 Thn",
    seller: "Urban Style",
    desc: "Desain elegan cocok untuk acara formal maupun santai. Tahan air hingga 30m.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"
  }
];

let products = [...defaultProducts];
let cart = [];
let orders = [];
let uploadedImageBase64 = "";
let activeStore = "";

// ==========================================
// 2. SISTEM AUTENTIKASI MULTI-METHOD (SUPABASE AUTH)
// ==========================================

// Pantau Sesi Login Pengguna secara Otomatis
_supabase.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    currentUser = session.user;
  } else {
    currentUser = null;
  }
  checkAuthState();
});

function checkAuthState() {
  const authBox = document.getElementById('authBox');
  const profileBox = document.getElementById('profileBox');
  const userDisplayName = document.getElementById('userDisplayName');
  const userDisplayEmail = document.getElementById('userDisplayEmail');
  const userAvatar = document.getElementById('userAvatar');

  if (currentUser) {
    if (authBox) authBox.style.display = 'none';
    if (profileBox) profileBox.style.display = 'block';

    const name = currentUser.user_metadata?.full_name || 
                 currentUser.user_metadata?.username || 
                 currentUser.email || 
                 currentUser.phone || 
                 "Pengguna";

    if (userDisplayName) userDisplayName.innerText = name;
    if (userDisplayEmail) userDisplayEmail.innerText = currentUser.email || currentUser.phone || "Akun Terverifikasi";
    if (userAvatar) userAvatar.innerText = name.charAt(0).toUpperCase();
  } else {
    if (authBox) authBox.style.display = 'block';
    if (profileBox) profileBox.style.display = 'none';
  }
}

// METODE 1: LOGIN GOOGLE
async function loginWithGoogle() {
  const { data, error } = await _supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) alert("Gagal login dengan Google: " + error.message);
}

// METODE 2: EMAIL & PASSWORD (DAFTAR / MASUK)
let isRegisterMode = false;

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  const authTitle = document.getElementById('authTitle');
  const btnAuth = document.getElementById('btnAuth');
  const groupUsername = document.getElementById('groupUsername');
  const toggleAuthText = document.getElementById('toggleAuthText');

  if (authTitle) authTitle.innerText = isRegisterMode ? "Daftar Akun Baru" : "Masuk ke Akun";
  if (btnAuth) btnAuth.innerText = isRegisterMode ? "Daftar" : "Masuk";
  if (groupUsername) groupUsername.style.display = isRegisterMode ? "block" : "none";
  if (toggleAuthText) toggleAuthText.innerText = isRegisterMode ? "Sudah punya akun? Login di sini" : "Belum punya akun? Daftar di sini";
}

async function handleEmailAuth() {
  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');
  const usernameInput = document.getElementById('authUsername');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';
  const username = usernameInput ? usernameInput.value.trim() : '';

  if (!email || !password) return alert("Email dan Password wajib diisi!");

  if (isRegisterMode) {
    if (!username) return alert("Username wajib diisi untuk pendaftaran!");

    const { data, error } = await _supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: username } }
    });

    if (error) {
      alert("Gagal Pendaftaran: " + error.message);
    } else {
      alert("Pendaftaran Berhasil! Silakan cek email/langsung login.");
    }
  } else {
    const { data, error } = await _supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) alert("Gagal Login: " + error.message);
    else alert("Berhasil masuk!");
  }
}

// METODE 3: NOMOR TELEPON (OTP SMS/WHATSAPP)
async function sendPhoneOTP() {
  const phoneInput = document.getElementById('authPhone');
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!phone) return alert("Masukkan nomor HP dengan kode negara (contoh: +628123456789)");

  const { data, error } = await _supabase.auth.signInWithOtp({ phone: phone });

  if (error) {
    alert("Gagal mengirim OTP: " + error.message);
  } else {
    alert("Kode OTP berhasil dikirim ke " + phone);
    const otpBox = document.getElementById('otpVerifyGroup');
    if (otpBox) otpBox.style.display = 'block';
  }
}

async function verifyPhoneOTP() {
  const phoneInput = document.getElementById('authPhone');
  const otpInput = document.getElementById('authOTP');

  const phone = phoneInput ? phoneInput.value.trim() : '';
  const token = otpInput ? otpInput.value.trim() : '';

  if (!token) return alert("Masukkan kode OTP!");

  const { data, error } = await _supabase.auth.verifyOtp({
    phone: phone,
    token: token,
    type: 'sms'
  });

  if (error) alert("Kode OTP Salah/Kadaluarsa: " + error.message);
  else alert("Nomor HP berhasil diverifikasi!");
}

// UBAH USERNAME
async function updateUsername() {
  const newNameInput = document.getElementById('newUsernameInput');
  const newName = newNameInput ? newNameInput.value.trim() : '';
  if (!newName) return alert("Isi username baru terlebih dahulu!");

  const { data, error } = await _supabase.auth.updateUser({
    data: { full_name: newName }
  });

  if (error) {
    alert("Gagal memperbarui username: " + error.message);
  } else {
    alert("Username berhasil diperbarui!");
    if (newNameInput) newNameInput.value = '';
    checkAuthState();
  }
}

// LOGOUT
async function keluarAkun() {
  await _supabase.auth.signOut();
  currentUser = null;
  alert("Anda telah keluar dari akun.");
  checkAuthState();
    }

// 3. NAVIGASI HALAMAN
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) targetPage.classList.add('active');

  const activeNav = document.getElementById('nav-' + pageId);
  if (activeNav) activeNav.classList.add('active');

  if (pageId === 'home') renderProducts(products);
  if (pageId === 'promo') renderPromoProducts();
  if (pageId === 'cart') renderCart();
  if (pageId === 'orders') renderOrders();
  if (pageId === 'account') checkAuthState();
}

function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// 4. TAMPILKAN PRODUK
function renderProducts(items) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!items || items.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Produk tidak ditemukan.</p>';
    return;
  }

  items.forEach(prod => {
    const sellerName = prod.seller || "Toko Penjual";
    grid.innerHTML += `
      <div class="product-card">
        <img src="${prod.image || 'https://via.placeholder.com/150'}" class="product-img" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="product-info">
          <span class="product-badge">${prod.badge || 'Terlaris'}</span>
          <div class="product-title">${prod.name}</div>
          <div class="product-price">${formatRupiah(prod.price)}</div>
          
          <div style="font-size: 12px; color: #555; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="cursor: pointer; color: #00aa5b; font-weight: bold;" onclick="openStore('${sellerName}')">🏪 ${sellerName}</span>
            <button onclick="startChat('${sellerName}', '${prod.name}')" style="background: none; border: 1px solid #00aa5b; color: #00aa5b; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">Chat</button>
          </div>

          <div class="product-desc">${prod.desc}</div>
          <button class="btn-add-cart" onclick="addToCart('${prod.id}')">+ Keranjang</button>
        </div>
      </div>
    `;
  });
}

function renderPromoProducts() {
  const grid = document.getElementById('promoGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const promoItems = products.filter(p => p.promo);

  promoItems.forEach(prod => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${prod.image}" class="product-img" alt="${prod.name}">
        <div class="product-info">
          <span class="product-badge">PROMO HARI INI</span>
          <div class="product-title">${prod.name}</div>
          <div class="product-price">${formatRupiah(prod.price)}</div>
          <div class="product-desc">${prod.desc}</div>
          <button class="btn-add-cart" onclick="addToCart('${prod.id}')">+ Keranjang</button>
        </div>
      </div>
    `;
  });
}

function filterProducts() {
  const queryInput = document.getElementById('searchInput');
  const query = queryInput ? queryInput.value.toLowerCase() : '';
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.desc.toLowerCase().includes(query)
  );
  switchPage('home');
  renderProducts(filtered);
}

// 5. KERANJANG BELANJA
function addToCart(productId) {
  const product = products.find(p => p.id == productId);
  if (!product) return;

  const existing = cart.find(item => item.id == productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartBadge();
  alert(`"${product.name}" berhasil ditambahkan ke keranjang!`);
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.innerText = totalCount;
}

function renderCart() {
  const container = document.getElementById('cartList');
  const totalElem = document.getElementById('cartTotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="color: #888;">Keranjang Anda masih kosong.</p>';
    if (totalElem) totalElem.innerText = 'Rp 0';
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-details">
          <strong>${item.name}</strong>
          <div style="color: #00aa5b; font-weight: bold;">${formatRupiah(item.price)}</div>
          <div style="font-size: 13px; color: #666; margin-top: 5px;">
            Jumlah: 
            <button onclick="changeQty(${index}, -1)" style="padding: 2px 8px;">-</button>
            <span style="margin: 0 5px;">${item.qty}</span>
            <button onclick="changeQty(${index}, 1)" style="padding: 2px 8px;">+</button>
          </div>
        </div>
        <div>
          <button onclick="removeFromCart(${index})" style="background: #ff3333; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Hapus</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalElem) totalElem.innerText = formatRupiah(total);
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert('Keranjang belanja Anda masih kosong.');
    return;
  }

  const addressInput = document.getElementById('shippingAddress');
  const address = addressInput ? addressInput.value.trim() : '';

  if (!address) {
    alert('Harap isi alamat pengiriman terlebih dahulu!');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const newOrder = {
    id: 'INV/' + Date.now(),
    date: new Date().toLocaleDateString('id-ID'),
    items: [...cart],
    totalAmount: total,
    address: address,
    status: 'Diproses'
  };

  orders.unshift(newOrder);
  cart = [];
  updateCartBadge();
  if (addressInput) addressInput.value = '';
  alert('Pesanan berhasil dibuat dan akan dikirim ke alamat Anda!');
  switchPage('orders');
}

function renderOrders() {
  const container = document.getElementById('ordersList');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = '<div class="card-box"><p style="color: #888;">Belum ada riwayat pesanan.</p></div>';
    return;
  }

  let html = '';
  orders.forEach(order => {
    let itemsHtml = order.items.map(i => `<li>${i.name} (${i.qty}x) - ${formatRupiah(i.price * i.qty)}</li>`).join('');

    html += `
      <div class="card-box">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
          <strong>${order.id}</strong>
          <span style="background: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${order.status}</span>
        </div>
        <p style="font-size: 12px; color: #888;">Tanggal: ${order.date}</p>
        <p style="font-size: 13px; color: #333; margin-top: 5px;"><strong>Alamat Pengiriman:</strong> ${order.address}</p>
        <ul style="margin: 10px 0 10px 20px; font-size: 14px;">
          ${itemsHtml}
        </ul>
        <div style="text-align: right; font-weight: bold; color: #00aa5b; font-size: 16px;">
          Total: ${formatRupiah(order.totalAmount)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 6. PREVIEW & KOMPRES FOTO
function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 400;
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        uploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.7);

        const prevEl = document.getElementById('imagePreview');
        if (prevEl) prevEl.innerHTML = `<img src="${uploadedImageBase64}" alt="Preview" style="max-height:100px; border-radius:8px;">`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// 7. UPLOAD PRODUK KE SUPABASE
async function handleUploadProduct(event) {
  event.preventDefault();

  const nameInput = document.getElementById('prodName');
  const priceInput = document.getElementById('prodPrice');
  const descInput = document.getElementById('prodDesc');

  if (!nameInput || !priceInput) return;

  const name = nameInput.value;
  const price = parseFloat(priceInput.value);
  const desc = descInput ? descInput.value : '';

  if (!uploadedImageBase64) {
    alert('Harap pilih foto barang terlebih dahulu.');
    return;
  }

  const sellerName = currentUser ? (currentUser.displayName || "Toko Saya") : "Toko Saya";

  // Tambahkan ID berbasis timestamp agar tidak NULL
  const newProduct = {
    id: Date.now().toString(),
    name: name,
    price: price,
    desc: desc,
    image: uploadedImageBase64,
    badge: "Penjual",
    seller: sellerName,
    promo: false
  };

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerText : "Unggah";
  if (submitBtn) {
    submitBtn.innerText = "Mengunggah...";
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify([newProduct])
    });

    if (response.ok) {
      alert('Barang berhasil diupload ke Supabase!');
      if (document.getElementById('uploadForm')) document.getElementById('uploadForm').reset();
      const prevEl = document.getElementById('imagePreview');
      if (prevEl) prevEl.innerHTML = 'Preview Foto';
      uploadedImageBase64 = '';
      
      switchPage('home');
      fetchProductsFromSupabase();
    } else {
      const errData = await response.json();
      alert('Gagal upload ke Supabase: ' + (errData.message || 'Periksa RLS/Tabel Supabase'));
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi ke Supabase.');
  } finally {
    if (submitBtn) {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  }
}

// 8. CHAT & STORE
function openStore(sellerName) {
  activeStore = sellerName;
  const titleEl = document.getElementById('storeNameTitle');
  const avatarEl = document.getElementById('storeAvatar');
  if (titleEl) titleEl.innerText = sellerName;
  if (avatarEl) avatarEl.innerText = sellerName.charAt(0).toUpperCase();

  const storeProducts = products.filter(p => (p.seller || "Toko Penjual") === sellerName);
  const grid = document.getElementById('storeProductGrid');
  if (!grid) return;
  grid.innerHTML = '';

  storeProducts.forEach(prod => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${prod.image}" class="product-img" alt="${prod.name}">
        <div class="product-info">
          <div class="product-title">${prod.name}</div>
          <div class="product-price">${formatRupiah(prod.price)}</div>
          <button class="btn-add-cart" onclick="addToCart('${prod.id}')">+ Keranjang</button>
        </div>
      </div>
    `;
  });

  switchPage('store');
}

function startChat(sellerName, productName = "") {
  activeStore = sellerName;
  const chatTitle = document.getElementById('chatTargetTitle');
  if (chatTitle) chatTitle.innerText = `Chat dengan: ${sellerName}`;
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  chatBox.innerHTML = `
    <div style="background: #e8f5e9; padding: 8px 12px; border-radius: 6px; font-size: 12px; align-self: flex-start;">
      <strong>Halo! Ada yang bisa kami bantu mengenai produk ${productName ? '"' + productName + '"' : ''}?</strong>
    </div>
  `;
  switchPage('chat');
}

function openChatWithStore() {
  if (activeStore) startChat(activeStore);
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  chatBox.innerHTML += `
    <div style="background: #00aa5b; color: white; padding: 8px 12px; border-radius: 6px; font-size: 13px; align-self: flex-end; max-width: 80%;">
      ${text}
    </div>
  `;

  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    chatBox.innerHTML += `
      <div style="background: #f1f1f1; color: #333; padding: 8px 12px; border-radius: 6px; font-size: 13px; align-self: flex-start; max-width: 80%;">
        Terima kasih pesannya! Penjual akan segera membalas.
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);
}

// 9. AMBIL DATA DARI SUPABASE
async function fetchProductsFromSupabase() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`, {
      method: 'GET',
      headers: SUPABASE_HEADERS
    });

    if (response.ok) {
      const cloudProducts = await response.json();
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        products = [...cloudProducts, ...defaultProducts];
      }
    }
  } catch (error) {
    console.log("Memuat data dari Supabase...");
  }
  renderProducts(products);
}

// 10. SAAT HALAMAN DIBUKA
window.onload = function() {
  renderProducts(products);
  fetchProductsFromSupabase();
  checkAuthState();

  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('hidden');
    }
  }, 1800);
};
