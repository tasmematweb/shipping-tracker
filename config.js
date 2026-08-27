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
if (typeof module !== 'undefined' && module.exports) { module.exports = CONFIG; }
