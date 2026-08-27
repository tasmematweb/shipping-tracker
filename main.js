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

    // 1. تحقق محلي مباشر للـ Admin (يدعم النص والرقام معاً)
    const adminPhone = String(CONFIG.ADMIN_PHONE || '111').trim();
    const adminPass = String(CONFIG.ADMIN_PASSWORD || '111').trim();

    if ((phone === '111' && password === '111') || (phone === adminPhone && password === adminPass)) {
        alert('✅ مرحباً Admin! تم تسجيل الدخول بنجاح.');
        const loginBtn = document.getElementById('loginBtn');
        const adminPanel = document.getElementById('adminPanel');

        if (loginBtn) loginBtn.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('active');

        closeLoginModal();
        document.querySelectorAll('.delete-prod, .delete-cat').forEach(el => el.style.display = 'block');
        return;
    }

    // 2. إذا لم تتطابق البيانات المحلية، نفحص عبر الشيت
    const result = await callAPI('loginUser', { phone: phone, password: password });

    if (result && result.success) {
        alert('✅ تم تسجيل الدخول بنجاح.');
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.classList.add('hidden');
        closeLoginModal();
    } else {
        alert('❌ رقم الهاتف أو كلمة المرور غير صحيحة.');
    }
}
