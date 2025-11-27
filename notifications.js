// Simple client-side notifications stored per-username in localStorage
// Provides: addNotification, getNotifications, countUnread, markAllRead, markNotificationRead, sendExternalNotificationPlaceholder
(function(){
    function _loadAll() {
        try { return JSON.parse(localStorage.getItem('notifications') || '{}'); } catch (e) { return {}; }
    }

    function _saveAll(obj) {
        localStorage.setItem('notifications', JSON.stringify(obj));
    }

    function addNotification(username, notif) {
        if (!username) return null;
        const all = _loadAll();
        const list = all[username] || [];
        const n = {
            id: Date.now().toString() + Math.random().toString(36).slice(2,6),
            type: notif.type || 'info',
            message: notif.message || '',
            data: notif.data || null,
            time: new Date().toISOString(),
            read: false
        };
        list.unshift(n);
        all[username] = list;
        _saveAll(all);
        return n;
    }

    function getNotifications(username) {
        if (!username) return [];
        const all = _loadAll();
        return all[username] || [];
    }

    function countUnread(username) {
        return getNotifications(username).filter(n => !n.read).length;
    }

    function markAllRead(username) {
        if (!username) return;
        const all = _loadAll();
        if (!all[username]) return;
        all[username] = all[username].map(n => ({ ...n, read: true }));
        _saveAll(all);
    }

    function markNotificationRead(username, id) {
        if (!username) return;
        const all = _loadAll();
        if (!all[username]) return;
        all[username] = all[username].map(n => n.id === id ? ({ ...n, read: true }) : n);
        _saveAll(all);
    }

    function sendExternalNotificationPlaceholder(username, message, channel) {
        // Placeholder: to actually send SMS/Line integrate with your backend/API and provide credentials.
        // Here we only show a confirmation to the admin and log the attempt.
        alert(`[Placeholder] จะส่ง ${channel.toUpperCase()} ถึง ${username}:\n${message}\n(ต้องต่อ API ภายนอก - ใส่คีย์ในระบบหรือเรียก backend)`);
        console.log('External notification placeholder', { username, message, channel });
    }

    window.addNotification = addNotification;
    window.getNotifications = getNotifications;
    window.countUnread = countUnread;
    window.markAllRead = markAllRead;
    window.markNotificationRead = markNotificationRead;
    window.sendExternalNotificationPlaceholder = sendExternalNotificationPlaceholder;
    // Small built-in renderer so any page with #notificationArea can show a badge/center
    function renderNotificationBadge() {
        const area = document.getElementById('notificationArea');
        if (!area) return;
        const raw = localStorage.getItem('currentUser');
        let cu = null;
        try { cu = raw ? JSON.parse(raw) : null; } catch (e) { cu = null; }
        if (!cu) { area.innerHTML = ''; return; }
        const unread = countUnread(cu.username);
        area.innerHTML = `<div class="notif-icon" onclick="toggleNotificationCenter()"><i class="fas fa-bell"></i>${unread? '<span class="notif-badge">'+unread+'</span>' : ''}</div><div id="notificationCenter" class="notification-center" style="display:none"></div>`;
    }

    function toggleNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        if (!center) return;
        if (center.style.display === 'block') { center.style.display = 'none'; return; }
        const raw = localStorage.getItem('currentUser');
        let cu = null;
        try { cu = raw ? JSON.parse(raw) : null; } catch (e) { cu = null; }
        const username = cu ? cu.username : null;
        if (!username) return;
        const notes = getNotifications(username) || [];
        if (!notes.length) {
            center.innerHTML = '<div style="padding:12px;">ไม่มีการแจ้งเตือน</div>';
        } else {
            center.innerHTML = notes.map(n => `<div class="notif-item ${n.read ? 'read' : ''}">` +
                `<div class="notif-msg">${n.message}</div>` +
                `<div class="notif-time">${new Date(n.time).toLocaleString('th-TH')}</div></div>`).join('');
        }
        center.style.display = 'block';
        markAllRead(username);
        try { renderNotificationBadge(); } catch (e) {}
    }

    window.renderNotificationBadge = renderNotificationBadge;
    window.toggleNotificationCenter = toggleNotificationCenter;
})();
