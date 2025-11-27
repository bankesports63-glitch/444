// Check authentication
if (!isUserAdmin()) {
    window.location.href = 'index.html';
}

function isUserAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.username !== 'admin') return false;

    // Also validate adminSession expiration if present
    const sessionRaw = localStorage.getItem('adminSession');
    if (!sessionRaw) return true; // backward compatibility: allow if currentUser exists
    try {
        const session = JSON.parse(sessionRaw);
        // persistent session when expiresAt is null
        if (!session.expiresAt) return true;
        if (Date.now() > session.expiresAt) {
            // session expired -> cleanup
            localStorage.removeItem('adminSession');
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('adminLoggedIn');
            if (window.__adminTimeoutId) { clearTimeout(window.__adminTimeoutId); window.__adminTimeoutId = null; }
            return false;
        }
    } catch (e) { console.warn('isUserAdmin parse error', e); }

    return true;
}

function adminLogout() {
    // clear admin session and current user
    localStorage.removeItem('adminSession');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('adminLoggedIn');
    if (window.__adminTimeoutId) { clearTimeout(window.__adminTimeoutId); window.__adminTimeoutId = null; }
    window.location.href = 'index.html';
}

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.admin-menu button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    if (sectionId === 'products') loadProductsTable();
    if (sectionId === 'stock') loadStockTable();
    if (sectionId === 'orders') loadOrdersTable();
    if (sectionId === 'users') { loadUsersTable(); loadUserLogsTable(); }
    if (sectionId === 'dashboard') loadDashboardStats();
}

// ===== PRODUCTS SECTION =====
function addProduct(event) {
    event.preventDefault();
    
    const product = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value,
        sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim())
    };

    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));

    alert('✅ เพิ่มสินค้าสำเร็จ!');
    event.currentTarget.reset();
    loadProductsTable();
}

function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = `
            <tr>
                <td>${product.name}</td>
                <td>${product.brand.toUpperCase()}</td>
                <td>฿${product.price.toLocaleString()}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="editProduct(${product.id})">แก้ไข</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">ลบ</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteProduct(productId) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProductsTable();
        alert('✅ ลบสินค้าสำเร็จ!');
    }
}

function editProduct(productId) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productBrand').value = product.brand;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productSizes').value = product.sizes.join(', ');
        
        deleteProduct(productId);
    }
}

// ===== STOCK MANAGEMENT =====
function loadStockTable() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const stockStatus = product.stock > 10 ? '🟢 เพียงพอ' : product.stock > 0 ? '🟡 ใกล้หมด' : '🔴 หมด';
        const row = `
            <tr>
                <td>${product.name}</td>
                <td>${product.brand.toUpperCase()}</td>
                <td>
                    <input type="number" value="${product.stock}" onchange="updateStock(${product.id}, this.value)">
                    ${stockStatus}
                </td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="updateStockForProduct(${product.id})">บันทึก</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateStock(productId, newStock) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock = parseInt(newStock);
        localStorage.setItem('products', JSON.stringify(products));
        alert('✅ อัปเดตสต็อกสำเร็จ!');
    }
}

function searchStock() {
    const query = document.getElementById('stockSearchInput').value.toLowerCase();
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));

    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    filtered.forEach(product => {
        const stockStatus = product.stock > 10 ? '🟢 เพียงพอ' : product.stock > 0 ? '🟡 ใกล้หมด' : '🔴 หมด';
        const row = `
            <tr>
                <td>${product.name}</td>
                <td>${product.brand.toUpperCase()}</td>
                <td>
                    <input type="number" value="${product.stock}" onchange="updateStock(${product.id}, this.value)">
                    ${stockStatus}
                </td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="updateStockForProduct(${product.id})">บันทึก</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== ORDERS MANAGEMENT =====
function loadOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const statusColor = order.status === 'pending' ? 'status-pending' : 
                           order.status === 'completed' ? 'status-completed' : 'status-cancelled';
        const statusText = order.status === 'pending' ? 'รอดำเนินการ' : 
                          order.status === 'completed' ? 'สำเร็จ' : 'ยกเลิก';
        
        const row = `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>฿${order.total.toLocaleString()}</td>
                <td><span class="status-badge ${statusColor}">${statusText}</span></td>
                <td>${new Date(order.date).toLocaleDateString('th-TH')}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="viewOrderDetail(${order.id})">ดู</button>
                    <button class="btn btn-secondary btn-small" onclick="setOrderStatus(${order.id}, 'pending')">รอดำเนินการ</button>
                    <button class="btn btn-primary btn-small" onclick="setOrderStatus(${order.id}, 'completed')">สำเร็จ</button>
                    <button class="btn btn-danger btn-small" onclick="setOrderStatus(${order.id}, 'cancelled')">ยกเลิก</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function viewOrderDetail(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const idStr = String(orderId);
    const order = orders.find(o => String(o.id) === idStr);

    if (order) {
        // normalize fields (support multiple naming conventions)
        const customerName = order.customerName || order.name || order.customer || '-';
        const address = order.customerAddress || order.address || order.shippingAddress || '-';
        const phone = order.customerPhone || order.phone || order.tel || '-';
        const shipping = order.shippingMethod || order.shipping || order.delivery || '-';
        const payment = order.paymentMethod || order.payment || order.paymentType || '-';
        const status = order.status || '-';
        const date = order.date ? new Date(order.date) : null;

        let itemsHtml = '';
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach(item => {
            const itemName = item.name || item.title || 'สินค้า';
            const qty = item.quantity || item.qty || 1;
            const price = item.price || item.unitPrice || 0;
            itemsHtml += `<p>• ${itemName} x${qty} = ฿${(price * qty).toLocaleString()}</p>`;
        });

        // compute total if missing
        const total = order.total || items.reduce((s, it) => s + ((it.price || it.unitPrice || 0) * (it.quantity || it.qty || 1)), 0);

        const detail = `
            <h2>รหัสสั่งซื้อ: #${order.id}</h2>
            <hr>
            <h3>ข้อมูลลูกค้า</h3>
            <p><strong>ชื่อ:</strong> ${customerName}</p>
            <p><strong>ที่อยู่:</strong> ${address}</p>
            <p><strong>เบอร์โทร:</strong> ${phone}</p>
            <h3>รายการสินค้า</h3>
            ${itemsHtml || '<p>ไม่มีรายการสินค้า</p>'}
            <hr>
            <p><strong>ยอดรวม:</strong> ฿${Number(total).toLocaleString()}</p>
            <p><strong>วิธีจัดส่ง:</strong> ${shipping}</p>
            <p><strong>วิธีชำระเงิน:</strong> ${payment}</p>
            <p><strong>สถานะ:</strong> ${status}</p>
            <div style="margin-top:8px; text-align:right;">
                <button class="btn btn-secondary btn-small" onclick="setOrderStatus(${order.id}, 'pending')">รอดำเนินการ</button>
                <button class="btn btn-primary btn-small" onclick="setOrderStatus(${order.id}, 'completed')">สำเร็จ</button>
                <button class="btn btn-danger btn-small" onclick="setOrderStatus(${order.id}, 'cancelled')">ยกเลิก</button>
            </div>
            <div style="margin-top:8px; text-align:right;">
                <button class="btn btn-secondary btn-small" onclick="sendExternalNotificationPlaceholder('${order.customerUsername || ''}', 'คำสั่งซื้อ #${order.id} สถานะ: ${status}', 'sms')">ส่ง SMS</button>
                <button class="btn btn-secondary btn-small" onclick="sendExternalNotificationPlaceholder('${order.customerUsername || ''}', 'คำสั่งซื้อ #${order.id} สถานะ: ${status}', 'line')">ส่ง Line</button>
            </div>
            <h3>ประวัติสถานะ</h3>
            ${(order.statusHistory || []).map(h => `<div style="font-size:13px; margin-bottom:4px;">- ${h.status} (${new Date(h.time).toLocaleString('th-TH')}) ${h.note ? '- ' + h.note : ''}</div>`).join('')}
            <p><strong>วันที่:</strong> ${date ? date.toLocaleDateString('th-TH') : '-'}</p>
            <div style="margin-top:12px; text-align:right;">
                <button class="btn btn-secondary btn-small" onclick="closeOrderModal()">ปิด</button>
            </div>
        `;

        document.getElementById('orderDetailContent').innerHTML = detail;
        document.getElementById('orderModal').classList.add('active');
        document.getElementById('orderModalOverlay').classList.add('active');
    } else {
        alert('ไม่พบคำสั่งซื้อที่ระบุ');
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    document.getElementById('orderModalOverlay').classList.remove('active');
}

// เปลี่ยนสถานะคำสั่งซื้อแบบรวดเร็ว (โดยแอดมิน)
function setOrderStatus(orderId, newStatus, note = '') {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => String(o.id) === String(orderId));
    if (!order) {
        alert('ไม่พบคำสั่งซื้อ');
        return;
    }

    // Confirm for important transitions
    if (newStatus === 'cancelled' || newStatus === 'completed') {
        const ok = confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะคำสั่งซื้อ #${orderId} เป็น '${newStatus}'?`);
        if (!ok) return;
    }

    order.status = newStatus;
    order.lastUpdate = new Date().toISOString();
    order.unreadForUser = true;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: newStatus, time: new Date().toISOString(), note: note || 'อัปเดตโดยแอดมิน' });

    // persist and notify
    localStorage.setItem('orders', JSON.stringify(orders));
    try {
        const cust = order.customerUsername || null;
        if (cust && typeof addNotification === 'function') {
            addNotification(cust, { type: 'order_update', message: `คำสั่งซื้อ #${order.id} ถูกเปลี่ยนสถานะเป็น ${newStatus}`, data: { orderId: order.id, status: newStatus } });
        }
    } catch (e) { console.warn('notify', e); }

    loadOrdersTable();
    showOrderUpdatedToast(orderId, newStatus);
}

function showOrderUpdatedToast(orderId, newStatus) {
    alert(`อัปเดตคำสั่งซื้อ #${orderId} เป็น: ${newStatus}`);
}

function updateOrderStatus(orderId) {
    const newStatus = prompt('เปลี่ยนสถานะเป็น (pending/completed/cancelled):');
    if (newStatus) {
        setOrderStatus(orderId, newStatus, 'อัปเดตโดยแอดมิน (prompt)');
    }
}

function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const filtered = status ? orders.filter(o => o.status === status) : orders;

    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    filtered.forEach(order => {
        const statusColor = order.status === 'pending' ? 'status-pending' : 
                           order.status === 'completed' ? 'status-completed' : 'status-cancelled';
        const statusText = order.status === 'pending' ? 'รอดำเนินการ' : 
                          order.status === 'completed' ? 'สำเร็จ' : 'ยกเลิก';
        
        const row = `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>฿${order.total.toLocaleString()}</td>
                <td><span class="status-badge ${statusColor}">${statusText}</span></td>
                <td>${new Date(order.date).toLocaleDateString('th-TH')}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="viewOrderDetail(${order.id})">ดู</button>
                    <button class="btn btn-secondary btn-small" onclick="setOrderStatus(${order.id}, 'pending')">รอดำเนินการ</button>
                    <button class="btn btn-primary btn-small" onclick="setOrderStatus(${order.id}, 'completed')">สำเร็จ</button>
                    <button class="btn btn-danger btn-small" onclick="setOrderStatus(${order.id}, 'cancelled')">ยกเลิก</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function searchOrders() {
    const query = document.getElementById('orderSearchInput').value;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const filtered = orders.filter(o => o.id.toString().includes(query));

    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    filtered.forEach(order => {
        const statusColor = order.status === 'pending' ? 'status-pending' : 
                           order.status === 'completed' ? 'status-completed' : 'status-cancelled';
        const statusText = order.status === 'pending' ? 'รอดำเนินการ' : 
                          order.status === 'completed' ? 'สำเร็จ' : 'ยกเลิก';
        
        const row = `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>฿${order.total.toLocaleString()}</td>
                <td><span class="status-badge ${statusColor}">${statusText}</span></td>
                <td>${new Date(order.date).toLocaleDateString('th-TH')}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="viewOrderDetail(${order.id})">ดู</button>
                    <button class="btn btn-secondary btn-small" onclick="setOrderStatus(${order.id}, 'pending')">รอดำเนินการ</button>
                    <button class="btn btn-primary btn-small" onclick="setOrderStatus(${order.id}, 'completed')">สำเร็จ</button>
                    <button class="btn btn-danger btn-small" onclick="setOrderStatus(${order.id}, 'cancelled')">ยกเลิก</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== USERS MANAGEMENT =====
function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.username}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${new Date(user.registerDate).toLocaleDateString('th-TH')}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.username}')">ลบ</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function deleteUser(username) {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ${username}?`)) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsersTable();
        alert('✅ ลบผู้ใช้สำเร็จ!');
    }
}

function searchUsers() {
    const query = document.getElementById('userSearchInput').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filtered = users.filter(u => u.username.toLowerCase().includes(query) || u.fullName.toLowerCase().includes(query));

    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    filtered.forEach(user => {
        const row = `
            <tr>
                <td>${user.username}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${new Date(user.registerDate).toLocaleDateString('th-TH')}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.username}')">ลบ</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== USER LOGS (for admin) =====
function loadUserLogsTable() {
    const tbody = document.getElementById('userLogsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Prefer helper from users.js, fallback to localStorage
    let logs = [];
    try {
        if (typeof getUserLogs === 'function') {
            logs = getUserLogs(200);
        } else {
            logs = JSON.parse(localStorage.getItem('userLogs')) || [];
        }
    } catch (e) { logs = JSON.parse(localStorage.getItem('userLogs')) || []; }

    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#777;">ไม่มีบันทึก</td></tr>';
        return;
    }

    logs.forEach(log => {
        const time = log.time ? new Date(log.time).toLocaleString('th-TH') : '-';
        const action = log.action || '-';
        const username = log.username || '-';
        // meta summary
        let metaStr = '';
        try {
            const m = log.meta || {};
            const parts = [];
            if (m.email) parts.push(m.email);
            if (m.fullName) parts.push(m.fullName);
            if (m.role) parts.push(m.role);
            if (m.ua) parts.push((m.ua || '').slice(0,60) + ((m.ua || '').length > 60 ? '…' : ''));
            metaStr = parts.join(' | ');
        } catch (e) { metaStr = '' }

        const row = `
            <tr>
                <td>${time}</td>
                <td>${action}</td>
                <td>${username}</td>
                <td style="font-size:12px; color:#444;">${metaStr}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== DASHBOARD =====
function loadDashboardStats() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalSales').textContent = '฿' + totalSales.toLocaleString();
    
    document.getElementById('totalUsers').textContent = users.length;
}

// ฟังก์ชันเปลี่ยนหน้า
function switchSection(sectionName) {
    // ซ่อนทุก section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // ซ่อนหมด menu active
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // แสดง section ที่เลือก
    document.getElementById(sectionName).classList.add('active');
    
    // เพิ่ม active class ให้ menu ที่เลือก
    event.target.classList.add('active');

    // อัปเดตข้อมูล
    if (sectionName === 'orders') {
        loadOrders();
    } else if (sectionName === 'stock') {
        loadStock();
    } else if (sectionName === 'stats') {
        loadStats();
    }
}

// โหลดข้อมูลสต็อก
function loadStock() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.sku || 'N/A'}</td>
            <td>${product.name}</td>
            <td>${product.brand}</td>
            <td>฿${product.price}</td>
            <td><strong>${product.stock}</strong></td>
            <td>
                <button class="btn" onclick="editProduct('${product.id}')">แก้ไข</button>
                <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">ลบ</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// เพิ่มหรือแก้ไขสินค้า
function handleAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value;
    const brand = document.getElementById('productBrand').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const sku = document.getElementById('productSku').value || `${brand.toUpperCase()}-${Date.now()}`;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const newProduct = {
        id: Date.now().toString(),
        name,
        brand,
        price,
        stock,
        sku,
        image: `https://via.placeholder.com/200?text=${name}`
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    // รีเซ็ตฟอร์ม
    event.target.reset();
    alert('✅ เพิ่มสินค้าสำเร็จ');
    loadStock();
}

// ลบสินค้า
function deleteProduct(productId) {
    if (confirm('คุณแน่ใจไหม? การลบนี้ไม่สามารถกู้คืนได้')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        alert('✅ ลบสินค้าสำเร็จ');
        loadStock();
    }
}

// แก้ไขสินค้า
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);

    if (product) {
        const newStock = prompt(`แก้ไขสต็อกของ "${product.name}"\nสต็อกปัจจุบัน: ${product.stock}`, product.stock);
        
        if (newStock !== null) {
            product.stock = parseInt(newStock);
            localStorage.setItem('products', JSON.stringify(products));
            alert('✅ อัปเดตสต็อกสำเร็จ');
            loadStock();
        }
    }
}

// โหลดคำสั่งซื้อ
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');
        const items = order.items.map(item => `${item.name} x${item.quantity}`).join(', ');
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.customerPhone}</td>
            <td>฿${order.total}</td>
            <td><span class="status-badge status-${order.status}">${order.status === 'pending' ? 'รอจัดส่ง' : 'เสร็จสิ้น'}</span></td>
            <td>${new Date(order.date).toLocaleDateString('th-TH')}</td>
            <td>
                <details>
                    <summary>👁️ ดู</summary>
                    <div class="order-details">
                        <p><strong>สินค้า:</strong> ${items}</p>
                        <p><strong>ที่อยู่:</strong> ${order.customerAddress}</p>
                        <p><strong>วิธีจัดส่ง:</strong> ${order.shippingMethod === 'standard' ? 'Standard (฿50)' : 'Express (฿100)'}</p>
                        <p><strong>วิธีชำระ:</strong> ${order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนเงินธนาคาร'}</p>
                        <button class="btn" onclick="markAsCompleted('${order.id}')" ${order.status === 'completed' ? 'disabled' : ''}>
                            ${order.status === 'completed' ? '✓ จัดส่งแล้ว' : 'ยืนยันจัดส่ง'}
                        </button>
                    </div>
                </details>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// อัปเดตสถานะคำสั่งซื้อ
function markAsCompleted(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        order.status = 'completed';
        localStorage.setItem('orders', JSON.stringify(orders));
        alert('✅ อัปเดตสถานะสำเร็จ');
        loadOrders();
    }
}

// โหลดสถิติ
function loadStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // นับคำสั่งซื้อ
    document.getElementById('totalOrders').innerText = orders.length;
    
    // นับคำสั่งรอจัดส่ง
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    document.getElementById('pendingOrders').innerText = pendingCount;

    // นับรายได้รวม
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').innerText = `฿${totalRevenue.toLocaleString()}`;

    // แสดงสินค้าไม่มีสต็อก
    const outOfStock = products.filter(p => p.stock === 0);
    const outOfStockBody = document.getElementById('outOfStockTableBody');
    outOfStockBody.innerHTML = '';

    if (outOfStock.length === 0) {
        outOfStockBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">ไม่มีสินค้าไม่มีสต็อก ✓</td></tr>';
    } else {
        outOfStock.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>฿${product.price}</td>
            `;
            outOfStockBody.appendChild(row);
        });
    }
}

// ปุ่มกลับไปที่ร้าน
function backToShop() {
    window.location.href = 'index.html';
}

// โหลดข้อมูลเมื่อเปิดหน้า
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบว่าผู้ใช้เป็นแอดมิน (รองรับทั้ง localStorage.currentUser และ sessionStorage เก่า)
    if (isUserAdmin() || sessionStorage.getItem('adminLoggedIn') === 'true') {
        // โหลดข้อมูลสถิติสำหรับ Dashboard ซึ่งเป็นหน้าแรก
        loadDashboardStats();
        // ทำให้ปุ่มเมนู Dashboard เป็นสถานะ active
        const dashboardBtn = document.querySelector('.admin-menu button[onclick*="dashboard"]');
        if (dashboardBtn) dashboardBtn.classList.add('active');
    } else {
        // หากไม่ใช่แอดมิน ให้ redirect ออก
        window.location.href = 'admin-login.html';
    }
    // render notification badge if available
    try { renderNotificationBadge(); } catch (e) {}
});