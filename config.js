// ==================================================
// CONFIGURATION - H.L LeVance Store
// جميع بيانات الربط في ملف واحد منفصل
// ==================================================

const CONFIG = {
    // ==============================================
    // Google Sheets API - الرابط الجديد
    // ==============================================
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbzQ1ZzQtn1M8AI_9ppSpCPYauVod2JTIHj0a1lO6x3-gLb-khqqfW8EtcWZVg8wJcAf/exec',
    
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
    // مفاتيح التخزين المحلي (localStorage) - للنسخ الاحتياطي
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
    MAX_FILE_SIZE: 5,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],

    // ==============================================
    // Cloudinary - رفع الصور والفيديو (اختياري)
    // ==============================================
    CLOUDINARY: {
        CLOUD_NAME: 'q2tqddel',
        API_KEY: '518715792296824',
        API_SECRET: 'اضف_المفتاح_السري_هنا'
    },
    
    CLOUDINARY_UPLOAD_URL: 'https://api.cloudinary.com/v1_1/q2tqddel/upload'
};

// تصدير للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
