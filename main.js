/* ==================================================
   MAIN.JS - H.L LeVance Store - الإصدار النهائي
   تم تعريف API_BASE_URL في بداية الملف
================================================== */

// ==================================================
// تعريف API_BASE_URL في النطاق العام (GLOBAL)
// ==================================================
var API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzuajhu983jCQWr_V4ezz6SHpanxinydY5L4Vf7spqyuWTtoOLBmH4536yWz6jboSxm/exec';

// التأكد من وجود CONFIG
if (typeof window.CONFIG === 'undefined') {
    window.CONFIG = {
        API_BASE_URL: API_BASE_URL,
        STORE_NAME: 'H.L LeVance',
        STORE_PHONE: '201234567890',
        ADMIN_PHONE: '111',
        ADMIN_PASSWORD: '111',
        STORAGE_KEY_PRODUCTS: 'hl_products',
        STORAGE_KEY_CATEGORIES: 'hl_categories',
        STORAGE_KEY_CART: 'hl_cart',
        STORAGE_KEY_ORDERS: 'hl_orders'
    };
    console.log('✅ CONFIG created with fallback values');
}

console.log('✅ API_BASE_URL:', API_BASE_URL);

/* ==================================================
   INTRO - التحكم بشاشة الترحيب
================================================== */
const intro = document.getElementById("intro");
const video = document.getElementById("introVideo");
const store = document.getElementById("store");

function enterStore() {
  if (intro.classList.contains("hide")) return;
  intro.classList.add("hide");
  store.classList.add("show");
  document.body.style.overflow = "auto";
  if (video) video.pause();
  
  setTimeout(() => {
    try {
      loadData();
    } catch(e) {
      console.error('Load data error:', e);
    }
  }, 300);
}

if (video) {
  video.addEventListener("ended", enterStore);
  
  setTimeout(function() {
    if (!intro.classList.contains("hide")) {
      console.log("⏰ Timeout - forcing enter store");
      enterStore();
    }
  }, 5000);
}

function startVideo() {
  if (!video) {
    enterStore();
    return;
  }
  const promise = video.play();
  if (promise !== undefined) {
    promise.catch(function(error) {
      console.log("تعذر التشغيل التلقائي:", error);
      enterStore();
    });
  }
}

if (video && video.readyState >= 2) {
  startVideo();
} else if (video) {
  video.addEventListener("loadeddata", startVideo, { once: true });
} else {
  enterStore();
}

if (video) {
  video.addEventListener("error", function() {
    console.warn("تعذر تحميل intro.mp4");
    enterStore();
  });
}

document.body.style.overflow = "hidden";

/* ==================================================
   ZOOM FUNCTIONALITY
================================================== */
let zoomMedia = [];
let zoomIndex = 0;
let zoomProductId = null;

function openZoom(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || !product.media || product.media.length === 0) {
    alert("لا توجد صور أو فيديوهات لعرضها.");
    return;
  }

  zoomMedia = product.media;
  zoomIndex = 0;
  zoomProductId = productId;
  showZoomMedia(0);
  document.getElementById('zoomModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeZoom() {
  document.getElementById('zoomModal').classList.remove('active');
  document.body.style.overflow = 'auto';
  const video = document.getElementById('zoomVideo');
  if (video) video.pause();
}

function showZoomMedia(index) {
  const media = zoomMedia[index];
  if (!media) return;

  const img = document.getElementById('zoomImage');
  const video = document.getElementById('zoomVideo');
  const videoSource = document.getElementById('zoomVideoSource');
  const counter = document.getElementById('zoomCounter');

  img.style.display = 'none';
  video.style.display = 'none';

  if (media.type === 'video') {
    videoSource.src = media.url || media.data;
    video.load();
    video.style.display = 'block';
    video.play().catch(() => {});
  } else {
    img.src = media.url || media.data;
    img.style.display = 'block';
  }

  counter.textContent = `${index + 1} / ${zoomMedia.length}`;
  zoomIndex = index;
}

function zoomPrev() {
  if (zoomIndex > 0) {
    showZoomMedia(zoomIndex - 1);
  } else {
    showZoomMedia(zoomMedia.length - 1);
  }
}

function zoomNext() {
  if (zoomIndex < zoomMedia.length - 1) {
    showZoomMedia(zoomIndex + 1);
  } else {
    showZoomMedia(0);
  }
}

document.addEventListener('keydown', function(e) {
  if (document.getElementById('zoomModal').classList.contains('active')) {
    if (e.key === 'Escape') closeZoom();
    if (e.key === 'ArrowRight') zoomNext();
    if (e.key === 'ArrowLeft') zoomPrev();
  }
});

document.getElementById('zoomModal').addEventListener('click', function(e) {
  if (e.target === this) closeZoom();
});

/* ==================================================
   API HELPER FUNCTIONS
================================================== */

async function apiGet(action) {
  try {
    const url = `${API_BASE_URL}?action=${action}`;
    console.log('Fetching (GET):', url);
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API GET Response:', data);
    return data;
  } catch (error) {
    console.error('API GET Error:', error);
    return { error: error.toString() };
  }
}

async function apiPost(data) {
  try {
    console.log('Posting data:', data);
    
    const formData = new FormData();
    formData.append('payload', JSON.stringify(data));
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      redirect: 'follow',
      mode: 'no-cors',
      body: formData
    });
    
    console.log('✅ POST request sent successfully');
    return { success: true, message: 'تم الإرسال بنجاح' };
  } catch (error) {
    console.error('❌ API POST Error:', error);
    return { error: error.toString() };
  }
}

/* ==================================================
   MEDIA FILE INPUTS
================================================== */
let fileRows = 1;

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
  removeBtn.onclick = function() { removeFileRow(this); };
  
  container.appendChild(newRow);
  fileRows++;
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

function removeFileRow(btn) {
  const row = btn.closest('.media-file-row');
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
    const removeBtn = row.querySelector('.remove-file-btn');
    removeBtn.className = 'remove-file-btn';
    return;
  }
  row.remove();
  fileRows--;
}

function getMediaFiles() {
  const rows = document.querySelectorAll('.media-file-row');
  const media = [];
  
  rows.forEach(row => {
    const fileInput = row.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const isVideo = file.type.startsWith('video/');
      media.push({
        file: file,
        type: isVideo ? 'video' : 'image',
        name: file.name
      });
    }
  });
  
  return media;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function(e) {
      reject(e);
    };
    reader.readAsDataURL(file);
  });
}

/* ==================================================
   CART
================================================== */
let cart = [];
let cartTotal = 0;

function addToCart(productName, price, size) {
  const item = size ? `${productName} (مقاس ${size})` : productName;
  cart.push({ name: item, price: price });
  cartTotal += price;
  alert("تمت إضافة " + item + " إلى السلة 🛒");
}

function showCart() {
  if (cart.length === 0) {
    alert("السلة فارغة.");
    return;
  }
  let msg = "المنتجات في السلة:\n\n";
  cart.forEach((item, index) => {
    msg += `${index + 1}. ${item.name} - ${item.price} جنيه\n`;
  });
  msg += `\nالإجمالي: ${cartTotal} جنيه`;
  msg += `\n\nهل تريد تأكيد الطلبية؟`;
  if (confirm(msg)) {
    showOrderForm();
  }
}

/* ==================================================
   ORDER FORM - صفحة الطلب
================================================== */
const governorates = {
  'الشرقية': ['بلبيس', 'انشاص الرمل', 'أولاد صقر', 'الحسينية', 'ديرب نجم', 'فاقوس', 'كفر صقر', 'مشتول السوق', 'منيا القمح', 'الصالحية القديمة', 'الصالحية الجديدة', 'صان الحجر', 'مدينة العاشر من رمضان'],
  'الجيزة': ['مدينة السادس من أكتوبر', 'مدينة الشيخ زايد', 'العياط', 'الحوامدية', 'البدرشين', 'الصف', 'العمرانية', 'أطفيح', 'الواحات البحرية', 'الجيزة', 'حدائق الاهرام', 'فيصل', 'الهرم', 'أبو النمرس', 'العجوزة', 'الوراق', 'أوسيم', 'بولاق الدكرور', 'الدقي', 'أرض اللواء', 'المهندسين', 'كرداسة', 'إمبابة', 'منشأة القناطر'],
  'الغربية': ['كفر الزيات', 'المحلة الكبرى', 'سمنود', 'بسيون', 'السنطة', 'زفتى', 'قطور', 'طنطا'],
  'الدقهلية': ['المنصورة', 'أجا', 'المنزلة', 'بلقاس', 'دكرنس', 'السنبلاوين', 'منية النصر', 'ميت غمر', 'شربين', 'طلخا'],
  'الإسكندرية': ['الدخيلة', 'العامرية', 'برج العرب', 'محرم بيك', 'باب شرقي', 'الساحل الشمالي', 'سيدي جابر', 'العطارين', 'المنشية', 'اللبان', 'الجمرك', 'مينا البصل', 'كرموز', 'الرمل', 'المنتزه'],
  'أسيوط': ['أبنوب', 'أبوتيج', 'البداري', 'الغنايم', 'الفتح', 'القوصية', 'ديروط', 'ساحل سليم', 'صدفا', 'مدينة أسيوط', 'منفلوط', 'منقباد'],
  'أسوان': ['أسوان', 'كوم امبو', 'دراو', 'إدفو'],
  'بني سويف': ['الواسطى', 'ناصر', 'مدينة بني سويف', 'مركز بني سويف', 'أهناسيا', 'ببا', 'سمسطا', 'الفشن'],
  'القليوبية': ['بنها', 'الخانكة', 'العبور', 'القناطر الخيرية', 'شبين القناطر', 'طوخ', 'كفر شكر', 'قليوب', 'شبرا الخيمة'],
  'القاهرة': ['عابدين', 'العباسية', 'الأزبكية', 'القطامية', 'المنيل', 'المقطم', 'دار السلام', 'البساتين', 'الجمالية', 'السيدة زينب', 'حلوان', 'المعادي', 'مصر القديمة', 'قصر النيل', 'الخليفة', 'طرة', 'الزمالك', 'الشروق', 'مدينة بدر', 'عين شمس', 'مدينتي', 'الزيتون', 'مدينة نصر', 'القاهرة الجديدة', 'هليوبوليس', 'الأميرية', 'السلام', 'الوايلي', 'الشرابية', 'المرج', 'المطرية', 'النزهة', 'حدائق القبة', 'شبرا مصر', 'كورنيش النيل'],
  'البحيرة': ['دمنهور', 'كفر الدوار', 'أبو حمص', 'المحمودية', 'وادي النطرون', 'النوبارية', 'أبوالمطامير', 'حوش عيسي', 'إيتاي البارود', 'شبراخيت', 'رشيد', 'إدكوا', 'مركز بدر', 'الدلنجات', 'الرحمانية', 'كوم حمادة'],
  'دمياط': ['فارسكور', 'دمياط القديمة', 'كفر سعد', 'الزرقا', 'كفر البطيخ', 'دمياط الجديدة', 'رأس البر', 'عزبة البرج'],
  'الفيوم': ['طامية', 'سنورس', 'مركز الفيوم', 'مدينة الفيوم', 'أطسا', 'أبشواي', 'يوسف الصديق'],
  'البحر الأحمر': ['الغردقة', 'رأس غارب', 'سفاجا', 'القصير', 'مرسى علم'],
  'الإسماعيلية': ['الإسماعيلية'],
  'كفر الشيخ': ['كفر الشيخ', 'دسوق', 'فوه', 'مطوبس', 'بلطيم', 'الحامول', 'الرياض', 'بيلا', 'قلين', 'سيدى سالم'],
  'الأقصر': ['مدينة الأقصر', 'أرمنت', 'أسنا', 'القرنة'],
  'مرسى مطروح': ['مرسى مطروح'],
  'المنيا': ['العدوة', 'مغاغة', 'بني مزار', 'مطاي', 'سمالوط', 'مركز المنيا', 'مدينة المنيا', 'أبو قرقاص', 'ملوي', 'دير مواس'],
  'بور سعيد': ['بورسعيد'],
  'قنا': ['قنا', 'قوص', 'مدينة قفط', 'دشنا', 'نقادة', 'نجع حمادي', 'فرشوط', 'أبوتشت'],
  'المنوفية': ['قويسنا', 'بركة السبع', 'السادات', 'الشهداء', 'تلا', 'شبين الكوم', 'الباجور', 'منوف', 'أشمون'],
  'سوهاج': ['طما', 'طهطا', 'جهينة', 'مدينة سوهاج', 'المراغة', 'أخميم', 'ساقلته', 'المنشأة', 'جرجا', 'البلينا', 'دار السلام', 'العسيرات'],
  'السويس': ['السويس'],
  'الوادي الجديد': ['الخارجة', 'الداخلة', 'الفرافرة'],
  'جنوب سيناء': ['جنوب سيناء', 'شرم الشيخ', 'دهب']
};

function populateOrderGovernorates() {
  const select = document.getElementById('orderGovernorate');
  select.innerHTML = '<option value="">اختر المحافظة</option>';
  Object.keys(governorates).forEach(gov => {
    const option = document.createElement('option');
    option.value = gov;
    option.textContent = gov;
    select.appendChild(option);
  });
}

function updateOrderCities() {
  const govSelect = document.getElementById('orderGovernorate');
  const citySelect = document.getElementById('orderCity');
  const selected = govSelect.value;
  citySelect.innerHTML = '<option value="">اختر المدينة</option>';
  if (selected && governorates[selected]) {
    governorates[selected].forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
}

function showOrderForm() {
  document.getElementById('store').style.display = 'none';
  document.getElementById('orderFormPage').classList.add('active');
  
  const itemsDiv = document.getElementById('orderCartItems');
  itemsDiv.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = `${item.name} - ${item.price} جنيه`;
    itemsDiv.appendChild(div);
  });
  document.getElementById('orderTotalPrice').textContent = cartTotal;
  
  populateOrderGovernorates();
}

function showStore() {
  document.getElementById('store').style.display = 'block';
  document.getElementById('orderFormPage').classList.remove('active');
}

/* ==================================================
   SUBMIT ORDER - إرسال الطلب
================================================== */
let isOrderSubmitting = false;

async function submitOrder() {
  if (isOrderSubmitting) {
    alert('يتم معالجة الطلب حالياً، يرجى الانتظار...');
    return;
  }

  const customerName = document.getElementById('orderCustomerName').value.trim();
  const customerPhone = document.getElementById('orderCustomerPhone').value.trim();
  const customerPhone2 = document.getElementById('orderCustomerPhone2').value.trim();
  const governorate = document.getElementById('orderGovernorate').value;
  const city = document.getElementById('orderCity').value;
  const address = document.getElementById('orderAddress').value.trim();
  const amount = document.getElementById('orderAmount').value.trim();
  const weight = document.getElementById('orderWeight').value.trim() || '1';
  const notes = document.getElementById('orderNotes').value.trim();
  const errorDiv = document.getElementById('orderError');

  if (!customerName || !customerPhone || !governorate || !city || !address || !amount) {
    errorDiv.textContent = '⚠️ يرجى ملء جميع الحقول المطلوبة';
    return;
  }
  if (customerPhone.length !== 11) {
    errorDiv.textContent = '⚠️ رقم هاتف المستلم يجب أن يكون 11 رقم';
    return;
  }
  if (customerPhone2 && customerPhone2.length !== 11) {
    errorDiv.textContent = '⚠️ رقم الهاتف الآخر يجب أن يكون 11 رقم';
    return;
  }

  const orderData = {
    action: 'addOrder',
    customerName: customerName,
    customerPhone: customerPhone,
    customerPhone2: customerPhone2,
    governorate: governorate,
    city: city,
    address: address,
    amount: amount,
    weight: weight,
    notes: notes,
    products: cart.map(item => item.name).join('، '),
    totalPrice: cartTotal.toString()
  };

  isOrderSubmitting = true;
  const submitBtn = document.getElementById('submitOrderBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ جاري الإرسال...';

  try {
    const result = await apiPost(orderData);
    
    if (result && !result.error) {
      errorDiv.textContent = '';
      alert(`✅ تم تأكيد الطلبية بنجاح!`);
      
      cart = [];
      cartTotal = 0;
      showStore();
      
      document.getElementById('orderCustomerName').value = '';
      document.getElementById('orderCustomerPhone').value = '';
      document.getElementById('orderCustomerPhone2').value = '';
      document.getElementById('orderGovernorate').value = '';
      document.getElementById('orderCity').innerHTML = '<option value="">اختر المحافظة أولا</option>';
      document.getElementById('orderAddress').value = '';
      document.getElementById('orderAmount').value = '';
      document.getElementById('orderWeight').value = '1';
      document.getElementById('orderNotes').value = '';
    } else {
      errorDiv.textContent = result?.error || '❌ فشل إرسال الطلب، حاول مرة أخرى';
    }
  } catch (error) {
    errorDiv.textContent = '❌ حدث خطأ في الاتصال بالخادم';
    console.error('Order submission error:', error);
  }

  isOrderSubmitting = false;
  submitBtn.disabled = false;
  submitBtn.textContent = '🛒 تأكيد الطلبية';
}

/* ==================================================
   SEARCH
================================================== */
function searchProducts() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const products = document.querySelectorAll(".product");
  products.forEach(product => {
    const name = product.querySelector("h3").textContent.toLowerCase();
    product.style.display = !query || name.includes(query) ? "" : "none";
  });
}

document.getElementById("search").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    searchProducts();
  }
});

/* ==================================================
   LOGIN MODAL
================================================== */
let isLoggedIn = false;
let isAdmin = false;
let currentUser = null;

function openLoginModal() {
  document.getElementById("loginModal").classList.add("active");
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active");
}

async function handleLogin() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!phone || !password) {
    alert("⚠️ يرجى إدخال رقم الهاتف وكلمة المرور.");
    return;
  }

  if (phone === CONFIG.ADMIN_PHONE && password === CONFIG.ADMIN_PASSWORD) {
    isLoggedIn = true;
    isAdmin = true;
    currentUser = "admin";
    document.getElementById("loginBtn").classList.add("hidden");
    closeLoginModal();
    document.getElementById("adminPanel").classList.add("active");
    showDeleteButtons(true);
    alert("✅ مرحباً Admin! تم تسجيل الدخول بنجاح.");
    return;
  }

  const result = await apiPost({
    action: 'loginUser',
    phone: phone,
    password: password
  });

  if (result && result.success) {
    isLoggedIn = true;
    isAdmin = false;
    currentUser = phone;
    document.getElementById("loginBtn").classList.add("hidden");
    closeLoginModal();
    document.getElementById("adminPanel").classList.remove("active");
    showDeleteButtons(false);
    alert("✅ مرحباً " + (result.user?.name || phone) + "! تم تسجيل الدخول بنجاح.");
  } else {
    alert("❌ " + (result?.error || "رقم الهاتف أو كلمة المرور غير صحيحة."));
  }
}

async function handleSignup() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!phone || !password) {
    alert("⚠️ يرجى إدخال رقم الهاتف وكلمة المرور لإنشاء الحساب.");
    return;
  }

  if (phone === CONFIG.ADMIN_PHONE) {
    alert("⚠️ هذا الرقم محجوز للإدمن.");
    return;
  }

  const result = await apiPost({
    action: 'registerUser',
    phone: phone,
    password: password,
    name: phone
  });

  if (result && result.success) {
    alert("✅ تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
    document.getElementById("loginPhone").value = "";
    document.getElementById("loginPassword").value = "";
  } else {
    alert("❌ " + (result?.error || "حدث خطأ أثناء إنشاء الحساب."));
  }
}

document.getElementById("loginModal").addEventListener("click", function(e) {
  if (e.target === this) {
    closeLoginModal();
  }
});

/* ==================================================
   LOAD DATA FROM GOOGLE SHEETS
================================================== */
let products = [];
let categories = [];

function loadFromLocalStorage() {
  const savedProducts = localStorage.getItem(CONFIG.STORAGE_KEY_PRODUCTS);
  const savedCategories = localStorage.getItem(CONFIG.STORAGE_KEY_CATEGORIES);
  
  if (savedProducts) {
    try {
      products = JSON.parse(savedProducts);
    } catch (e) {
      products = getSampleProducts();
      localStorage.setItem(CONFIG.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    }
  } else {
    products = getSampleProducts();
    localStorage.setItem(CONFIG.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }
  
  if (savedCategories) {
    try {
      categories = JSON.parse(savedCategories);
    } catch (e) {
      categories = getSampleCategories();
      localStorage.setItem(CONFIG.STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    }
  } else {
    categories = getSampleCategories();
    localStorage.setItem(CONFIG.STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(CONFIG.STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('❌ localStorage full!');
    alert('⚠️ مساحة التخزين ممتلئة! حاول تقليل حجم الصور أو عدد المنتجات.');
  }
}

async function loadData() {
  loadFromLocalStorage();
  renderStoreProducts();
  renderStoreCategories();
  
  await loadProductsFromAPI();
  await loadCategoriesFromAPI();
}

async function loadProductsFromAPI() {
  const spinner = document.getElementById('productSpinner');
  spinner.classList.add('active');

  try {
    const result = await apiGet('getProducts');
    spinner.classList.remove('active');

    if (result && !result.error && result.products && result.products.length > 0) {
      products = result.products;
      localStorage.setItem(CONFIG.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      renderStoreProducts();
      if (isAdmin) renderAdminProducts();
      console.log('✅ Products loaded from API');
    } else {
      console.log('Using cached products from localStorage');
    }
  } catch (error) {
    spinner.classList.remove('active');
    console.error('Load products error:', error);
  }
}

async function loadCategoriesFromAPI() {
  const spinner = document.getElementById('categorySpinner');
  spinner.classList.add('active');

  try {
    const result = await apiGet('getCategories');
    spinner.classList.remove('active');

    if (result && !result.error && result.categories && result.categories.length > 0) {
      categories = result.categories;
      localStorage.setItem(CONFIG.STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      renderStoreCategories();
      if (isAdmin) renderAdminCategories();
      console.log('✅ Categories loaded from API');
    } else {
      console.log('Using cached categories from localStorage');
    }
  } catch (error) {
    spinner.classList.remove('active');
    console.error('Load categories error:', error);
  }
}

/* ==================================================
   SAMPLE DATA
================================================== */
function getSampleProducts() {
  return [
    { id: 1, name: "قميص أنيق", price: 499, discount: 0, icon: "👕", media: [], sizes: ["S", "M", "L", "XL"] },
    { id: 2, name: "فستان أنيق", price: 799, discount: 0, icon: "👗", media: [], sizes: ["S", "M", "L"] },
    { id: 3, name: "حذاء أنيق", price: 599, discount: 0, icon: "👡", media: [], sizes: ["40", "41", "42", "43"] },
    { id: 4, name: "مستحضرات تجميل", price: 299, discount: 0, icon: "💄", media: [], sizes: [] }
  ];
}

function getSampleCategories() {
  return [
    { id: 1, name: "الملابس", icon: "👕", image: null },
    { id: 2, name: "فساتين", icon: "👗", image: null },
    { id: 3, name: "الأحذية", icon: "👠", image: null },
    { id: 4, name: "الجمال", icon: "💄", image: null },
    { id: 5, name: "الهدايا", icon: "🎁", image: null }
  ];
}

/* ==================================================
   RENDER FUNCTIONS
================================================== */
function getProductPriceWithDiscount(product) {
  if (product.discount && product.discount > 0) {
    const discounted = product.price - (product.price * product.discount / 100);
    return {
      final: Math.round(discounted),
      original: product.price,
      hasDiscount: true
    };
  }
  return {
    final: product.price,
    original: null,
    hasDiscount: false
  };
}

function renderStoreProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--brown);font-size:18px;padding:40px 0;">لا توجد منتجات حالياً</p>';
    return;
  }

  products.forEach((p) => {
    const priceInfo = getProductPriceWithDiscount(p);
    const article = document.createElement("article");
    article.className = "product";
    article.dataset.id = p.id;

    let mainMedia = '';
    let galleryHtml = '';
    const hasMedia = p.media && p.media.length > 0;

    if (hasMedia) {
      const firstMedia = p.media[0];
      if (firstMedia.type === 'video') {
        mainMedia = `<video controls muted playsinline><source src="${firstMedia.url || firstMedia.data}" type="video/mp4"></video>`;
      } else {
        mainMedia = `<img src="${firstMedia.url || firstMedia.data}" alt="${p.name}">`;
      }

      if (p.media.length > 1) {
        galleryHtml = `<div class="image-gallery">`;
        p.media.forEach((m, index) => {
          if (m.type === 'video') {
            galleryHtml += `<video muted playsinline onclick="changeMainMedia(this, ${p.id}, ${index})"><source src="${m.url || m.data}" type="video/mp4"></video>`;
          } else {
            galleryHtml += `<img src="${m.url || m.data}" alt="${p.name}" onclick="changeMainMedia(this, ${p.id}, ${index})">`;
          }
        });
        galleryHtml += `</div>`;
      }
    } else {
      mainMedia = `<span class="product-icon">${p.icon || '📦'}</span>`;
    }

    let sizesHtml = '';
    if (p.sizes && p.sizes.length > 0) {
      sizesHtml = `<div class="sizes">`;
      p.sizes.forEach(size => {
        sizesHtml += `<button class="size-btn" onclick="selectSize(this)">${size}</button>`;
      });
      sizesHtml += `</div>`;
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
          ${priceInfo.hasDiscount ? `<span class="original-price">${priceInfo.original} جنيه</span>` : ''}
          ${priceInfo.final} جنيه
          ${priceInfo.hasDiscount ? `<span style="color:red;font-size:14px;"> (خصم ${p.discount}%)</span>` : ''}
        </div>
        ${sizesHtml}
        <button class="add-cart" onclick="addToCartWithSize(this, ${priceInfo.final})">أضف إلى السلة</button>
      </div>
    `;
    grid.appendChild(article);
  });

  if (isAdmin) {
    showDeleteButtons(true);
  }
}

function selectSize(btn) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function addToCartWithSize(btn, price) {
  const productCard = btn.closest('.product');
  const name = productCard.querySelector('h3').textContent;
  let size = null;
  const selected = productCard.querySelector('.size-btn.selected');
  if (selected) {
    size = selected.textContent;
  }
  addToCart(name, price, size);
}

function changeMainMedia(element, productId, index) {
  const container = document.getElementById(`productImage_${productId}`);
  if (!container) return;
  
  const mainMedia = container.querySelector('.main-media');
  if (!mainMedia) return;
  
  const product = products.find(p => p.id === productId);
  if (!product || !product.media) return;
  
  const media = product.media[index];
  if (!media) return;
  
  if (media.type === 'video') {
    mainMedia.innerHTML = `<video controls muted playsinline><source src="${media.url || media.data}" type="video/mp4"></video>`;
    const videoEl = mainMedia.querySelector('video');
    if (videoEl) videoEl.play();
  } else {
    mainMedia.innerHTML = `<img src="${media.url || media.data}" alt="${product.name}">`;
  }
  
  const gallery = container.querySelector('.image-gallery');
  if (gallery) {
    gallery.querySelectorAll('img, video').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
  }
}

function renderAdminProducts() {
  const list = document.getElementById("adminProductList");
  if (!list) return;
  list.innerHTML = "";

  if (!products || products.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--brown);padding:20px 0;">لا توجد منتجات</p>';
    return;
  }

  products.forEach(p => {
    const priceInfo = getProductPriceWithDiscount(p);
    const div = document.createElement("div");
    div.className = "admin-list-item";
    let mediaPreview = '';
    if (p.media && p.media.length > 0) {
      const first = p.media[0];
      if (first.type === 'video') {
        mediaPreview = `<video style="width:40px;height:40px;object-fit:cover;border-radius:8px;" muted><source src="${first.url || first.data}" type="video/mp4"></video>`;
      } else {
        mediaPreview = `<img src="${first.url || first.data}" alt="${p.name}">`;
      }
    } else {
      mediaPreview = `<span style="font-size:30px;">${p.icon || '📦'}</span>`;
    }

    const sizeTags = p.sizes && p.sizes.length > 0 ? 
      `<div class="size-tags">${p.sizes.map(s => `<span>${s}</span>`).join('')}</div>` : '';

    div.innerHTML = `
      <div class="item-info">
        ${mediaPreview}
        <span>${p.name} - ${priceInfo.final} جنيه ${priceInfo.hasDiscount ? `(خصم ${p.discount}%)` : ''}</span>
        ${sizeTags}
        <span style="font-size:12px;opacity:0.7;">📎 ${p.media ? p.media.length : 0} ملف</span>
      </div>
      <button onclick="deleteProduct(${p.id})">🗑 حذف</button>
    `;
    list.appendChild(div);
  });
}

function renderStoreCategories() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!categories || categories.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--brown);font-size:18px;padding:40px 0;">لا توجد أقسام حالياً</p>';
    return;
  }

  categories.forEach(c => {
    const div = document.createElement("div");
    div.className = "category";
    div.dataset.id = c.id;
    let imageHtml = '';
    if (c.image) {
      imageHtml = `<img src="${c.image}" alt="${c.name}" class="category-image">`;
    } else {
      imageHtml = `<span class="icon">${c.icon || '🏷️'}</span>`;
    }
    div.innerHTML = `
      ${imageHtml}
      <h3>${c.name}</h3>
      <button class="delete-cat" onclick="deleteCategory(${c.id})">🗑</button>
    `;
    grid.appendChild(div);
  });
  if (isAdmin) {
    document.querySelectorAll('.delete-cat').forEach(btn => btn.style.display = 'block');
  }
}

function renderAdminCategories() {
  const list = document.getElementById("adminCategoryList");
  if (!list) return;
  list.innerHTML = "";

  if (!categories || categories.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--brown);padding:20px 0;">لا توجد أقسام</p>';
    return;
  }

  categories.forEach(c => {
    const div = document.createElement("div");
    div.className = "admin-list-item";
    let imagePreview = '';
    if (c.image) {
      imagePreview = `<img src="${c.image}" alt="${c.name}">`;
    } else {
      imagePreview = `<span style="font-size:30px;">${c.icon || '🏷️'}</span>`;
    }
    div.innerHTML = `
      <div class="item-info">
        ${imagePreview}
        <span>${c.name}</span>
      </div>
      <button onclick="deleteCategory(${c.id})">🗑 حذف</button>
    `;
    list.appendChild(div);
  });
}

function showDeleteButtons(show) {
  document.querySelectorAll('.delete-prod').forEach(btn => {
    btn.style.display = show ? 'block' : 'none';
  });
  document.querySelectorAll('.delete-cat').forEach(btn => {
    btn.style.display = show ? 'block' : 'none';
  });
}

/* ==================================================
   PRODUCT MANAGEMENT
================================================== */
async function addProduct() {
  const nameInput = document.getElementById("newProductName");
  const priceInput = document.getElementById("newProductPrice");
  const discountInput = document.getElementById("newProductDiscount");
  const iconInput = document.getElementById("newProductIcon");

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value.trim());
  const discount = parseFloat(discountInput.value.trim()) || 0;
  const icon = iconInput.value.trim() || '📦';

  const sizeCheckboxes = document.querySelectorAll('.size-checkboxes input[type="checkbox"]:checked');
  const sizes = Array.from(sizeCheckboxes).map(cb => cb.value);

  if (!name || isNaN(price) || price <= 0) {
    alert("⚠️ يرجى إدخال اسم المنتج وسعر صحيح.");
    return;
  }

  const mediaFiles = getMediaFiles();
  const media = [];
  
  for (const mf of mediaFiles) {
    try {
      const dataUrl = await readFileAsDataURL(mf.file);
      media.push({
        type: mf.type,
        data: dataUrl,
        name: mf.name
      });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

  const newProduct = {
    id: Date.now(),
    name: name,
    price: price,
    discount: discount,
    icon: icon,
    media: media,
    sizes: sizes
  };

  products.push(newProduct);
  saveToLocalStorage();
  renderStoreProducts();
  renderAdminProducts();

  const result = await apiPost({
    action: 'addProduct',
    name: name,
    price: price,
    discount: discount,
    icon: icon,
    media: media,
    sizes: sizes
  });

  if (result && !result.error) {
    document.getElementById("newProductName").value = "";
    document.getElementById("newProductPrice").value = "";
    document.getElementById("newProductDiscount").value = "";
    document.getElementById("newProductIcon").value = "";
    document.querySelectorAll('.media-file-row input[type="file"]').forEach(input => {
      input.value = '';
    });
    document.querySelectorAll('.media-file-row .file-preview').forEach(preview => {
      preview.style.display = 'none';
      preview.className = 'file-preview';
    });
    document.querySelectorAll('.media-file-row .remove-file-btn').forEach(btn => {
      btn.className = 'remove-file-btn';
    });
    const container = document.getElementById('mediaFilesContainer');
    const rows = container.querySelectorAll('.media-file-row');
    rows.forEach((row, index) => {
      if (index > 0) row.remove();
    });
    document.querySelectorAll('.size-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    await loadProductsFromAPI();
    alert("✅ تم إضافة المنتج بنجاح!");
  } else {
    alert("⚠️ تم إضافة المنتج محلياً ولكن قد يكون هناك خطأ في المزامنة مع الخادم.");
  }
}

async function deleteProduct(id) {
  if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    products = products.filter(p => p.id !== id);
    saveToLocalStorage();
    renderStoreProducts();
    renderAdminProducts();

    const result = await apiPost({
      action: 'deleteProduct',
      id: id
    });

    if (result && !result.error) {
      await loadProductsFromAPI();
      alert("🗑 تم حذف المنتج.");
    } else {
      alert("⚠️ تم حذف المنتج محلياً ولكن قد يكون هناك خطأ في المزامنة مع الخادم.");
    }
  }
}

async function resetProducts() {
  if (confirm("⚠️ سيتم إعادة ضبط المنتجات إلى الوضع الافتراضي. هل أنت متأكد؟")) {
    products = getSampleProducts();
    saveToLocalStorage();
    renderStoreProducts();
    renderAdminProducts();
    alert("🔄 تم إعادة ضبط المنتجات محلياً.");
  }
}

/* ==================================================
   CATEGORY MANAGEMENT
================================================== */
async function addCategory() {
  const nameInput = document.getElementById("newCategoryName");
  const iconInput = document.getElementById("newCategoryIcon");
  const fileInput = document.getElementById("newCategoryImage");

  const name = nameInput.value.trim();
  const icon = iconInput.value.trim() || '🏷️';

  if (!name) {
    alert("⚠️ يرجى إدخال اسم القسم.");
    return;
  }

  let imageData = null;
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    imageData = await new Promise((resolve) => {
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    });
  }

  const newCategory = {
    id: Date.now(),
    name: name,
    icon: icon,
    image: imageData
  };

  categories.push(newCategory);
  saveToLocalStorage();
  renderStoreCategories();
  renderAdminCategories();

  const result = await apiPost({
    action: 'addCategory',
    name: name,
    icon: icon,
    image: imageData
  });

  if (result && !result.error) {
    document.getElementById("newCategoryName").value = "";
    document.getElementById("newCategoryIcon").value = "";
    document.getElementById("newCategoryImage").value = "";
    await loadCategoriesFromAPI();
    alert("✅ تم إضافة القسم بنجاح!");
  } else {
    alert("⚠️ تم إضافة القسم محلياً ولكن قد يكون هناك خطأ في المزامنة مع الخادم.");
  }
}

async function deleteCategory(id) {
  if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
    categories = categories.filter(c => c.id !== id);
    saveToLocalStorage();
    renderStoreCategories();
    renderAdminCategories();

    const result = await apiPost({
      action: 'deleteCategory',
      id: id
    });

    if (result && !result.error) {
      await loadCategoriesFromAPI();
      alert("🗑 تم حذف القسم.");
    } else {
      alert("⚠️ تم حذف القسم محلياً ولكن قد يكون هناك خطأ في المزامنة مع الخادم.");
    }
  }
}

async function resetCategories() {
  if (confirm("⚠️ سيتم إعادة ضبط الأقسام إلى الوضع الافتراضي. هل أنت متأكد؟")) {
    categories = getSampleCategories();
    saveToLocalStorage();
    renderStoreCategories();
    renderAdminCategories();
    alert("🔄 تم إعادة ضبط الأقسام محلياً.");
  }
}

// ==================================================
// بدء التحميل عند اكتمال تحميل الصفحة
// ==================================================
document.addEventListener('DOMContentLoaded', function() {
  loadFromLocalStorage();
  renderStoreProducts();
  renderStoreCategories();

  setTimeout(() => {
    loadProductsFromAPI();
    loadCategoriesFromAPI();
  }, 1000);
});
