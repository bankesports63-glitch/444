// ข้อมูล admin (อาจจะเชื่อมต่อกับ database จริง)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '123456'
};

// SESSION TIMEOUT (30 นาที)
const SESSION_TIMEOUT = 30 * 60 * 1000;

function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorMessage = document.getElementById('errorMessage');

    // ตรวจสอบข้อมูล
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // บันทึก session แอดมิน
        const remember = document.getElementById('rememberAdmin') ? document.getElementById('rememberAdmin').checked : false;

        // expiresAt: null => persistent session until explicit logout
        const sessionData = {
            username: username,
            loginTime: Date.now(),
            token: generateToken(),
            expiresAt: remember ? null : (Date.now() + SESSION_TIMEOUT)
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));

        // Also set current user (consistent auth store used across the app)
        const adminUserObj = {
            username: username,
            role: 'admin',
            fullName: 'Admin BANKSHOP',
            email: 'admin@bankshop.com',
            loginTime: sessionData.loginTime
        };
        localStorage.setItem('currentUser', JSON.stringify(adminUserObj));
        // keep a session flag for backward compatibility
        sessionStorage.setItem('adminLoggedIn', 'true');
        
    // ตั้ง timeout เฉพาะกรณีที่ไม่ได้เลือก remember-me (setAdminSessionTimeout will no-op for persistent sessions)
    setAdminSessionTimeout();

        // แสดงข้อความสำเร็จ
        showSuccessMessage('ล็อคอินสำเร็จ! กำลังเข้าสู่ระบบ...');

        // เปลี่ยนหน้าไปยัง admin dashboard
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } else {
        // แสดงข้อความผิดพลาด
        errorMessage.style.display = 'block';
        errorMessage.textContent = '❌ ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
    }
}

// สร้าง token สำหรับ session
function generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// ตั้ง timeout สำหรับ session
function setAdminSessionTimeout() {
    try {
        const sessionRaw = localStorage.getItem('adminSession');
        if (!sessionRaw) return;
        const session = JSON.parse(sessionRaw);

        // If expiresAt is null => persistent session; do not set a timeout
        if (!session.expiresAt) return;

        const ms = session.expiresAt - Date.now();
        if (ms <= 0) {
            // already expired
            logoutAdmin();
            return;
        }

        // keep timer in-memory only (won't survive full process restart which is fine)
        if (window.__adminTimeoutId) clearTimeout(window.__adminTimeoutId);
        window.__adminTimeoutId = setTimeout(() => {
            logoutAdmin();
        }, ms);
    } catch (e) {
        console.warn('setAdminSessionTimeout error', e);
    }
}

// ตรวจสอบว่า admin ล็อคอินอยู่หรือไม่
function isAdminLoggedIn() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        return false;
    }

    const sessionData = JSON.parse(session);

    // If expiresAt is null, treat as persistent (still logged in)
    if (!sessionData.expiresAt) return true;

    const currentTime = Date.now();
    if (currentTime > sessionData.expiresAt) {
        // expired
        logoutAdmin();
        return false;
    }

    // still valid
    return true;
}

// ออกจากระบบแอดมิน
function logoutAdmin() {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionTimeout');
    // clear authenticated user
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// แสดงข้อความสำเร็จ
function showSuccessMessage(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
    errorDiv.style.background = '#d5f4e6';
    errorDiv.style.color = '#27ae60';
}

// เปิด/ปิดการแสดงรหัสผ่าน
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleBtn = document.querySelector('.toggle-btn');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// ตรวจสอบการสิ้นสุด session เมื่อเปลี่ยนแท็บ
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isAdminLoggedIn()) {
        alert('⏱️ Session หมดอายุแล้ว กรุณาล็อคอินอีกครั้ง');
        window.location.href = 'admin-login.html';
    }
});