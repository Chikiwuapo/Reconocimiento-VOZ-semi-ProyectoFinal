/**
 * AriasDigitalSoft - Mantenimiento JavaScript
 * Maneja las animaciones y efectos visuales de la página de mantenimiento
 */

class MaintenanceManager {
    constructor() {
        this.container = document.querySelector('.container');
        this.logoContainer = document.querySelector('.logo-container');
        this.userWelcome = document.querySelector('.user-welcome');
        this.userInfo = document.querySelector('.user-info');
        this.maintenanceCard = document.querySelector('.maintenance-card');
        this.logoutBtn = document.querySelector('.logout-btn');
        this.floatingElements = document.querySelectorAll('.floating-element');
        
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
        
        // Iniciar animaciones específicas de mantenimiento
        this.startMaintenanceAnimations();
    }

    animatePageLoad() {
        // Animar elementos con delay escalonado
        const elements = [
            { selector: '.logo-container', delay: 200 },
            { selector: '.user-welcome', delay: 400 },
            { selector: '.user-info', delay: 600 },
            { selector: '.maintenance-card', delay: 800 }
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
        // Efectos hover para el botón de logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('mouseenter', this.onLogoutHover.bind(this));
            this.logoutBtn.addEventListener('mouseleave', this.onLogoutLeave.bind(this));
            this.logoutBtn.addEventListener('click', this.onLogoutClick.bind(this));
        }

        // Efectos de teclado
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // Efectos de mouse para parallax
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Efectos hover para las tarjetas de información
        if (this.userInfo) {
            this.userInfo.addEventListener('mouseenter', this.onCardHover.bind(this));
            this.userInfo.addEventListener('mouseleave', this.onCardLeave.bind(this));
        }

        if (this.maintenanceCard) {
            this.maintenanceCard.addEventListener('mouseenter', this.onMaintenanceCardHover.bind(this));
            this.maintenanceCard.addEventListener('mouseleave', this.onMaintenanceCardLeave.bind(this));
        }
    }

    startMaintenanceAnimations() {
        // Animación pulsante para el icono de mantenimiento
        const maintenanceIcon = document.querySelector('.maintenance-icon');
        if (maintenanceIcon) {
            maintenanceIcon.style.animation = 'maintenance-pulse 2s infinite';
        }

        // Animación del logo de herramientas
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.animation = 'tool-rotate 4s infinite linear';
        }

        // Agregar keyframes si no existen
        if (!document.querySelector('#maintenance-styles')) {
            const style = document.createElement('style');
            style.id = 'maintenance-styles';
            style.textContent = `
                @keyframes maintenance-pulse {
                    0%, 100% { 
                        transform: scale(1);
                        filter: hue-rotate(0deg);
                    }
                    50% { 
                        transform: scale(1.1);
                        filter: hue-rotate(20deg);
                    }
                }
                
                @keyframes tool-rotate {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                    100% { transform: rotate(0deg); }
                }
                
                @keyframes info-glow {
                    0%, 100% { box-shadow: 0 10px 30px rgba(139, 92, 246, 0.1); }
                    50% { box-shadow: 0 15px 40px rgba(139, 92, 246, 0.2); }
                }
                
                @keyframes maintenance-glow {
                    0%, 100% { box-shadow: 0 10px 30px rgba(245, 158, 11, 0.1); }
                    50% { box-shadow: 0 15px 40px rgba(245, 158, 11, 0.2); }
                }
            `;
            document.head.appendChild(style);
        }

        // Aplicar animaciones de glow a las tarjetas
        if (this.userInfo) {
            this.userInfo.style.animation = 'info-glow 3s infinite';
        }

        if (this.maintenanceCard) {
            this.maintenanceCard.style.animation = 'maintenance-glow 4s infinite';
        }
    }

    onLogoutHover(event) {
        const button = event.currentTarget;
        
        // Efecto de hover específico para logout
        button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        button.style.boxShadow = '0 15px 40px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)';
        button.style.transform = 'translateY(-3px) scale(1.05)';
        
        // Efecto de partículas de advertencia
        this.createWarningParticles(button);
    }

    onLogoutLeave(event) {
        const button = event.currentTarget;
        
        // Restaurar estado original
        button.style.background = '';
        button.style.boxShadow = '';
        button.style.transform = '';
    }

    onLogoutClick(event) {
        const button = event.currentTarget;
        
        // Efecto de click con ondas
        this.createRippleEffect(button, event);
        
        // Animación de despedida
        this.animateLogoutSequence();
        
        // Pequeña pausa antes de la navegación
        setTimeout(() => {
            // La navegación se maneja por el href del enlace
        }, 1000);
    }

    animateLogoutSequence() {
        // Crear mensaje de despedida
        const farewell = document.createElement('div');
        farewell.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: 600;
            box-shadow: 0 25px 50px rgba(139, 92, 246, 0.3);
            z-index: 1000;
            opacity: 0;
            animation: farewell-appear 0.5s ease-out forwards;
        `;
        farewell.textContent = '¡Hasta pronto! 👋';
        
        // Agregar keyframes para despedida
        if (!document.querySelector('#farewell-styles')) {
            const style = document.createElement('style');
            style.id = 'farewell-styles';
            style.textContent = `
                @keyframes farewell-appear {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(farewell);
        
        // Remover después de la animación
        setTimeout(() => {
            farewell.remove();
        }, 1000);
    }

    createWarningParticles(button) {
        const rect = button.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #fbbf24;
                border-radius: 50%;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 1000;
                animation: warning-particle 1s ease-out forwards;
            `;
            
            // Dirección aleatoria para cada partícula
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 30 + Math.random() * 20;
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
        if (!document.querySelector('#warning-particle-styles')) {
            const style = document.createElement('style');
            style.id = 'warning-particle-styles';
            style.textContent = `
                @keyframes warning-particle {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--vx), var(--vy)) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    onCardHover(event) {
        const card = event.currentTarget;
        
        // Efecto de elevación y glow
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)';
    }

    onCardLeave(event) {
        const card = event.currentTarget;
        
        // Restaurar estado original
        card.style.transform = '';
        card.style.boxShadow = '';
    }

    onMaintenanceCardHover(event) {
        const card = event.currentTarget;
        
        // Efecto específico para la tarjeta de mantenimiento
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.3)';
        
        // Hacer que el icono gire más rápido
        const icon = card.querySelector('.maintenance-icon');
        if (icon) {
            icon.style.animation = 'maintenance-pulse 0.5s infinite';
        }
    }

    onMaintenanceCardLeave(event) {
        const card = event.currentTarget;
        
        // Restaurar estado original
        card.style.transform = '';
        card.style.boxShadow = '';
        
        // Restaurar velocidad normal del icono
        const icon = card.querySelector('.maintenance-icon');
        if (icon) {
            icon.style.animation = 'maintenance-pulse 2s infinite';
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

        // Efecto sutil en las tarjetas principales
        const cards = [this.userWelcome, this.userInfo, this.maintenanceCard];
        cards.forEach((card, index) => {
            if (card) {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                
                const deltaX = (clientX - cardCenterX) / cardRect.width;
                const deltaY = (clientY - cardCenterY) / cardRect.height;
                
                const rotateX = deltaY * 1;
                const rotateY = deltaX * 1;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
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
                case 'q':
                    event.preventDefault();
                    this.logoutBtn?.click();
                    break;
            }
        }
        
        // Easter egg: Konami code para efectos especiales
        this.handleKonamiCode(event);
    }

    handleKonamiCode(event) {
        if (!this.konamiSequence) {
            this.konamiSequence = [];
        }
        
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        
        this.konamiSequence.push(event.code);
        
        if (this.konamiSequence.length > konamiCode.length) {
            this.konamiSequence.shift();
        }
        
        if (this.konamiSequence.length === konamiCode.length && 
            this.konamiSequence.every((key, index) => key === konamiCode[index])) {
            this.activateEasterEgg();
            this.konamiSequence = [];
        }
    }

    activateEasterEgg() {
        // Efecto especial cuando se activa el código Konami
        const specialMessage = document.createElement('div');
        specialMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd);
            background-size: 400% 400%;
            animation: rainbow-bg 2s ease infinite;
            color: white;
            padding: 30px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        specialMessage.innerHTML = '🎉 ¡Código secreto activado! 🎉<br>¡Eres un verdadero hacker!';
        
        // Agregar animación rainbow
        if (!document.querySelector('#rainbow-styles')) {
            const style = document.createElement('style');
            style.id = 'rainbow-styles';
            style.textContent = `
                @keyframes rainbow-bg {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(specialMessage);
        
        // Crear efecto de fuegos artificiales
        this.createFireworks();
        
        // Remover después de 5 segundos
        setTimeout(() => {
            specialMessage.remove();
        }, 5000);
    }

    createFireworks() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                firework.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: ${color};
                    border-radius: 50%;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight}px;
                    pointer-events: none;
                    z-index: 999;
                    animation: firework-explode 2s ease-out forwards;
                `;
                
                document.body.appendChild(firework);
                
                setTimeout(() => {
                    firework.remove();
                }, 2000);
            }, i * 100);
        }
        
        // Agregar keyframes para fuegos artificiales
        if (!document.querySelector('#firework-styles')) {
            const style = document.createElement('style');
            style.id = 'firework-styles';
            style.textContent = `
                @keyframes firework-explode {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(3);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(6);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
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
    window.maintenanceManager = new MaintenanceManager();
});

// Exportar para uso global
window.MaintenanceManager = MaintenanceManager;
window.AnimationUtils = AnimationUtils;