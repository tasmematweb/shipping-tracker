// ==================================================
// CONFIGURATION - H.L LeVance Store
// جميع بيانات الربط في ملف واحد منفصل
// ==================================================

const CONFIG = {
    // ==============================================
    // Google Sheets API - الرابط الجديد
    // ==============================================
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwMtcxky7rrjXBdKVOyohFF7f-F_FzbW1eIV_p7wc-gLsac6VYOrUPTXzptkKiPW0ju/exec',
    
    // ==============================================
    // إعدادات المتجر
    // ==============================================
    STORE_NAME: 'H.L LeVance',
    STORE_PHONE: '201234567890',
    STORE_EMAIL: 'info@hllevance.com',
    
    // ==============================================
    // إعدادات Admin
    // ==============================================
    ADMIN_PHONE: '111',
    ADMIN_PASSWORD: '111',
    
    // ==============================================
    // مفاتيح التخزين المحلي (localStorage)
    // ==============================================
    STORAGE_KEY_PRODUCTS: 'hl_products',
    STORAGE_KEY_CATEGORIES: 'hl_categories',
    STORAGE_KEY_CART: 'hl_cart',
    STORAGE_KEY_ORDERS: 'hl_orders',
    
    // ==============================================
    // إعدادات WhatsApp
    // ==============================================
    WHATSAPP_NUMBER: '201234567890',
    WHATSAPP_MESSAGE: 'مرحباً، أريد الاستفسار عن منتجاتكم',
    
    // ==============================================
    // إعدادات أخرى
    // ==============================================
    DEFAULT_CURRENCY: 'جنيه',
    DEFAULT_WEIGHT: 1,
    MAX_FILE_SIZE: 5, // ميجابايت
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
};

// تصدير للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// تصدير للاستخدام في Node.js (إذا لزم الأمر)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
