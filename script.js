let products = [
  {
    id: 1,
    name: "Headphone Bluetooth Wireless Bass",
    price: 249000,
    promo: true,
    badge: "Cashback 10%",
    seller: "SoundTech Official",
    desc: "Suara jernih dengan fitur noise cancellation dan baterai tahan hingga 20 jam.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Sepatu Running Sport Light",
    price: 189000,
    promo: true,
    badge: "Diskon 30%",
    seller: "AeroSport Store",
    desc: "Ringan, empuk, dan sangat nyaman dipakai untuk olahraga lari atau harian.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Jam Tangan Minimalis Modern",
    price: 320000,
    promo: false,
    badge: "Garansi 1 Thn",
    seller: "Urban Style",
    desc: "Desain elegan cocok untuk acara formal maupun santai. Tahan air hingga 30m.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"
  }
];

let cart = [];
let orders = [];
let uploadedImageBase64 = "";
let activeStore = "";

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
}

function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function renderProducts(items) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Produk tidak ditemukan.</p>';
    return;
  }

  items.forEach(prod => {
    const sellerName = prod.seller || "Toko Penjual";
    grid.innerHTML += `
      <div class="product-card">
        <img src="${prod.image}" class="product-img" alt="${prod.name}">
        <div class="product-info">
          <span class="product-badge">${prod.badge || 'Terlaris'}</span>
          <div class="product-title">${prod.name}</div>
          <div class="product-price">${formatRupiah(prod.price)}</div>
          
          <div style="font-size: 12px; color: #555; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="cursor: pointer; color: #00aa5b; font-weight: bold;" onclick="openStore('${sellerName}')">🏪 ${sellerName}</span>
            <button onclick="startChat('${sellerName}', '${prod.name}')" style="background: none; border: 1px solid #00aa5b; color: #00aa5b; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">Chat</button>
          </div>

          <div class="product-desc">${prod.desc}</div>
          <button class="btn-add-cart" onclick="addToCart(${prod.id})">+ Keranjang</button>
        </div>
      </div>
    `;
  });
}

function renderPromoProducts() {
  const grid = document.getElementById('promoGrid');
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
          <button class="btn-add-cart" onclick="addToCart(${prod.id})">+ Keranjang</button>
        </div>
      </div>
    `;
  });
}

function filterProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.desc.toLowerCase().includes(query)
  );
  switchPage('home');
  renderProducts(filtered);
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);

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
  document.getElementById('cartCount').innerText = totalCount;
}

function renderCart() {
  const container = document.getElementById('cartList');
  const totalElem = document.getElementById('cartTotal');

  if (cart.length === 0) {
    container.innerHTML = '<p style="color: #888;">Keranjang Anda masih kosong.</p>';
    totalElem.innerText = 'Rp 0';
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
  totalElem.innerText = formatRupiah(total);
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

function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImageBase64 = e.target.result;
      document.getElementById('imagePreview').innerHTML = `<img src="${uploadedImageBase64}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
}

function handleUploadProduct(event) {
  event.preventDefault();

  const name = document.getElementById('prodName').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const desc = document.getElementById('prodDesc').value;

  if (!uploadedImageBase64) {
    alert('Harap pilih foto barang terlebih dahulu.');
    return;
  }

  const newProduct = {
    id: Date.now(),
    name: name,
    price: price,
    promo: false,
    badge: "Baru / Penjual",
    seller: "Toko Saya",
    desc: desc,
    image: uploadedImageBase64
  };

  products.unshift(newProduct);

  document.getElementById('uploadForm').reset();
  document.getElementById('imagePreview').innerHTML = 'Preview Foto';
  uploadedImageBase64 = '';

  alert('Barang berhasil diupload!');
  switchPage('home');
}

function openStore(sellerName) {
  activeStore = sellerName;
  document.getElementById('storeNameTitle').innerText = sellerName;
  document.getElementById('storeAvatar').innerText = sellerName.charAt(0).toUpperCase();

  const storeProducts = products.filter(p => (p.seller || "Toko Penjual") === sellerName);
  const grid = document.getElementById('storeProductGrid');
  grid.innerHTML = '';

  storeProducts.forEach(prod => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${prod.image}" class="product-img" alt="${prod.name}">
        <div class="product-info">
          <div class="product-title">${prod.name}</div>
          <div class="product-price">${formatRupiah(prod.price)}</div>
          <button class="btn-add-cart" onclick="addToCart(${prod.id})">+ Keranjang</button>
        </div>
      </div>
    `;
  });

  switchPage('store');
}

function startChat(sellerName, productName = "") {
  activeStore = sellerName;
  document.getElementById('chatTargetTitle').innerText = `Chat dengan: ${sellerName}`;
  const chatBox = document.getElementById('chatBox');
  
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
  const text = input.value.trim();
  if (!text) return;

  const chatBox = document.getElementById('chatBox');
  
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

window.onload = function() {
  renderProducts(products);
};
let isRegisterMode = false;
let currentUser = null;

// 1. SWITCH MOdE LOGIN / REGISTER
function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('authTitle').innerText = isRegisterMode ? "Daftar Akun Baru" : "Masuk ke Akun";
  document.getElementById('btnAuth').innerText = isRegisterMode ? "Daftar" : "Masuk";
  document.getElementById('groupUsername').style.display = isRegisterMode ? "block" : "none";
  document.getElementById('toggleAuthText').innerText = isRegisterMode ? "Sudah punya akun? Login di sini" : "Belum punya akun? Daftar di sini";
}

// 2. HANDLE LOGIN & REGISTER
function handleAuth() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const username = document.getElementById('authUsername').value;

  if (!email || !password) {
    alert("Email dan password wajib diisi!");
    return;
  }

  if (isRegisterMode) {
    // FUNGSI REGISTER
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        userCredential.user.updateProfile({ displayName: username || "User" }).then(() => {
          alert("Pendaftaran berhasil!");
          location.reload();
        });
      })
      .catch(err => alert("Gagal daftar: " + err.message));
  } else {
    // FUNGSI LOGIN
    auth.signInWithEmailAndPassword(email, password)
      .then(() => alert("Berhasil login!"))
      .catch(err => alert("Gagal login: " + err.message));
  }
}

// 3. EDIT USERNAME
function updateUsername() {
  const newName = document.getElementById('newUsernameInput').value.trim();
  if (!newName) return alert("Isi username baru terlebih dahulu!");

  if (auth.currentUser) {
    auth.currentUser.updateProfile({ displayName: newName })
      .then(() => {
        alert("Username berhasil diperbarui!");
        document.getElementById('userDisplayName').innerText = newName;
        document.getElementById('userAvatar').innerText = newName.charAt(0).toUpperCase();
        document.getElementById('newUsernameInput').value = '';
      })
      .catch(err => alert("Gagal ubah username: " + err.message));
  }
}

// 4. LOGOUT
function keluarAkun() {
  auth.signOut().then(() => alert("Anda telah keluar."));
}

// 5. PANTAU STATUS LOGIN PENGGUNA
auth.onAuthStateChanged((user) => {
  currentUser = user;
  if (user) {
    document.getElementById('authBox').style.display = 'none';
    document.getElementById('profileBox').style.display = 'block';
    const name = user.displayName || "User";
    document.getElementById('userDisplayName').innerText = name;
    document.getElementById('userDisplayEmail').innerText = user.email;
    document.getElementById('userAvatar').innerText = name.charAt(0).toUpperCase();
  } else {
    document.getElementById('authBox').style.display = 'block';
    document.getElementById('profileBox').style.display = 'none';
  }
});

// 6. SIMPAN PRODUK KE DATABASE CLOUD (DILIHAT SEMUA ORANG)
function handleUploadProduct(event) {
  event.preventDefault();

  const name = document.getElementById('prodName').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const desc = document.getElementById('prodDesc').value;

  if (!uploadedImageBase64) {
    alert('Harap pilih foto barang terlebih dahulu.');
    return;
  }

  const sellerName = currentUser ? (currentUser.displayName || "Toko Penjual") : "Toko Anonim";

  // Simpan ke Firestore
  db.collection("products").add({
    name: name,
    price: price,
    desc: desc,
    image: uploadedImageBase64,
    seller: sellerName,
    createdAt: new Date()
  })
  .then(() => {
    alert('Barang berhasil diupload dan bisa dilihat oleh semua pengguna!');
    document.getElementById('uploadForm').reset();
    document.getElementById('imagePreview').innerHTML = 'Preview Foto';
    uploadedImageBase64 = '';
    switchPage('home');
  })
  .catch(err => alert("Gagal upload ke cloud: " + err.message));
}

// 7. AMBIL PRODUK DARI DATABASE CLOUD SECARA REAL-TIME
window.onload = function() {
  db.collection("products").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    let cloudProducts = [];
    snapshot.forEach((doc) => {
      cloudProducts.push({ id: doc.id, ...doc.data() });
    });
    
    // Jika database cloud belum ada isinya, pakai data dummy bawaan
    products = cloudProducts.length > 0 ? cloudProducts : products;
    renderProducts(products);
  });
};
// SEMBUNYIKAN ANIMASI SPLASH SCREEN SETELAH 1.8 DETIK
setTimeout(() => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('hidden');
  }
}, 1800);
      
