/**
 * AriasDigitalSoft - Login JavaScript
 * Maneja las animaciones y efectos visuales de la página de login
 */

class LoginManager {
    constructor() {
        this.container = document.querySelector('.container');
        this.card = document.querySelector('.card');
        this.buttons = document.querySelectorAll('.btn');
        this.inputs = document.querySelectorAll('.input');
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
        
        // Verificar si se debe limpiar el campo de email después del logout
        this.checkAndClearEmailField();
    }

    checkAndClearEmailField() {
        // Verificar si hay un parámetro en la URL que indique que se debe limpiar el campo
        const urlParams = new URLSearchParams(window.location.search);
        const clearEmail = urlParams.get('clear_email');
        
        // También verificar si hay un flag en localStorage
        const shouldClearEmail = localStorage.getItem('clear_email_on_load');
        
        if (clearEmail === 'true' || shouldClearEmail === 'true') {
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.value = '';
                
                // CRÍTICO: También limpiar el sessionStorage que conserva el email
                try {
                    sessionStorage.removeItem('login_email');
                } catch (e) {
                    console.log('No se pudo limpiar sessionStorage:', e);
                }
                
                // Limpiar el flag de localStorage
                localStorage.removeItem('clear_email_on_load');
                
                // Limpiar el parámetro de la URL sin recargar la página
                if (clearEmail === 'true') {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                }
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

    onButtonHover(event) {
        const button = event.currentTarget;
        const icon = button.querySelector('.btn-icon');
        
        // Agregar efecto de brillo según el tipo de botón
        if (button.classList.contains('btn-primary')) {
            button.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)';
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
                    document.querySelector('.btn-primary')?.click();
                    break;
                case '2':
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
    window.loginManager = new LoginManager();
});

// Exportar para uso global
window.LoginManager = LoginManager;
window.AnimationUtils = AnimationUtils;