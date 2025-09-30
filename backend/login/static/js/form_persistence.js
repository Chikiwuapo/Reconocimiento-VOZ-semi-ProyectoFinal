/**
 * Sistema de Persistencia de Formulario
 * Guarda automáticamente los datos del formulario en localStorage
 * y los recupera cuando se recarga la página
 */

class FormPersistence {
    constructor(formSelector = '#registerForm', storageKey = 'registerFormData') {
        this.form = document.querySelector(formSelector);
        this.storageKey = storageKey;
        this.fields = ['nombres', 'apellidos', 'email', 'dni'];
        this.saveTimeout = null;
        this.saveDelay = 500; // Guardar después de 500ms de inactividad
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        // Cargar datos guardados al inicializar
        this.loadSavedData();
        
        // Configurar eventos para guardar automáticamente
        this.setupAutoSave();
        
        // Limpiar datos cuando se envía el formulario exitosamente
        this.setupFormSubmission();
        
        console.log('✅ Sistema de persistencia de formulario inicializado');
    }

    /**
     * Carga los datos guardados en localStorage
     */
    loadSavedData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Restaurar cada campo
                this.fields.forEach(fieldName => {
                    const field = this.form.querySelector(`[name="${fieldName}"]`);
                    if (field && data[fieldName]) {
                        field.value = data[fieldName];
                        
                        // Disparar evento de cambio para que otros sistemas lo detecten
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
                
                console.log('📥 Datos del formulario restaurados desde localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Error al cargar datos guardados:', error);
            // Si hay error, limpiar localStorage corrupto
            localStorage.removeItem(this.storageKey);
        }
    }

    /**
     * Guarda los datos actuales del formulario
     */
    saveFormData() {
        try {
            const formData = {};
            let hasData = false;
            
            // Recopilar datos de todos los campos
            this.fields.forEach(fieldName => {
                const field = this.form.querySelector(`[name="${fieldName}"]`);
                if (field && field.value.trim()) {
                    formData[fieldName] = field.value.trim();
                    hasData = true;
                }
            });
            
            // Solo guardar si hay datos
            if (hasData) {
                // Agregar timestamp para control
                formData._timestamp = Date.now();
                formData._url = window.location.pathname;
                
                localStorage.setItem(this.storageKey, JSON.stringify(formData));
                console.log('💾 Datos del formulario guardados automáticamente');
            } else {
                // Si no hay datos, limpiar localStorage
                localStorage.removeItem(this.storageKey);
            }
        } catch (error) {
            console.warn('⚠️ Error al guardar datos del formulario:', error);
        }
    }

    /**
     * Configura el guardado automático con debounce
     */
    setupAutoSave() {
        this.fields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                // Eventos para guardar automáticamente
                ['input', 'change', 'blur'].forEach(eventType => {
                    field.addEventListener(eventType, () => {
                        this.debouncedSave();
                    });
                });
            }
        });
    }

    /**
     * Guarda con debounce para evitar guardados excesivos
     */
    debouncedSave() {
        // Cancelar guardado anterior si existe
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Programar nuevo guardado
        this.saveTimeout = setTimeout(() => {
            this.saveFormData();
        }, this.saveDelay);
    }

    /**
     * Configura la limpieza de datos cuando se envía el formulario
     */
    setupFormSubmission() {
        this.form.addEventListener('submit', (event) => {
            // Limpiar datos guardados cuando se envía el formulario
            setTimeout(() => {
                this.clearSavedData();
            }, 100); // Pequeño delay para asegurar que el envío se procese
        });
    }

    /**
     * Limpia los datos guardados
     */
    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('🗑️ Datos del formulario limpiados de localStorage');
        } catch (error) {
            console.warn('⚠️ Error al limpiar datos guardados:', error);
        }
    }

    /**
     * Limpia datos manualmente (para uso externo)
     */
    clear() {
        this.clearSavedData();
        
        // También limpiar los campos del formulario
        this.fields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.value = '';
            }
        });
    }

    /**
     * Obtiene los datos actuales del formulario
     */
    getCurrentData() {
        const data = {};
        this.fields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                data[fieldName] = field.value.trim();
            }
        });
        return data;
    }

    /**
     * Verifica si hay datos guardados
     */
    hasSavedData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData !== null;
        } catch (error) {
            return false;
        }
    }
}

// Inicializar automáticamente cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar en la página de registro
    if (document.querySelector('#registerForm')) {
        window.formPersistence = new FormPersistence();
    }
});

// Exportar para uso global
window.FormPersistence = FormPersistence;