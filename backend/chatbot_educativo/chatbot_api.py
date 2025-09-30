"""
API Endpoint para el Chatbot Educativo
Conecta el modelo entrenado de scikit-learn con el frontend HTML
"""

import os
import sys
import json
import logging
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

# Agregar el directorio ai_agent al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_agent'))

try:
    from ai_agent.models.sklearn_model import EducationalChatbotModel
except ImportError:
    print("Error: No se pudo importar EducationalChatbotModel")
    sys.exit(1)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__)
CORS(app)  # Permitir CORS para requests desde el frontend

# Inicializar modelo global
chatbot_model = None

def initialize_model():
    """Inicializa el modelo de chatbot"""
    global chatbot_model
    try:
        chatbot_model = EducationalChatbotModel()
        
        # Intentar cargar modelo guardado
        model_path = os.path.join("ai_agent", "models", "saved_models", "sklearn_chatbot_model.pkl")
        
        if os.path.exists(model_path):
            success = chatbot_model.load_model(model_path)
            if success:
                logger.info(f"✅ Modelo cargado exitosamente desde: {model_path}")
                return True
            else:
                logger.warning("⚠️ No se pudo cargar el modelo guardado")
        else:
            logger.warning(f"⚠️ No se encontró modelo en: {model_path}")
        
        # Si no hay modelo guardado, entrenar uno nuevo con datos existentes
        logger.info("🏋️ Entrenando nuevo modelo con datos existentes...")
        
        # Cargar datos de entrenamiento mejorados
        import pandas as pd
        import joblib
        df = None
        
        try:
            # Intentar cargar modelo anti-dashboard mejorado más reciente
            import pickle
            
            # Buscar modelos mejorados primero en la nueva estructura
            enhanced_models_dir = os.path.join('trained_models', 'enhanced_models')
            if os.path.exists(enhanced_models_dir):
                improved_files = [f for f in os.listdir(enhanced_models_dir) if f.startswith('improved_anti_dashboard_model_') and f.endswith('.pkl')]
                # Prioridad 1: Modelos improved_enhanced (más recientes y mejores)
                improved_enhanced_files = [f for f in os.listdir(enhanced_models_dir) if f.startswith('improved_enhanced_model_') and f.endswith('.pkl')]
                # Prioridad 2: Modelos enhanced_70 (anteriores)
                enhanced_70_files = [f for f in os.listdir(enhanced_models_dir) if f.startswith('enhanced_70_model_') and f.endswith('.pkl')]
                # Combinar archivos mejorados con prioridad
                improved_files = improved_enhanced_files + improved_files + enhanced_70_files
            else:
                improved_files = [f for f in os.listdir('.') if f.startswith('improved_anti_dashboard_model_') and f.endswith('.pkl')]
            
            anti_dashboard_files = []
            
            # Priorizar modelos mejorados
            all_model_files = improved_files + anti_dashboard_files
            
            if all_model_files:
                latest_anti_dashboard = max(all_model_files, key=lambda x: x.split('_')[-1])
                vectorizer_file = latest_anti_dashboard.replace('model', 'vectorizer')
                
                # Construir rutas completas
                model_file_path = os.path.join(enhanced_models_dir, latest_anti_dashboard) if os.path.exists(enhanced_models_dir) else latest_anti_dashboard
                vectorizer_file_path = os.path.join(enhanced_models_dir, vectorizer_file) if os.path.exists(enhanced_models_dir) else vectorizer_file
                
                if os.path.exists(vectorizer_file_path):
                    with open(model_file_path, 'rb') as f:
                        model = pickle.load(f)
                    with open(vectorizer_file_path, 'rb') as f:
                        vectorizer = pickle.load(f)
                
                    # Cargar encoder si existe (para modelos enhanced_70 e improved_enhanced)
                    encoder_file = latest_anti_dashboard.replace('model', 'encoder')
                    encoder_file_path = os.path.join(enhanced_models_dir, encoder_file) if os.path.exists(enhanced_models_dir) else encoder_file
                    
                    if os.path.exists(encoder_file_path):
                        with open(encoder_file_path, 'rb') as f:
                            encoder = pickle.load(f)
                        chatbot_model.label_encoder = encoder
                        logger.info(f"✅ Encoder cargado: {encoder_file}")
                
                    chatbot_model.model = model
                    chatbot_model.vectorizer = vectorizer
                    chatbot_model.anti_dashboard_model = model
                    chatbot_model.anti_dashboard_vectorizer = vectorizer
                    chatbot_model.is_trained = True
                    logger.info(f"✅ Modelo mejorado cargado exitosamente: {latest_anti_dashboard}")
                    return True
        except Exception as e:
            logger.warning(f"⚠️ No se pudo cargar modelo anti-dashboard: {e}")
        
        # Intentar cargar modelo ensemble avanzado más reciente
        try:
            # Buscar en models_backup primero
            models_backup_dir = 'models_backup'
            if os.path.exists(models_backup_dir):
                advanced_model_files = [f for f in os.listdir(models_backup_dir) if f.startswith('advanced_ensemble_model_') and f.endswith('.pkl')]
                advanced_vectorizer_files = [f for f in os.listdir(models_backup_dir) if f.startswith('advanced_vectorizer_') and f.endswith('.pkl')]
                
                if advanced_model_files and advanced_vectorizer_files:
                    # Obtener el más reciente
                    latest_model = max(advanced_model_files, key=lambda x: x.split('_')[-1])
                    latest_vectorizer = max(advanced_vectorizer_files, key=lambda x: x.split('_')[-1])
                    
                    model_path = os.path.join(models_backup_dir, latest_model)
                    vectorizer_path = os.path.join(models_backup_dir, latest_vectorizer)
                    
                    model = joblib.load(model_path)
                    vectorizer = joblib.load(vectorizer_path)
                
                # Asignar al modelo del chatbot
                chatbot_model.model = model
                chatbot_model.vectorizer = vectorizer
                chatbot_model.is_trained = True
                
                logger.info(f"✅ Modelo ensemble avanzado cargado exitosamente: {latest_model}")
                return True
        except Exception as e:
            logger.warning(f"⚠️ No se pudo cargar modelo ensemble avanzado: {e}")
        
        # Intentar cargar modelo optimizado más reciente
        try:
            optimized_model_path = os.path.join("models_backup", "optimized_model_20250929_175903.pkl")
            optimized_vectorizer_path = os.path.join("models_backup", "optimized_vectorizer_20250929_175903.pkl")
            
            if os.path.exists(optimized_model_path) and os.path.exists(optimized_vectorizer_path):
                # Cargar modelo y vectorizador optimizados
                model = joblib.load(optimized_model_path)
                vectorizer = joblib.load(optimized_vectorizer_path)
                
                # Asignar al modelo del chatbot
                chatbot_model.model = model
                chatbot_model.vectorizer = vectorizer
                chatbot_model.is_trained = True
                
                logger.info("✅ Modelo optimizado cargado exitosamente (SVM - 32.6% precisión)")
                return True
        except Exception as e:
            logger.warning(f"⚠️ No se pudo cargar modelo optimizado: {e}")
        
        # Fallback: cargar datos y entrenar
        try:
            # Intentar cargar el dataset mejorado más reciente
            df = pd.read_csv('ai_agent/data/csv_storage/training_data_improved.csv')
            logger.info(f"📊 Datos mejorados cargados: {len(df)} registros")
        except FileNotFoundError:
            try:
                # Fallback al dataset integrado
                df = pd.read_csv('ai_agent/data/csv_storage/training_data_integrated.csv')
                logger.info(f"📊 Datos integrados cargados: {len(df)} registros")
            except FileNotFoundError:
                try:
                    # Fallback al dataset convertido fijo
                    df = pd.read_csv('ai_agent/data/csv_storage/training_data_converted_fixed.csv')
                    logger.info(f"📊 Datos convertidos fijos cargados: {len(df)} registros")
                except FileNotFoundError:
                    logger.error("❌ No se encontró ningún archivo de datos de entrenamiento")
                    return False
        
        if df is not None:
            texts = df['input'].tolist()
            labels = df['category'].tolist()
            
            # Entrenar modelo
            chatbot_model.train(texts, labels)
            
            # Guardar modelo entrenado
            chatbot_model.save_model(model_path)
            
            logger.info("✅ Modelo entrenado y guardado exitosamente")
            return True
        else:
            logger.error(f"❌ No se encontraron datos de entrenamiento en: {csv_path}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error inicializando modelo: {e}")
        return False

@app.route('/')
def index():
    """Página principal - sirve el archivo index.html"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Error: index.html no encontrado", 404

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """
    Endpoint principal para el chatbot
    Recibe una pregunta y devuelve la respuesta del modelo entrenado
    """
    try:
        # Obtener datos de la request con manejo de encoding
        try:
            data = request.get_json(force=True)
        except Exception as json_error:
            logger.error(f"Error decodificando JSON: {json_error}")
            return jsonify({
                'error': 'Formato JSON inválido',
                'success': False
            }), 400
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Mensaje requerido',
                'success': False
            }), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({
                'error': 'Mensaje vacío',
                'success': False
            }), 400
        
        # Verificar que el modelo esté inicializado
        if not chatbot_model:
            return jsonify({
                'error': 'Modelo no inicializado',
                'success': False
            }), 500
        
        # Obtener predicción del modelo
        prediction = chatbot_model.predict_category(user_message)
        
        # Generar respuesta contextual basada en la categoría predicha
        response_data = generate_contextual_response(prediction, user_message)
        
        logger.info(f"Pregunta: {user_message}")
        logger.info(f"Categoría predicha: {prediction['category']}")
        logger.info(f"Confianza: {prediction['confidence']:.2f}")
        
        return jsonify({
            'success': True,
            'response': response_data['response'],
            'category': prediction['category'],
            'confidence': prediction['confidence'],
            'redirect_url': response_data.get('redirect_url'),
            'suggestions': response_data.get('suggestions', [])
        })
        
    except Exception as e:
        logger.error(f"Error en chat endpoint: {e}")
        return jsonify({
            'error': 'Error interno del servidor',
            'success': False
        }), 500

def generate_contextual_response(prediction, user_message):
    """
    Genera una respuesta contextual mejorada basada en la predicción del modelo
    """
    category = prediction['category']
    confidence = prediction['confidence']
    
    # Sistema de confianza robusto
    def calculate_robust_confidence(base_confidence, query_length, category_match):
        """Calcular confianza robusta considerando múltiples factores"""
        robust_confidence = base_confidence
        
        # Penalizar consultas muy cortas (menos contexto)
        if len(user_message.split()) < 3:
            robust_confidence *= 0.8
        
        # Bonificar consultas con palabras clave específicas
        specific_keywords = {
            'dashboard': ['panel', 'inicio', 'principal', 'home'],
            'autenticacion': ['login', 'contraseña', 'usuario', 'acceso', 'ingresar'],
            'arithmetic_gestures': ['gesto', 'entrenar', 'reconocer', 'mano'],
            'cursos': ['curso', 'lección', 'aprender', 'estudiar'],
            'saved_models': ['modelo', 'guardar', 'eliminar', 'gestión'],
            'ayuda': ['ayuda', 'help', 'orientación', 'guía']
        }
        
        query_lower = user_message.lower()
        if category in specific_keywords:
            for keyword in specific_keywords[category]:
                if keyword in query_lower:
                    robust_confidence *= 1.2
                    break
        
        # Limitar confianza máxima
        return min(robust_confidence, 0.95)
    
    # Calcular confianza robusta
    robust_confidence = calculate_robust_confidence(confidence, len(user_message), category)
    
    # Mapeo mejorado de categorías con respuestas más específicas y contextuales
    enhanced_category_responses = {
        # Categorías principales de navegación
        'inicio': {
            'response': '¡Hola! Esta es una plataforma educativa innovadora que enseña matemáticas usando gestos de las manos y la cámara de tu dispositivo. Puedes aprender con cursos interactivos, entrenar gestos para números y operaciones, y resolver ejercicios de forma visual y divertida. ¿Te gustaría ver la presentación completa?',
            'redirect_url': '/',
            'suggestions': ['Ver presentación', 'Registrarme', 'Practicar gestos'],
            'confidence_boost': 0.1
        },
        'landing_page': {
            'response': 'Te muestro la página de inicio donde encontrarás una presentación completa de la plataforma, sus beneficios y cómo comenzar. Es perfecta para conocer todas las funcionalidades disponibles.',
            'redirect_url': '/',
            'suggestions': ['Registrarme', 'Ver cursos', 'Practicar ahora'],
            'confidence_boost': 0.1
        },
        'inicio_presentacion': {
            'response': 'En la portada encontrarás toda la información sobre esta plataforma educativa de matemáticas con reconocimiento de gestos. Te explica cómo funciona y qué puedes lograr aquí.',
            'redirect_url': '/',
            'suggestions': ['Empezar ahora', 'Ver demo', 'Registrarme'],
            'confidence_boost': 0.1
        },
        
        # Autenticación mejorada
        'autenticacion': {
            'response': 'Te llevo a la sección de registro donde podrás crear tu cuenta. Tenemos opciones tradicionales y también reconocimiento facial si tu dispositivo lo permite. Una vez registrado, tendrás acceso a tu panel personalizado.',
            'redirect_url': '/auth',
            'suggestions': ['Iniciar sesión', 'Registro con email', 'Reconocimiento facial'],
            'confidence_boost': 0.2
        },
        'authentication': {
            'response': 'Perfecto, te dirijo al área de autenticación. Puedes iniciar sesión con tus datos o usar reconocimiento facial si está habilitado. Desde ahí accederás a tu panel con todas tus actividades.',
            'redirect_url': '/auth',
            'suggestions': ['Login tradicional', 'Reconocimiento facial', 'Crear cuenta nueva'],
            'confidence_boost': 0.2
        },
        
        # Dashboard mejorado
        'dashboard': {
            'response': 'Te dirijo a tu panel principal donde encontrarás tarjetas con tu progreso, accesos rápidos a cursos, actividades recomendadas y métricas de tu aprendizaje. Es tu centro de control personalizado.',
            'redirect_url': '/dashboard',
            'suggestions': ['Ver progreso', 'Cursos recomendados', 'Practicar gestos'],
            'confidence_boost': 0.15
        },
        'panel_dashboard': {
            'response': 'En tu panel podrás ver todas tus estadísticas de aprendizaje, cursos completados, gestos entrenados y actividades pendientes. Te muestro tu dashboard ahora.',
            'redirect_url': '/dashboard',
            'suggestions': ['Estadísticas detalladas', 'Actividades pendientes', 'Nuevos cursos'],
            'confidence_boost': 0.15
        },
        
        # Aritmética y gestos mejorados
        'aritmetica': {
            'response': 'Excelente, te llevo a la sección de Aritmética donde puedes usar la cámara para entrenar y reconocer gestos de números y operaciones. Podrás entrenar nuevos gestos y probar tu precisión resolviendo ejercicios.',
            'redirect_url': '/arithmetic',
            'suggestions': ['Entrenar gestos', 'Resolver ejercicios', 'Calibrar cámara'],
            'confidence_boost': 0.25
        },
        'arithmetic': {
            'response': 'En la sección de práctica con gestos podrás resolver operaciones usando tus manos frente a la cámara. El sistema reconocerá tus gestos en tiempo real. ¡Vamos a probarlo!',
            'redirect_url': '/arithmetic',
            'suggestions': ['Práctica básica', 'Operaciones avanzadas', 'Entrenar números'],
            'confidence_boost': 0.25
        },
        'arithmetic_gestures': {
            'response': 'Te dirijo a la práctica de gestos matemáticos donde podrás entrenar números del 0 al 9 y símbolos de operaciones. La cámara reconocerá tus movimientos y te dará retroalimentación en tiempo real.',
            'redirect_url': '/arithmetic',
            'suggestions': ['Entrenar números', 'Practicar operaciones', 'Ver precisión'],
            'confidence_boost': 0.25
        },
        'aritmetica_gestos': {
            'response': 'Perfecto para practicar matemáticas de forma interactiva. Usa tus manos para mostrar números y operaciones, y el sistema te ayudará a mejorar tu precisión paso a paso.',
            'redirect_url': '/arithmetic',
            'suggestions': ['Tutorial de gestos', 'Práctica libre', 'Ejercicios guiados'],
            'confidence_boost': 0.25
        },
        'gestos': {
            'response': 'El reconocimiento de gestos es una de nuestras características principales. Puedes entrenar gestos para números y operaciones matemáticas usando tu cámara. El sistema aprende tus movimientos únicos.',
            'redirect_url': '/arithmetic',
            'suggestions': ['Entrenar nuevos gestos', 'Practicar reconocimiento', 'Ver gestos guardados'],
            'confidence_boost': 0.25
        },
        
        # Modelos y gestión
        'modelos': {
            'response': 'Te muestro tu colección de gestos y modelos entrenados. Aquí podrás revisar, actualizar o eliminar los gestos que has guardado, y ver qué tan bien está funcionando cada uno.',
            'redirect_url': '/models',
            'suggestions': ['Ver todos los modelos', 'Entrenar nuevo gesto', 'Estadísticas de precisión'],
            'confidence_boost': 0.2
        },
        'saved_models': {
            'response': 'En esta sección puedes gestionar todos tus gestos entrenados. Revisa su precisión, actualiza los que necesiten mejoras, o elimina los que ya no uses.',
            'redirect_url': '/models',
            'suggestions': ['Gestionar modelos', 'Ver estadísticas', 'Exportar datos'],
            'confidence_boost': 0.2
        },
        'modelos_guardados': {
            'response': 'Todos tus gestos entrenados están aquí organizados. Puedes ver el historial de entrenamiento, la precisión de cada gesto y hacer ajustes cuando sea necesario.',
            'redirect_url': '/models',
            'suggestions': ['Historial completo', 'Mejorar precisión', 'Backup de modelos'],
            'confidence_boost': 0.2
        },
        
        # Cursos mejorados
        'cursos': {
            'response': 'Te dirijo a los cursos disponibles donde encontrarás contenido estructurado de matemáticas. Cada curso incluye lecciones teóricas y práctica con gestos para reforzar el aprendizaje.',
            'redirect_url': '/courses',
            'suggestions': ['Cursos básicos', 'Cursos avanzados', 'Mi progreso'],
            'confidence_boost': 0.2
        },
        'courses': {
            'response': 'Los cursos están diseñados para complementar la práctica con gestos. Encontrarás desde aritmética básica hasta temas más avanzados, todos con ejercicios interactivos.',
            'redirect_url': '/courses',
            'suggestions': ['Aritmética básica', 'Fracciones', 'Álgebra'],
            'confidence_boost': 0.2
        },
        
        # Ayuda y navegación
        'ayuda': {
            'response': 'Te ayudo a orientarte. Puedes ir a tu panel para ver actividades recomendadas, practicar gestos con la cámara, o explorar cursos. ¿Qué te interesa más: aprender algo nuevo, practicar con gestos, o ver tu progreso?',
            'redirect_url': '/dashboard',
            'suggestions': ['Ver mi panel', 'Practicar gestos', 'Explorar cursos'],
            'confidence_boost': 0.15
        },
        'navigation': {
            'response': 'Te sugiero algunas opciones: puedes empezar practicando gestos básicos con la cámara, explorar un curso de aritmética, o revisar tu panel para ver actividades recomendadas.',
            'redirect_url': '/dashboard',
            'suggestions': ['Práctica de gestos', 'Cursos recomendados', 'Mi progreso'],
            'confidence_boost': 0.1
        },
        'navegacion_ayuda': {
            'response': 'No te preocupes, te oriento. Las secciones principales son: tu panel personal, práctica de gestos con cámara, cursos educativos y gestión de modelos. ¿Por dónde quieres empezar?',
            'redirect_url': '/dashboard',
            'suggestions': ['Tour guiado', 'Empezar práctica', 'Ver cursos'],
            'confidence_boost': 0.15
        },
        'problemas_tecnicos': {
            'response': 'Si tienes problemas técnicos, verifica tu conexión a internet y permisos de cámara. También puedes consultar nuestra sección de ayuda o contactar soporte técnico.',
            'redirect_url': '/help',
            'suggestions': ['Verificar cámara', 'Problemas comunes', 'Contactar soporte'],
            'confidence_boost': 0.1
        },
        
        # Saludos mejorados
        'greeting': {
            'response': '¡Hola! Bienvenido a la plataforma educativa de matemáticas con gestos. Aquí puedes aprender de forma interactiva usando tu cámara para reconocer movimientos de manos. ¿Te gustaría comenzar con un tutorial?',
            'redirect_url': '/',
            'suggestions': ['Tutorial básico', 'Ir al panel', 'Practicar ahora'],
            'confidence_boost': 0.1
        }
    }
    
    # Aplicar boost de confianza si la categoría está en respuestas mejoradas
    if category.lower() in enhanced_category_responses:
        category_info = enhanced_category_responses[category.lower()]
        robust_confidence += category_info.get('confidence_boost', 0)
        robust_confidence = min(robust_confidence, 0.95)  # Limitar máximo
        
        return {
            'response': category_info['response'],
            'redirect_url': category_info['redirect_url'],
            'suggestions': category_info['suggestions'],
            'confidence': robust_confidence,
            'category': category
        }
    
    # Obtener respuesta por defecto si la categoría no está mapeada
    default_response = {
        'response': f"Entiendo tu consulta sobre '{user_message}'. Te dirijo a la sección más relevante donde puedes encontrar lo que buscas.",
        'redirect_url': '/dashboard',
        'suggestions': ['Explorar opciones', 'Ver mi panel', 'Buscar ayuda']
    }
    
    # Seleccionar respuesta basada en la categoría
    response_data = default_response
    
    # Ajustar confianza basada en la calidad de la respuesta
    adjusted_confidence = robust_confidence * 0.8
    
    # Respuesta por defecto con confianza ajustada
    if adjusted_confidence < 0.3:  # Umbral más estricto
        return {
            'response': f"No estoy completamente seguro de tu consulta '{user_message}', pero te sugiero explorar el panel principal donde encontrarás todas las opciones disponibles.",
            'redirect_url': '/dashboard',
            'suggestions': ['Panel principal', 'Buscar ayuda', 'Explorar cursos'],
            'confidence': adjusted_confidence,
            'category': 'dashboard'  # Categoría por defecto más útil
        }
    
    # Respuesta genérica con confianza media
    return {
        'response': f"Basándome en tu consulta '{user_message}', creo que te interesa la sección de {category}. Te dirijo allí para que puedas encontrar lo que buscas.",
        'redirect_url': f'/{category}',
        'suggestions': ['Explorar sección', 'Volver al inicio', 'Buscar ayuda'],
        'confidence': adjusted_confidence,
        'category': category
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar el estado del API"""
    from datetime import datetime
    return jsonify({
        'status': 'healthy',
        'model_loaded': chatbot_model is not None,
        'timestamp': str(datetime.now())
    })

if __name__ == '__main__':
    # Inicializar modelo al arrancar
    print("🚀 Iniciando API del Chatbot Educativo...")
    
    if initialize_model():
        print("✅ Modelo inicializado correctamente")
        print("🌐 Iniciando servidor Flask...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("❌ Error inicializando modelo. No se puede iniciar el servidor.")
        sys.exit(1)