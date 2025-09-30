#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para expandir el conjunto de datos de entrenamiento del chatbot educativo
con más preguntas variadas, respuestas contextuales y manejo de preguntas fuera de contexto.
"""

import json
import os
from datetime import datetime
import random

class TrainingDataExpander:
    def __init__(self, project_root):
        self.project_root = project_root
        self.data_dir = os.path.join(project_root, "ai_agent", "data")
        
        # Cargar datos existentes
        self.existing_data = self.load_existing_data()
        
        # Nuevas categorías expandidas
        self.expanded_categories = {
            "Inicio": {
                "keywords": ["inicio", "principal", "plataforma", "bienvenida", "presentación", "qué es", "función", "propósito"],
                "variations": [
                    "¿Cuál es el objetivo principal de esta plataforma?",
                    "¿Qué tipo de educación ofrece este sitio?",
                    "Explícame brevemente de qué trata esta página",
                    "¿Cómo funciona esta plataforma educativa?",
                    "¿Qué beneficios ofrece para aprender matemáticas?",
                    "¿Es esta una plataforma gratuita?",
                    "¿Quién puede usar esta plataforma?",
                    "¿Qué edad recomiendan para usar el sistema?",
                    "¿Necesito conocimientos previos de matemáticas?",
                    "¿Cómo empiezo a usar la plataforma?",
                    "¿Qué hace diferente a esta plataforma de otras?",
                    "¿Puedo usar esta plataforma en mi teléfono?",
                    "¿Está disponible en otros idiomas?",
                    "¿Cómo se financia esta plataforma?",
                    "¿Hay algún costo por usar los servicios?"
                ],
                "response": "Esta es una plataforma educativa revolucionaria que enseña matemáticas usando reconocimiento de gestos y tecnología avanzada. Está diseñada para hacer el aprendizaje matemático más interactivo, visual y accesible para estudiantes de todas las edades."
            },
            "Autenticación": {
                "keywords": ["login", "registro", "contraseña", "cuenta", "usuario", "acceso", "iniciar sesión"],
                "variations": [
                    "¿Cómo me registro en la plataforma?",
                    "¿Qué datos necesito para crear una cuenta?",
                    "¿Puedo usar mi cuenta de Google para registrarme?",
                    "¿Cómo recupero mi contraseña olvidada?",
                    "¿Es seguro registrarse en esta plataforma?",
                    "¿Puedo cambiar mi contraseña después?",
                    "¿Qué hago si no puedo iniciar sesión?",
                    "¿Necesito verificar mi email después del registro?",
                    "¿Puedo usar la misma cuenta en varios dispositivos?",
                    "¿Cómo cierro mi sesión de forma segura?",
                    "¿Qué información personal necesitan?",
                    "¿Puedo eliminar mi cuenta si ya no la quiero?",
                    "¿Hay límite de intentos para iniciar sesión?",
                    "¿Qué pasa si olvido mi nombre de usuario?",
                    "¿Puedo cambiar mi email asociado a la cuenta?"
                ],
                "response": "Para acceder a la plataforma, necesitas crear una cuenta con tu email y una contraseña segura. El proceso de registro es simple y seguro. Una vez registrado, podrás iniciar sesión y acceder a todas las funcionalidades de aprendizaje matemático con gestos."
            },
            "Panel principal": {
                "keywords": ["panel", "dashboard", "menú", "navegación", "opciones", "funciones"],
                "variations": [
                    "¿Qué opciones tengo en el panel principal?",
                    "¿Cómo navego por las diferentes secciones?",
                    "¿Dónde veo mi progreso de aprendizaje?",
                    "¿Cómo accedo a los ejercicios de matemáticas?",
                    "¿Puedo personalizar mi panel de control?",
                    "¿Dónde están mis estadísticas de rendimiento?",
                    "¿Cómo cambio la configuración de mi cuenta?",
                    "¿Puedo ver mi historial de actividades?",
                    "¿Dónde encuentro los tutoriales?",
                    "¿Cómo accedo a los cursos disponibles?",
                    "¿Puedo cambiar el idioma de la interfaz?",
                    "¿Dónde veo mis logros y certificados?",
                    "¿Cómo contacto al soporte técnico?",
                    "¿Puedo exportar mis datos de progreso?",
                    "¿Hay un modo oscuro disponible?"
                ],
                "response": "El panel principal te da acceso a todas las funcionalidades: ejercicios de matemáticas con gestos, seguimiento de progreso, cursos estructurados, configuración de cuenta y herramientas de aprendizaje personalizado. Todo está organizado de forma intuitiva para facilitar tu experiencia educativa."
            },
            "Aritmética y gestos": {
                "keywords": ["gestos", "matemáticas", "aritmética", "reconocimiento", "cámara", "ejercicios"],
                "variations": [
                    "¿Cómo funciona el reconocimiento de gestos?",
                    "¿Qué tipo de ejercicios matemáticos puedo hacer?",
                    "¿Necesito una cámara especial para los gestos?",
                    "¿Puedo hacer operaciones complejas con gestos?",
                    "¿Qué tan preciso es el reconocimiento?",
                    "¿Funciona con diferentes tipos de iluminación?",
                    "¿Puedo usar ambas manos para los gestos?",
                    "¿Hay ejercicios para diferentes niveles?",
                    "¿Cómo calibro el sistema de reconocimiento?",
                    "¿Qué hago si no reconoce mis gestos?",
                    "¿Puedo practicar sin la cámara activada?",
                    "¿Hay tutoriales para aprender los gestos?",
                    "¿Funciona el reconocimiento en tiempo real?",
                    "¿Puedo crear mis propios ejercicios?",
                    "¿Qué operaciones matemáticas están disponibles?"
                ],
                "response": "Nuestro sistema de reconocimiento de gestos te permite resolver problemas matemáticos usando movimientos de manos naturales. Funciona con cualquier cámara web estándar y reconoce operaciones aritméticas básicas y avanzadas en tiempo real, adaptándose a tu nivel de aprendizaje."
            },
            "Modelos guardados": {
                "keywords": ["modelos", "guardados", "progreso", "historial", "ejercicios", "resultados"],
                "variations": [
                    "¿Dónde veo mis ejercicios guardados?",
                    "¿Cómo accedo a mi historial de progreso?",
                    "¿Puedo revisar ejercicios anteriores?",
                    "¿Se guardan automáticamente mis resultados?",
                    "¿Puedo exportar mis modelos guardados?",
                    "¿Cómo organizo mis ejercicios por tema?",
                    "¿Puedo compartir mis resultados con profesores?",
                    "¿Hay límite de almacenamiento para mis datos?",
                    "¿Puedo eliminar ejercicios que ya no necesito?",
                    "¿Cómo busco un ejercicio específico guardado?",
                    "¿Se sincronizan mis datos entre dispositivos?",
                    "¿Puedo hacer copias de seguridad de mi progreso?",
                    "¿Cómo veo estadísticas detalladas de rendimiento?",
                    "¿Puedo comparar mi progreso actual con el anterior?",
                    "¿Los modelos guardados tienen fecha de caducidad?"
                ],
                "response": "Todos tus ejercicios, progreso y resultados se guardan automáticamente en tu perfil. Puedes acceder a tu historial completo, revisar ejercicios anteriores, ver estadísticas de rendimiento y exportar tus datos cuando lo necesites."
            },
            "Cursos": {
                "keywords": ["cursos", "lecciones", "aprendizaje", "niveles", "matemáticas", "programa"],
                "variations": [
                    "¿Qué cursos de matemáticas están disponibles?",
                    "¿Cómo me inscribo en un curso específico?",
                    "¿Los cursos tienen un orden específico?",
                    "¿Puedo tomar varios cursos al mismo tiempo?",
                    "¿Hay cursos para principiantes?",
                    "¿Cuánto tiempo dura cada curso?",
                    "¿Recibo certificados al completar cursos?",
                    "¿Puedo repetir lecciones si no entiendo?",
                    "¿Hay cursos avanzados de cálculo?",
                    "¿Los cursos incluyen ejercicios prácticos?",
                    "¿Puedo pausar un curso y retomarlo después?",
                    "¿Hay fechas límite para completar cursos?",
                    "¿Puedo ver una vista previa antes de inscribirme?",
                    "¿Los cursos están adaptados por edades?",
                    "¿Hay cursos especializados en geometría?"
                ],
                "response": "Ofrecemos cursos estructurados de matemáticas desde nivel básico hasta avanzado, todos integrados con reconocimiento de gestos. Puedes inscribirte en múltiples cursos, avanzar a tu ritmo y obtener certificados de finalización."
            },
            "Casos ambiguos": {
                "keywords": ["ayuda", "problema", "error", "no funciona", "soporte"],
                "variations": [
                    "¿Qué hago si tengo problemas técnicos?",
                    "¿Cómo contacto al soporte técnico?",
                    "¿Hay un manual de usuario disponible?",
                    "¿Dónde encuentro preguntas frecuentes?",
                    "¿Qué hago si la plataforma va lenta?",
                    "¿Cómo reporto un error o bug?",
                    "¿Hay tutoriales en video disponibles?",
                    "¿Puedo sugerir nuevas funcionalidades?",
                    "¿Qué navegadores son compatibles?",
                    "¿Funciona en dispositivos móviles?",
                    "¿Qué hago si no carga correctamente?",
                    "¿Hay una comunidad de usuarios?",
                    "¿Puedo obtener ayuda de otros estudiantes?",
                    "¿Cómo actualizo mi navegador para mejor rendimiento?",
                    "¿Qué requisitos técnicos necesito?"
                ],
                "response": "Si tienes algún problema o duda, puedes contactar nuestro soporte técnico, consultar las preguntas frecuentes o acceder a nuestros tutoriales. Estamos aquí para ayudarte a tener la mejor experiencia de aprendizaje matemático."
            },
            "Fuera de contexto": {
                "keywords": ["clima", "noticias", "deportes", "cocina", "música", "política", "entretenimiento"],
                "variations": [
                    "¿Qué tiempo hace hoy?",
                    "¿Cuáles son las últimas noticias?",
                    "¿Quién ganó el partido de fútbol?",
                    "¿Cómo cocino pasta?",
                    "¿Qué música me recomiendas?",
                    "¿Qué opinas de la política actual?",
                    "¿Qué películas están en cartelera?",
                    "¿Cómo está la bolsa de valores?",
                    "¿Qué restaurante me recomiendas?",
                    "¿Cómo llego al aeropuerto?",
                    "¿Qué significa esta palabra en inglés?",
                    "¿Cuál es la capital de Francia?",
                    "¿Cómo funciona un motor de coche?",
                    "¿Qué vitaminas necesito tomar?",
                    "¿Cómo cuido mis plantas?"
                ],
                "response": "Lo siento, soy un asistente especializado en esta plataforma educativa de matemáticas con reconocimiento de gestos. Solo puedo ayudarte con preguntas relacionadas con el uso de la plataforma, cursos de matemáticas, ejercicios con gestos y funcionalidades del sistema. ¿Te gustaría saber algo específico sobre nuestros cursos de matemáticas?"
            }
        }
    
    def load_existing_data(self):
        """Cargar datos de entrenamiento existentes"""
        try:
            improved_data_path = os.path.join(self.data_dir, "improved_training_data.json")
            if os.path.exists(improved_data_path):
                with open(improved_data_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"Error cargando datos existentes: {e}")
            return []
    
    def generate_expanded_dataset(self):
        """Generar conjunto expandido de datos de entrenamiento"""
        expanded_data = []
        
        # Mantener datos existentes
        expanded_data.extend(self.existing_data)
        
        # Generar nuevos datos para cada categoría
        for category, info in self.expanded_categories.items():
            for question in info["variations"]:
                # Crear múltiples variaciones de respuesta para diversidad
                responses = self.generate_response_variations(info["response"], category)
                
                for response in responses:
                    expanded_data.append({
                        "input_text": question,
                        "expected_category": category,
                        "response": response,
                        "keywords": info["keywords"],
                        "confidence": 0.95 if category != "Fuera de contexto" else 0.99,
                        "source": "expanded_training_2024"
                    })
        
        return expanded_data
    
    def generate_response_variations(self, base_response, category):
        """Generar variaciones de respuesta para mayor diversidad"""
        if category == "Fuera de contexto":
            return [
                "Lo siento, soy un asistente especializado en esta plataforma educativa de matemáticas con reconocimiento de gestos. Solo puedo ayudarte con preguntas relacionadas con el uso de la plataforma, cursos de matemáticas, ejercicios con gestos y funcionalidades del sistema. ¿Te gustaría saber algo específico sobre nuestros cursos de matemáticas?",
                "Mi especialidad es ayudarte con esta plataforma educativa de matemáticas. No puedo responder preguntas sobre otros temas. ¿Hay algo sobre los cursos de matemáticas o el reconocimiento de gestos que te gustaría saber?",
                "Estoy diseñado para asistirte únicamente con temas relacionados a esta plataforma de aprendizaje matemático. ¿Te puedo ayudar con alguna pregunta sobre los ejercicios con gestos o los cursos disponibles?"
            ]
        
        # Para otras categorías, generar variaciones sutiles
        variations = [base_response]
        
        # Agregar variaciones con diferentes enfoques
        if category == "Inicio":
            variations.extend([
                f"{base_response} Puedes comenzar registrándote y explorando nuestros cursos interactivos.",
                f"¡Bienvenido! {base_response} Todo está diseñado para hacer las matemáticas más divertidas y comprensibles."
            ])
        elif category == "Autenticación":
            variations.extend([
                f"{base_response} El proceso es rápido y tus datos están completamente protegidos.",
                f"Es muy fácil empezar. {base_response} Una vez dentro, tendrás acceso completo a todas las herramientas."
            ])
        
        return variations[:2]  # Limitar a 2 variaciones por pregunta
    
    def add_contextual_examples(self, data):
        """Agregar ejemplos contextuales específicos"""
        contextual_examples = [
            # Ejemplos de preguntas mal formuladas que deben redirigirse
            {
                "input_text": "¿Puedes ayudarme con mi tarea de historia?",
                "expected_category": "Fuera de contexto",
                "response": "Lo siento, solo puedo ayudarte con temas relacionados a esta plataforma de matemáticas con reconocimiento de gestos. ¿Te gustaría explorar nuestros cursos de matemáticas?",
                "keywords": ["historia", "tarea"],
                "confidence": 0.99,
                "source": "contextual_filtering"
            },
            {
                "input_text": "¿Qué hora es?",
                "expected_category": "Fuera de contexto", 
                "response": "Mi función es asistirte con esta plataforma educativa de matemáticas. ¿Hay algo sobre los ejercicios con gestos que te gustaría saber?",
                "keywords": ["hora", "tiempo"],
                "confidence": 0.99,
                "source": "contextual_filtering"
            },
            # Ejemplos de preguntas ambiguas que deben clarificarse
            {
                "input_text": "¿Cómo funciona esto?",
                "expected_category": "Casos ambiguos",
                "response": "¿Te refieres a cómo funciona el reconocimiento de gestos, los cursos de matemáticas, o alguna funcionalidad específica de la plataforma? Puedo ayudarte con cualquier aspecto del sistema educativo.",
                "keywords": ["funciona", "esto"],
                "confidence": 0.85,
                "source": "contextual_filtering"
            }
        ]
        
        data.extend(contextual_examples)
        return data
    
    def save_expanded_dataset(self, data):
        """Guardar el conjunto expandido de datos"""
        # Crear backup del archivo anterior
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Guardar datos expandidos
        expanded_file = os.path.join(self.data_dir, "expanded_training_data.json")
        with open(expanded_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Crear reporte de expansión
        report = {
            "timestamp": timestamp,
            "original_records": len(self.existing_data),
            "expanded_records": len(data),
            "new_records_added": len(data) - len(self.existing_data),
            "categories_expanded": list(self.expanded_categories.keys()),
            "total_categories": len(self.expanded_categories),
            "expansion_factor": round(len(data) / max(len(self.existing_data), 1), 2),
            "out_of_context_examples": len([d for d in data if d.get("expected_category") == "Fuera de contexto"]),
            "contextual_filtering_enabled": True
        }
        
        report_file = os.path.join(self.data_dir, "expansion_report.json")
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return expanded_file, report_file, report

def main():
    project_root = "c:/Users/USER/Desktop/CHATBOT"
    
    print("🚀 EXPANSIÓN DEL CONJUNTO DE DATOS DE ENTRENAMIENTO")
    print("=" * 60)
    
    # Inicializar expansor
    expander = TrainingDataExpander(project_root)
    
    # Generar datos expandidos
    print("📊 Generando conjunto expandido de datos...")
    expanded_data = expander.generate_expanded_dataset()
    
    # Agregar ejemplos contextuales
    print("🎯 Agregando ejemplos de filtrado contextual...")
    expanded_data = expander.add_contextual_examples(expanded_data)
    
    # Eliminar duplicados
    print("🔄 Eliminando duplicados...")
    unique_data = []
    seen_inputs = set()
    for item in expanded_data:
        input_key = item["input_text"].lower().strip()
        if input_key not in seen_inputs:
            seen_inputs.add(input_key)
            unique_data.append(item)
    
    # Guardar datos expandidos
    print("💾 Guardando conjunto expandido...")
    expanded_file, report_file, report = expander.save_expanded_dataset(unique_data)
    
    # Mostrar resultados
    print("\n✅ EXPANSIÓN COMPLETADA")
    print("=" * 60)
    print(f"📁 Archivo expandido: {expanded_file}")
    print(f"📋 Reporte: {report_file}")
    print(f"📊 Registros originales: {report['original_records']}")
    print(f"📈 Registros expandidos: {report['expanded_records']}")
    print(f"🆕 Nuevos registros: {report['new_records_added']}")
    print(f"🏷️  Categorías: {report['total_categories']}")
    print(f"🚫 Ejemplos fuera de contexto: {report['out_of_context_examples']}")
    print(f"📊 Factor de expansión: {report['expansion_factor']}x")
    print(f"🎯 Filtrado contextual: {'✅ Habilitado' if report['contextual_filtering_enabled'] else '❌ Deshabilitado'}")
    
    print("\n🎉 ¡Conjunto de datos expandido exitosamente!")
    print("🔄 Listo para reentrenamiento con filtrado contextual")

if __name__ == "__main__":
    main()