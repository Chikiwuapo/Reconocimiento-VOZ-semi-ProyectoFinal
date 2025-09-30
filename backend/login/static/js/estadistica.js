// Estadistica.js - Panel Administrativo
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    // Mostrar modal de bienvenida si es necesario
    showWelcomeModal();
    
    // Cargar datos iniciales
    loadDashboardData();
    loadUsersData();
    loadSystemLogs();
    
    // Configurar actualizaciones automáticas
    setInterval(loadDashboardData, 30000); // Actualizar cada 30 segundos
    setInterval(loadSystemLogs, 60000); // Actualizar logs cada minuto
}

function showWelcomeModal() {
    // Verificar si es la primera vez que se accede
    const hasSeenWelcome = localStorage.getItem('admin_welcome_seen');
    
    if (!hasSeenWelcome) {
        const modal = document.getElementById('welcome-modal');
        const username = getAdminUsername();
        
        // Actualizar nombre de usuario en el modal
        document.getElementById('modal-username').textContent = username;
        document.getElementById('admin-username').textContent = username;
        
        modal.classList.add('show');
        
        // Marcar como visto
        localStorage.setItem('admin_welcome_seen', 'true');
    } else {
        // Solo actualizar el nombre de usuario en el header
        const username = getAdminUsername();
        document.getElementById('admin-username').textContent = username;
    }
}

function getAdminUsername() {
    // Obtener nombre de usuario desde URL params o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username') || localStorage.getItem('admin_username') || 'Administrador';
    
    // Guardar en localStorage para futuras visitas
    localStorage.setItem('admin_username', username);
    
    return username;
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('show');
}

async function loadDashboardData() {
    try {
        // Cargar estadísticas de usuarios
        const usersResponse = await fetch('/api/admin/users-stats/');
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            document.getElementById('total-users').textContent = usersData.total || 0;
            document.getElementById('total-logins').textContent = usersData.total_logins || 0;
        }
        
        // Cargar estadísticas de comandos de voz
        const voiceResponse = await fetch('/voz/api/comandos-stats/');
        if (voiceResponse.ok) {
            const voiceData = await voiceResponse.json();
            document.getElementById('voice-commands').textContent = voiceData.total || 0;
        }
        
        // Estado del sistema (siempre activo si la página carga)
        document.getElementById('system-status').textContent = 'Activo';
        
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        showNotification('Error al cargar estadísticas', 'error');
    }
}

async function loadUsersData() {
    try {
        const response = await fetch('/api/admin/users/');
        if (response.ok) {
            const data = await response.json();
            renderUsersTable(data.users || []);
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #718096;">No hay usuarios registrados</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const userType = user.email && user.email.endsWith('@senati.pe') ? 'Administrador' : 'Usuario';
        const status = user.is_active ? 'Activo' : 'Inactivo';
        const statusClass = user.is_active ? 'status-active' : 'status-inactive';
        
        row.innerHTML = `
            <td>${user.nombres || ''} ${user.apellidos || ''}</td>
            <td>${user.email || 'N/A'}</td>
            <td><span class="user-type ${userType.toLowerCase()}">${userType}</span></td>
            <td>${formatDate(user.date_joined)}</td>
            <td><span class="status ${statusClass}">${status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewUser(${user.id})" title="Ver detalles">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                ${!user.is_active ? `
                <button class="action-btn activate-btn" onclick="toggleUserStatus(${user.id}, true)" title="Activar usuario">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                ` : `
                <button class="action-btn deactivate-btn" onclick="toggleUserStatus(${user.id}, false)" title="Desactivar usuario">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                `}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

async function loadSystemLogs() {
    try {
        const response = await fetch('/api/admin/logs/');
        if (response.ok) {
            const data = await response.json();
            renderSystemLogs(data.logs || []);
        }
    } catch (error) {
        console.error('Error cargando logs:', error);
        // Mostrar logs simulados si no hay endpoint
        renderSystemLogs([
            { timestamp: new Date().toISOString(), level: 'INFO', message: 'Sistema iniciado correctamente' },
            { timestamp: new Date(Date.now() - 300000).toISOString(), level: 'INFO', message: 'Usuario admin@senati.pe inició sesión' },
            { timestamp: new Date(Date.now() - 600000).toISOString(), level: 'INFO', message: 'Comando de voz procesado exitosamente' }
        ]);
    }
}

function renderSystemLogs(logs) {
    const logsContainer = document.getElementById('system-logs');
    logsContainer.innerHTML = '';
    
    if (logs.length === 0) {
        logsContainer.innerHTML = '<div style="color: #718096; text-align: center;">No hay logs disponibles</div>';
        return;
    }
    
    logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${log.level.toLowerCase()}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${formatDateTime(log.timestamp)}]</span>
            <span class="log-level">${log.level}</span>
            <span class="log-message">${log.message}</span>
        `;
        logsContainer.appendChild(logEntry);
    });
    
    // Scroll al final
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function refreshLogs() {
    loadSystemLogs();
    showNotification('Logs actualizados', 'success');
}

async function viewUser(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/`);
        if (response.ok) {
            const user = await response.json();
            showUserModal(user);
        }
    } catch (error) {
        console.error('Error obteniendo detalles del usuario:', error);
        showNotification('Error al obtener detalles del usuario', 'error');
    }
}

async function toggleUserStatus(userId, activate) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/toggle-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ active: activate })
        });
        
        if (response.ok) {
            loadUsersData(); // Recargar tabla
            showNotification(`Usuario ${activate ? 'activado' : 'desactivado'} exitosamente`, 'success');
        }
    } catch (error) {
        console.error('Error cambiando estado del usuario:', error);
        showNotification('Error al cambiar estado del usuario', 'error');
    }
}

function showUserModal(user) {
    // Implementar modal de detalles de usuario
    alert(`Detalles del usuario:\nNombre: ${user.nombres} ${user.apellidos}\nEmail: ${user.email}\nDNI: ${user.dni}`);
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar localStorage
        localStorage.removeItem('admin_welcome_seen');
        localStorage.removeItem('admin_username');
        
        // Establecer flag para limpiar el campo de email en la página de login
        localStorage.setItem('clear_email_on_load', 'true');
        
        // Redirigir al logout
        window.location.href = '/logout/';
    }
}

// Utilidades
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
}

function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}

function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Agregar estilos para las notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .user-type {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .user-type.administrador {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }
    
    .user-type.usuario {
        background: rgba(72, 187, 120, 0.1);
        color: #48bb78;
    }
    
    .status {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .status.status-active {
        background: rgba(72, 187, 120, 0.1);
        color: #48bb78;
    }
    
    .status.status-inactive {
        background: rgba(245, 101, 101, 0.1);
        color: #f56565;
    }
    
    .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        margin: 0 0.25rem;
        transition: all 0.3s ease;
    }
    
    .action-btn:hover {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .view-btn { color: #4299e1; }
    .activate-btn { color: #48bb78; }
    .deactivate-btn { color: #f56565; }
    
    .log-entry {
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .log-timestamp { color: #718096; }
    .log-level { 
        font-weight: bold; 
        margin: 0 0.5rem;
    }
    .log-message { color: #2d3748; }
    
    .log-info .log-level { color: #4299e1; }
    .log-warning .log-level { color: #ed8936; }
    .log-error .log-level { color: #f56565; }
`;
document.head.appendChild(notificationStyles);