"""
Servicio del Chatbot Educativo para Django
Adaptado del API Flask original para integración con Django
"""

import os
import sys
import json
import logging
import pickle
import pandas as pd
from django.conf import settings

# Agregar el directorio ai_agent al path
chatbot_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(os.path.join(chatbot_root, 'ai_agent'))

try:
    from ..ai_agent.models.sklearn_model import EducationalChatbotModel
except ImportError as e:
    print(f"Error: No se pudo importar EducationalChatbotModel: {e}")
    EducationalChatbotModel = None

# Configurar logging
logger = logging.getLogger(__name__)

class ChatbotService:
    """Servicio principal del chatbot educativo"""
    
    def __init__(self):
        self.chatbot_model = None
        self.initialize_model()
    
    def initialize_model(self):
        """Inicializa el modelo de chatbot"""
        try:
            if EducationalChatbotModel is None:
                print("❌ Error inicializando modelo: EducationalChatbotModel no está disponible")
                return False
                
            self.chatbot_model = EducationalChatbotModel()
            
            # Intentar cargar modelo guardado
            model_path = os.path.join(chatbot_root, "ai_agent", "models", "saved_models", "sklearn_chatbot_model.pkl")
            
            if os.path.exists(model_path):
                success = self.chatbot_model.load_model(model_path)
                if success:
                    logger.info(f"✅ Modelo cargado exitosamente desde: {model_path}")
                    return True
                else:
                    logger.warning("⚠️ No se pudo cargar el modelo guardado")
            else:
                logger.warning(f"⚠️ No se encontró modelo en: {model_path}")
            
            # Si no hay modelo guardado, cargar modelo mejorado
            logger.info("🏋️ Cargando modelo mejorado...")
            
            # Buscar modelos mejorados
            enhanced_models_dir = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'enhanced_models')
            if os.path.exists(enhanced_models_dir):
                improved_enhanced_files = [f for f in os.listdir(enhanced_models_dir) 
                                         if f.startswith('improved_enhanced_model_') and f.endswith('.pkl')]
                improved_files = [f for f in os.listdir(enhanced_models_dir) 
                                if f.startswith('improved_anti_dashboard_model_') and f.endswith('.pkl')]
                enhanced_70_files = [f for f in os.listdir(enhanced_models_dir) 
                                   if f.startswith('enhanced_70_model_') and f.endswith('.pkl')]
                
                all_model_files = improved_enhanced_files + improved_files + enhanced_70_files
            else:
                all_model_files = []
            
            if all_model_files:
                latest_model = max(all_model_files, key=lambda x: x.split('_')[-1])
                vectorizer_file = latest_model.replace('model', 'vectorizer')
                encoder_file = latest_model.replace('model', 'encoder')
                
                model_file_path = os.path.join(enhanced_models_dir, latest_model)
                vectorizer_file_path = os.path.join(enhanced_models_dir, vectorizer_file)
                encoder_file_path = os.path.join(enhanced_models_dir, encoder_file)
                
                if os.path.exists(vectorizer_file_path):
                    try:
                        with open(model_file_path, 'rb') as f:
                            model = pickle.load(f)
                        with open(vectorizer_file_path, 'rb') as f:
                            vectorizer = pickle.load(f)
                        
                        encoder = None
                        if os.path.exists(encoder_file_path):
                            with open(encoder_file_path, 'rb') as f:
                                encoder = pickle.load(f)
                            logger.info(f"✅ Encoder cargado desde: {encoder_file_path}")
                        
                        # Crear pipeline con el modelo y vectorizer cargados
                        from sklearn.pipeline import Pipeline
                        
                        # El vectorizer es un diccionario con múltiples vectorizers
                        if isinstance(vectorizer, dict) and 'tfidf_word' in vectorizer:
                            # Usar el vectorizer principal (tfidf_word)
                            main_vectorizer = vectorizer['tfidf_word']
                            self.chatbot_model.pipeline = Pipeline([
                                ('vectorizer', main_vectorizer),
                                ('classifier', model)
                            ])
                            self.chatbot_model.vectorizer = vectorizer  # Guardar el dict completo
                        else:
                            # Vectorizer simple
                            self.chatbot_model.pipeline = Pipeline([
                                ('vectorizer', vectorizer),
                                ('classifier', model)
                            ])
                            self.chatbot_model.vectorizer = vectorizer
                        
                        self.chatbot_model.model = model
                        if encoder:
                            self.chatbot_model.encoder = encoder
                        
                        logger.info(f"✅ Modelo mejorado cargado exitosamente: {latest_model}")
                        
                        # Probar el modelo con un mensaje de prueba
                        test_prediction = self.chatbot_model.predict("¿Qué cursos tienen?")
                        logger.info(f"🧪 Prueba del modelo - Categoría: {test_prediction.get('category')}, Confianza: {test_prediction.get('confidence')}")
                        
                        return True
                        
                    except Exception as e:
                        logger.error(f"❌ Error cargando archivos del modelo: {e}")
                        return False
            
            logger.error("❌ No se pudo cargar ningún modelo")
            return False
            
        except Exception as e:
            logger.error(f"❌ Error inicializando modelo: {str(e)}")
            return False
    
    def process_message(self, user_message, session_id=None):
        """Procesa un mensaje del usuario y devuelve la respuesta del chatbot"""
        try:
            if not self.chatbot_model:
                return {
                    'response': 'Lo siento, el chatbot no está disponible en este momento.',
                    'confidence': 0.0,
                    'category': 'Error',
                    'redirect': None
                }
            
            # Obtener predicción del modelo
            prediction = self.chatbot_model.predict(user_message)
            
            # Generar respuesta contextual
            response_data = self.generate_contextual_response(prediction, user_message)
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error procesando mensaje: {str(e)}")
            return {
                'response': 'Lo siento, ocurrió un error procesando tu mensaje.',
                'confidence': 0.0,
                'category': 'Error',
                'redirect': None
            }
    
    def generate_contextual_response(self, prediction, user_message):
        """Genera respuesta contextual basada en la predicción"""
        
        # Mapeo de categorías a respuestas y redirecciones (usando nombres exactos del modelo)
        response_mapping = {
            "greeting": {
                "responses": [
                    "¡Hola! Bienvenido a la plataforma educativa de matemáticas con reconocimiento de gestos. Te llevo al inicio donde puedes explorar todas nuestras funciones.",
                    "¡Hola! Esta es una plataforma innovadora para aprender matemáticas con gestos. Te dirijo al landing principal para que conozcas todo lo que ofrecemos.",
                    "¡Perfecto! Estás en la plataforma de matemáticas con IA. Te llevo al inicio donde puedes comenzar tu experiencia de aprendizaje."
                ],
                "redirect": "http://localhost:5173/"
            },
            "authentication": {
                "responses": [
                    "Te llevo a la sección de registro donde podrás crear tu cuenta. Tenemos opciones tradicionales y también reconocimiento facial si tu dispositivo lo permite.",
                    "Para acceder a todas las funciones, necesitas registrarte o iniciar sesión. Te redirijo a la página de autenticación.",
                    "El sistema de autenticación te permite guardar tu progreso y acceder a cursos personalizados. Vamos a la página de login."
                ],
                "redirect": "http://localhost:5173/auth"
            },
            "autenticacion": {
                "responses": [
                    "Te dirijo al área de autenticación. Puedes iniciar sesión con tus datos o usar reconocimiento facial si está habilitado. Desde ahí accederás a tu panel con todas tus actividades y progreso.",
                    "Para acceder a todas las funciones, necesitas registrarte o iniciar sesión. Te redirijo a la página de autenticación.",
                    "El sistema de autenticación te permite guardar tu progreso y acceder a cursos personalizados. Vamos a la página de login."
                ],
                "redirect": "http://localhost:5173/auth"
            },
            "dashboard": {
                "responses": [
                    "Te dirijo a tu panel principal donde encontrarás tarjetas con tu progreso, accesos rápidos a cursos, actividades recomendadas y métricas de tu aprendizaje.",
                    "El panel principal es tu centro de control donde puedes acceder a cursos, entrenar gestos y ver tu progreso. Te llevo allí.",
                    "Desde el dashboard puedes navegar a todas las secciones: cursos, entrenamiento de gestos y configuraciones. Vamos al panel."
                ],
                "redirect": "http://localhost:5173/blackboard"
            },
            "arithmetic": {
                "responses": [
                    "Te llevo a la sección de modelos donde puedes gestionar tus entrenamientos de gestos, revisar su precisión y configurar nuevos modelos personalizados.",
                    "¡Excelente! En la sección de modelos puedes ver todos tus gestos entrenados y su rendimiento. Te llevo allí.",
                    "Los modelos te permiten gestionar y mejorar tus entrenamientos de gestos. Vamos a la sección de modelos."
                ],
                "redirect": "http://localhost:5173/models"
            },
            "arithmetic_gestures": {
                "responses": [
                    "Te dirijo al blackboard donde podrás practicar gestos matemáticos y entrenar números del 0 al 9 con símbolos de operaciones. La cámara reconocerá tus movimientos en tiempo real.",
                    "¡Excelente! El blackboard te permite entrenar gestos matemáticos usando tu cámara. Te llevo a la pizarra interactiva.",
                    "Los gestos con cámara hacen el aprendizaje más interactivo. Vamos al blackboard donde puedes entrenar y practicar."
                ],
                "redirect": "http://localhost:5173/blackboard"
            },
            "aritmetica": {
                "responses": [
                    "Te dirijo a la sección de modelos donde puedes gestionar tus entrenamientos de aritmética y gestos, revisar su precisión y configurar nuevos modelos.",
                    "La aritmética con gestos se gestiona desde los modelos. Te llevo a la sección donde puedes entrenar y configurar tus gestos matemáticos.",
                    "¡Perfecto! En la sección de modelos puedes gestionar todos tus entrenamientos de aritmética con gestos. Te dirijo allí."
                ],
                "redirect": "http://localhost:5173/models"
            },
            "aritmetica_gestos": {
                "responses": [
                    "Te llevo al blackboard donde puedes practicar aritmética con gestos. La cámara reconoce tus movimientos de manos para resolver operaciones matemáticas de forma interactiva.",
                    "La aritmética con gestos se practica en el blackboard. Te dirijo a la pizarra donde puedes entrenar y practicar con tu cámara.",
                    "¡Excelente elección! Los gestos aritméticos se entrenan en el blackboard. Vamos a la pizarra interactiva."
                ],
                "redirect": "http://localhost:5173/blackboard"
            },
            "gestures": {
                "responses": [
                    "Te dirijo al blackboard donde puedes entrenar el reconocimiento de números y símbolos matemáticos usando tu cámara. Es la funcionalidad principal de nuestra plataforma.",
                    "Los gestos son el corazón de nuestra plataforma. Te llevo al blackboard donde puedes entrenar y practicar reconocimiento de números con las manos.",
                    "¡Perfecto! En el blackboard puedes entrenar la cámara para reconocer tus movimientos de manos. Te dirijo a la pizarra."
                ],
                "redirect": "http://localhost:5173/blackboard"
            },
            "courses": {
                "responses": [
                    "Te dirijo a los cursos disponibles donde encontrarás contenido estructurado de matemáticas. Cada curso incluye lecciones teóricas y práctica con gestos para reforzar el aprendizaje.",
                    "Tenemos cursos estructurados de matemáticas que se adaptan a tu nivel. Te redirijo a la sección de cursos.",
                    "Los cursos incluyen teoría y práctica con reconocimiento de gestos. Vamos a explorar los cursos disponibles."
                ],
                "redirect": "http://localhost:5173/courses"
            },
            "saved_models": {
                "responses": [
                    "En esta sección puedes gestionar todos tus gestos entrenados. Revisa su precisión, actualiza los que necesiten mejoras, o elimina los que ya no uses.",
                    "Los modelos guardados contienen tus configuraciones y entrenamientos personalizados. Te dirijo a esa sección.",
                    "Puedes acceder a tus gestos entrenados y configuraciones guardadas en la sección de modelos. Vamos allí."
                ],
                "redirect": "http://localhost:5173/models"
            },
            "modelos": {
                "responses": [
                    "Te dirijo a la sección de modelos donde puedes gestionar tus entrenamientos de gestos guardados, revisar su precisión y configurar nuevos modelos personalizados.",
                    "En la sección de modelos puedes ver todos tus gestos entrenados, su rendimiento y configuraciones. Te llevo allí.",
                    "Los modelos guardados te permiten continuar tu entrenamiento donde lo dejaste. Te dirijo a esa sección."
                ],
                "redirect": "http://localhost:5173/models"
            },
            "modelos_guardados": {
                "responses": [
                    "Te llevo a tus modelos guardados donde puedes revisar todos los gestos que has entrenado, su precisión y configuraciones personalizadas.",
                    "En modelos guardados tienes acceso a todos tus entrenamientos previos de gestos. Te dirijo a esa sección para que los revises.",
                    "Los modelos guardados contienen tu progreso de entrenamiento. Te llevo allí para que gestiones tus configuraciones."
                ],
                "redirect": "http://localhost:5173/models"
            },
            "navigation": {
                "responses": [
                    "Te ayudo a orientarte. Puedes ir a tu panel para ver actividades recomendadas, practicar gestos con la cámara, o explorar cursos. ¿Qué te interesa más?",
                    "Te sugiero algunas opciones: puedes empezar practicando gestos básicos con la cámara, explorar un curso de aritmética, o revisar tu panel para ver actividades recomendadas.",
                    "Para navegar mejor, te recomiendo: Panel Principal (blackboard), Cursos, Práctica de Gestos (blackboard), o Modelos Guardados."
                ],
                "redirect": "http://localhost:5173/blackboard"
            },
            "landing_page": {
                "responses": [
                    "Te dirijo a la página de inicio donde encontrarás la presentación completa de la plataforma, sus beneficios, testimonios de usuarios y cómo empezar tu experiencia de aprendizaje interactivo.",
                    "La página principal te muestra todo lo que puedes hacer: entrenar gestos, tomar cursos, ver progreso y más. Es tu punto de partida perfecto.",
                    "Te llevo a la página de inicio donde tienes la bienvenida completa con una presentación visual de cómo funciona la plataforma y sus beneficios únicos."
                ],
                "redirect": "http://localhost:5173/"
            },
            "platform_info": {
                "responses": [
                    "Esta plataforma entrena gestos por lenguaje de señas y reconocimiento de voz. Puedes practicar vocales, abecedario, números, operaciones básicas y palabras. ¿Qué aspecto específico te interesa?",
                    "La plataforma te permite entrenar gestos usando lenguaje de señas y reconocimiento de voz. Puedes practicar vocales, abecedario, números del 0 al 9, operaciones matemáticas básicas y palabras completas.",
                    "Es una plataforma de entrenamiento de gestos que combina lenguaje de señas con reconocimiento de voz. Entrenas vocales, letras del abecedario, números, operaciones básicas (+, -, ×, ÷) y palabras usando tu cámara y micrófono."
                ],
                "redirect": "http://localhost:5173/"
            },
            "specific_intents": {
                "responses": [
                    "Esta plataforma entrena gestos por lenguaje de señas y reconocimiento de voz. Puedes practicar vocales, abecedario, números, operaciones básicas y palabras. ¿Qué aspecto específico te interesa?",
                    "Te ayudo con información específica. La plataforma combina lenguaje de señas con reconocimiento de voz para entrenar gestos de vocales, abecedario, números y operaciones. ¿Qué quieres saber?",
                    "Estoy aquí para responder sobre esta plataforma de entrenamiento de gestos que incluye vocales, abecedario, números, operaciones básicas y palabras usando cámara y micrófono. ¿En qué puedo ayudarte?"
                ],
                "redirect": None
            },
            "technical_support": {
                "responses": [
                    "Para soporte técnico, puedo ayudarte con problemas de cámara, configuración de gestos, errores de la plataforma o dudas sobre funcionalidades. ¿Cuál es tu problema específico?",
                    "Te ayudo con soporte técnico. Los problemas más comunes son: permisos de cámara, calibración de gestos, problemas de conexión o configuración del navegador. ¿Qué necesitas?",
                    "Estoy aquí para resolver tus problemas técnicos. Puedo ayudarte con la cámara, gestos, navegación, cuentas o cualquier error que encuentres en la plataforma."
                ],
                "redirect": None
            },
            "faq_database": {
                "responses": [
                    "Te dirijo a la base de datos de preguntas frecuentes donde encontrarás respuestas a las dudas más comunes sobre la plataforma, gestos, cursos y funcionalidades.",
                    "En la sección de FAQ tienes respuestas detalladas sobre cómo usar la plataforma, resolver problemas comunes y aprovechar al máximo todas las funcionalidades.",
                    "La base de datos de preguntas frecuentes contiene guías paso a paso, soluciones a problemas comunes y consejos para mejorar tu experiencia de aprendizaje."
                ],
                "redirect": "http://localhost:5173/faq"
            },
            "out_of_context": {
                "responses": [
                    "Me especializo en ayudarte con la plataforma educativa de matemáticas. ¿Puedo ayudarte con cursos, gestos, navegación o autenticación?",
                    "Soy tu asistente para temas relacionados con matemáticas, reconocimiento de gestos y navegación en la plataforma. ¿En qué puedo ayudarte?",
                    "Mi función es asistirte con la plataforma educativa. Puedo ayudarte con cursos, entrenamiento de gestos, registro o navegación."
                ],
                "redirect": None
            }
        }
        
        # Obtener categoría y confianza de la predicción
        category = prediction.get('category', 'Casos ambiguos')
        confidence = prediction.get('confidence', 0.5)
        
        # Buscar respuesta apropiada
        if category in response_mapping:
            category_data = response_mapping[category]
            import random
            response = random.choice(category_data['responses'])
            redirect = category_data['redirect']
        else:
            # Respuesta por defecto para casos ambiguos
            response = "Entiendo que necesitas ayuda. ¿Podrías ser más específico sobre qué aspecto de la plataforma te interesa? Puedo ayudarte con cursos, gestos, navegación o registro."
            redirect = None
        
        return {
            'response': response,
            'confidence': confidence,
            'category': category,
            'redirect': redirect
        }
    
    def health_check(self):
        """Verifica el estado del servicio"""
        try:
            if self.chatbot_model:
                return {
                    'status': 'healthy',
                    'model_loaded': True,
                    'message': 'Chatbot service is running properly'
                }
            else:
                return {
                    'status': 'unhealthy',
                    'model_loaded': False,
                    'message': 'Chatbot model not loaded'
                }
        except Exception as e:
            return {
                'status': 'error',
                'model_loaded': False,
                'message': f'Error checking health: {str(e)}'
            }

# Instancia global del servicio
chatbot_service = ChatbotService()