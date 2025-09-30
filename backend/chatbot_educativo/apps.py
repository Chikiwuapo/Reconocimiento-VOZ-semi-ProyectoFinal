from django.apps import AppConfig
import logging

class ChatbotEducativoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chatbot_educativo'
    verbose_name = 'Chatbot Educativo'
    
    def ready(self):
        """
        Configuración que se ejecuta cuando la aplicación está lista.
        Aquí se pueden inicializar componentes del chatbot.
        """
        try:
            # Importar señales si las hay
            # import chatbot_educativo.signals
            
            # Configurar logging específico para el chatbot
            logger = logging.getLogger('chatbot_educativo')
            logger.info('Aplicación Chatbot Educativo inicializada correctamente')
            
            # Verificar que los modelos de IA estén disponibles
            self._check_ai_models()
            
        except Exception as e:
            logger = logging.getLogger('chatbot_educativo')
            logger.error(f'Error al inicializar Chatbot Educativo: {e}')
    
    def _check_ai_models(self):
        """
        Verifica que los modelos de IA necesarios estén disponibles.
        """
        import os
        from django.conf import settings
        
        logger = logging.getLogger('chatbot_educativo')
        
        # Verificar que existan las carpetas de modelos
        base_dir = getattr(settings, 'BASE_DIR', os.getcwd())
        models_dir = os.path.join(base_dir, 'chatbot_educativo', 'trained_models')
        
        if os.path.exists(models_dir):
            logger.info(f'Directorio de modelos encontrado: {models_dir}')
            
            # Verificar archivos específicos de modelos
            required_files = [
                'intent_classifier.pkl',
                'vectorizer.pkl',
                'label_encoder.pkl'
            ]
            
            missing_files = []
            for file_name in required_files:
                file_path = os.path.join(models_dir, file_name)
                if not os.path.exists(file_path):
                    missing_files.append(file_name)
            
            if missing_files:
                logger.warning(f'Archivos de modelo faltantes: {missing_files}')
            else:
                logger.info('Todos los archivos de modelo están disponibles')
        else:
            logger.warning(f'Directorio de modelos no encontrado: {models_dir}')
        
        # Verificar carpeta de funciones de IA
        functions_dir = os.path.join(base_dir, 'chatbot_educativo', 'FUNCTIONS')
        if os.path.exists(functions_dir):
            logger.info(f'Directorio de funciones encontrado: {functions_dir}')
        else:
            logger.warning(f'Directorio de funciones no encontrado: {functions_dir}')
        
        # Verificar carpeta del agente de IA
        ai_agent_dir = os.path.join(base_dir, 'chatbot_educativo', 'ai_agent')
        if os.path.exists(ai_agent_dir):
            logger.info(f'Directorio del agente IA encontrado: {ai_agent_dir}')
        else:
            logger.warning(f'Directorio del agente IA no encontrado: {ai_agent_dir}')