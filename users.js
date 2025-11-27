// ข้อมูล User ที่ลงทะเบียนไว้แล้ว
let USERS_DATABASE = {
    'admin': {
        username: 'admin',
        password: '123456',
        role: 'admin',
        fullName: 'Admin BANKSHOP',
        email: 'admin@bankshop.com',
        createdAt: '2025-01-01'
    }
};

// โหลดข้อมูล user จาก localStorage เมื่อเปิดหน้า
function loadUsersFromStorage() {
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        USERS_DATABASE = { ...USERS_DATABASE, ...parsedUsers };
    }
}

// เรียกฟังก์ชันเมื่อโหลดหน้า
loadUsersFromStorage();

// ฟังก์ชันตรวจสอบ login
function validateLogin(username, password) {
    const user = USERS_DATABASE[username];
    
    if (!user) {
        return {
            success: false,
            message: '❌ ไม่พบชื่อผู้ใช้งานนี้'
        };
    }

    if (user.password !== password) {
        return {
            success: false,
            message: '❌ รหัสผ่านไม่ถูกต้อง'
        };
    }

    return {
        success: true,
        user: {
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            email: user.email
        }
    };
}

// ฟังก์ชันเพิ่ม user ใหม่
function registerNewUser(username, password, fullName, email) {
    // ตรวจสอบว่ามี username นี้อยู่แล้วหรือไม่
    if (USERS_DATABASE[username]) {
        return {
            success: false,
            message: '❌ ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว'
        };
    }

    // ไม่ให้ใช้ชื่อ admin
    if (username.toLowerCase() === 'admin') {
        return {
            success: false,
            message: '❌ ไม่สามารถใช้ชื่อ admin ได้'
        };
    }

    // สร้าง user ใหม่
    const newUser = {
        username: username,
        password: password,
        role: 'user',
        fullName: fullName,
        email: email,
        createdAt: new Date().toISOString().split('T')[0]
    };

    // เพิ่มไปยัง database
    USERS_DATABASE[username] = newUser;

    // บันทึกไป localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
    registeredUsers[username] = newUser;
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    return {
        success: true,
        message: '✅ ลงทะเบียนสำเร็จ'
    };
}

// ฟังก์ชันดึงข้อมูล user ทั้งหมด (สำหรับ admin)
function getAllUsers() {
    return Object.values(USERS_DATABASE)
        .filter(user => user.role === 'user')
        .map(user => ({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));
}

// -------------------- User logs (register / login) --------------------
function addUserLog(action, username, meta = {}) {
    try {
        const logs = JSON.parse(localStorage.getItem('userLogs')) || [];
        const entry = {
            id: Date.now().toString() + '-' + Math.floor(Math.random()*9000+1000),
            time: new Date().toISOString(),
            action: action, // 'register' | 'login'
            username: username,
            meta: meta
        };
        logs.unshift(entry); // most recent first
        // keep last 100 logs to avoid unbounded growth
        localStorage.setItem('userLogs', JSON.stringify(logs.slice(0, 100)));
        return entry;
    } catch (e) {
        console.warn('addUserLog error', e);
        return null;
    }
}

function getUserLogs(limit = 200) {
    try {
        const logs = JSON.parse(localStorage.getItem('userLogs')) || [];
        return logs.slice(0, limit);
    } catch (e) {
        return [];
    }
}

function clearUserLogs() {
    localStorage.removeItem('userLogs');
}