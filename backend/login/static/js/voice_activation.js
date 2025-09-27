/**
 * VoiceActivation - Sistema para activar comandos de voz en login.html
 * Verifica si el usuario está registrado y tiene perfil de voz antes de activar
 */

class VoiceActivation {
    constructor() {
        this.activateButton = document.querySelector('#btnActivateVoice');
        this.emailInput = document.querySelector('#email');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkInitialState();
    }
    
    bindEvents() {
        // Escuchar cambios en el email para verificar usuario
        if (this.emailInput) {
            this.emailInput.addEventListener('input', () => {
                this.checkUserVoiceProfile();
            });
            
            this.emailInput.addEventListener('blur', () => {
                this.checkUserVoiceProfile();
            });
        }
        
        // Manejar click del botón de activación
        if (this.activateButton) {
            this.activateButton.addEventListener('click', () => {
                this.activateVoiceCommands();
            });
        }
    }
    
    checkInitialState() {
        // Verificar si ya hay consentimiento activo
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        if (voiceConsent === 'true') {
            this.hideActivateButton();
        } else {
            this.checkUserVoiceProfile();
        }
    }
    
    async checkUserVoiceProfile() {
        const email = this.emailInput?.value?.trim();
        
        if (!email || !this.isValidEmail(email)) {
            this.hideActivateButton();
            return;
        }
        
        try {
            // Verificar si el usuario existe y tiene perfil de voz activo
            const response = await fetch('/voz/api/check_registered_users/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al verificar usuario');
            }
            
            const data = await response.json();
            
            // Verificar específicamente si este email tiene perfil de voz
            const userResponse = await fetch('/api/validate_user/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ email: email })
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.exists && data.users_with_voice > 0) {
                    this.showActivateButton();
                } else {
                    this.hideActivateButton();
                }
            } else {
                this.hideActivateButton();
            }
            
        } catch (error) {
            console.error('Error verificando perfil de voz:', error);
            this.hideActivateButton();
        }
    }
    
    showActivateButton() {
        if (this.activateButton) {
            this.activateButton.style.display = 'block';
        }
    }
    
    hideActivateButton() {
        if (this.activateButton) {
            this.activateButton.style.display = 'none';
        }
    }
    
    activateVoiceCommands() {
        // Activar comandos de voz estableciendo el consentimiento
        localStorage.setItem('voiceCommandsEnabled', 'true');
        
        // Ocultar el botón
        this.hideActivateButton();
        
        // Mostrar mensaje de confirmación
        this.showToast('✅ Comandos de voz activados', 'success');
        
        // Inicializar VoiceLogin si está disponible
        if (typeof VoiceLogin !== 'undefined') {
            window.voiceLogin = new VoiceLogin();
        }
        
        // Recargar la página para aplicar todos los cambios
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }
    
    showToast(message, type = 'info') {
        // Crear elemento toast si no existe
        let toast = document.querySelector('#voice-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'voice-toast';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.transform = 'translateX(0)';
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si no hay consentimiento previo
    const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
    if (voiceConsent !== 'true') {
        window.voiceActivation = new VoiceActivation();
    }
});