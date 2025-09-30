/**
 * AriasDigitalSoft - Register JavaScript
 * Maneja las animaciones y efectos visuales de la página de registro
 */

class RegisterManager {
    constructor() {
        this.container = document.querySelector('.container');
        this.card = document.querySelector('.card');
        this.buttons = document.querySelectorAll('.btn');
        this.inputs = document.querySelectorAll('.input');
        this.floatingElements = document.querySelectorAll('.floating-element');
        this.voiceRegisterBtn = document.getElementById('btnVoiceRegister');
        this.registerBtn = document.getElementById('btnRegister');
        
        this.registrationStep = 'face'; // 'face' or 'voice'
        
        this.init();
    }

    init() {
        // Iniciar animaciones de entrada
        this.animatePageLoad();
        
        // Agregar listeners para interacciones
        this.addInteractionListeners();
        
        // Iniciar animaciones de fondo
        this.startBackgroundAnimations();
        
        // Efectos de parallax
        this.initParallaxEffects();
        
        // Listeners específicos del registro
        this.addRegistrationListeners();
        
        // Inicializar el sistema de registro de voz
        this.initVoiceRegistration();
    }

    initVoiceRegistration() {
        // La funcionalidad de registro de voz se maneja en voice_register.js
        if (typeof VoiceRegistration !== 'undefined') {
            window.voiceRegistration = new VoiceRegistration();
            
            // Obtener el pending token del elemento de datos en el HTML
            const pendingTokenElement = document.querySelector('[data-pending-token]');
            if (pendingTokenElement) {
                const pendingToken = pendingTokenElement.getAttribute('data-pending-token');
                window.voiceRegistration.setPendingToken(pendingToken);
            }
        }
    }

    animatePageLoad() {
        // Animar elementos con delay escalonado
        const elements = [
            { selector: '.card', delay: 200 },
            { selector: '.card-media', delay: 400 },
            { selector: '.card-aside', delay: 600 },
            { selector: '.actions', delay: 800 }
        ];

        elements.forEach(({ selector, delay }) => {
            setTimeout(() => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(30px)';
                    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 50);
                }
            }, delay);
        });
    }

    addInteractionListeners() {
        // Efectos hover para botones
        this.buttons.forEach(button => {
            button.addEventListener('mouseenter', this.onButtonHover.bind(this));
            button.addEventListener('mouseleave', this.onButtonLeave.bind(this));
            button.addEventListener('click', this.onButtonClick.bind(this));
        });

        // Efectos focus para inputs
        this.inputs.forEach(input => {
            input.addEventListener('focus', this.onInputFocus.bind(this));
            input.addEventListener('blur', this.onInputBlur.bind(this));
            input.addEventListener('input', this.onInputChange.bind(this));
        });

        // Efectos de teclado
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // Efectos de mouse para parallax
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    addRegistrationListeners() {
        // Listener para el botón de registro facial
        if (this.registerBtn) {
            this.registerBtn.addEventListener('click', this.onFaceRegisterClick.bind(this));
        }

        // Listener para el botón de registro de voz
        if (this.voiceRegisterBtn) {
            this.voiceRegisterBtn.addEventListener('click', this.onVoiceRegisterClick.bind(this));
        }
    }

    onFaceRegisterClick(event) {
        event.preventDefault();
        
        // Animación de éxito del registro facial
        this.animateRegistrationSuccess('face');
        
        // Habilitar el botón de registro de voz después del registro facial
        setTimeout(() => {
            if (this.voiceRegisterBtn) {
                this.voiceRegisterBtn.disabled = false;
                this.voiceRegisterBtn.classList.add('pulse-animation');
                this.registrationStep = 'voice';
                
                // Mostrar mensaje de siguiente paso
                this.showStepMessage('¡Registro facial completado! Ahora registra tu voz.');
            }
        }, 1500);
    }

    onVoiceRegisterClick(event) {
        event.preventDefault();
        
        // Animación de éxito del registro de voz
        this.animateRegistrationSuccess('voice');
        
        // Completar el proceso de registro
        setTimeout(() => {
            this.showStepMessage('¡Registro completado exitosamente!');
            this.animateCompletionSuccess();
        }, 1500);
    }

    animateRegistrationSuccess(type) {
        const button = type === 'face' ? this.registerBtn : this.voiceRegisterBtn;
        
        if (button) {
            // Efecto de éxito
            button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            button.style.transform = 'scale(1.05)';
            button.innerHTML = type === 'face' ? '✓ Rostro Registrado' : '✓ Voz Registrada';
            
            // Efecto de partículas de éxito
            this.createSuccessParticles(button);
            
            // Restaurar después de un tiempo
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                if (type === 'face') {
                    button.disabled = true;
                    button.style.opacity = '0.7';
                }
            }, 1000);
        }
    }

    animateCompletionSuccess() {
        // Animar toda la card con efecto de éxito
        if (this.card) {
            this.card.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))';
            this.card.style.borderColor = '#10b981';
            this.card.style.boxShadow = '0 25px 50px rgba(16, 185, 129, 0.3)';
            
            // Efecto de confeti
            this.createConfettiEffect();
        }
    }

    createSuccessParticles(button) {
        const rect = button.getBoundingClientRect();
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 1000;
                animation: particle-burst 1s ease-out forwards;
            `;
            
            // Dirección aleatoria para cada partícula
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 50 + Math.random() * 30;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', `${vx}px`);
            particle.style.setProperty('--vy', `${vy}px`);
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
        
        // Agregar keyframes si no existen
        if (!document.querySelector('#particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particle-burst {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--vx), var(--vy)) scale(0);
                        opacity: 0;
                    }
                }
                @keyframes pulse-animation {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .pulse-animation {
                    animation: pulse-animation 2s infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }

    createConfettiEffect() {
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#a855f7', '#ef4444'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${color};
                left: ${Math.random() * window.innerWidth}px;
                top: -10px;
                pointer-events: none;
                z-index: 1000;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        // Agregar keyframes para confeti
        if (!document.querySelector('#confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confetti-fall {
                    to {
                        transform: translateY(${window.innerHeight + 20}px) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showStepMessage(message) {
        // Crear o actualizar mensaje de paso
        let stepMessage = document.querySelector('.step-message');
        if (!stepMessage) {
            stepMessage = document.createElement('div');
            stepMessage.className = 'step-message';
            stepMessage.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 500;
                box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
                z-index: 1000;
                opacity: 0;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(stepMessage);
        }
        
        stepMessage.textContent = message;
        stepMessage.style.opacity = '1';
        stepMessage.style.transform = 'translateX(-50%) translateY(0)';
        
        // Ocultar después de 4 segundos
        setTimeout(() => {
            stepMessage.style.opacity = '0';
            stepMessage.style.transform = 'translateX(-50%) translateY(-20px)';
        }, 4000);
    }

    onButtonHover(event) {
        const button = event.currentTarget;
        const icon = button.querySelector('.btn-icon');
        
        // Efectos específicos según el tipo de botón
        if (button.classList.contains('btn-primary')) {
            button.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)';
            button.style.transform = 'translateY(-2px) scale(1.02)';
        } else if (button.classList.contains('btn-voice-register')) {
            button.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)';
            button.style.transform = 'translateY(-2px) scale(1.02)';
        } else if (button.classList.contains('btn-ghost')) {
            button.style.boxShadow = '0 15px 40px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2)';
            button.style.transform = 'translateY(-2px)';
        }
        
        // Animar icono si existe
        if (icon) {
            icon.style.transform = 'translateX(5px) scale(1.1)';
        }
    }

    onButtonLeave(event) {
        const button = event.currentTarget;
        const icon = button.querySelector('.btn-icon');
        
        // Restaurar estado original
        button.style.boxShadow = '';
        button.style.transform = '';
        
        // Restaurar icono
        if (icon) {
            icon.style.transform = '';
        }
    }

    onButtonClick(event) {
        const button = event.currentTarget;
        
        // Efecto de click con ondas
        this.createRippleEffect(button, event);
        
        // Animación de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    onInputFocus(event) {
        const input = event.currentTarget;
        const parent = input.parentElement;
        
        // Efecto de glow en el input
        input.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1), 0 0 20px rgba(139, 92, 246, 0.2)';
        input.style.borderColor = 'var(--primary-color)';
        
        // Animar contenedor padre si existe
        if (parent) {
            parent.style.transform = 'translateY(-2px)';
        }
    }

    onInputBlur(event) {
        const input = event.currentTarget;
        const parent = input.parentElement;
        
        // Restaurar estado original
        input.style.boxShadow = '';
        input.style.borderColor = '';
        
        if (parent) {
            parent.style.transform = '';
        }
    }

    onInputChange(event) {
        const input = event.currentTarget;
        
        // Efecto sutil de validación visual
        if (input.value.length > 0) {
            input.style.backgroundColor = 'rgba(139, 92, 246, 0.02)';
        } else {
            input.style.backgroundColor = '';
        }
    }

    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Agregar keyframes para la animación ripple si no existe
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Remover el elemento después de la animación
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    onMouseMove(event) {
        // Efecto parallax sutil para elementos flotantes
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        
        this.floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.02;
            const x = (clientX / innerWidth - 0.5) * 20 * speed;
            const y = (clientY / innerHeight - 0.5) * 20 * speed;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });

        // Efecto sutil en la card principal
        if (this.card) {
            const cardRect = this.card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            const deltaX = (clientX - cardCenterX) / cardRect.width;
            const deltaY = (clientY - cardCenterY) / cardRect.height;
            
            const rotateX = deltaY * 2;
            const rotateY = deltaX * 2;
            
            this.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    }

    onKeyDown(event) {
        // Navegación con teclado
        if (event.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('btn')) {
                event.preventDefault();
                focusedElement.click();
            }
        }
        
        // Atajos de teclado
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    this.registerBtn?.click();
                    break;
                case '2':
                    event.preventDefault();
                    this.voiceRegisterBtn?.click();
                    break;
                case '3':
                    event.preventDefault();
                    document.querySelector('.btn-ghost')?.click();
                    break;
            }
        }
    }

    startBackgroundAnimations() {
        // Animar elementos flotantes de fondo
        this.floatingElements.forEach((element, index) => {
            const duration = 8000 + (index * 2000); // Diferentes duraciones
            const delay = index * 1000; // Delay escalonado
            
            element.style.animationDuration = `${duration}ms`;
            element.style.animationDelay = `${delay}ms`;
        });
    }

    initParallaxEffects() {
        // Efecto parallax en scroll (si hay scroll)
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            this.floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.1;
                element.style.transform = `translateY(${parallax * speed}px)`;
            });
        });
    }

    // Método para mostrar toast (si se necesita)
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.style.display = 'block';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }
}

// Utilidades de animación
class AnimationUtils {
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    static animateValue(start, end, duration, callback) {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = AnimationUtils.easeInOutCubic(progress);
            const currentValue = start + (end - start) * easedProgress;
            
            callback(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.registerManager = new RegisterManager();
});

// Exportar para uso global
window.RegisterManager = RegisterManager;
window.AnimationUtils = AnimationUtils;