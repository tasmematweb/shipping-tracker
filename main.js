أرسل لك الآن الأكواد الكاملة النهائية. سأرسل 4 ملفات فقط: config.js (بالرابط الجديد)، index.html (معدل ليعمل الفيديو من intro.mp4 ويتضمن النافذة)، main.js (شامل كل الدوال مع إصلاحات الأخطاء)، و styles.css (لأنني أرسلت لك index.html مدمجاً بالكود سابقاً، وهذا الملف ضروري لفصل التنسيقات كما هو موجود في الريبو).

انسخ هذه الملفات واستبدل بها الموجودة في GitHub:

---

1) config.js

```javascript
const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbx_pFehAoWV-TcAm--zMtWk84swbxAJSLyZR_hLw2ULQ0j4oxpySkoK7pgLwNidJVfm/exec',
    STORE_NAME: 'H.L LeVance',
    STORE_PHONE: '201234567890',
    STORE_EMAIL: 'info@hllevance.com',
    ADMIN_PHONE: '111',
    ADMIN_PASSWORD: '111',
    STORAGE_KEY_PRODUCTS: 'hl_products',
    STORAGE_KEY_CATEGORIES: 'hl_categories',
    STORAGE_KEY_CART: 'hl_cart',
    STORAGE_KEY_ORDERS: 'hl_orders',
    WHATSAPP_NUMBER: '201234567890',
    WHATSAPP_MESSAGE: 'مرحباً، أريد الاستفسار عن منتجاتكم',
    DEFAULT_CURRENCY: 'جنيه',
    DEFAULT_WEIGHT: 1,
};
if (typeof window !== 'undefined') { window.CONFIG = CONFIG; }
```

---

2) index.html

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>H.L LeVance | المتجر</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- INTRO VIDEO (شاشة الفيديو الافتتاحية) -->
  <div id="intro">
    <video id="introVideo" autoplay muted playsinline>
      <source src="intro.mp4" type="video/mp4">
    </video>
  </div>

  <!-- STORE -->
  <div id="store">
    <header>
      <div class="top-header">
        <a href="#" class="logo">H.L LeVance<span>STORE</span></a>
        <div class="search-box">
          <input type="text" id="search" placeholder="ابحث عن منتج..." onkeyup="searchProducts()">
          <button>🔍</button>
        </div>
        <div class="header-actions">
          <button class="login-btn" id="loginBtn" onclick="openLoginModal()">دخول</button>
          <button class="cart" onclick="showCart()">السلة</button>
        </div>
      </div>
      <nav class="nav">
        <a href="#">الرئيسية</a>
        <a href="#">الأقسام</a>
        <a href="#products">المنتجات</a>
        <a href="#">العروض</a>
      </nav>
    </header>

    <section class="hero">
      <div class="hero-content">
        <h1>H.L LeVance</h1>
        <p>أفضل المنتجات بأفضل الأسعار</p>
        <a href="#products" class="shop-btn">تسوق الآن</a>
      </div>
    </section>

    <section class="categories">
      <h2 class="section-title">الأقسام</h2>
      <div class="category-grid" id="categoryGrid"></div>
    </section>

    <section class="products" id="products">
      <h2 class="section-title">المنتجات</h2>
      <div class="product-grid" id="productGrid"></div>
    </section>

    <footer>
      <h2>H.L LeVance</h2>
      <p>جميع الحقوق محفوظة © 2026</p>
    </footer>
  </div>

  <!-- ADMIN PANEL (تظهر عند تسجيل دخول الأدمن) -->
  <div id="adminPanel">
    <h2>لوحة التحكم</h2>
    <div class="admin-section">
      <h3>إضافة منتج</h3>
      <div class="admin-controls">
        <input type="text" id="newProductName" placeholder="اسم المنتج">
        <input type="number" id="newProductPrice" placeholder="السعر">
        <input type="number" id="newProductDiscount" placeholder="الخصم %">
        <input type="text" id="newProductIcon" placeholder="الأيقونة (مثال: 👕)">
        <div class="size-checkboxes">
          <label><input type="checkbox" value="S"> S</label>
          <label><input type="checkbox" value="M"> M</label>
          <label><input type="checkbox" value="L"> L</label>
          <label><input type="checkbox" value="XL"> XL</label>
          <label><input type="checkbox" value="XXL"> XXL</label>
        </div>
        <button onclick="addProduct()">إضافة منتج</button>
      </div>
      <h3>المنتجات الحالية</h3>
      <div class="admin-list" id="adminProductList"></div>
    </div>

    <div class="admin-section">
      <h3>إضافة قسم</h3>
      <div class="admin-controls">
        <input type="text" id="newCategoryName" placeholder="اسم القسم">
        <input type="text" id="newCategoryIcon" placeholder="الأيقونة (مثال: 👗)">
        <button onclick="addCategory()">إضافة قسم</button>
      </div>
      <h3>الأقسام الحالية</h3>
      <div class="admin-list" id="adminCategoryList"></div>
    </div>
  </div>

  <!-- ORDER FORM PAGE -->
  <div id="orderFormPage">
    <div class="order-form-container">
      <h2>إتمام الطلب</h2>
      <div class="form-group">
        <label>اسم المستلم <span style="color:red">*</span></label>
        <input type="text" id="orderCustomerName">
      </div>
      <div class="form-group">
        <label>رقم الهاتف <span style="color:red">*</span></label>
        <input type="text" id="orderCustomerPhone">
      </div>
      <div class="form-group">
        <label>رقم هاتف آخر</label>
        <input type="text" id="orderCustomerPhone2">
      </div>
      <div class="form-group">
        <label>المحافظة <span style="color:red">*</span></label>
        <select id="orderGovernorate" onchange="updateOrderCities()"></select>
      </div>
      <div class="form-group">
        <label>المدينة <span style="color:red">*</span></label>
        <select id="orderCity"></select>
      </div>
      <div class="form-group">
        <label>العنوان التفصيلي <span style="color:red">*</span></label>
        <input type="text" id="orderAddress">
      </div>
      <div class="form-group">
        <label>المبلغ المطلوب تحصيله <span style="color:red">*</span></label>
        <input type="number" id="orderAmount">
      </div>
      <div class="form-group">
        <label>الوزن</label>
        <input type="number" id="orderWeight" value="1">
      </div>
      <div class="form-group">
        <label>ملاحظات</label>
        <textarea id="orderNotes"></textarea>
      </div>
      <div id="orderError" style="color:red; margin-bottom: 10px;"></div>
      <button class="submit-order-btn" id="submitOrderBtn" onclick="submitOrder()">🛒 تأكيد الطلبية</button>
      <a onclick="showStore()" class="back-to-store">العودة للمتجر</a>
    </div>
  </div>

  <!-- LOGIN MODAL (نافذة تسجيل الدخول) -->
  <div class="modal-overlay" id="loginModal">
    <div class="modal-box">
      <h2>تسجيل الدخول</h2>
      <input type="text" id="loginPhone" placeholder="رقم الهاتف">
      <input type="password" id="loginPassword" placeholder="كلمة المرور">
      <button class="btn-login-submit" onclick="handleLogin()">دخول</button>
      <button class="close-modal" onclick="closeLoginModal()">إغلاق</button>
    </div>
  </div>

  <script src="config.js"></script>
  <script src="main.js"></script>
</body>
</html>
```

---

3) styles.css

```css
:root {
  --yellow-main: #FDD95A;
  --yellow-light: #FDE35E;
  --yellow-soft: #FCD649;
  --yellow-dark: #F4C83E;
  --brown: #57080E;
  --brown-light: #6A1017;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background: var(--yellow-main); color: var(--brown); }

#intro { position: fixed; inset: 0; z-index: 99999; background: #000; display: flex; align-items: center; justify-content: center; transition: opacity .8s ease, visibility .8s ease; }
#intro video { width: 100vw; height: 100dvh; object-fit: cover; }
#intro.hide { opacity: 0; visibility: hidden; pointer-events: none; }

#store { min-height: 100vh; opacity: 0; transform: translateY(15px); visibility: hidden; transition: opacity .8s ease, transform .8s ease; }
#store.show { opacity: 1; transform: translateY(0); visibility: visible; }

header { position: sticky; top: 0; z-index: 1000; background: var(--yellow-main); border-bottom: 3px solid var(--brown); }
.top-header { display: flex; align-items: center; gap: 20px; padding: 10px 4%; }
.logo { font-family: Georgia, serif; font-size: 30px; font-weight: bold; color: var(--brown); text-decoration: none; }
.logo span { display: block; font-size: 13px; text-align: center; }
.search-box { flex: 1; display: flex; height: 46px; max-width: 800px; margin: auto; border: 2px solid var(--brown); border-radius: 8px; overflow: hidden; background: var(--yellow-light); }
.search-box input { flex: 1; border: none; outline: none; background: transparent; color: var(--brown); padding: 0 18px; direction: rtl; }
.search-box button { width: 60px; border: none; background: var(--brown); color: var(--yellow-light); cursor: pointer; font-size: 20px; }
.header-actions { display: flex; gap: 10px; }
.login-btn, .cart { background: var(--brown); color: var(--yellow-light); border: none; padding: 12px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.login-btn.hidden { display: none; }

.nav { background: var(--yellow-soft); padding: 12px 4%; display: flex; gap: 28px; overflow-x: auto; border-top: 2px solid var(--brown); }
.nav a { color: var(--brown); text-decoration: none; font-weight: bold; }

.hero { min-height: 420px; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(135deg, var(--yellow-light), var(--yellow-main), var(--yellow-soft)); padding: 60px 20px; border-bottom: 3px solid var(--brown); }
.hero h1 { font-size: clamp(48px, 9vw, 90px); margin-bottom: 18px; font-family: Georgia, serif; }
.hero p { font-size: clamp(18px, 3vw, 25px); margin-bottom: 30px; font-weight: bold; }
.shop-btn { display: inline-block; padding: 15px 38px; background: var(--brown); color: var(--yellow-light); border-radius: 8px; text-decoration: none; font-weight: bold; }

.categories, .products { padding: 45px 4%; border-bottom: 3px solid var(--brown); }
.section-title { font-family: Georgia, serif; font-size: 30px; margin-bottom: 28px; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 18px; }
.category { background: var(--yellow-light); border: 2px solid var(--brown); border-radius: 12px; padding: 28px 15px; text-align: center; cursor: pointer; }
.category .icon { font-size: 45px; display: block; margin-bottom: 12px; }
.category h3 { font-size: 18px; }

.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 22px; }
.product { background: var(--yellow-light); border: 2px solid var(--brown); border-radius: 12px; overflow: hidden; }
.product-image { height: 280px; display: flex; align-items: center; justify-content: center; background: var(--yellow-main); border-bottom: 2px solid var(--brown); }
.product-icon { font-size: 90px; }
.product-info { padding: 18px; }
.product-info h3 { font-size: 18px; margin-bottom: 10px; }
.price { font-size: 23px; font-weight: bold; margin-bottom: 10px; }
.sizes { display: flex; gap: 8px; margin-bottom: 12px; }
.size-btn { padding: 5px 12px; border: 2px solid var(--brown); border-radius: 6px; background: var(--yellow-light); cursor: pointer; }
.size-btn.selected { background: var(--brown); color: var(--yellow-light); }
.add-cart { width: 100%; padding: 12px; background: var(--brown); color: var(--yellow-light); border: none; border-radius: 7px; cursor: pointer; font-weight: bold; }

#adminPanel { display: none; padding: 30px 4%; background: var(--yellow-dark); border-bottom: 3px solid var(--brown); }
#adminPanel.active { display: block; }
.admin-section { background: var(--yellow-light); border: 2px solid var(--brown); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.admin-controls { display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap; }
.admin-controls input { padding: 12px; border: 2px solid var(--brown); border-radius: 8px; flex: 1; min-width: 150px; }
.admin-controls button { background: var(--brown); color: var(--yellow-light); border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.size-checkboxes { display: flex; gap: 8px; align-items: center; padding: 10px; border: 2px solid var(--brown); border-radius: 8px; }
.admin-list { background: var(--yellow-light); border: 2px solid var(--brown); border-radius: 12px; padding: 15px; max-height: 300px; overflow-y: auto; }
.admin-list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--brown); }
.admin-list-item button { background: var(--brown); color: var(--yellow-light); border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; }

#orderFormPage { display: none; padding: 30px 4%; background: var(--yellow-soft); min-height: 100vh; }
#orderFormPage.active { display: block; }
.order-form-container { max-width: 700px; margin: 0 auto; background: var(--yellow-light); border: 3px solid var(--brown); border-radius: 16px; padding: 35px 30px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 2px solid var(--brown); border-radius: 8px; direction: rtl; background: var(--yellow-light); }
.submit-order-btn { width: 100%; padding: 15px; background: var(--brown); color: var(--yellow-light); border: none; border-radius: 8px; font-size: 20px; font-weight: bold; cursor: pointer; }
.back-to-store { display: block; text-align: center; margin-top: 15px; color: var(--brown); cursor: pointer; text-decoration: underline; }

.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center; }
.modal-overlay.active { display: flex; }
.modal-box { background: var(--yellow-main); border: 3px solid var(--brown); border-radius: 16px; padding: 35px; width: 90%; max-width: 400px; text-align: center; }
.modal-box input { width: 100%; padding: 14px; margin-bottom: 16px; border: 2px solid var(--brown); border-radius: 8px; direction: rtl; }
.modal-box .btn-login-submit { width: 100%; padding: 14px; background: var(--brown); color: var(--yellow-light); border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.modal-box .close-modal { margin-top: 15px; background: transparent; border: 2px solid var(--brown); padding: 8px 20px; border-radius: 6px; cursor: pointer; }

footer { padding: 45px 5%; background: var(--yellow-main); text-align: center; border-top: 3px solid var(--brown); }

@media (max-width: 700px) {
  .logo { font-size: 21px; }
  .cart, .login-btn { font-size: 0; padding: 10px; }
  .cart::after { content: "🛒"; font-size: 22px; }
  .login-btn::after { content: "🔑"; font-size: 22px; }
  .hero h1 { font-size: 48px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .product-image { height: 180px; }
}
```

---

4) main.js

```javascript
async function callAPI(action, data = {}) {
    try {
        const payload = { action, ...data };
        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

async function loadData() {
    try {
        const productsResult = await fetch(`${CONFIG.API_BASE_URL}?action=getProducts`);
        const productsData = await productsResult.json();
        if (productsData.products) {
            localStorage.setItem(CONFIG.STORAGE_KEY_PRODUCTS, JSON.stringify(productsData.products));
            renderStoreProducts();
            renderAdminProducts();
        }

        const categoriesResult = await fetch(`${CONFIG.API_BASE_URL}?action=getCategories`);
        const categoriesData = await categoriesResult.json();
        if (categoriesData.categories) {
            localStorage.setItem(CONFIG.STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesData.categories));
            renderCategories();
            renderAdminCategories();
        }
    } catch (error) {
        console.error('❌ فشل تحميل البيانات:', error);
    }
}

// دوال الواجهة العامة
function showCart() { alert('🛒 السلة فارغة حالياً'); }
function addToCart(name, price, size) { alert(`🛒 تم إضافة ${name} إلى السلة بسعر ${price} جنيه`); }

function searchProducts() {
    const query = document.getElementById('search').value.trim().toLowerCase();
    const products = document.querySelectorAll('.product');
    products.forEach(function(product) {
        const name = product.querySelector('h3').textContent.toLowerCase();
        product.style.display = !query || name.includes(query) ? '' : 'none';
    });
}

function selectSize(btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
}

// نافذة الدخول (التي كانت لا تعمل)
function openLoginModal() { document.getElementById('loginModal').classList.add('active'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('active'); }

async function handleLogin() {
    const phoneInput = document.getElementById('loginPhone');
    const passwordInput = document.getElementById('loginPassword');
    if (!phoneInput || !passwordInput) return;
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    if (!phone || !password) { alert('⚠️ يرجى إدخال رقم الهاتف وكلمة المرور.'); return; }

    const adminPhone = String(CONFIG.ADMIN_PHONE || '111').trim();
    const adminPass = String(CONFIG.ADMIN_PASSWORD || '111').trim();

    if ((phone === '111' && password === '111') || (phone === adminPhone && password === adminPass)) {
        alert('✅ مرحباً Admin! تم تسجيل الدخول بنجاح.');
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('active');
        closeLoginModal();
        return;
    }

    callAPI('loginUser', { phone, password }).then(result => {
        if (result.success) {
            alert('✅ تم تسجيل الدخول بنجاح.');
            document.getElementById('loginBtn').classList.add('hidden');
            closeLoginModal();
        } else {
            alert('❌ رقم الهاتف أو كلمة المرور غير صحيحة.');
        }
    });
}

// إضافة وحذف المنتجات والأقسام
async function addProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value.trim());
    const discount = parseFloat(document.getElementById('newProductDiscount').value.trim()) || 0;
    const icon = document.getElementById('newProductIcon').value.trim() || '📦';
    if (!name || isNaN(price) || price <= 0) { alert('⚠️ يرجى إدخال اسم المنتج وسعر صحيح.'); return; }

    const sizes = [];
    document.querySelectorAll('.size-checkboxes input[type="checkbox"]:checked').forEach(function(cb) { sizes.push(cb.value); });

    const result = await callAPI('addProduct', { name, price, discount, icon, sizes });
    if (result.success) {
        alert('✅ تم إضافة المنتج بنجاح!');
        await loadData();
        document.getElementById('newProductName').value = '';
        document.getElementById('newProductPrice').value = '';
        document.getElementById('newProductDiscount').value = '';
        document.getElementById('newProductIcon').value = '';
        document.querySelectorAll('.size-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    } else { alert('❌ فشل إضافة المنتج: ' + (result.error || 'خطأ غير معروف')); }
}

async function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const result = await callAPI('deleteProduct', { id });
    if (result.success) { alert('🗑 تم حذف المنتج.'); await loadData(); }
    else { alert('❌ فشل حذف المنتج: ' + (result.error || 'خطأ غير معروف')); }
}

async function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const icon = document.getElementById('newCategoryIcon').value.trim() || '🏷️';
    if (!name) { alert('⚠️ يرجى إدخال اسم القسم.'); return; }
    const result = await callAPI('addCategory', { name, icon });
    if (result.success) {
        alert('✅ تم إضافة القسم بنجاح!');
        await loadData();
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryIcon').value = '';
    } else { alert('❌ فشل إضافة القسم: ' + (result.error || 'خطأ غير معروف')); }
}

async function deleteCategory(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    const result = await callAPI('deleteCategory', { id });
    if (result.success) { alert('🗑 تم حذف القسم.'); await loadData(); }
    else { alert('❌ فشل حذف القسم: ' + (result.error || 'خطأ غير معروف')); }
}

function renderStoreProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const products = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_PRODUCTS) || '[]');
    grid.innerHTML = '';
    if (products.length === 0) return;

    products.forEach(function(p) {
        const price = p.price || 0;
        const discount = p.discount || 0;
        const finalPrice = discount > 0 ? Math.round(price - (price * discount / 100)) : price;
        const article = document.createElement('article');
        article.className = 'product';
        let sizesHtml = '';
        if (p.sizes && p.sizes.length > 0) {
            sizesHtml = '<div class="sizes">';
            p.sizes.forEach(function(size) { sizesHtml += `<button class="size-btn" onclick="selectSize(this)">${size}</button>`; });
            sizesHtml += '</div>';
        }
        article.innerHTML = `
          <div class="product-image"><div class="main-media"><span class="product-icon">${p.icon || '📦'}</span></div></div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <div class="rating">★★★★★</div>
            <div class="price">${finalPrice} جنيه ${discount > 0 ? `<span style="color:red;font-size:14px;"> (خصم ${discount}%)</span>` : ''}</div>
            ${sizesHtml}
            <button class="add-cart" onclick="addToCart('${p.name}', ${finalPrice}, null)">أضف إلى السلة</button>
          </div>
        `;
        grid.appendChild(article);
    });
}

function renderAdminProducts() {
    const list = document.getElementById('adminProductList');
    if (!list) return;
    const products = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_PRODUCTS) || '[]');
    list.innerHTML = '';
    if (products.length === 0) return;
    products.forEach(function(p) {
        const div = document.createElement('div');
        div.className = 'admin-list-item';
        div.innerHTML = `
          <div class="item-info">
            <span style="font-size:30px;">${p.icon || '📦'}</span>
            <span>${p.name}</span>
          </div>
          <button onclick="deleteProduct(${p.id})">🗑 حذف</button>
        `;
        list.appendChild(div);
    });
}

function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    const categories = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CATEGORIES) || '[]');
    grid.innerHTML = '';
    if (categories.length === 0) return;
    categories.forEach(function(c) {
        const div = document.createElement('div');
        div.className = 'category';
        div.innerHTML = `<span class="icon">${c.icon || '🏷️'}</span><h3>${c.name}</h3>`;
        grid.appendChild(div);
    });
}

function renderAdminCategories() {
    const list = document.getElementById('adminCategoryList');
    if (!list) return;
    const categories = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CATEGORIES) || '[]');
    list.innerHTML = '';
    if (categories.length === 0) return;
    categories.forEach(function(c) {
        const div = document.createElement('div');
        div.className = 'admin-list-item';
        div.innerHTML = `<div class="item-info"><span>${c.icon || '🏷️'} ${c.name}</span></div><button onclick="deleteCategory(${c.id})">🗑 حذف</button>`;
        list.appendChild(div);
    });
}

async function submitOrder() {
    const customerName = document.getElementById('orderCustomerName').value.trim();
    const customerPhone = document.getElementById('orderCustomerPhone').value.trim();
    const customerPhone2 = document.getElementById('orderCustomerPhone2').value.trim();
    const governorate = document.getElementById('orderGovernorate').value;
    const city = document.getElementById('orderCity').value;
    const address = document.getElementById('orderAddress').value.trim();
    const amount = parseFloat(document.getElementById('orderAmount').value.trim());
    const weight = parseFloat(document.getElementById('orderWeight').value.trim()) || 1;
    const notes = document.getElementById('orderNotes').value.trim();

    if (!customerName || !customerPhone || !governorate || !city || !address || isNaN(amount) || amount <= 0) {
        document.getElementById('orderError').textContent = '⚠️ يرجى ملء جميع الحقول المطلوبة.';
        return;
    }
    document.getElementById('orderError').textContent = '';
    document.getElementById('submitOrderBtn').disabled = true;
    document.getElementById('submitOrderBtn').textContent = '⏳ جاري الإرسال...';

    const result = await callAPI('addOrder', {
        customerName, customerPhone, customerPhone2, governorate, city, address, amount, weight, notes
    });

    document.getElementById('submitOrderBtn').disabled = false;
    document.getElementById('submitOrderBtn').textContent = '🛒 تأكيد الطلبية';
    if (result.success) {
        alert(`✅ تم إرسال الطلبية بنجاح!\nرقم الطلب: ${result.orderId || 'تم الإرسال'}`);
        document.getElementById('orderCustomerName').value = '';
        document.getElementById('orderCustomerPhone').value = '';
        document.getElementById('orderCustomerPhone2').value = '';
        document.getElementById('orderAddress').value = '';
        document.getElementById('orderAmount').value = '';
        document.getElementById('orderWeight').value = '1';
        document.getElementById('orderNotes').value = '';
        showStore();
    } else {
        document.getElementById('orderError').textContent = '❌ فشل إرسال الطلبية: ' + (result.error || 'خطأ غير معروف');
    }
}

function showStore() {
    document.getElementById('store').style.display = 'block';
    document.getElementById('orderFormPage').classList.remove('active');
}

// محافظات مصر
const EGYPT_GOVERNORATES = {
    'القاهرة': ['مدينة نصر', 'مصر الجديدة', 'المعادي', 'وسط البلد', 'الدقي', 'المهندسين', 'الزمالك', 'شبرا'],
    'الإسكندرية': ['سيدي جابر', 'رشدي', 'الساحل الشمالي', 'وسط البلد', 'المعمورة', 'العجمي'],
    'الجيزة': ['الدقي', 'المهندسين', 'العجوزة', 'بولاق الدكرور', 'أكتوبر', 'الشيخ زايد', 'الهرم'],
    'الشرقية': ['الزقازيق', 'منيا القمح', 'ههيا', 'كفر صقر', 'أبو كبير', 'فاقوس'],
    'الدقهلية': ['المنصورة', 'طلخا', 'أجا', 'منية النصر', 'دكرنس', 'تمي الأمديد'],
    'القليوبية': ['بنها', 'شبرا الخيمة', 'قليوب', 'الخانكة', 'كفر شكر', 'طوخ'],
    'المنوفية': ['شبين الكوم', 'مدينة السادات', 'الباجور', 'سرس الليان', 'قويسنا', 'منوف'],
    'الغربية': ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'بسيون', 'السنطة'],
    'كفر الشيخ': ['كفر الشيخ', 'دسوق', 'فوه', 'البرلس', 'الرياض', 'سيدي سالم'],
    'الإسماعيلية': ['الإسماعيلية', 'القنطرة', 'أبو صوير', 'التل الكبير', 'فايد'],
    'بورسعيد': ['بورسعيد', 'المناخ', 'الزهور', 'العرب', 'الضواحي'],
    'السويس': ['السويس', 'الجناين', 'فيصل', 'حدائق السويس'],
    'أسيوط': ['أسيوط', 'ديروط', 'البداري', 'أبنوب', 'القوصية', 'منفلوط'],
    'الأقصر': ['الأقصر', 'البياضية', 'الطود', 'إسنا', 'أرمنت', 'الحبيل'],
    'أسوان': ['أسوان', 'دراو', 'كوم أمبو', 'النصر', 'السباعية', 'الشلال'],
    'سوهاج': ['سوهاج', 'المراغة', 'طهطا', 'جرجا', 'أخميم', 'البلينا'],
    'قنا': ['قنا', 'نقادة', 'فرشوط', 'قفط', 'الوقف', 'دشنا'],
    'الفيوم': ['الفيوم', 'أطسا', 'إبشواي', 'سنورس', 'طامية', 'منشأة القناطر'],
    'بنى سويف': ['بنى سويف', 'الواسطى', 'الفشن', 'ناصر', 'أهناسيا', 'ببا'],
    'المنيا': ['المنيا', 'مغاغة', 'بنى مزار', 'مطاي', 'العدوة', 'سمالوط'],
    'البحر الأحمر': ['الغردقة', 'رأس غارب', 'سفاجا', 'القصير', 'مرسى علم', 'الشلاتين'],
    'شمال سيناء': ['العريش', 'رفح', 'الشيخ زويد', 'الحسنة', 'نخل', 'بئر العبد'],
    'جنوب سيناء': ['شرم الشيخ', 'دهب', 'نويبع', 'سانت كاترين', 'طابا', 'رأس سدر'],
    'مطروح': ['مرسى مطروح', 'الضبعة', 'العلمين', 'سيوة', 'النجيلة', 'براني'],
    'الوادي الجديد': ['الخارجة', 'الداخلة', 'الفرافرة', 'باريس', 'بلاط'],
    'دمياط': ['دمياط', 'فارسكور', 'كفر البطيخ', 'الزرقا', 'المزار', 'روضة']
};

function updateOrderCities() {
    const governorateSelect = document.getElementById('orderGovernorate');
    const citySelect = document.getElementById('orderCity');
    const governorate = governorateSelect.value;
    citySelect.innerHTML = '<option value="">اختر المدينة</option>';
    if (governorate && EGYPT_GOVERNORATES[governorate]) {
        EGYPT_GOVERNORATES[governorate].forEach(function(city) {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const governorateSelect = document.getElementById('orderGovernorate');
    if (governorateSelect) {
        Object.keys(EGYPT_GOVERNORATES).forEach(function(gov) {
            const option = document.createElement('option');
            option.value = gov;
            option.textContent = gov;
            governorateSelect.appendChild(option);
        });
    }

    const intro = document.getElementById('intro');
    const video = document.getElementById('introVideo');

    function transitionToStore() {
        if (intro && intro.classList.contains('hide')) return;
        if (intro) intro.classList.add('hide');
        document.body.style.overflow = 'auto';
        const store = document.getElementById('store');
        if (store) store.classList.add('show');
        setTimeout(function() { loadData(); }, 500);
    }

    // الفيديو يظهر لمدة 5 ثوانٍ فقط
    setTimeout(transitionToStore, 5000);

    if (video) {
        video.muted = true;
        video.play().catch(function() {});
    }
});
```
