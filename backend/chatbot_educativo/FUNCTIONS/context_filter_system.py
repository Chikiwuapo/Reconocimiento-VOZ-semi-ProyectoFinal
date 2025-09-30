#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de filtrado contextual para el chatbot educativo.
Detecta y rechaza preguntas fuera del contexto de la plataforma de matemáticas.
"""

import json
import os
import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime

class ContextFilterSystem:
    def __init__(self, project_root: str):
        self.project_root = project_root
        self.data_dir = os.path.join(project_root, "ai_agent", "data")
        
        # Palabras clave del contexto válido (plataforma educativa de matemáticas)
        self.valid_context_keywords = {
            "plataforma", "matemáticas", "gestos", "reconocimiento", "ejercicios", 
            "cursos", "aprendizaje", "educativo", "aritmética", "cálculo",
            "geometría", "álgebra", "cuenta", "registro", "login", "usuario",
            "panel", "dashboard", "progreso", "resultados", "modelos", "guardados",
            "lecciones", "niveles", "certificados", "tutoriales", "ayuda",
            "soporte", "funcionalidades", "sistema", "cámara", "tiempo real",
            "interactivo", "visual", "tecnología", "avanzada", "estudiantes"
        }
        
        # Palabras clave que indican contexto fuera del dominio
        self.out_of_context_keywords = {
            "clima", "tiempo", "temperatura", "lluvia", "sol", "nieve",
            "noticias", "política", "gobierno", "elecciones", "presidente",
            "deportes", "fútbol", "básquet", "tenis", "olimpiadas",
            "cocina", "receta", "comida", "restaurante", "chef",
            "música", "canción", "artista", "concierto", "banda",
            "película", "cine", "actor", "director", "serie",
            "viajes", "turismo", "hotel", "vuelo", "aeropuerto",
            "salud", "médico", "enfermedad", "medicina", "hospital",
            "trabajo", "empleo", "empresa", "oficina", "jefe",
            "amor", "pareja", "cita", "matrimonio", "divorcio",
            "dinero", "banco", "préstamo", "inversión", "bolsa",
            "coche", "auto", "mecánico", "gasolina", "tráfico",
            "animales", "perro", "gato", "mascota", "veterinario",
            "moda", "ropa", "zapatos", "marca", "estilo",
            "tecnología general", "smartphone", "whatsapp", "facebook", "instagram"
        }
        
        # Patrones de preguntas típicamente fuera de contexto
        self.out_of_context_patterns = [
            r"¿qué tiempo hace\??",
            r"¿cómo está el clima\??",
            r"¿quién ganó.*partido\??",
            r"¿cómo cocino.*\??",
            r"¿qué película.*\??",
            r"¿dónde está.*\??",
            r"¿cómo llego a.*\??",
            r"¿qué significa.*en inglés\??",
            r"¿cuál es la capital de.*\??",
            r"¿qué hora es\??",
            r"¿cómo funciona.*motor\??",
            r"¿qué vitaminas.*\??",
            r"¿cómo cuido.*plantas\??",
            r"¿qué opinas de.*política\??",
            r"¿me recomiendas.*restaurante\??",
            r"¿cómo está.*bolsa.*valores\??",
            r"¿cuáles son.*noticias\??",
            r"¿qué música.*recomiendas\??"
        ]
        
        # Respuestas estándar para redirección
        self.redirect_responses = [
            "Lo siento, soy un asistente especializado en esta plataforma educativa de matemáticas con reconocimiento de gestos. Solo puedo ayudarte con preguntas relacionadas con el uso de la plataforma, cursos de matemáticas, ejercicios con gestos y funcionalidades del sistema. ¿Te gustaría saber algo específico sobre nuestros cursos de matemáticas?",
            "Mi especialidad es ayudarte con esta plataforma educativa de matemáticas. No puedo responder preguntas sobre otros temas. ¿Hay algo sobre los cursos de matemáticas o el reconocimiento de gestos que te gustaría saber?",
            "Estoy diseñado para asistirte únicamente con temas relacionados a esta plataforma de aprendizaje matemático. ¿Te puedo ayudar con alguna pregunta sobre los ejercicios con gestos o los cursos disponibles?",
            "Mi función es ayudarte con esta plataforma de matemáticas interactiva. Para otros temas, te recomiendo consultar fuentes especializadas. ¿Qué te gustaría saber sobre nuestros métodos de enseñanza con gestos?",
            "Solo puedo asistirte con preguntas sobre esta plataforma educativa de matemáticas. ¿Te interesa conocer cómo funcionan nuestros ejercicios interactivos o algún curso específico?"
        ]
    
    def analyze_context(self, question: str) -> Dict:
        """Analizar el contexto de una pregunta"""
        question_lower = question.lower().strip()
        
        # Calcular puntuaciones
        valid_score = self._calculate_valid_context_score(question_lower)
        invalid_score = self._calculate_invalid_context_score(question_lower)
        pattern_match = self._check_out_of_context_patterns(question_lower)
        
        # Determinar si está en contexto
        is_in_context = self._determine_context_validity(valid_score, invalid_score, pattern_match)
        
        # Calcular confianza
        confidence = self._calculate_confidence(valid_score, invalid_score, pattern_match)
        
        return {
            "question": question,
            "is_in_context": is_in_context,
            "confidence": confidence,
            "valid_context_score": valid_score,
            "invalid_context_score": invalid_score,
            "pattern_match": pattern_match,
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    def _calculate_valid_context_score(self, question: str) -> float:
        """Calcular puntuación de contexto válido"""
        matches = 0
        total_keywords = len(self.valid_context_keywords)
        
        for keyword in self.valid_context_keywords:
            if keyword in question:
                matches += 1
        
        return matches / total_keywords if total_keywords > 0 else 0.0
    
    def _calculate_invalid_context_score(self, question: str) -> float:
        """Calcular puntuación de contexto inválido"""
        matches = 0
        total_keywords = len(self.out_of_context_keywords)
        
        for keyword in self.out_of_context_keywords:
            if keyword in question:
                matches += 1
        
        return matches / total_keywords if total_keywords > 0 else 0.0
    
    def _check_out_of_context_patterns(self, question: str) -> bool:
        """Verificar patrones típicos de preguntas fuera de contexto"""
        for pattern in self.out_of_context_patterns:
            if re.search(pattern, question, re.IGNORECASE):
                return True
        return False
    
    def _determine_context_validity(self, valid_score: float, invalid_score: float, pattern_match: bool) -> bool:
        """Determinar si la pregunta está en contexto válido"""
        # Si hay un patrón claro fuera de contexto
        if pattern_match:
            return False
        
        # Si hay más palabras clave inválidas que válidas
        if invalid_score > valid_score and invalid_score > 0.1:
            return False
        
        # Si no hay ninguna palabra clave válida (pregunta muy genérica)
        if valid_score == 0.0 and invalid_score == 0.0:
            return True  # Asumir contexto válido para preguntas ambiguas
        
        # Por defecto, asumir que está en contexto (para evitar falsos positivos)
        return True
    
    def _calculate_confidence(self, valid_score: float, invalid_score: float, pattern_match: bool) -> float:
        """Calcular nivel de confianza en la clasificación"""
        if pattern_match:
            return 0.95  # Alta confianza si hay patrón claro
        
        if invalid_score > 0.2:
            return 0.90  # Alta confianza si hay muchas palabras fuera de contexto
        
        if valid_score > 0.1:
            return 0.85  # Buena confianza si hay palabras del contexto válido
        
        return 0.70  # Confianza moderada para casos ambiguos
    
    def get_redirect_response(self) -> str:
        """Obtener una respuesta de redirección aleatoria"""
        import random
        return random.choice(self.redirect_responses)
    
    def process_question(self, question: str) -> Dict:
        """Procesar una pregunta completa con análisis y respuesta"""
        analysis = self.analyze_context(question)
        
        if analysis["is_in_context"]:
            return {
                "question": question,
                "should_process": True,
                "response": None,
                "analysis": analysis
            }
        else:
            return {
                "question": question,
                "should_process": False,
                "response": self.get_redirect_response(),
                "analysis": analysis
            }
    
    def test_filter_system(self) -> Dict:
        """Probar el sistema de filtrado con ejemplos"""
        test_questions = [
            # Preguntas válidas (en contexto)
            "¿Cómo funciona el reconocimiento de gestos?",
            "¿Qué cursos de matemáticas tienen disponibles?",
            "¿Cómo me registro en la plataforma?",
            "¿Puedo ver mi progreso de aprendizaje?",
            "¿Qué ejercicios de aritmética puedo hacer?",
            
            # Preguntas inválidas (fuera de contexto)
            "¿Qué tiempo hace hoy?",
            "¿Quién ganó el partido de fútbol?",
            "¿Cómo cocino pasta?",
            "¿Qué película me recomiendas?",
            "¿Cuál es la capital de Francia?",
            
            # Preguntas ambiguas
            "¿Cómo funciona esto?",
            "¿Puedes ayudarme?",
            "¿Qué es esto?"
        ]
        
        results = {
            "test_timestamp": datetime.now().isoformat(),
            "total_questions": len(test_questions),
            "results": [],
            "summary": {
                "in_context": 0,
                "out_of_context": 0,
                "high_confidence": 0,
                "medium_confidence": 0,
                "low_confidence": 0
            }
        }
        
        for question in test_questions:
            result = self.process_question(question)
            results["results"].append(result)
            
            # Actualizar resumen
            if result["should_process"]:
                results["summary"]["in_context"] += 1
            else:
                results["summary"]["out_of_context"] += 1
            
            confidence = result["analysis"]["confidence"]
            if confidence >= 0.9:
                results["summary"]["high_confidence"] += 1
            elif confidence >= 0.8:
                results["summary"]["medium_confidence"] += 1
            else:
                results["summary"]["low_confidence"] += 1
        
        return results
    
    def save_test_results(self, results: Dict) -> str:
        """Guardar resultados de prueba"""
        test_file = os.path.join(self.data_dir, "context_filter_test_results.json")
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        return test_file

def main():
    project_root = "c:/Users/USER/Desktop/CHATBOT"
    
    print("🎯 SISTEMA DE FILTRADO CONTEXTUAL")
    print("=" * 50)
    
    # Inicializar sistema de filtrado
    filter_system = ContextFilterSystem(project_root)
    
    # Probar el sistema
    print("🧪 Ejecutando pruebas del sistema de filtrado...")
    test_results = filter_system.test_filter_system()
    
    # Guardar resultados
    test_file = filter_system.save_test_results(test_results)
    
    # Mostrar resultados
    print("\n✅ RESULTADOS DE PRUEBA")
    print("=" * 50)
    print(f"📊 Total de preguntas probadas: {test_results['total_questions']}")
    print(f"✅ Preguntas en contexto: {test_results['summary']['in_context']}")
    print(f"❌ Preguntas fuera de contexto: {test_results['summary']['out_of_context']}")
    print(f"🎯 Alta confianza: {test_results['summary']['high_confidence']}")
    print(f"🎯 Confianza media: {test_results['summary']['medium_confidence']}")
    print(f"🎯 Baja confianza: {test_results['summary']['low_confidence']}")
    
    print(f"\n📁 Resultados guardados en: {test_file}")
    
    # Mostrar algunos ejemplos
    print("\n📋 EJEMPLOS DE CLASIFICACIÓN:")
    print("-" * 50)
    for i, result in enumerate(test_results['results'][:8]):
        status = "✅ EN CONTEXTO" if result['should_process'] else "❌ FUERA DE CONTEXTO"
        confidence = f"{result['analysis']['confidence']:.2f}"
        print(f"{i+1}. {result['question']}")
        print(f"   {status} (Confianza: {confidence})")
        if not result['should_process']:
            print(f"   Respuesta: {result['response'][:80]}...")
        print()
    
    print("🎉 ¡Sistema de filtrado contextual implementado exitosamente!")
    print("🔄 Listo para integración con el modelo de entrenamiento")

if __name__ == "__main__":
    main()