// ==================================================
// MAIN.JS - H.L LeVance Store
// متصل بـ Google Sheets عبر Apps Script (معدل بالكامل)
// ==================================================

// ==================================================
// دوال الاتصال بـ API
// ==================================================

/**
 * إرسال بيانات إلى الـ API (POST)
 */
async function callAPI(action, data = {}) {
    try {
        const payload = { action, ...data };
        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // يمنع مشاكل CORS ويسمح بجوجل سكريبت بقراءة البيانات
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * جلب البيانات من الـ API (GET)
 */
async function fetchFromAPI(action) {
    try {
        const url = `${CONFIG.API_BASE_URL}?action=${action}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        return { error: error.message };
    }
}

// ==================================================
// تحميل البيانات من Google Sheets
// ==================================================

async function loadData() {
    try {
        // جلب المنتجات
        const productsResult = await fetchFromAPI('getProducts');
        if (productsResult && productsResult.products) {
            localStorage.setItem(CONFIG.STORAGE_KEY_PRODUCTS, JSON.stringify(productsResult.products));
            renderStoreProducts();
            renderAdminProducts();
        }

        // جلب الأقسام
        const categoriesResult = await fetchFromAPI('getCategories');
        if (categoriesResult && categoriesResult.categories) {
            localStorage.setItem(CONFIG.STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesResult.categories));
            renderCategories();
            renderAdminCategories();
        }

        console.log('✅ تم تحميل البيانات من Google Sheets');
    } catch (error) {
        console.error('❌ فشل تحميل البيانات:', error);
        // في حالة الفشل، نستخدم البيانات المخزنة محلياً
        renderStoreProducts();
        renderCategories();
        renderAdminProducts();
        renderAdminCategories();
    }
}

// ==================================================
// إدارة المنتجات - متصلة بـ API
// ==================================================

async function addProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value.trim());
    const discount = parseFloat(document.getElementById('newProductDiscount').value.trim()) || 0;
    const icon = document.getElementById('newProductIcon').value.trim() || '📦';

    if (!name || isNaN(price) || price <= 0) {
        alert('⚠️ يرجى إدخال اسم المنتج وسعر صحيح.');
        return;
    }

    // جمع المقاسات المختارة
    const sizes = [];
    document.querySelectorAll('.size-checkboxes input[type="checkbox"]:checked').forEach(function(cb) {
        sizes.push(cb.value);
    });

    // جمع الملفات وتحويلها إلى Base64
    const media = [];
    const fileInputs = document.querySelectorAll('.media-file-row input[type="file"]');
    
    for (const input of fileInputs) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const isVideo = file.type.startsWith('video/');
            try {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
                media.push({
                    type: isVideo ? 'video' : 'image',
                    data: dataUrl,
                    name: file.name
                });
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }
    }

    // إرسال البيانات إلى الـ API
    const result = await callAPI('addProduct', {
        name: name,
        price: price,
        discount: discount,
        icon: icon,
        sizes: sizes,
        media: media
    });

    if (result.success) {
        alert('✅ تم إضافة المنتج بنجاح!');
        // إعادة تحميل البيانات
        await loadData();
        
        // تنظيف الحقول
        document.getElementById('newProductName').value = '';
        document.getElementById('newProductPrice').value = '';
        document.getElementById('newProductDiscount').value = '';
        document.getElementById('newProductIcon').value = '';
        document.querySelectorAll('.size-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('.media-file-row input[type="file"]').forEach(input => input.value = '');
        document.querySelectorAll('.file-preview').forEach(el => {
            el.style.display = 'none';
            el.className = 'file-preview';
        });
    } else {
        alert('❌ فشل إضافة المنتج: ' + (result.error || 'خطأ غير معروف'));
    }
}

async function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    const result = await callAPI('deleteProduct', { id: id });

    if (result.success) {
        alert('🗑 تم حذف المنتج.');
        await loadData();
    } else {
        alert('❌ فشل حذف المنتج: ' + (result.error || 'خطأ غير معروف'));
    }
}

async function resetProducts() {
    if (!confirm('⚠️ سيتم حذف جميع المنتجات. هل أنت متأكد؟')) return;
    alert('⚠️ هذه الميزة تحتاج إلى تنفيذ في الـ Backend.');
}

// ==================================================
// إدارة الأقسام - متصلة بـ API
// ==================================================

async function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const icon = document.getElementById('newCategoryIcon').value.trim() || '🏷️';
    const imageInput = document.getElementById('newCategoryImage');
    
    if (!name) {
        alert('⚠️ يرجى إدخال اسم القسم.');
        return;
    }

    let image = '';
    if (imageInput.files && imageInput.files[0]) {
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(imageInput.files[0]);
            });
            image = dataUrl;
        } catch (error) {
            console.error('Error reading image:', error);
        }
    }

    const result = await callAPI('addCategory', {
        name: name,
        icon: icon,
        image: image
    });

    if (result.success) {
        alert('✅ تم إضافة القسم بنجاح!');
        await loadData();
        
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryIcon').value = '';
        document.getElementById('newCategoryImage').value = '';
    } else {
        alert('❌ فشل إضافة القسم: ' + (result.error || 'خطأ غير معروف'));
    }
}

async function deleteCategory(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    const result = await callAPI('deleteCategory', { id: id });

    if (result.success) {
        alert('🗑 تم حذف القسم.');
        await loadData();
    } else {
        alert('❌ فشل حذف القسم: ' + (result.error || 'خطأ غير معروف'));
    }
}

async function resetCategories() {
    if (!confirm('⚠️ سيتم حذف جميع الأقسام. هل أنت متأكد؟')) return;
    alert('⚠️ هذه الميزة تحتاج إلى تنفيذ في الـ Backend.');
}

// ==================================================
// عرض المنتجات والأقسام
// ==================================================

function renderStoreProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const products = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_PRODUCTS) || '[]');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--brown);font-size:18px;padding:40px 0;">لا توجد منتجات حالياً</p>';
        return;
    }

    products.forEach(function(p) {
        const price = p.price || 0;
        const discount = p.discount || 0;
        const finalPrice = discount > 0 ? Math.round(price - (price * discount / 100)) : price;
        const hasDiscount = discount > 0;

        const article = document.createElement('article');
        article.className = 'product';
        article.dataset.id = p.id;

        let mainMedia = '';
        let galleryHtml = '';
        const hasMedia = p.media && p.media.length > 0;

        if (hasMedia) {
            const firstMedia = p.media[0];
            if (firstMedia.type === 'video') {
                mainMedia = `<video controls muted playsinline><source src="${firstMedia.data || firstMedia.url}" type="video/mp4"></video>`;
            } else {
                mainMedia = `<img src="${firstMedia.data || firstMedia.url}" alt="${p.name}">`;
            }

            if (p.media.length > 1) {
                galleryHtml = '<div class="image-gallery">';
                p.media.forEach(function(m, index) {
                    if (m.type === 'video') {
                        galleryHtml += `<video muted playsinline onclick="changeMainMedia(this, ${p.id}, ${index})"><source src="${m.data || m.url}" type="video/mp4"></video>`;
                    } else {
                        galleryHtml += `<img src="${m.data || m.url}" alt="${p.name}" onclick="changeMainMedia(this, ${p.id}, ${index})">`;
                    }
                });
                galleryHtml += '</div>';
            }
        } else {
            mainMedia = `<span class="product-icon">${p.icon || '📦'}</span>`;
        }

        let sizesHtml = '';
        if (p.sizes && p.sizes.length > 0) {
            sizesHtml = '<div class="sizes">';
            p.sizes.forEach(function(size) {
                sizesHtml += `<button class="size-btn" onclick="selectSize(this)">${size}</button>`;
            });
            sizesHtml += '</div>';
        }

        article.innerHTML = `
          <div class="product-image" id="productImage_${p.id}">
            <div class="main-media">${mainMedia}</div>
            ${galleryHtml}
            <button class="zoom-btn" onclick="openZoom(${p.id})" title="عرض الصور بحجم كبير">🔍</button>
            <button class="delete-prod" onclick="deleteProduct(${p.id})">🗑</button>
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <div class="rating">★★★★★</div>
            <div class="price">
              ${hasDiscount ? `<span class="original-price">${price} جنيه</span>` : ''}
              ${finalPrice} جنيه
              ${hasDiscount ? `<span style="color:red;font-size:14px;"> (خصم ${discount}%)</span>` : ''}
            </div>
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

    if (products.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--brown);padding:20px 0;">لا توجد منتجات</p>';
        return;
    }

    products.forEach(function(p) {
        const price = p.price || 0;
        const discount = p.discount || 0;
        const finalPrice = discount > 0 ? Math.round(price - (price * discount / 100)) : price;

        const div = document.createElement('div');
        div.className = 'admin-list-item';

        let mediaPreview = '';
        if (p.media && p.media.length > 0) {
            const first = p.media[0];
            if (first.type === 'video') {
                mediaPreview = `<video style="width:40px;height:40px;object-fit:cover;border-radius:8px;" muted><source src="${first.data || first.url}" type="video/mp4"></video>`;
            } else {
                mediaPreview = `<img src="${first.data || first.url}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">`;
            }
        } else {
            mediaPreview = `<span style="font-size:30px;">${p.icon || '📦'}</span>`;
        }

        const sizeTags = p.sizes && p.sizes.length > 0 ?
            `<div class="size-tags">${p.sizes.map(s => `<span>${s}</span>`).join('')}</div>` :
            '';

        div.innerHTML = `
          <div class="item-info">
            ${mediaPreview}
            <span>${p.name} - ${finalPrice} جنيه ${discount > 0 ? `(خصم ${discount}%)` : ''}</span>
            ${sizeTags}
            <span style="font-size:12px;opacity:0.7;">📎 ${p.media ? p.media.length : 0} ملف</span>
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

    if (categories.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--brown);padding:20px 0;">لا توجد أقسام</p>';
        return;
    }

    categories.forEach(function(c) {
        const div = document.createElement('div');
        div.className = 'category';
        div.innerHTML = `
          <button class="delete-cat" onclick="deleteCategory(${c.id})">🗑</button>
          ${c.image ? `<img class="category-image" src="${c.image}" alt="${c.name}">` : `<span class="icon">${c.icon || '🏷️'}</span>`}
          <h3>${c.name}</h3>
        `;
        grid.appendChild(div);
    });
}

function renderAdminCategories() {
    const list = document.getElementById('adminCategoryList');
    if (!list) return;

    const categories = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CATEGORIES) || '[]');
    list.innerHTML = '';

    if (categories.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--brown);padding:20px 0;">لا توجد أقسام</p>';
        return;
    }

    categories.forEach(function(c) {
        const div = document.createElement('div');
        div.className = 'admin-list-item';
        div.innerHTML = `
          <div class="item-info">
            <span>${c.icon || '🏷️'} ${c.name}</span>
          </div>
          <button onclick="deleteCategory(${c.id})">🗑 حذف</button>
        `;
        list.appendChild(div);
    });
}

// ==================================================
// إدارة الطلبات - متصلة بـ API
// ==================================================

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
        customerName: customerName,
        customerPhone: customerPhone,
        customerPhone2: customerPhone2,
        governorate: governorate,
        city: city,
        address: address,
        amount: amount,
        weight: weight,
        notes: notes
    });

    document.getElementById('submitOrderBtn').disabled = false;
    document.getElementById('submitOrderBtn').textContent = '🛒 تأكيد الطلبية';

    if (result.success) {
        alert(`✅ تم إرسال الطلبية بنجاح!\nرقم الطلب: ${result.orderId || 'تم الإرسال'}`);
        document.getElementById('orderCustomerName').value = '';
        document.getElementById('orderCustomerPhone').value = '';
        document.getElementById('orderCustomerPhone2').value = '';
        document.getElementById('orderGovernorate').value = '';
        document.getElementById('orderCity').innerHTML = '<option value="">اختر المحافظة أولا</option>';
        document.getElementById('orderAddress').value = '';
        document.getElementById('orderAmount').value = '';
        document.getElementById('orderWeight').value = '1';
        document.getElementById('orderNotes').value = '';
        showStore();
    } else {
        document.getElementById('orderError').textContent = '❌ فشل إرسال الطلبية: ' + (result.error || 'خطأ غير معروف');
    }
}

// ==================================================
// دوال مساعدة
// ==================================================

function showStore() {
    document.getElementById('store').style.display = 'block';
    document.getElementById('orderFormPage').classList.remove('active');
    document.getElementById('orderFormPage').style.display = 'none';
}

function showCart() {
    alert('🛒 السلة فارغة حالياً');
}

function addToCart(name, price, size) {
    alert(`🛒 تم إضافة ${name} إلى السلة بسعر ${price} جنيه`);
}

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
    parent.querySelectorAll('.size-btn').forEach(function(b) {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');
}

function openZoom(productId) {
    const products = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_PRODUCTS) || '[]');
    const product = products.find(p => p.id === productId);
    if (!product || !product.media || product.media.length === 0) {
        alert('لا توجد صور أو فيديوهات لعرضها.');
        return;
    }
    alert('🔍 تم فتح التكبير للمنتج: ' + product.name);
}

function addFileRow() {
    const container = document.getElementById('mediaFilesContainer');
    const template = document.getElementById('fileRowTemplate');
    const newRow = template.cloneNode(true);
    newRow.id = 'fileRow_' + Date.now();
    newRow.style.display = 'flex';

    const fileInput = newRow.querySelector('input[type="file"]');
    fileInput.value = '';
    fileInput.onchange = function() { previewFile(this); };

    const imgPreview = newRow.querySelector('#previewImg');
    if (imgPreview) {
        imgPreview.id = 'previewImg_' + Date.now();
        imgPreview.className = 'file-preview';
        imgPreview.style.display = 'none';
    }

    const videoPreview = newRow.querySelector('#previewVideo');
    if (videoPreview) {
        videoPreview.id = 'previewVideo_' + Date.now();
        videoPreview.className = 'file-preview';
        videoPreview.style.display = 'none';
    }

    const removeBtn = newRow.querySelector('.remove-file-btn');
    removeBtn.className = 'remove-file-btn show';
    removeBtn.onclick = function() {
        const row = this.closest('.media-file-row');
        const container = document.getElementById('mediaFilesContainer');
        if (container.querySelectorAll('.media-file-row').length <= 1) {
            const fileInput = row.querySelector('input[type="file"]');
            fileInput.value = '';
            const imgPreview = row.querySelector('img.file-preview');
            if (imgPreview) {
                imgPreview.style.display = 'none';
                imgPreview.className = 'file-preview';
            }
            const videoPreview = row.querySelector('video.file-preview');
            if (videoPreview) {
                videoPreview.style.display = 'none';
                videoPreview.className = 'file-preview';
            }
            this.className = 'remove-file-btn';
            return;
        }
        row.remove();
    };

    container.appendChild(newRow);
}

function previewFile(input) {
    const row = input.closest('.media-file-row');
    const file = input.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const imgPreview = row.querySelector('img.file-preview');
    const videoPreview = row.querySelector('video.file-preview');

    const reader = new FileReader();
    reader.onload = function(e) {
        if (isVideo) {
            if (videoPreview) {
                videoPreview.src = e.target.result;
                videoPreview.style.display = 'block';
                videoPreview.className = 'file-preview show';
            }
            if (imgPreview) {
                imgPreview.style.display = 'none';
                imgPreview.className = 'file-preview';
            }
        } else {
            if (imgPreview) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'block';
                imgPreview.className = 'file-preview show';
            }
            if (videoPreview) {
                videoPreview.style.display = 'none';
                videoPreview.className = 'file-preview';
            }
        }
    };
    reader.readAsDataURL(file);
}

// ==================================================
// تحميل البيانات عند بدء التشغيل
// ==================================================

document.addEventListener('DOMContentLoaded', function() {
    const intro = document.getElementById('intro');
    const video = document.getElementById('introVideo');

    function transitionToStore() {
        if (intro && intro.classList.contains('hide')) return;
        if (intro) intro.classList.add('hide');
        document.body.style.overflow = 'auto';
        const store = document.getElementById('store');
        if (store) store.classList.add('show');
        
        setTimeout(function() {
            loadData();
        }, 500);
    }

    if (video) {
        video.addEventListener('ended', transitionToStore);
        video.addEventListener('error', function() {
            setTimeout(transitionToStore, 2000);
        });
        video.play().catch(function() {
            setTimeout(transitionToStore, 2000);
        });
    } else {
        loadData();
    }
});

// ==================================================
// دوال تسجيل الدخول (تتحقق محلياً وعبر API)
// ==================================================

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

async function handleLogin() {
    const phoneInput = document.getElementById('loginPhone');
    const passwordInput = document.getElementById('loginPassword');

    if (!phoneInput || !passwordInput) return;

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!phone || !password) {
        alert('⚠️ يرجى إدخال رقم الهاتف وكلمة المرور.');
        return;
    }

    // 1. تحقق محلي مباشر باستخدام بيانات الادمن في config.js
    if (phone === CONFIG.ADMIN_PHONE && password === CONFIG.ADMIN_PASSWORD) {
        alert('✅ مرحباً Admin! تم تسجيل الدخول بنجاح.');
        const loginBtn = document.getElementById('loginBtn');
        const adminPanel = document.getElementById('adminPanel');

        if (loginBtn) loginBtn.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('active');

        closeLoginModal();
        document.querySelectorAll('.delete-prod, .delete-cat').forEach(el => el.style.display = 'block');
        return;
    }

    // 2. إذا لم تتطابق البيانات المحليه، نفحص عبر الشيت
    const result = await callAPI('loginUser', { phone: phone, password: password });

    if (result.success) {
        alert('✅ تم تسجيل الدخول بنجاح.');
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.classList.add('hidden');
        closeLoginModal();
    } else {
        alert('❌ رقم الهاتف أو كلمة المرور غير صحيحة.');
    }
}

function handleSignup() {
    alert('📝 سيتم تفعيل إنشاء الحساب قريباً');
}

// ==================================================
// المدن والمحافظات
// ==================================================

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
});

console.log('✅ Main.js fixed and loaded successfully');
