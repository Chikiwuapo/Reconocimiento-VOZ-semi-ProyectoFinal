// JavaScript principal para el Chatbot Educativo

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chatbot Educativo cargado correctamente');
    
    // Inicializar componentes
    initializeChat();
    initializeNavigation();
    initializeAnimations();
});

// Funciones de chat
function initializeChat() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatInput && sendButton) {
        // Enviar mensaje con Enter
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Enviar mensaje con botón
        sendButton.addEventListener('click', sendMessage);
        
        // Auto-resize del textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
    
    // Scroll automático al final
    if (chatMessages) {
        scrollToBottom();
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Mostrar mensaje del usuario
    addMessageToChat(message, 'user');
    
    // Limpiar input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    // Simular respuesta del bot (esto se reemplazará con la API real)
    setTimeout(() => {
        hideTypingIndicator();
        addMessageToChat('Gracias por tu mensaje. Estoy procesando tu consulta...', 'bot');
    }, 1000);
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble message-${sender}`;
    messageDiv.textContent = message;
    
    // Añadir timestamp
    const timestamp = document.createElement('small');
    timestamp.className = 'message-time';
    timestamp.textContent = new Date().toLocaleTimeString();
    messageDiv.appendChild(document.createElement('br'));
    messageDiv.appendChild(timestamp);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Animación de entrada
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    });
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message-bubble message-bot';
    typingDiv.innerHTML = '<div class="loading"></div> El bot está escribiendo...';
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Funciones de navegación
function initializeNavigation() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Highlight del enlace activo
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Funciones de animación
function initializeAnimations() {
    // Intersection Observer para animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos con clase 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Utilidades
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatMessage(text) {
    // Convertir URLs en enlaces
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    
    // Convertir saltos de línea
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Funciones de sesión de chat
function createNewChatSession() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        addMessageToChat('¡Hola! Soy tu asistente educativo. ¿En qué puedo ayudarte hoy?', 'bot');
    }
}

function clearChat() {
    if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
        createNewChatSession();
        showNotification('Chat limpiado correctamente', 'success');
    }
}

// Exportar funciones para uso global
window.ChatBot = {
    sendMessage,
    addMessageToChat,
    clearChat,
    createNewChatSession,
    showNotification,
    formatMessage
};

// CSS adicional para animaciones
const additionalCSS = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .message-time {
        opacity: 0.7;
        font-size: 0.8em;
        margin-top: 5px;
        display: block;
    }
`;

// Inyectar CSS adicional
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);