// ==========================================
// KONFIGURASI GOOGLE SHEETS VIA SHEETDB
// ==========================================
const SHEETDB_API_URL = "https://sheetdb.io/api/v1/cvv4d9dgw";

let products = [];
let cart = [];
let uploadedImageBase64 = "";

// 1. AMBIL DATA DARI GOOGLE SHEETS SAAT WEB DIBUKA
window.onload = function() {
  fetchProductsFromSheets();

  // Sembunyikan Splash Screen
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('hidden');
  }, 1800);
};

// Fungsi Ambil Data dari SheetDB dengan Pengaman
async function fetchProductsFromSheets() {
  try {
    const response = await fetch(SHEETDB_API_URL);
    if (response.ok) {
      const data = await response.json();
      
      // Pastikan data berupa Array agar tidak eror
      if (Array.isArray(data)) {
        products = data.map(item => ({
          id: item.id || Date.now().toString(),
          name: item.name || 'Produk',
          price: parseFloat(item.price) || 0,
          desc: item.desc || '',
          image: item.image || 'https://via.placeholder.com/150',
          badge: item.badge || 'Barang',
          seller: item.seller || 'Toko Saya'
        })).reverse(); // Urutkan produk terbaru di paling atas
      } else {
        products = [];
      }
      
      renderProducts(products);
    } else {
      console.error("Gagal mengambil data dari SheetDB");
    }
  } catch (error) {
    console.error("Error Koneksi SheetDB:", error);
  }
}

// 2. SIMPAN BARANG BARU KE GOOGLE SHEETS
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

  const newProduct = {
    id: Date.now().toString(),
    name: name,
    price: price,
    desc: desc,
    image: uploadedImageBase64,
    badge: "Penjual",
    seller: "Toko Saya"
  };

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerText : "Unggah";
  if (submitBtn) {
    submitBtn.innerText = "Mengunggah...";
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: [newProduct] })
    });

    if (response.ok) {
      alert('Barang berhasil ditayangkan ke Google Sheets!');
      if (document.getElementById('uploadForm')) document.getElementById('uploadForm').reset();
      const preview = document.getElementById('imagePreview');
      if (preview) preview.innerHTML = 'Preview Foto';
      uploadedImageBase64 = '';
      
      switchPage('home');
      fetchProductsFromSheets();
    } else {
      alert('Gagal mengunggah. Pastikan baris 1 di Google Sheets kamu sudah diisi header: id, name, price, desc, image, badge, seller');
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi.');
    console.error(err);
  } finally {
    if (submitBtn) {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  }
}

// 3. TAMPILKAN PRODUK (GRID VIEW 2 KOLOM)
function renderProducts(productList) {
  const container = document.getElementById('productContainer');
  if (!container) return;

  if (!productList || productList.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Belum ada barang dagangan. Yuk upload barang pertama!</p>`;
    return;
  }

  container.innerHTML = productList.map(prod => `
    <div class="product-card" onclick="openDetail('${prod.id}')">
      <img src="${prod.image || 'https://via.placeholder.com/150'}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150'">
      <div class="product-info">
        <span class="badge">${prod.badge || 'Barang'}</span>
        <h3>${prod.name}</h3>
        <p class="price">Rp ${Number(prod.price).toLocaleString('id-ID')}</p>
        <p class="seller">👤 ${prod.seller || 'Penjual'}</p>
        <button onclick="event.stopPropagation(); addToCart('${prod.id}')" style="margin-top:8px; width:100%; padding:6px; background:#008080; color:white; border:none; border-radius:6px; font-weight:bold;">+ Keranjang</button>
      </div>
    </div>
  `).join('');
}

// 4. NAVIGASI HALAMAN
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const targetPage = document.getElementById(pageId + 'Page');
  if (targetPage) targetPage.classList.add('active');

  const navItem = document.querySelector(`[onclick="switchPage('${pageId}')"]`);
  if (navItem) navItem.classList.add('active');
}

// 5. HANDLING PREVIEW FOTO
function handleImageUpload(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImageBase64 = e.target.result;
      const preview = document.getElementById('imagePreview');
      if (preview) {
        preview.innerHTML = `<img src="${e.target.result}" style="max-height:100px; border-radius:8px;">`;
      }
    };
    reader.readAsDataURL(file);
  }
}

// 6. FITUR KERANJANG BELANJA
function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const itemInCart = cart.find(c => c.id === id);
  if (itemInCart) {
    itemInCart.qty += 1;
  } else {
    cart.push({ ...prod, qty: 1 });
  }

  alert(`"${prod.name}" berhasil masuk ke keranjang!`);
  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById('cartContainer');
  const totalPriceEl = document.getElementById('totalPrice');
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">Keranjang belanjaanmu masih kosong.</p>`;
    if (totalPriceEl) totalPriceEl.innerText = 'Rp 0';
    return;
  }

  let total = 0;
  cartContainer.innerHTML = cart.map((item, index) => {
    total += item.price * item.qty;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
        <div>
          <h4 style="margin:0;">${item.name}</h4>
          <p style="margin:4px 0; color:#008080; font-weight:bold;">Rp ${Number(item.price).toLocaleString('id-ID')} x ${item.qty}</p>
        </div>
        <button onclick="removeFromCart(${index})" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:6px;">Hapus</button>
      </div>
    `;
  }).join('');

  if (totalPriceEl) totalPriceEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// 7. DETAIL PRODUK & PENCARIAN
function openDetail(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  alert(`Detail Produk:\n\nNama: ${prod.name}\nHarga: Rp ${Number(prod.price).toLocaleString('id-ID')}\nDeskripsi: ${prod.desc}`);
}

function searchProducts(keyword) {
  const filtered = products.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
  renderProducts(filtered);
}
