// ==========================================
// KONFIGURASI GOOGLE SHEETS VIA SHEETDB
// ==========================================
const SHEETDB_API_URL = "https://sheetdb.io/api/v1/cvv4d9dgw";

let products = [];
let uploadedImageBase64 = "";

// 1. AMBIL DATA DARI GOOGLE SHEETS SAAT WEB DIBUKA
window.onload = function() {
  fetchProductsFromSheets();

  // Sembunyikan Splash Screen setelah 1.8 detik
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('hidden');
  }, 1800);
};

async function fetchProductsFromSheets() {
  try {
    const response = await fetch(SHEETDB_API_URL);
    if (response.ok) {
      const data = await response.json();
      products = data.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0
      })).reverse(); // Urutkan produk terbaru di atas
      
      renderProducts(products);
    }
  } catch (error) {
    console.error("Gagal memuat produk dari Google Sheets:", error);
  }
}

// 2. SIMPAN BARANG BARU KE GOOGLE SHEETS
async function handleUploadProduct(event) {
  event.preventDefault();

  const name = document.getElementById('prodName').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const desc = document.getElementById('prodDesc').value;

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
  const originalText = submitBtn.innerText;
  submitBtn.innerText = "Mengunggah ke Sheets...";
  submitBtn.disabled = true;

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
      document.getElementById('uploadForm').reset();
      document.getElementById('imagePreview').innerHTML = 'Preview Foto';
      uploadedImageBase64 = '';
      switchPage('home');
      fetchProductsFromSheets();
    } else {
      alert('Gagal mengunggah barang. Pastikan Google Sheets sudah diatur publik (Editor).');
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi.');
  } finally {
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
  }
}

// 3. TAMPILKAN PRODUK (GRID VIEW 2 KOLOM)
function renderProducts(productList) {
  const container = document.getElementById('productContainer');
  if (!container) return;

  if (productList.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Belum ada barang dagangan. Yuk upload barang pertama!</p>`;
    return;
  }

  container.innerHTML = productList.map(prod => `
    <div class="product-card" onclick="openDetail('${prod.id}')">
      <img src="${prod.image || 'https://via.placeholder.com/150'}" alt="${prod.name}">
      <div class="product-info">
        <span class="badge">${prod.badge || 'Barang'}</span>
        <h3>${prod.name}</h3>
        <p class="price">Rp ${prod.price.toLocaleString('id-ID')}</p>
        <p class="seller">👤 ${prod.seller || 'Penjual'}</p>
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
      document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" style="max-height:100px; border-radius:8px;">`;
    };
    reader.readAsDataURL(file);
  }
}

// 6. DETAIL PRODUK
function openDetail(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  alert(`Detail Produk:\nNama: ${prod.name}\nHarga: Rp ${prod.price.toLocaleString('id-ID')}\nDeskripsi: ${prod.desc}`);
}
  
