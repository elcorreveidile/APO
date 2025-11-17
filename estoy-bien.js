/**
 * Estoy Bien - Sistema de Check-in Diario
 * Sistema para ayudar a personas que viven solas a reportar su estado diario
 */

// Constants
const STORAGE_KEYS = {
    CHECK_INS: 'estoyBienCheckIns',
    CONTACTS: 'estoyBienContacts',
    ALERTS: 'estoyBienAlerts',
    SETTINGS: 'estoyBienSettings'
};

const ALERT_INTERVALS = {
    HOURS_24: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    HOURS_48: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
    HOURS_72: 72 * 60 * 60 * 1000  // 72 hours in milliseconds
};

/**
 * Initialize the app
 */
function initApp() {
    updateStatus();
    loadContactsSummary();
    loadRecentHistory();
    checkAlerts();

    // Check alerts every minute
    setInterval(checkAlerts, 60000);
}

/**
 * Handle check-in button click
 */
function handleCheckIn() {
    const now = new Date();

    // Get existing check-ins
    let checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECK_INS) || '[]');

    // Add new check-in
    const newCheckIn = {
        id: Date.now().toString(),
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('es-ES'),
        time: now.toLocaleTimeString('es-ES')
    };

    checkIns.unshift(newCheckIn);
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));

    // Clear any active alerts
    clearAlerts();

    // Update UI
    updateStatus();
    loadRecentHistory();

    // Show success message
    showNotification('✓ Check-in registrado correctamente', 'success');

    // Animate button
    animateCheckInButton();
}

/**
 * Update the main status display
 */
function updateStatus() {
    const lastCheckIn = getLastCheckIn();
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const checkInBtn = document.getElementById('check-in-btn');
    const lastCheckInDiv = document.getElementById('last-check-in');

    if (!statusIcon || !statusTitle || !statusMessage) return;

    if (!lastCheckIn) {
        // No check-in yet
        statusIcon.className = 'w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-200';
        statusIcon.innerHTML = '<span class="text-6xl">👋</span>';
        statusTitle.textContent = 'Bienvenido';
        statusMessage.textContent = 'Realiza tu primer check-in para comenzar';
        lastCheckInDiv.textContent = 'Aún no has realizado ningún check-in';
        return;
    }

    const timeSinceLastCheckIn = Date.now() - new Date(lastCheckIn.timestamp).getTime();
    const hoursSince = Math.floor(timeSinceLastCheckIn / (1000 * 60 * 60));

    // Update alert indicators
    updateAlertIndicators(timeSinceLastCheckIn);

    if (timeSinceLastCheckIn < ALERT_INTERVALS.HOURS_24) {
        // All good - less than 24 hours
        statusIcon.className = 'w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600';
        statusIcon.innerHTML = '<span class="text-6xl">✓</span>';
        statusTitle.textContent = '¡Todo Bien!';
        statusTitle.className = 'text-3xl font-bold mb-3 text-green-600';
        statusMessage.textContent = 'Tu último check-in fue hace ' + formatTimeSince(timeSinceLastCheckIn);
        checkInBtn.classList.remove('disabled');
    } else if (timeSinceLastCheckIn < ALERT_INTERVALS.HOURS_48) {
        // Warning - 24-48 hours
        statusIcon.className = 'w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 pulse-animation';
        statusIcon.innerHTML = '<span class="text-6xl">⚠️</span>';
        statusTitle.textContent = 'Atención';
        statusTitle.className = 'text-3xl font-bold mb-3 text-yellow-600';
        statusMessage.textContent = 'Han pasado más de 24 horas desde tu último check-in';
        checkInBtn.classList.remove('disabled');
    } else if (timeSinceLastCheckIn < ALERT_INTERVALS.HOURS_72) {
        // Alert - 48-72 hours
        statusIcon.className = 'w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 pulse-animation';
        statusIcon.innerHTML = '<span class="text-6xl">🔔</span>';
        statusTitle.textContent = 'Alerta Activada';
        statusTitle.className = 'text-3xl font-bold mb-3 text-orange-600';
        statusMessage.textContent = 'Han pasado más de 48 horas. Tus contactos han sido notificados.';
        checkInBtn.classList.remove('disabled');
    } else {
        // Critical - more than 72 hours
        statusIcon.className = 'w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-red-400 to-red-600 pulse-animation';
        statusIcon.innerHTML = '<span class="text-6xl">🚨</span>';
        statusTitle.textContent = 'Alerta Crítica';
        statusTitle.className = 'text-3xl font-bold mb-3 text-red-600';
        statusMessage.textContent = 'Han pasado más de 72 horas. Tus contactos han sido alertados.';
        checkInBtn.classList.remove('disabled');
    }

    // Update last check-in info
    const lastDate = new Date(lastCheckIn.timestamp);
    lastCheckInDiv.innerHTML = `
        Último check-in: <strong>${lastCheckIn.date}</strong> a las <strong>${lastCheckIn.time}</strong>
        <br>
        <span class="text-xs">(Hace ${formatTimeSince(timeSinceLastCheckIn)})</span>
    `;
}

/**
 * Update alert indicators
 */
function updateAlertIndicators(timeSince) {
    const alert24h = document.getElementById('alert-24h');
    const alert48h = document.getElementById('alert-48h');
    const alert72h = document.getElementById('alert-72h');
    const alert24hTime = document.getElementById('alert-24h-time');
    const alert48hTime = document.getElementById('alert-48h-time');
    const alert72hTime = document.getElementById('alert-72h-time');

    if (!alert24h) return;

    const lastCheckIn = getLastCheckIn();
    if (!lastCheckIn) {
        alert24hTime.textContent = '--';
        alert48hTime.textContent = '--';
        alert72hTime.textContent = '--';
        return;
    }

    const lastTime = new Date(lastCheckIn.timestamp).getTime();

    // 24 hour alert
    const alert24Time = new Date(lastTime + ALERT_INTERVALS.HOURS_24);
    const alert48Time = new Date(lastTime + ALERT_INTERVALS.HOURS_48);
    const alert72Time = new Date(lastTime + ALERT_INTERVALS.HOURS_72);

    if (timeSince >= ALERT_INTERVALS.HOURS_24) {
        alert24h.classList.add('bg-yellow-100', 'border', 'border-yellow-300');
        alert24h.classList.remove('bg-gray-50');
        alert24h.querySelector('.w-3').classList.add('bg-yellow-500');
        alert24h.querySelector('.w-3').classList.remove('bg-gray-400');
        alert24hTime.textContent = '¡Activada!';
        alert24hTime.classList.add('text-yellow-700', 'font-bold');
    } else {
        alert24hTime.textContent = alert24Time.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (timeSince >= ALERT_INTERVALS.HOURS_48) {
        alert48h.classList.add('bg-orange-100', 'border', 'border-orange-300');
        alert48h.classList.remove('bg-gray-50');
        alert48h.querySelector('.w-3').classList.add('bg-orange-500');
        alert48h.querySelector('.w-3').classList.remove('bg-gray-400');
        alert48hTime.textContent = '¡Activada!';
        alert48hTime.classList.add('text-orange-700', 'font-bold');
    } else {
        alert48hTime.textContent = alert48Time.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (timeSince >= ALERT_INTERVALS.HOURS_72) {
        alert72h.classList.add('bg-red-100', 'border', 'border-red-300');
        alert72h.classList.remove('bg-gray-50');
        alert72h.querySelector('.w-3').classList.add('bg-red-500');
        alert72h.querySelector('.w-3').classList.remove('bg-gray-400');
        alert72hTime.textContent = '¡Activada!';
        alert72hTime.classList.add('text-red-700', 'font-bold');
    } else {
        alert72hTime.textContent = alert72Time.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Check and trigger alerts
 */
function checkAlerts() {
    const lastCheckIn = getLastCheckIn();
    if (!lastCheckIn) return;

    const timeSince = Date.now() - new Date(lastCheckIn.timestamp).getTime();
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS) || '[]');
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '{}');

    // Check 24 hour alert
    if (timeSince >= ALERT_INTERVALS.HOURS_24 && !alerts.alert24h) {
        triggerAlert('24h', contacts);
        alerts.alert24h = true;
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }

    // Check 48 hour alert
    if (timeSince >= ALERT_INTERVALS.HOURS_48 && !alerts.alert48h) {
        triggerAlert('48h', contacts);
        alerts.alert48h = true;
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }

    // Check 72 hour alert
    if (timeSince >= ALERT_INTERVALS.HOURS_72 && !alerts.alert72h) {
        triggerAlert('72h', contacts);
        alerts.alert72h = true;
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }
}

/**
 * Trigger an alert
 */
function triggerAlert(level, contacts) {
    console.log(`🚨 ALERTA ${level} ACTIVADA`);
    console.log('Contactos a notificar:', contacts);

    // In a real app, this would send actual notifications
    // For demo purposes, we'll show a browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Alerta Estoy Bien - ${level}`, {
            body: `No se ha recibido check-in en las últimas ${level}`,
            icon: '/favicon.ico'
        });
    }

    // Log the alert
    const alertLog = {
        timestamp: new Date().toISOString(),
        level: level,
        contacts: contacts.map(c => c.name)
    };

    let logs = JSON.parse(localStorage.getItem('estoyBienAlertLogs') || '[]');
    logs.unshift(alertLog);
    localStorage.setItem('estoyBienAlertLogs', JSON.stringify(logs));
}

/**
 * Clear all alerts
 */
function clearAlerts() {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify({}));
}

/**
 * Get the last check-in
 */
function getLastCheckIn() {
    const checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECK_INS) || '[]');
    return checkIns.length > 0 ? checkIns[0] : null;
}

/**
 * Load contacts summary for main page
 */
function loadContactsSummary() {
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;

    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS) || '[]');

    if (contacts.length === 0) {
        contactsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p class="mb-2">No tienes contactos agregados</p>
                <a href="estoy-bien-contactos.html" class="text-blue-500 hover:text-blue-600 font-medium">
                    Agregar contactos
                </a>
            </div>
        `;
    } else {
        contactsList.innerHTML = contacts.slice(0, 3).map(contact => `
            <div class="contact-item flex items-center justify-between p-3 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold">${contact.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p class="font-medium text-sm">${contact.name}</p>
                        <p class="text-xs text-gray-500">${contact.relation}</p>
                    </div>
                </div>
                <div class="text-xs text-gray-400">
                    ${contact.phone}
                </div>
            </div>
        `).join('');

        if (contacts.length > 3) {
            contactsList.innerHTML += `
                <a href="estoy-bien-contactos.html" class="block text-center text-blue-500 hover:text-blue-600 font-medium text-sm mt-2">
                    Ver todos (${contacts.length})
                </a>
            `;
        }
    }
}

/**
 * Load recent history
 */
function loadRecentHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    const checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECK_INS) || '[]');

    if (checkIns.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p>No hay check-ins registrados</p>
            </div>
        `;
    } else {
        historyList.innerHTML = checkIns.slice(0, 5).map((checkIn, index) => {
            const date = new Date(checkIn.timestamp);
            const timeSince = Date.now() - date.getTime();
            const isToday = date.toDateString() === new Date().toDateString();

            return `
                <div class="flex items-center justify-between p-3 rounded-lg ${isToday ? 'bg-green-50' : 'bg-gray-50'}">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full ${isToday ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center">
                            <span class="text-white">✓</span>
                        </div>
                        <div>
                            <p class="font-medium text-sm">${checkIn.date}</p>
                            <p class="text-xs text-gray-500">${checkIn.time}</p>
                        </div>
                    </div>
                    <span class="text-xs text-gray-500">
                        ${formatTimeSince(timeSince)}
                    </span>
                </div>
            `;
        }).join('');
    }
}

/**
 * Format time since last check-in
 */
function formatTimeSince(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} día${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else {
        return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
}

/**
 * Animate check-in button
 */
function animateCheckInButton() {
    const btn = document.getElementById('check-in-btn');
    if (!btn) return;

    btn.classList.add('scale-110');
    setTimeout(() => {
        btn.classList.remove('scale-110');
    }, 300);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    } text-white font-medium transition-all`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Request notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Request notification permission on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', requestNotificationPermission);
}
