#!/usr/bin/env python3
"""
TEST_AGENTE - Archivo consolidado de pruebas y testing del chatbot
Consolida todas las funcionalidades de prueba del proyecto en un solo lugar
"""

import requests
import json
import time
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
import os
import sys

class ChatbotTester:
    """Clase principal para realizar pruebas del chatbot"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
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
    
    def evaluate_prediction(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Evalúa la calidad de una predicción"""
        evaluation = {
            "accuracy": 0.0,
            "confidence_score": result.get("confidence", 0.0),
            "response_quality": "unknown"
        }
        
        # Evaluar precisión de intención
        if "intent_match" in result:
            evaluation["accuracy"] = 1.0 if result["intent_match"] else 0.0
        
        # Evaluar calidad de respuesta
        response = result.get("response", "")
        if len(response) > 10 and result.get("confidence", 0) > 0.5:
            evaluation["response_quality"] = "good"
        elif len(response) > 5:
            evaluation["response_quality"] = "fair"
        else:
            evaluation["response_quality"] = "poor"
        
        return evaluation
    
    def run_comprehensive_test(self, test_cases: List[Dict[str, str]]) -> Dict[str, Any]:
        """Ejecuta una batería completa de pruebas"""
        print("🧪 Iniciando pruebas comprehensivas del chatbot...")
        
        results = []
        total_tests = len(test_cases)
        successful_tests = 0
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"   Prueba {i}/{total_tests}: {test_case['message'][:50]}...")
            
            result = self.test_api_endpoint(
                test_case["message"],
                test_case.get("expected_intent")
            )
            
            evaluation = self.evaluate_prediction(result)
            result.update(evaluation)
            
            results.append(result)
            
            if result["status"] == "success":
                successful_tests += 1
            
            time.sleep(0.1)  # Evitar sobrecarga del servidor
        
        # Calcular estadísticas
        accuracy_scores = [r.get("accuracy", 0) for r in results if "accuracy" in r]
        confidence_scores = [r.get("confidence_score", 0) for r in results]
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "success_rate": successful_tests / total_tests if total_tests > 0 else 0,
            "average_accuracy": sum(accuracy_scores) / len(accuracy_scores) if accuracy_scores else 0,
            "average_confidence": sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0,
            "results": results
        }
        
        return summary
    
    def analyze_results(self, test_summary: Dict[str, Any]) -> None:
        """Analiza y muestra los resultados de las pruebas"""
        print("\n" + "="*60)
        print("📊 ANÁLISIS DE RESULTADOS DE PRUEBAS")
        print("="*60)
        
        print(f"📈 Pruebas totales: {test_summary['total_tests']}")
        print(f"✅ Pruebas exitosas: {test_summary['successful_tests']}")
        print(f"📊 Tasa de éxito: {test_summary['success_rate']:.2%}")
        print(f"🎯 Precisión promedio: {test_summary['average_accuracy']:.2%}")
        print(f"🔍 Confianza promedio: {test_summary['average_confidence']:.2%}")
        
        # Análisis por calidad de respuesta
        quality_counts = {}
        for result in test_summary['results']:
            quality = result.get('response_quality', 'unknown')
            quality_counts[quality] = quality_counts.get(quality, 0) + 1
        
        print(f"\n📋 Calidad de respuestas:")
        for quality, count in quality_counts.items():
            print(f"   {quality.title()}: {count} ({count/test_summary['total_tests']:.1%})")
        
        # Mostrar errores si los hay
        errors = [r for r in test_summary['results'] if r['status'] == 'error']
        if errors:
            print(f"\n❌ Errores encontrados ({len(errors)}):")
            for error in errors[:5]:  # Mostrar solo los primeros 5
                print(f"   - {error['message'][:40]}...: {error['error']}")
    
    def save_results(self, test_summary: Dict[str, Any], filename: str = None) -> str:
        """Guarda los resultados de las pruebas"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_results/test_agente_results_{timestamp}.json"
        
        # Asegurar que existe el directorio
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(test_summary, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Resultados guardados en: {filename}")
        return filename

class AntiDashboardTester(ChatbotTester):
    """Tester especializado para pruebas anti-dashboard"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        super().__init__(base_url)
        self.anti_dashboard_cases = [
            {"message": "¿Cómo sumo fracciones?", "expected_intent": "arithmetic"},
            {"message": "Quiero practicar matemáticas", "expected_intent": "arithmetic"},
            {"message": "¿Cómo hago gestos con las manos?", "expected_intent": "gestures"},
            {"message": "Entrenar reconocimiento de señas", "expected_intent": "gestures"},
            {"message": "¿Dónde están los cursos?", "expected_intent": "course_navigation"},
            {"message": "Quiero ver las materias disponibles", "expected_intent": "course_navigation"},
            {"message": "Necesito ayuda con la plataforma", "expected_intent": "technical_support"},
            {"message": "No puedo acceder al sistema", "expected_intent": "technical_support"},
            {"message": "¿Cómo guardo mi progreso?", "expected_intent": "model_management"},
            {"message": "Eliminar modelo guardado", "expected_intent": "model_management"},
            {"message": "¿Qué puedo hacer aquí?", "expected_intent": "help"},
            {"message": "Mostrar opciones principales", "expected_intent": "dashboard"},
            {"message": "Ver panel principal", "expected_intent": "dashboard"},
            {"message": "Ayuda", "expected_intent": "help"},
            {"message": "¿Qué tal?", "expected_intent": "greeting"},
            {"message": "Hola", "expected_intent": "greeting"},
            {"message": "Buenos días", "expected_intent": "greeting"}
        ]
    
    def run_anti_dashboard_test(self) -> Dict[str, Any]:
        """Ejecuta pruebas específicas anti-dashboard"""
        print("🛡️ Ejecutando pruebas anti-dashboard...")
        return self.run_comprehensive_test(self.anti_dashboard_cases)

class TrainingTester:
    """Tester para validar modelos de entrenamiento"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.test_data = []
    
    def load_test_data(self, data_path: str) -> None:
        """Carga datos de prueba desde un archivo"""
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                if data_path.endswith('.json'):
                    self.test_data = json.load(f)
                elif data_path.endswith('.csv'):
                    import pandas as pd
                    df = pd.read_csv(data_path)
                    self.test_data = df.to_dict('records')
            print(f"📊 Cargados {len(self.test_data)} casos de prueba")
        except Exception as e:
            print(f"❌ Error cargando datos de prueba: {e}")
    
    def validate_model_accuracy(self) -> Dict[str, Any]:
        """Valida la precisión del modelo"""
        if not self.test_data:
            return {"error": "No hay datos de prueba cargados"}
        
        print("🎯 Validando precisión del modelo...")
        
        # Aquí iría la lógica de validación del modelo
        # Por ahora, simulamos resultados
        
        validation_results = {
            "timestamp": datetime.now().isoformat(),
            "model_path": self.model_path,
            "test_cases": len(self.test_data),
            "accuracy": 0.85,  # Simulado
            "precision": 0.82,  # Simulado
            "recall": 0.88,     # Simulado
            "f1_score": 0.85    # Simulado
        }
        
        return validation_results

def get_default_test_cases() -> List[Dict[str, str]]:
    """Retorna casos de prueba por defecto"""
    return [
        {"message": "Hola", "expected_intent": "greeting"},
        {"message": "¿Cómo estás?", "expected_intent": "greeting"},
        {"message": "Ayuda", "expected_intent": "help"},
        {"message": "¿Qué puedes hacer?", "expected_intent": "help"},
        {"message": "Quiero practicar matemáticas", "expected_intent": "arithmetic"},
        {"message": "¿Cómo sumo números?", "expected_intent": "arithmetic"},
        {"message": "Mostrar dashboard", "expected_intent": "dashboard"},
        {"message": "Ver panel principal", "expected_intent": "dashboard"},
        {"message": "¿Dónde están los cursos?", "expected_intent": "course_navigation"},
        {"message": "Acceder a materias", "expected_intent": "course_navigation"}
    ]

def main():
    """Función principal para ejecutar pruebas"""
    print("🚀 TEST_AGENTE - Sistema de Pruebas del Chatbot")
    print("="*50)
    
    # Configurar tester
    tester = ChatbotTester()
    
    # Ejecutar pruebas básicas
    test_cases = get_default_test_cases()
    results = tester.run_comprehensive_test(test_cases)
    
    # Analizar resultados
    tester.analyze_results(results)
    
    # Guardar resultados
    tester.save_results(results)
    
    # Ejecutar pruebas anti-dashboard
    anti_dashboard_tester = AntiDashboardTester()
    anti_dashboard_results = anti_dashboard_tester.run_anti_dashboard_test()
    
    print("\n🛡️ RESULTADOS ANTI-DASHBOARD:")
    anti_dashboard_tester.analyze_results(anti_dashboard_results)
    anti_dashboard_tester.save_results(
        anti_dashboard_results, 
        f"test_results/anti_dashboard_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )
    
    print("\n✅ Todas las pruebas completadas!")

if __name__ == "__main__":
    main()