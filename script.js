// DATA DUMMY PRODUK AWAL
let products = [
  {
    id: 1,
    name: "Headphone Bluetooth Wireless Bass",
    price: 249000,
    promo: true,
    badge: "Cashback 10%",
    desc: "Suara jernih dengan fitur noise cancellation dan baterai tahan hingga 20 jam.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Sepatu Running Sport Light",
    price: 189000,
    promo: true,
    badge: "Diskon 30%",
    desc: "Ringan, empuk, dan sangat nyaman dipakai untuk olahraga lari atau harian.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Jam Tangan Minimalis Modern",
    price: 320000,
    promo: false,
    badge: "Garansi 1 Thn",
    desc: "Desain elegan cocok untuk acara formal maupun santai. Tahan air hingga 30m.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Kamera Mirrorless HD 4K",
    price: 4500000,
    promo: true,
    badge: "Gratis Ongkir",
    desc: "Hasil foto tajam dan perekaman video 4K jernih. Cocok untuk vlogger.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop"
  }
];

let cart = [];
let orders = [];
let uploadedImageBase64 = "";

// NAVIGASI HALAMAN (SPA)
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById('page-' + pageId).classList.add('active');
  const activeNav = document.getElementById('nav-' + pageId);
  if (activeNav) activeNav.classList.add('active');

  if (pageId === 'home') renderProducts(products);
  if (pageId === 'promo') renderPromoProducts();
  if (pageId === 'cart') renderCart();
  if (pageId === 'orders') renderOrders();
}

// FORMAT RUPIAH
function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// RENDER PRODUK DI BERANDA
function renderProducts(items) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Produk tidak ditemukan.</p>';
    return;
  }

  items.forEach(prod => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${prod.image}" class="product-img" alt="${prod.name}">
        <div class="product-info">
          <span class="product-badge">${prod.badge || 'Terlaris'}</span>
          <div class="product-title">${prod.name}</div>
          <div class="product-price">${formatRupiah(prod.price)}</div>
          <div class="product-desc">${prod.desc}</div>
          <button class="btn-add-cart" onclick="addToCart(${prod.id})">+ Keranjang</button>
        </div>
      </div>
    `;
  });
}

// RENDER PRODUK PROMO
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

// FILTER / PENCARIAN PRODUK
function filterProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.desc.toLowerCase().includes(query)
  );
  switchPage('home');
  renderProducts(filtered);
}

// MENAMBAHKAN ITEM KE KERANJANG
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

// RENDER KERANJANG
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
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartBadge();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

// PROCESS CHECKOUT / PESANAN
function checkout() {
  if (cart.length === 0) {
    alert('Keranjang belanja Anda masih kosong.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const newOrder = {
    id: 'INV/' + Date.now(),
    date: new Date().toLocaleDateString('id-ID'),
    items: [...cart],
    totalAmount: total,
    status: 'Diproses'
  };

  orders.unshift(newOrder);
  cart = [];
  updateCartBadge();
  alert('Pesanan berhasil dibuat! Anda dapat mengeceknya di halaman Pesanan.');
  switchPage('orders');
}

// RENDER DAFTAR PESANAN
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

// PREVIEW FOTO UPLOAD
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

// HANDLE SUBMIT UPLOAD BARANG
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
    desc: desc,
    image: uploadedImageBase64
  };

  products.unshift(newProduct);

  document.getElementById('uploadForm').reset();
  document.getElementById('imagePreview').innerHTML = 'Preview Foto';
  uploadedImageBase64 = '';

  alert('Barang berhasil diupload dan ditayangkan di Tokolapak!');
  switchPage('home');
}

// INITIALIZATION
window.onload = function() {
  renderProducts(products);
};
