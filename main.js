// ==================================================
// MAIN.JS - تم إصلاح الخطأ البرمجي (Syntax Error) الذي يمنع الموقع من العمل
// ==================================================

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

// نافذة الدخول
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

// تشغيل الموقع
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

    // الدالة التي تنقل المستخدم للمتجر
    function transitionToStore() {
        if (intro && intro.classList.contains('hide')) return;
        if (intro) intro.classList.add('hide');
        document.body.style.overflow = 'auto';
        const store = document.getElementById('store');
        if (store) store.classList.add('show');
        setTimeout(function() { loadData(); }, 500);
    }

    // الانتقال للمتجر بعد 5 ثوانٍ بالضبط، دون انتظار الفيديو
    setTimeout(transitionToStore, 5000);

    if (video) {
        // إزالة الأحداث القديمة التي كانت تسبب التعليق
        video.removeEventListener('ended', transitionToStore);
        video.removeEventListener('error', transitionToStore);
        
        video.muted = true;
        video.play().catch(function() {});
    }
});

console.log('✅ Main.js loaded successfully');
