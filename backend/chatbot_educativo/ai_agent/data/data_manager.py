"""
Data Manager for AI Agent
Gestor de datos para migrar información esencial del sistema anterior
"""

import sqlite3
import json
import pandas as pd
from datetime import datetime
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataManager:
    """
    Gestor de datos para migrar información esencial del chatbot anterior
    """
    
    def __init__(self, old_db_path="chatbot_plataforma.db", new_data_path="ai_agent/data/"):
        self.old_db_path = old_db_path
        self.new_data_path = new_data_path
        self.essential_data = {}
        
        # Crear directorio si no existe
        os.makedirs(new_data_path, exist_ok=True)
        
    def extract_essential_data(self):
        """
        Extrae datos esenciales de la base de datos anterior
        """
        logger.info("Extrayendo datos esenciales de la BD anterior...")
        
        try:
            conn = sqlite3.connect(self.old_db_path)
            
            # Extraer datos de entrenamiento
            self.essential_data['training_data'] = self._extract_training_data(conn)
            
            # Extraer FAQs
            self.essential_data['faqs'] = self._extract_faqs(conn)
            
            # Extraer patrones de aprendizaje
            self.essential_data['learning_patterns'] = self._extract_learning_patterns(conn)
            
            # Extraer información de cursos
            self.essential_data['courses'] = self._extract_courses(conn)
            
            # Extraer interacciones exitosas
            self.essential_data['successful_interactions'] = self._extract_interactions(conn)
            
            conn.close()
            logger.info("Extracción de datos completada")
            
        except Exception as e:
            logger.error(f"Error extrayendo datos: {e}")
            
        return self.essential_data
    
    def _extract_training_data(self, conn):
        """Extrae datos de entrenamiento activos"""
        query = """
        SELECT input_text, output_text, category, confidence, source, usage_count
        FROM training_data 
        WHERE is_active = 1
        ORDER BY usage_count DESC, confidence DESC
        """
        
        df = pd.read_sql_query(query, conn)
        return df.to_dict('records')
    
    def _extract_faqs(self, conn):
        """Extrae preguntas frecuentes activas"""
        query = """
        SELECT pregunta, respuesta, categoria, palabras_clave, veces_consultada
        FROM faq 
        WHERE activa = 1
        ORDER BY veces_consultada DESC
        """
        
        df = pd.read_sql_query(query, conn)
        return df.to_dict('records')
    
    def _extract_learning_patterns(self, conn):
        """Extrae patrones de aprendizaje procesados"""
        query = """
        SELECT pattern_type, content, context, frequency, confidence
        FROM learning_patterns 
        WHERE is_processed = 1 AND frequency > 1
        ORDER BY frequency DESC, confidence DESC
        """
        
        try:
            df = pd.read_sql_query(query, conn)
            return df.to_dict('records')
        except:
            logger.warning("Tabla learning_patterns no encontrada")
            return []
    
    def _extract_courses(self, conn):
        """Extrae información de cursos activos"""
        query = """
        SELECT nombre, descripcion, tipo, nivel, contenido, duracion_estimada
        FROM curso 
        WHERE activo = 1
        ORDER BY orden, nombre
        """
        
        df = pd.read_sql_query(query, conn)
        return df.to_dict('records')
    
    def _extract_interactions(self, conn):
        """Extrae interacciones exitosas (con alta satisfacción)"""
        query = """
        SELECT pregunta, respuesta, satisfaccion
        FROM interaccion 
        WHERE satisfaccion >= 4
        ORDER BY satisfaccion DESC, fecha DESC
        LIMIT 1000
        """
        
        try:
            df = pd.read_sql_query(query, conn)
            return df.to_dict('records')
        except:
            logger.warning("Tabla interaccion no encontrada o vacía")
            return []
    
    def save_essential_data(self):
        """
        Guarda los datos esenciales en formato JSON
        """
        if not self.essential_data:
            logger.warning("No hay datos para guardar")
            return
        
        # Guardar datos completos
        full_data_file = os.path.join(self.new_data_path, "essential_data.json")
        with open(full_data_file, 'w', encoding='utf-8') as f:
            json.dump(self.essential_data, f, indent=2, ensure_ascii=False, default=str)
        
        # Guardar datos de entrenamiento por separado
        training_file = os.path.join(self.new_data_path, "training_dataset.json")
        with open(training_file, 'w', encoding='utf-8') as f:
            json.dump(self.essential_data.get('training_data', []), f, indent=2, ensure_ascii=False)
        
        # Guardar FAQs por separado
        faqs_file = os.path.join(self.new_data_path, "faqs_dataset.json")
        with open(faqs_file, 'w', encoding='utf-8') as f:
            json.dump(self.essential_data.get('faqs', []), f, indent=2, ensure_ascii=False)
        
        logger.info(f"Datos guardados en {self.new_data_path}")
    
    def extract_training_data(self, db_path):
        """
        Extrae datos de entrenamiento de la base de datos SQLite
        """
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Intentar extraer de la tabla TrainingData
            cursor.execute("""
                SELECT input_text, output_text, category, confidence 
                FROM chat_trainingdata 
                WHERE is_active = 1
            """)
            
            training_data = []
            for row in cursor.fetchall():
                training_data.append({
                    "input_text": row[0],
                    "output_text": row[1],
                    "category": row[2],
                    "confidence": row[3] if row[3] else 0.8
                })
            
            conn.close()
            logger.info(f"Extraídos {len(training_data)} datos de entrenamiento")
            return training_data
            
        except Exception as e:
            logger.warning(f"Error extrayendo training data: {e}")
            return []
    
    def extract_faqs(self, db_path):
        """
        Extrae FAQs de la base de datos
        """
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT question, answer, category 
                FROM chat_faq 
                WHERE is_active = 1
            """)
            
            faqs = []
            for row in cursor.fetchall():
                faqs.append({
                    "question": row[0],
                    "answer": row[1],
                    "category": row[2] if row[2] else "general"
                })
            
            conn.close()
            logger.info(f"Extraídos {len(faqs)} FAQs")
            return faqs
            
        except Exception as e:
            logger.warning(f"Error extrayendo FAQs: {e}")
            return []
    
    def extract_learning_patterns(self, db_path):
        """
        Extrae patrones de aprendizaje de la base de datos
        """
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT pattern_type, content, context, frequency, confidence 
                FROM chat_learningpattern
            """)
            
            patterns = []
            for row in cursor.fetchall():
                patterns.append({
                    "pattern_type": row[0],
                    "content": row[1],
                    "context": row[2],
                    "frequency": row[3] if row[3] else 1,
                    "confidence": row[4] if row[4] else 0.7
                })
            
            conn.close()
            logger.info(f"Extraídos {len(patterns)} patrones de aprendizaje")
            return patterns
            
        except Exception as e:
            logger.warning(f"Error extrayendo patrones: {e}")
            return []
    
    def extract_course_info(self, db_path):
        """
        Extrae información de cursos de la base de datos
        """
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT titulo, descripcion, categoria, nivel 
                FROM chat_curso 
                WHERE activo = 1
            """)
            
            courses = []
            for row in cursor.fetchall():
                courses.append({
                    "title": row[0],
                    "description": row[1],
                    "category": row[2] if row[2] else "general",
                    "level": row[3] if row[3] else "beginner"
                })
            
            conn.close()
            logger.info(f"Extraídos {len(courses)} cursos")
            return courses
            
        except Exception as e:
            logger.warning(f"Error extrayendo cursos: {e}")
            return []

    def create_tensorflow_dataset(self, data_dir="ai_agent/data/migrated"):
        """
        Crea dataset optimizado para TensorFlow
        """
        try:
            # Cargar datos migrados
            migrated_file = os.path.join(data_dir, "migrated_data.json")
            if not os.path.exists(migrated_file):
                logger.warning("No se encontraron datos migrados")
                return None
            
            with open(migrated_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Combinar todos los datos de texto
            texts = []
            labels = []
            
            # Datos de entrenamiento
            for item in data.get("training_data", []):
                texts.append(item.get("input_text", ""))
                labels.append(item.get("category", "general"))
            
            # FAQs
            for item in data.get("faqs", []):
                texts.append(item.get("question", ""))
                labels.append(item.get("category", "general"))
            
            # Crear dataset de TensorFlow
            dataset = tf.data.Dataset.from_tensor_slices((texts, labels))
            dataset = dataset.batch(32).prefetch(tf.data.AUTOTUNE)
            
            logger.info(f"Dataset creado con {len(texts)} ejemplos")
            return dataset
            
        except Exception as e:
            logger.error(f"Error creando dataset TensorFlow: {e}")
            return None
    
    def get_statistics(self):
        """
        Obtiene estadísticas de los datos migrados
        """
        if not self.essential_data:
            return {}
        
        stats = {
            'total_training_examples': len(self.essential_data.get('training_data', [])),
            'total_faqs': len(self.essential_data.get('faqs', [])),
            'total_learning_patterns': len(self.essential_data.get('learning_patterns', [])),
            'total_courses': len(self.essential_data.get('courses', [])),
            'total_successful_interactions': len(self.essential_data.get('successful_interactions', [])),
            'extraction_date': datetime.now().isoformat()
        }
        
        # Estadísticas por categoría
        categories = {}
        for item in self.essential_data.get('training_data', []):
            cat = item.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1
        
        stats['categories_distribution'] = categories
        
        return stats
    
    def load_hardcoded_responses(self):
        """
        Carga las respuestas hardcodeadas del sistema anterior
        """
        hardcoded_responses = {
            'greeting_responses': [
                "¡Hola! Soy tu asistente educativo especializado en matemáticas con gestos.",
                "¡Bienvenido! ¿Te gustaría aprender aritmética de forma interactiva?",
                "¡Saludos! Puedo ayudarte con matemáticas, cursos y navegación en la plataforma."
            ],
            'addition_responses': [
                "¡Excelente! Para sumar con gestos, muestra el primer número con una mano y el segundo con la otra.",
                "La suma es fácil con gestos. Por ejemplo: 2 + 3. Muestra 2 dedos con la izquierda y 3 con la derecha.",
                "¡Perfecto! Las sumas con gestos son muy visuales e intuitivas."
            ],
            'subtraction_responses': [
                "¡Genial! Para restar con gestos, muestra el número mayor y luego baja la cantidad que quieres quitar.",
                "La resta con gestos es como contar hacia atrás. Muy fácil de entender.",
                "¡Excelente! La resta enseña el concepto de diferencia de forma visual."
            ],
            'platform_responses': [
                "Esta plataforma usa tu cámara para reconocer gestos de manos y aprender matemáticas.",
                "Es una plataforma educativa que combina IA con aprendizaje interactivo.",
                "Aquí puedes entrenar gestos, hacer ejercicios y seguir cursos estructurados."
            ],
            'course_responses': [
                "Tenemos cursos de aritmética básica, gestos matemáticos y práctica avanzada.",
                "Los cursos incluyen: Matemáticas Básicas, Reconocimiento de Gestos y Panel de Progreso.",
                "Puedes acceder a todos los cursos desde tu panel principal."
            ],
            'fallback_response': "Esa información no la tengo, pero puedo ayudarte con matemáticas o guiarte en la plataforma. ¿Quieres que practiquemos gestos o revisemos cursos?"
        }
        
        # Guardar respuestas hardcodeadas
        responses_file = os.path.join(self.new_data_path, "hardcoded_responses.json")
        with open(responses_file, 'w', encoding='utf-8') as f:
            json.dump(hardcoded_responses, f, indent=2, ensure_ascii=False)
        
        return hardcoded_responses