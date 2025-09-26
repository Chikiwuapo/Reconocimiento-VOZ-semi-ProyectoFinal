/**
 * AriasDigitalSoft - Bienvenido JavaScript
 * Maneja las transiciones entre splash screen y pantalla de bienvenida
 */

class WelcomeManager {
    constructor() {
        this.splashScreen = document.getElementById('splash-screen');
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.splashDuration = 3000; // 3 segundos
        this.transitionDuration = 800; // 0.8 segundos
        
        this.init();
    }

    init() {
        // Asegurar que la pantalla de bienvenida esté oculta inicialmente
        this.welcomeScreen.classList.add('hidden');
        
        // Iniciar la secuencia después de que la página cargue
        window.addEventListener('load', () => {
            this.startWelcomeSequence();
        });

        // Agregar listeners para efectos adicionales
        this.addInteractionListeners();
        
        // Precargar recursos si es necesario
        this.preloadResources();
    }

    startWelcomeSequence() {
        // Mostrar splash screen por el tiempo definido
        setTimeout(() => {
            this.transitionToWelcome();
        }, this.splashDuration);
    }

    transitionToWelcome() {
        // Agregar clase de fade-out al splash screen
        this.splashScreen.classList.add('fade-out');
        
        // Después de la transición, ocultar splash y mostrar welcome
        setTimeout(() => {
            this.splashScreen.style.display = 'none';
            this.welcomeScreen.classList.remove('hidden');
            this.welcomeScreen.classList.add('fade-in');
            
            // Habilitar scroll en el body
            document.body.style.overflow = 'auto';
            
            // Iniciar animaciones de la pantalla de bienvenida
            this.animateWelcomeElements();
            
        }, this.transitionDuration);
    }

    animateWelcomeElements() {
        // Animar elementos de la pantalla de bienvenida con delay escalonado
        const elements = [
            { selector: '.main-logo-container', delay: 200 },
            { selector: '.welcome-title', delay: 400 },
            { selector: '.welcome-subtitle', delay: 600 },
            { selector: '.action-buttons', delay: 800 },
            { selector: '.footer-info', delay: 1000 }
        ];

        elements.forEach(({ selector, delay }) => {
            setTimeout(() => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                    
                    // Aplicar la animación
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 50);
                }
            }, delay);
        });
    }

    addInteractionListeners() {
        // Efectos hover mejorados para botones
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', this.onButtonHover.bind(this));
            button.addEventListener('mouseleave', this.onButtonLeave.bind(this));
            button.addEventListener('click', this.onButtonClick.bind(this));
        });

        // Efecto parallax sutil para elementos flotantes
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Efectos de teclado para accesibilidad
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onButtonHover(event) {
        const button = event.currentTarget;
        const icon = button.querySelector('.btn-icon');
        
        // Agregar efecto de brillo
        button.style.boxShadow = button.classList.contains('btn-primary') 
            ? '0 15px 40px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
            : '0 15px 40px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2)';
        
        // Animar icono
        if (icon) {
            icon.style.transform = 'translateX(5px) scale(1.1)';
        }
    }

    onButtonLeave(event) {
        const button = event.currentTarget;
        const icon = button.querySelector('.btn-icon');
        
        // Restaurar sombra original
        button.style.boxShadow = '';
        
        // Restaurar icono
        if (icon) {
            icon.style.transform = 'translateX(0) scale(1)';
        }
    }

    onButtonClick(event) {
        const button = event.currentTarget;
        
        // Efecto de click con ondas
        this.createRippleEffect(button, event);
        
        // Pequeña pausa antes de la navegación para mostrar el efecto
        setTimeout(() => {
            // La navegación se maneja por los enlaces href
        }, 150);
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
        const floatingElements = document.querySelectorAll('.floating-element');
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.02;
            const x = (clientX / innerWidth - 0.5) * 20 * speed;
            const y = (clientY / innerHeight - 0.5) * 20 * speed;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    onKeyDown(event) {
        // Navegación con teclado
        if (event.key === 'Enter' || event.key === ' ') {
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
                    document.querySelector('.btn-primary')?.click();
                    break;
                case '2':
                    event.preventDefault();
                    document.querySelector('.btn-secondary')?.click();
                    break;
            }
        }
    }

    preloadResources() {
        // Precargar imágenes y recursos críticos
        const imagesToPreload = [
            '/static/login/images/network-logo.svg'
        ];
        
        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Método público para forzar la transición (útil para testing)
    forceTransition() {
        this.transitionToWelcome();
    }

    // Método para reiniciar la secuencia
    restart() {
        this.splashScreen.style.display = 'flex';
        this.splashScreen.classList.remove('fade-out');
        this.welcomeScreen.classList.add('hidden');
        this.welcomeScreen.classList.remove('fade-in');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            this.startWelcomeSequence();
        }, 100);
    }
}

// Utilidades adicionales
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
    window.welcomeManager = new WelcomeManager();
});

// Exportar para uso global si es necesario
window.WelcomeManager = WelcomeManager;
window.AnimationUtils = AnimationUtils;