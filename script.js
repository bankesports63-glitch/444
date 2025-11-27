document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCartCount();
    setupPaymentMethodListener();
    // Render notification badge for logged-in user
    try { renderNotificationBadge(); } catch (e) {}
});

let products = [
    { id: 1, name: 'BREAKER BK1', brand: 'breaker', price: 1200, image: 'https://www.breaker-shoes.com/wp-content/uploads/2025/09/BK-1231RED_%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%87.jpg', tag: 'ใหม่', description: 'รองเท้าฟุตซอล Breaker รุ่น BK1 โดดเด่นด้วยดีไซน์ที่ทันสมัยและวัสดุคุณภาพสูง เหมาะสำหรับการเล่นในสนามทุกรูปแบบ', sizes: ['39', '40', '41', '42', '43'] },
    { id: 2, name: 'Nike Lunargato II', brand: 'nike', price: 2500, image: 'https://www.messisport.com/50701-large_default/n8242-nike-lunargato-ii-blackvolt.jpg', tag: 'ฮิต', description: 'สัมผัสความนุ่มสบายและการตอบสนองที่ยอดเยี่ยมกับ Nike Lunargato II ที่มาพร้อมเทคโนโลยี Lunarlon เพื่อการรองรับแรงกระแทกที่ดีที่สุด', sizes: ['40', '41', '42', '43', '44'] },
    { id: 3, name: 'PAN VIGOR X', brand: 'pan', price: 1800, image: 'https://img.lazcdn.com/g/p/3895931036138c7a5e23bb1f0045acbd.jpg_720x720q80.jpg', tag: 'ลดราคา', description: 'PAN VIGOR X ออกแบบมาเพื่อความคล่องตัวสูงสุดในสนาม ด้วยหนังสังเคราะห์คุณภาพดีที่ให้ความทนทานและสัมผัสบอลที่แม่นยำ', sizes: ['38', '39', '40', '41', '42'] },
    { id: 4, name: 'JOMA TOP FLEX', brand: 'joma', price: 2800, image: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw348a8f35/images/medium/TOPW2482IN_10.jpg?sw=900&sh=900&sm=fit', description: 'Joma Top Flex เป็นที่รู้จักในด้านความยืดหยุ่นและความสบายที่เหนือกว่า ผลิตจากหนังแท้คุณภาพพรีเมียม ให้คุณควบคุมเกมได้อย่างสมบูรณ์แบบ', sizes: ['39', '40', '41', '42', '43'] },
    { id: 5, name: 'Breaker Real', brand: 'breaker', price: 1350, image: 'https://www.breaker-shoes.com/wp-content/uploads/2024/03/BK-0917PK-WH_%E0%B8%84%E0%B8%B9%E0%B9%88Years-of-the-Dragon-600x600.webp', tag: 'เพิ่มสต็อก', description: 'Breaker Real รุ่นพิเศษลายมังกร ผสมผสานดีไซน์คลาสสิกเข้ากับความทันสมัย ให้ความทนทานและสวมใส่สบาย', sizes: ['39', '40', '41'] },
    { id: 6, name: 'NIKE Tiempo Legend 10', brand: 'nike', price: 3200, image: 'https://www.supersports.co.th/cdn/shop/files/NI083SH888EJTH-0.jpg?v=1744099882', tag: 'ฮิต', description: 'Nike Tiempo Legend 10 Academy IC มาพร้อมหนังสังเคราะห์ FlyTouch Lite ที่นุ่มและเบากว่าหนังธรรมชาติ ช่วยให้คุณควบคุมบอลได้อย่างเหนือชั้น', sizes: ['41', '42', '43', '44'] },
    { id: 7, name: 'PAN WAVE II', brand: 'pan', price: 1600, image: 'https://down-th.img.susercontent.com/file/th-11134207-7ras8-m24tp3cmjqa1ba', description: 'PAN WAVE II ให้ความกระชับและมั่นคงในทุกการเคลื่อนไหว เหมาะสำหรับผู้เล่นที่ต้องการความเร็วและความคล่องตัว', sizes: ['39', '40', '41', '42'] },
    { id: 8, name: 'JOMA MUNDIAL', brand: 'joma', price: 2650, image: 'https://down-th.img.susercontent.com/file/th-11134207-7r991-lyylxbq9gi9tc4', description: 'Joma Mundial รุ่นคลาสสิกที่ได้รับความไว้วางใจจากผู้เล่นทั่วโลก ผลิตจากหนังคุณภาพสูงเพื่อความทนทานและสัมผัสที่เป็นเลิศ', sizes: ['40', '41', '42', '43'] },
];

// Initialize products into localStorage with stock if not present
function initProductsStorage() {
    try {
        const stored = localStorage.getItem('products');
        if (stored) {
            products = JSON.parse(stored);
            return;
        }

        // Ensure each product has a `stock` field (default 10 pairs)
        products = products.map(p => ({ stock: 10, ...p }));
        localStorage.setItem('products', JSON.stringify(products));
    } catch (e) {
        console.warn('initProductsStorage error', e);
    }
}

initProductsStorage();

let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
// `currentUser` will be an object (or null). Prefer JSON shape: { username, role, fullName?, email? }
let currentUser = null;
const __rawCurrent = localStorage.getItem('currentUser');
if (__rawCurrent) {
    try {
        currentUser = JSON.parse(__rawCurrent);
    } catch (e) {
        // older string-based value; upgrade to object
        currentUser = { username: __rawCurrent, role: 'user', fullName: __rawCurrent };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

if (currentUser) {
    const displayName = currentUser.fullName || currentUser.username;
    document.getElementById('userNameDisplay').textContent = displayName;
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
    // show admin button if role=admin
    if (currentUser.role === 'admin') {
        document.getElementById('adminSection').style.display = 'block';
    }
}

// ========== Product Display ==========
function displayProducts(productsToDisplay) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    productsToDisplay.forEach(product => {
        const stock = (typeof product.stock !== 'undefined') ? Number(product.stock) : null;
        let stockClass = 'medium';
        if (stock === null) stockClass = 'medium';
        else if (stock <= 0) stockClass = 'out';
        else if (stock <= 5) stockClass = 'low';
        else if (stock <= 15) stockClass = 'medium';
        else stockClass = 'high';

        const stockText = (stock === null) ? 'ไม่ระบุ' : `${stock} คู่`;

        const productCard = `
            <div class="product-card" data-brand="${product.brand}">
                <div class="product-clickable-area" onclick="showProductDetails(${product.id})">
                    ${product.tag ? `<div class="product-tag tag-${product.tag}">${product.tag}</div>` : ''}
                    <img src="${product.image}" alt="${product.name}">
                    <p class="product-id">รหัสสินค้า: ${String(product.id).padStart(4, '0')}</p>
                    <h3>${product.name}</h3>
                </div>

                <p class="product-price">ราคา: ฿${product.price.toLocaleString()}</p>
                <p class="product-stock"><span class="stock-badge stock-${stockClass}">${stockText}</span></p>
                <a href="#" class="view-details-link" onclick="event.preventDefault(); showProductDetails(${product.id})"><i class="fas fa-search-plus"></i> ดูรายละเอียด</a>
                <div class="size-selector-modern" id="size-selector-${product.id}">
                    <span class="size-label">เลือกไซส์:</span>
                    <div class="size-options">
                        ${product.sizes.map(size => `<div class="size-option" onclick="selectSize(this, 'size-selector-${product.id}')" data-size="${size}">${size}</div>`).join('')}
                    </div>
                </div>
                <button class="modern-cart-btn" id="btn-${product.id}" onclick="addToCart(${product.id}, this, getSelectedSize('size-selector-${product.id}'))">
                    <i class="fas fa-shopping-cart btn-icon"></i>
                    <span class="btn-text">เพิ่มลงตะกร้า</span>
                </button>
            </div>
        `;
        productsGrid.innerHTML += productCard;
    });
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const detailContent = document.getElementById('productDetailContent');
    const stock = (typeof product.stock !== 'undefined') ? Number(product.stock) : null;
    let stockClass = 'medium';
    if (stock === null) stockClass = 'medium';
    else if (stock <= 0) stockClass = 'out';
    else if (stock <= 5) stockClass = 'low';
    else if (stock <= 15) stockClass = 'medium';
    else stockClass = 'high';
    const stockText = (stock === null) ? 'ไม่ระบุ' : `${stock} คู่`;

    detailContent.innerHTML = `
        <div class="product-detail-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-detail-info">
            <h2>${product.name}</h2>
            <p class="price">฿${product.price.toLocaleString()}</p>
            <p class="product-stock"><span class="stock-badge stock-${stockClass}">${stockText}</span></p>
            <p class="description">${product.description}</p>
            <div class="size-selector-modern" id="detail-size-selector-${product.id}">
                <span class="size-label">เลือกไซส์:</span>
                <div class="size-options">
                    ${product.sizes.map(size => `<div class="size-option" onclick="selectSize(this, 'detail-size-selector-${product.id}')" data-size="${size}">${size}</div>`).join('')}
                </div>
            </div>
            <button class="modern-cart-btn" id="detail-btn-${product.id}" onclick="addToCart(${product.id}, this, getSelectedSize('detail-size-selector-${product.id}'))">
                <i class="fas fa-shopping-cart btn-icon"></i>
                <span class="btn-text">เพิ่มลงตะกร้า</span>
            </button>
        </div>
    `;

    openModal('productDetailModal');
}

/**
 * จัดการการเลือกไซส์
 * @param {HTMLElement} element - The clicked size option element.
 * @param {string} containerId - The ID of the size selector container.
 */
function selectSize(element, containerId) {
    const container = document.getElementById(containerId);
    // ลบ class 'selected' ออกจากปุ่มอื่นทั้งหมดใน container เดียวกัน
    container.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
    // เพิ่ม class 'selected' ให้กับปุ่มที่ถูกคลิก
    element.classList.add('selected');
}

/**
 * ดึงไซส์ที่ถูกเลือกจาก container
 */
function getSelectedSize(containerId) {
    const selectedOption = document.querySelector(`#${containerId} .size-option.selected`);
    return selectedOption ? selectedOption.dataset.size : null;
}

function filterProducts(brand) {
    const filteredProducts = brand === 'all' ? products : products.filter(p => p.brand === brand);
    displayProducts(filteredProducts);

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[onclick="filterProducts('${brand}')"]`).classList.add('active');
}

// ========== Modal Management ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        if (modalId === 'cartModal') {
            updateCartDisplay();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// ========== User Authentication ==========
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    // Use centralized users.js validation (validateLogin)
    try {
        if (typeof validateLogin === 'function') {
            const res = validateLogin(username, password);
            if (!res.success) {
                showNotification(res.message || 'ไม่สามารถเข้าสู่ระบบได้', 'error');
                return;
            }

            const user = res.user;
            // Persist logged-in user
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Log login event for admin auditing (if helper available)
            try {
                if (typeof addUserLog === 'function') {
                    addUserLog('login', user.username, { role: user.role, ua: navigator.userAgent });
                }
            } catch (e) { console.warn('log login', e); }
            // If admin, set session flag and redirect to admin
            if (user.role === 'admin') {
                sessionStorage.setItem('adminLoggedIn', 'true');
                showNotification('เข้าสู่ระบบแอดมินสำเร็จ!');
                try { renderNotificationBadge(); } catch (e) {}
                window.location.href = 'admin.html';
                return;
            }

            // Regular user
            currentUser = user;
            document.getElementById('userNameDisplay').textContent = currentUser.fullName || currentUser.username;
            document.getElementById('userSection').style.display = 'block';
            document.getElementById('loginSection').style.display = 'none';
            closeModal('loginModal');
            showNotification(`ยินดีต้อนรับ, ${currentUser.fullName || currentUser.username}!`);
            try { renderNotificationBadge(); } catch (e) {}
            return;
        }
    } catch (e) {
        console.error('handleLogin validate error', e);
    }

    // Fallback (if users.js not loaded) - deny login for safety
    showNotification('ระบบลงทะเบียนไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง', 'error');
}

// Registration handler (called from index.html form)
function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const fullName = document.getElementById('registerFullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();

    if (password !== passwordConfirm) {
        showNotification('รหัสผ่านไม่ตรงกัน', 'error');
        return;
    }

    if (typeof registerNewUser === 'function') {
        const res = registerNewUser(username, password, fullName, email);
        if (!res.success) {
            showNotification(res.message || 'ลงทะเบียนไม่สำเร็จ', 'error');
            return;
        }

        // Log registration event for admin auditing
        try {
            if (typeof addUserLog === 'function') {
                addUserLog('register', username, { fullName: fullName, email: email, ua: navigator.userAgent });
            }
        } catch (e) { console.warn('log register', e); }

        showNotification('ลงทะเบียนสำเร็จ! โปรดล็อกอินเพื่อใช้งาน');
        // switch to login tab in modal
        document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-login').classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector('.tab-btn[onclick*="tab-login"]');
        if (btn) btn.classList.add('active');
        // clear register form
        try { event.target.reset(); } catch (e) {}
        return;
    }

    showNotification('ระบบลงทะเบียนไม่พร้อมใช้งาน', 'error');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');

    document.getElementById('userSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    showNotification('คุณได้ออกจากระบบแล้ว');
    try { renderNotificationBadge(); } catch (e) {}
}

// ========== Cart Management ==========
function addToCart(productId, buttonElement, size) {
    const product = products.find(p => p.id === productId);
    if (!size) {
        showNotification('กรุณาเลือกไซส์ก่อนเพิ่มสินค้า', 'error');
        return;
    }

    // Check stock before adding
    if (typeof product.stock !== 'undefined' && product.stock <= 0) {
        showNotification('ขออภัย สินค้าหมดสต็อก', 'error');
        return;
    }

    // สร้าง ID ที่ไม่ซ้ำกันสำหรับสินค้าและไซส์
    const cartItemId = `${productId}-${size}`;
    const existingItem = cartItems.find(item => item.cartId === cartItemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ ...product, quantity: 1, size: size, cartId: cartItemId });
   }

    // Note: we do not decrement product.stock here until an order is completed.

    // --- Modern Button Animation ---
    if (buttonElement) {
        // 1. Loading state
        buttonElement.disabled = true;
        buttonElement.classList.add('loading');
        buttonElement.querySelector('.btn-icon').className = 'fas fa-spinner btn-icon';

        // 2. Success state after a short delay
        setTimeout(() => {
            buttonElement.classList.remove('loading');
            buttonElement.classList.add('success');
            buttonElement.querySelector('.btn-icon').className = 'fas fa-check btn-icon';
            buttonElement.querySelector('.btn-text').textContent = 'เพิ่มแล้ว';

            // 3. Revert to normal state
            setTimeout(() => {
                buttonElement.classList.remove('success');
                buttonElement.disabled = false;
                buttonElement.querySelector('.btn-icon').className = 'fas fa-shopping-cart btn-icon';
                buttonElement.querySelector('.btn-text').textContent = 'เพิ่มลงตะกร้า';
            }, 1500); // แสดงสถานะ "เพิ่มแล้ว" 1.5 วินาที

        }, 2000);
    }

    saveCart();
    updateCartCount();
    showNotification(`เพิ่ม '${product.name} (ไซส์ ${size})' ลงในตะกร้าแล้ว`);
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalDisplay = document.getElementById('cartTotalDisplay');
    cartItemsList.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsList.innerHTML = '<p>ตะกร้าของคุณว่างเปล่า</p>';
    } else {
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.name} (ไซส์ ${item.size}) - x${item.quantity}</span>
                <span>฿${(item.price * item.quantity).toLocaleString()}</span>
                <button onclick="removeFromCart('${item.cartId}')">ลบ</button>
            `;
            cartItemsList.appendChild(itemElement);
            total += item.price * item.quantity;
        });
    }
    cartTotalDisplay.textContent = `฿${total.toLocaleString()}`;
}

function removeFromCart(cartItemId) {
    cartItems = cartItems.filter(item => item.cartId !== cartItemId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
}


function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// ========== Checkout and Payment System ==========

/**
 * เริ่มกระบวนการชำระเงิน
 */
function proceedToCheckout() {
    if (!currentUser) {
        showNotification('กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน', 'error');
        closeModal('cartModal');
        openModal('loginModal');
        return;
    }

    if (cartItems.length === 0) {
        showNotification('ตะกร้าของคุณว่างเปล่า', 'error');
        return;
    }

    populateCheckoutSummary();
    closeModal('cartModal');
    openModal('paymentModal');
}

/**
 * แสดงข้อมูลสรุปการสั่งซื้อในหน้าชำระเงิน
 */
function populateCheckoutSummary() {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutTotalDisplay = document.getElementById('checkoutTotalDisplay');
    checkoutItemsList.innerHTML = '';
    let total = 0;

    cartItems.forEach(item => {
        const itemElement = `
            <div class="checkout-item">
                <span>${item.name} (ไซส์ ${item.size}) (x${item.quantity})</span>
                <span>฿${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `;
        checkoutItemsList.innerHTML += itemElement;
        total += item.price * item.quantity;
    });

    checkoutTotalDisplay.textContent = `฿${total.toLocaleString()}`;
}

/**
 * จัดการการเลือกวิธีการชำระเงิน
 */
function setupPaymentMethodListener() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const transferInfo = document.getElementById('transferInfo');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (event) => {
            if (event.target.value === 'transfer') {
                transferInfo.style.display = 'block';
            } else {
                transferInfo.style.display = 'none';
            }
        });
    });
}

/**
 * จัดการการยืนยันคำสั่งซื้อ
 */
function handlePayment(event) {
    event.preventDefault(); // ป้องกันการรีโหลดหน้า

    // ดึงข้อมูลจากฟอร์ม (เผื่อใช้ในอนาคต เช่น ส่งไปหลังบ้าน)
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // สร้างคำสั่งซื้อใหม่ (เก็บ username ถ้ามี และเก็บประวัติสถานะ)
    const order = {
        id: Date.now().toString(),
        customerName,
        customerAddress,
        customerPhone,
        shippingMethod,
        paymentMethod,
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: 'pending',
        date: new Date().toISOString(),
        customerUsername: currentUser ? currentUser.username : null,
        statusHistory: [ { status: 'pending', time: new Date().toISOString(), note: 'คำสั่งซื้อถูกสร้าง' } ],
        lastUpdate: new Date().toISOString(),
        unreadForUser: true
    };

    // บันทึกลง localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    // ลดสต็อกสินค้าตามรายการในตะกร้า (ไม่ให้ติดลบ)
    try {
        (order.items || []).forEach(i => {
            const prod = products.find(p => String(p.id) === String(i.id));
            if (prod && typeof prod.stock !== 'undefined') {
                const qty = Number(i.quantity) || 1;
                prod.stock = Math.max(0, (Number(prod.stock) || 0) - qty);
            }
        });
        localStorage.setItem('products', JSON.stringify(products));
    } catch (e) { console.warn('decrement stock error', e); }
    // เพิ่มการแจ้งเตือนให้ผู้ใช้ (ถ้ามี username)
    try {
        if (order.customerUsername && typeof addNotification === 'function') {
            addNotification(order.customerUsername, { type: 'order', message: `คำสั่งซื้อ #${order.id} ถูกสร้าง`, data: { orderId: order.id } });
        }
    } catch (e) { console.warn('notify:', e); }

    // แสดงข้อความยืนยัน
    showNotification('✅ สั่งซื้อสำเร็จ! หมายเลขคำสั่ง: #' + order.id);
    
    // ล้างตะกร้า
    cartItems = [];
    updateCartCount();
    // เพิ่มในฟังก์ชัน handlePayment (หลังจากบรรทัด "closeModal('paymentModal');")
    
    // บันทึกคำสั่งซื้อ
    function handlePayment(event) {
        event.preventDefault();
        
        const customerName = document.getElementById('customerName').value;
        const customerAddress = document.getElementById('customerAddress').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
        // สร้างคำสั่งซื้อใหม่ (รองรับกรณีโค้ดสำรอง)
        const order = {
            id: Date.now().toString(),
            customerName,
            customerAddress,
            customerPhone,
            shippingMethod,
            paymentMethod,
            items: cart,
            total: cartTotal,
            status: 'pending',
            date: new Date().toISOString(),
            customerUsername: currentUser ? currentUser.username : null,
            statusHistory: [ { status: 'pending', time: new Date().toISOString(), note: 'คำสั่งซื้อถูกสร้าง' } ],
            lastUpdate: new Date().toISOString(),
            unreadForUser: true
        };
    
        // บันทึกลง localStorage
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        try {
            if (order.customerUsername && typeof addNotification === 'function') {
                addNotification(order.customerUsername, { type: 'order', message: `คำสั่งซื้อ #${order.id} ถูกสร้าง`, data: { orderId: order.id } });
            }
        } catch (e) { console.warn('notify:', e); }
    
        // แสดงข้อความยืนยัน
        showNotification('✅ สั่งซื้อสำเร็จ! หมายเลขคำสั่ง: #' + order.id);
        
        // ล้างตะกร้า
        cart = [];
        updateCartCount();
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // ปิด modal
        closeModal('paymentModal');
        
        // เคลียร์ฟอร์ม
        document.getElementById('checkoutForm').reset();
    }    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // ปิด modal
    closeModal('paymentModal');
    
    // เคลียร์ฟอร์ม
    document.getElementById('checkoutForm').reset();
    document.getElementById('transferInfo').style.display = 'none'; // ซ่อนข้อมูลการโอนเงิน
}


// ========== Notification System ==========
function showNotification(message, type = 'success') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notificationArea.removeChild(notification);
        }, 500);
    }, 3000);
}

// Initial setup
filterProducts('all');
updateCartCount();
// (already handled above during initialization)
setupPaymentMethodListener();

function goToAdmin() {
    if (isUserAdmin()) {
        window.location.href = 'admin.html';
    } else {
        alert('⚠️ เฉพาะแอดมินเท่านั้นที่เข้าถึงได้');
    }
}

function isUserAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user && user.username === 'admin';
}

// แสดงคำสั่งซื้อของผู้ใช้ปัจจุบัน
function showMyOrders() {
    if (!currentUser) {
        showNotification('กรุณาเข้าสู่ระบบก่อนดูคำสั่งซื้อ', 'error');
        openModal('loginModal');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const myOrders = orders.filter(o => (o.customerUsername && currentUser && o.customerUsername === currentUser.username) || (!o.customerUsername && currentUser && (o.customerName === currentUser.fullName || o.customerName === currentUser.username)));

    const container = document.getElementById('myOrdersContent');
    if (!container) return;

    if (myOrders.length === 0) {
        container.innerHTML = '<p>คุณยังไม่มีคำสั่งซื้อ</p>';
    } else {
        let html = '';
        myOrders.forEach(order => {
            const date = order.date ? new Date(order.date).toLocaleString('th-TH') : '-';
            html += `<div class="form-card" style="margin-bottom:12px;">
                        <h3>รหัส: #${order.id} <span style="float:right; font-size:14px;">${date}</span></h3>
                        <p><strong>ยอดรวม:</strong> ฿${Number(order.total).toLocaleString()}</p>
                        ${order.unreadForUser ? '<div style="color:#e74c3c; font-weight:600;">มีการอัปเดตใหม่</div>' : ''}
                        <p><strong>สถานะปัจจุบัน:</strong> ${order.status}</p>
                        <div style="margin-top:8px;"><strong>ประวัติสถานะ:</strong>
                            <div style="margin-top:6px;">${(order.statusHistory || []).map(h => `<div style="font-size:13px; margin-bottom:4px;">- ${h.status} (${new Date(h.time).toLocaleString('th-TH')}) ${h.note ? '- ' + h.note : ''}</div>`).join('')}</div>
                        </div>
                        <div style="margin-top:10px; text-align:right;"><button class="btn btn-secondary" onclick="copyOrderId('${order.id}')">คัดลอกหมายเลข</button></div>
                    </div>`;
        });
        container.innerHTML = html;
    }

    openModal('myOrdersModal');
    // mark these orders as read for this user
    let allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    let changed = false;
    allOrders = allOrders.map(o => {
        if ((o.customerUsername && currentUser && o.customerUsername === currentUser.username) || (!o.customerUsername && currentUser && (o.customerName === currentUser.fullName || o.customerName === currentUser.username))) {
            if (o.unreadForUser) { o.unreadForUser = false; changed = true; }
        }
        return o;
    });
    if (changed) localStorage.setItem('orders', JSON.stringify(allOrders));
}

function copyOrderId(id) {
    try {
        navigator.clipboard.writeText(id);
        showNotification('คัดลอกหมายเลขคำสั่งซื้อแล้ว');
    } catch (e) {
        prompt('คัดลอกหมายเลขคำสั่งซื้อ:', id);
    }
}

// --- Notification center / badge (uses notifications.js helpers) ---
function renderNotificationBadge() {
    const area = document.getElementById('notificationArea');
    if (!area) return;
    const raw = localStorage.getItem('currentUser');
    let cu = null;
    try { cu = raw ? JSON.parse(raw) : null; } catch(e) { cu = null; }
    if (!cu) { area.innerHTML = ''; return; }
    const unread = typeof countUnread === 'function' ? countUnread(cu.username) : 0;
    area.innerHTML = `<div class="notif-icon" onclick="toggleNotificationCenter()"><i class="fas fa-bell"></i>${unread? '<span class="notif-badge">'+unread+'</span>' : ''}</div><div id="notificationCenter" class="notification-center" style="display:none;"></div>`;
}

function toggleNotificationCenter() {
    const center = document.getElementById('notificationCenter');
    if (!center) return;
    if (center.style.display === 'block') { center.style.display = 'none'; return; }

    const raw = localStorage.getItem('currentUser');
    let cu = null;
    try { cu = raw ? JSON.parse(raw) : null; } catch(e) { cu = null; }
    const username = cu ? cu.username : null;
    if (!username) return;

    const notes = typeof getNotifications === 'function' ? getNotifications(username) : [];
    if (!notes || notes.length === 0) {
        center.innerHTML = '<div style="padding:12px;">ไม่มีการแจ้งเตือน</div>';
    } else {
        center.innerHTML = notes.map(n => `
            <div class="notif-item ${n.read ? 'read' : ''}">
                <div class="notif-msg">${n.message}</div>
                <div class="notif-time">${new Date(n.time).toLocaleString('th-TH')}</div>
            </div>
        `).join('');
    }
    center.style.display = 'block';
    if (typeof markAllRead === 'function') markAllRead(username);
    // update badge
    try { renderNotificationBadge(); } catch (e) {}
}