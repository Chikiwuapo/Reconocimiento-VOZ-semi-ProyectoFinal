#!/usr/bin/env python3
"""
TEST COMPREHENSIVE - Archivo consolidado de pruebas del chatbot educativo
Consolida todas las funcionalidades de prueba del proyecto en un solo lugar
Incluye: API testing, anti-dashboard validation, model improvements, predictions
"""

import requests
import json
import time
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import os
import sys

class ComprehensiveChatbotTester:
    """Clase principal para realizar todas las pruebas del chatbot"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/chat"
        self.test_results = []
        self.session = requests.Session()
    
    def test_api_endpoint(self, message: str, expected_intent: str = None) -> Dict[str, Any]:
        """Prueba un endpoint de la API del chatbot"""
        try:
            response = self.session.post(
                f"{self.base_url}/chat",
                json={"message": message},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                result = {
                    "message": message,
                    "status": "success",
                    "response": data.get("response", ""),
                    "intent": data.get("intent", "unknown"),
                    "confidence": data.get("confidence", 0.0),
                    "timestamp": datetime.now().isoformat()
                }
                
                if expected_intent:
                    result["expected_intent"] = expected_intent
                    result["intent_match"] = result["intent"] == expected_intent
                
                return result
            else:
                return {
                    "message": message,
                    "status": "error",
                    "error": f"HTTP {response.status_code}",
                    "timestamp": datetime.now().isoformat()
                }
        except Exception as e:
            return {
                "message": message,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def test_predictions(self) -> Dict[str, Any]:
        """Prueba las predicciones del modelo con casos específicos"""
        test_cases = [
            'Como sumo fracciones',
            'Quiero practicar matematicas',
            'Como hago gestos con las manos',
            'Donde estan los cursos',
            'Necesito ayuda',
            'Hola como estas',
            'Mostrar dashboard',
            'Ver panel principal',
            'Entrenar modelo',
            'Guardar progreso'
        ]
        
        results = []
        successful_tests = 0
        
        for test in test_cases:
            try:
                response = requests.post(self.api_url, 
                                       json={'message': test}, 
                                       timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    results.append({
                        'query': test,
                        'category': data.get('category', 'N/A'),
                        'confidence': data.get('confidence', 0),
                        'status': 'success'
                    })
                    successful_tests += 1
                else:
                    results.append({
                        'query': test,
                        'status': 'error',
                        'error': f'HTTP {response.status_code}'
                    })
                    
            except Exception as e:
                results.append({
                    'query': test,
                    'status': 'error',
                    'error': str(e)
                })
        
        return {
            'total_tests': len(test_cases),
            'successful_tests': successful_tests,
            'success_rate': successful_tests / len(test_cases),
            'results': results
        }
    
    def test_anti_dashboard_improvements(self) -> Dict[str, Any]:
        """Evalúa las mejoras anti-dashboard"""
        test_cases = [
            # Casos que anteriormente se clasificaban incorrectamente como 'dashboard'
            {"input": "¿Cómo sumo fracciones?", "expected": "arithmetic", "description": "Pregunta específica de aritmética"},
            {"input": "Quiero practicar matemáticas", "expected": "arithmetic", "description": "Intención de práctica matemática"},
            {"input": "¿Cómo hago gestos con las manos?", "expected": "gestures", "description": "Pregunta sobre reconocimiento de gestos"},
            {"input": "Entrenar reconocimiento de señas", "expected": "gestures", "description": "Entrenamiento de gestos"},
            {"input": "¿Dónde están los cursos?", "expected": "course_navigation", "description": "Navegación de cursos"},
            {"input": "Quiero ver las materias disponibles", "expected": "course_navigation", "description": "Exploración de materias"},
            {"input": "Necesito ayuda con la plataforma", "expected": "technical_support", "description": "Soporte técnico"},
            {"input": "No puedo acceder al sistema", "expected": "technical_support", "description": "Problema de acceso"},
            {"input": "¿Cómo guardo mi progreso?", "expected": "model_management", "description": "Gestión de modelos/progreso"},
            {"input": "Eliminar modelo guardado", "expected": "model_management", "description": "Eliminación de modelos"},
            
            # Casos que deberían ir a dashboard (casos legítimos)
            {"input": "¿Qué puedo hacer aquí?", "expected": "dashboard", "description": "Pregunta general sobre funcionalidades"},
            {"input": "Mostrar opciones principales", "expected": "dashboard", "description": "Solicitud de menú principal"},
            {"input": "Ver panel principal", "expected": "dashboard", "description": "Acceso directo al dashboard"},
            
            # Casos de saludo
            {"input": "¿Qué tal?", "expected": "greeting", "description": "Saludo informal"},
            {"input": "Hola", "expected": "greeting", "description": "Saludo básico"},
            {"input": "Buenos días", "expected": "greeting", "description": "Saludo formal"},
        ]
        
        results = []
        dashboard_misclassifications = 0
        correct_predictions = 0
        
        for case in test_cases:
            try:
                response = requests.post(
                    self.api_url,
                    json={"message": case["input"]},
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    predicted = data.get("category", "unknown")
                    confidence = data.get("confidence", 0.0)
                    
                    # Evaluar predicción
                    is_correct = False
                    if isinstance(case["expected"], list):
                        is_correct = predicted in case["expected"]
                    else:
                        is_correct = predicted == case["expected"]
                    
                    # Contar misclasificaciones como dashboard
                    if predicted == "dashboard" and case["expected"] != "dashboard":
                        dashboard_misclassifications += 1
                    
                    if is_correct:
                        correct_predictions += 1
                    
                    results.append({
                        "input": case["input"],
                        "expected": case["expected"],
                        "predicted": predicted,
                        "confidence": confidence,
                        "correct": is_correct,
                        "description": case["description"]
                    })
                else:
                    results.append({
                        "input": case["input"],
                        "error": f"HTTP {response.status_code}",
                        "correct": False
                    })
                    
            except Exception as e:
                results.append({
                    "input": case["input"],
                    "error": str(e),
                    "correct": False
                })
        
        total_tests = len(test_cases)
        accuracy = correct_predictions / total_tests if total_tests > 0 else 0
        dashboard_misclassification_rate = dashboard_misclassifications / total_tests if total_tests > 0 else 0
        
        return {
            "total_tests": total_tests,
            "correct_predictions": correct_predictions,
            "accuracy": accuracy,
            "dashboard_misclassifications": dashboard_misclassifications,
            "dashboard_misclassification_rate": dashboard_misclassification_rate,
            "results": results
        }
    
    def test_improved_model(self) -> Dict[str, Any]:
        """Verifica que el modelo mejorado funciona correctamente"""
        test_cases = [
            {
                "query": "Hola",
                "expected_not": "dashboard",
                "description": "Simple greeting"
            },
            {
                "query": "Como sumo fracciones",
                "expected_category": "arithmetic_gestures",
                "description": "Math question about fractions"
            },
            {
                "query": "Buenos días",
                "expected_category": "greeting",
                "description": "Morning greeting"
            },
            {
                "query": "Ayuda",
                "expected_not": "dashboard",
                "description": "Help request"
            },
            {
                "query": "Quiero aprender matemáticas",
                "expected_not": "dashboard",
                "description": "Learning request"
            },
            {
                "query": "Ver mi progreso",
                "expected_category": "specific_questions",
                "description": "Progress inquiry"
            },
            {
                "query": "Ir al dashboard",
                "expected_category": "dashboard",
                "description": "Explicit dashboard request"
            }
        ]
        
        results = []
        dashboard_predictions = 0
        correct_predictions = 0
        high_confidence_predictions = 0
        
        for case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/chat",
                    json={"message": case["query"]},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    predicted_category = data.get("category", "unknown")
                    confidence = data.get("confidence", 0.0)
                    
                    # Verificar si es correcto
                    is_correct = False
                    if "expected_category" in case:
                        is_correct = predicted_category == case["expected_category"]
                    elif "expected_not" in case:
                        is_correct = predicted_category != case["expected_not"]
                    
                    # Contar estadísticas
                    if predicted_category == "dashboard":
                        dashboard_predictions += 1
                    if is_correct:
                        correct_predictions += 1
                    if confidence > 0.5:
                        high_confidence_predictions += 1
                    
                    results.append({
                        "query": case["query"],
                        "predicted_category": predicted_category,
                        "confidence": confidence,
                        "correct": is_correct,
                        "description": case["description"]
                    })
                else:
                    results.append({
                        "query": case["query"],
                        "error": f"HTTP {response.status_code}",
                        "correct": False
                    })
                    
            except Exception as e:
                results.append({
                    "query": case["query"],
                    "error": str(e),
                    "correct": False
                })
        
        total_tests = len(test_cases)
        accuracy = correct_predictions / total_tests if total_tests > 0 else 0
        dashboard_rate = dashboard_predictions / total_tests if total_tests > 0 else 0
        
        return {
            "total_tests": total_tests,
            "correct_predictions": correct_predictions,
            "accuracy": accuracy,
            "dashboard_predictions": dashboard_predictions,
            "dashboard_rate": dashboard_rate,
            "high_confidence_predictions": high_confidence_predictions,
            "results": results
        }
    
    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Ejecuta todas las pruebas de forma integral"""
        print("🧪 Iniciando pruebas comprehensivas del chatbot...")
        print("=" * 60)
        
        # Verificar conectividad
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code != 200:
                return {"error": "Chatbot API no está disponible"}
        except:
            return {"error": "No se puede conectar al chatbot API"}
        
        # Ejecutar todas las pruebas
        results = {
            "timestamp": datetime.now().isoformat(),
            "predictions_test": self.test_predictions(),
            "anti_dashboard_test": self.test_anti_dashboard_improvements(),
            "improved_model_test": self.test_improved_model()
        }
        
        # Calcular métricas generales
        total_accuracy = (
            results["predictions_test"]["success_rate"] +
            results["anti_dashboard_test"]["accuracy"] +
            results["improved_model_test"]["accuracy"]
        ) / 3
        
        results["overall_metrics"] = {
            "total_accuracy": total_accuracy,
            "dashboard_issues_resolved": results["anti_dashboard_test"]["dashboard_misclassification_rate"] < 0.2,
            "model_improvements_working": results["improved_model_test"]["accuracy"] > 0.7
        }
        
        return results
    
    def save_results(self, results: Dict[str, Any], filename: str = None) -> str:
        """Guarda los resultados de las pruebas"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"comprehensive_test_results_{timestamp}.json"
        
        filepath = os.path.join(os.getcwd(), filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        return filepath
    
    def print_summary(self, results: Dict[str, Any]) -> None:
        """Imprime un resumen de los resultados"""
        print("\n📊 RESUMEN DE PRUEBAS COMPREHENSIVAS")
        print("=" * 60)
        
        if "error" in results:
            print(f"❌ Error: {results['error']}")
            return
        
        # Métricas generales
        overall = results["overall_metrics"]
        print(f"🎯 Precisión General: {overall['total_accuracy']:.1%}")
        print(f"✅ Problemas Dashboard Resueltos: {'Sí' if overall['dashboard_issues_resolved'] else 'No'}")
        print(f"🚀 Mejoras del Modelo Funcionando: {'Sí' if overall['model_improvements_working'] else 'No'}")
        
        # Detalles por prueba
        print(f"\n📈 Prueba de Predicciones:")
        pred = results["predictions_test"]
        print(f"   - Éxito: {pred['successful_tests']}/{pred['total_tests']} ({pred['success_rate']:.1%})")
        
        print(f"\n🛡️ Prueba Anti-Dashboard:")
        anti = results["anti_dashboard_test"]
        print(f"   - Precisión: {anti['correct_predictions']}/{anti['total_tests']} ({anti['accuracy']:.1%})")
        print(f"   - Misclasificaciones Dashboard: {anti['dashboard_misclassifications']} ({anti['dashboard_misclassification_rate']:.1%})")
        
        print(f"\n🔧 Prueba Modelo Mejorado:")
        improved = results["improved_model_test"]
        print(f"   - Precisión: {improved['correct_predictions']}/{improved['total_tests']} ({improved['accuracy']:.1%})")
        print(f"   - Predicciones Dashboard: {improved['dashboard_predictions']} ({improved['dashboard_rate']:.1%})")
        
        print("=" * 60)

def main():
    """Función principal para ejecutar las pruebas"""
    tester = ComprehensiveChatbotTester()
    
    try:
        print("🤖 Iniciando pruebas comprehensivas del chatbot educativo...")
        results = tester.run_comprehensive_test()
        
        # Mostrar resumen
        tester.print_summary(results)
        
        # Guardar resultados
        filepath = tester.save_results(results)
        print(f"\n💾 Resultados guardados en: {filepath}")
        
        return results["overall_metrics"]["total_accuracy"] > 0.7 if "overall_metrics" in results else False
        
    except KeyboardInterrupt:
        print("\n\n⏹️ Pruebas interrumpidas por el usuario.")
        return False
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)