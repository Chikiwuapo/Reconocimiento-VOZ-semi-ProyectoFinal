#!/usr/bin/env python3
"""
Script de validación automática del chatbot educativo
Prueba las preguntas específicas del HTML y verifica el rendimiento
"""

import requests
import json
import time
from datetime import datetime

class ChatbotValidator:
    def __init__(self, api_url="http://localhost:5000/api/chat"):
        self.api_url = api_url
        self.test_results = []
        
    def test_chatbot_questions(self):
        """Prueba las preguntas específicas identificadas en el HTML"""
        
        # Preguntas específicas de los botones de acción rápida del HTML
        test_questions = [
            {
                "question": "¿Cómo funciona el reconocimiento de gestos?",
                "expected_category": "arithmetic_gestures",
                "min_confidence": 0.6
            },
            {
                "question": "¿Cómo me registro en la plataforma?",
                "expected_category": "registration",
                "min_confidence": 0.7
            },
            {
                "question": "¿Qué cursos de matemáticas tienen?",
                "expected_category": "course_info",
                "min_confidence": 0.7
            },
            {
                "question": "¿Cómo hago operaciones aritméticas?",
                "expected_category": "arithmetic_gestures",
                "min_confidence": 0.6
            },
            {
                "question": "¿Dónde está el panel principal?",
                "expected_category": "navigation",
                "min_confidence": 0.6
            },
            {
                "question": "Necesito ayuda técnica",
                "expected_category": "technical_support",
                "min_confidence": 0.6
            },
            # Preguntas adicionales para validación completa
            {
                "question": "Hola",
                "expected_category": "greeting",
                "min_confidence": 0.8
            },
            {
                "question": "¿Cómo puedo ver mi progreso?",
                "expected_category": "progress",
                "min_confidence": 0.6
            },
            {
                "question": "¿Cómo funciona la cámara para gestos?",
                "expected_category": "arithmetic_gestures",
                "min_confidence": 0.6
            },
            {
                "question": "¿Puedo guardar mis entrenamientos?",
                "expected_category": "models",
                "min_confidence": 0.6
            },
            {
                "question": "¿Cómo inicio sesión?",
                "expected_category": "authentication",
                "min_confidence": 0.7
            },
            {
                "question": "¿Qué ejercicios de matemáticas hay?",
                "expected_category": "course_info",
                "min_confidence": 0.6
            }
        ]
        
        print("🚀 Iniciando validación del chatbot...")
        print(f"📊 Total de preguntas a probar: {len(test_questions)}")
        print("-" * 60)
        
        passed_tests = 0
        failed_tests = 0
        
        for i, test in enumerate(test_questions, 1):
            print(f"\n🔍 Prueba {i}/{len(test_questions)}")
            print(f"❓ Pregunta: {test['question']}")
            
            try:
                # Enviar pregunta al API
                response = requests.post(
                    self.api_url,
                    json={"message": test['question']},
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get('success'):
                        category = result.get('category', 'unknown')
                        confidence = result.get('confidence', 0.0)
                        response_text = result.get('response', '')
                        
                        # Validar categoría y confianza
                        category_match = category == test['expected_category']
                        confidence_ok = confidence >= test['min_confidence']
                        
                        test_result = {
                            'question': test['question'],
                            'expected_category': test['expected_category'],
                            'actual_category': category,
                            'expected_confidence': test['min_confidence'],
                            'actual_confidence': confidence,
                            'response': response_text,
                            'category_match': category_match,
                            'confidence_ok': confidence_ok,
                            'passed': category_match and confidence_ok,
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        self.test_results.append(test_result)
                        
                        # Mostrar resultados
                        print(f"📂 Categoría esperada: {test['expected_category']}")
                        print(f"📂 Categoría obtenida: {category}")
                        print(f"📊 Confianza esperada: ≥{test['min_confidence']*100:.0f}%")
                        print(f"📊 Confianza obtenida: {confidence*100:.1f}%")
                        print(f"💬 Respuesta: {response_text[:100]}...")
                        
                        if test_result['passed']:
                            print("✅ PASÓ")
                            passed_tests += 1
                        else:
                            print("❌ FALLÓ")
                            failed_tests += 1
                            if not category_match:
                                print(f"   ⚠️ Categoría incorrecta")
                            if not confidence_ok:
                                print(f"   ⚠️ Confianza baja")
                    else:
                        print(f"❌ Error en respuesta del API: {result.get('error', 'Unknown error')}")
                        failed_tests += 1
                else:
                    print(f"❌ Error HTTP: {response.status_code}")
                    failed_tests += 1
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ Error de conexión: {e}")
                failed_tests += 1
            
            # Pausa entre pruebas
            time.sleep(0.5)
        
        # Resumen final
        total_tests = len(test_questions)
        success_rate = (passed_tests / total_tests) * 100
        
        print("\n" + "="*60)
        print("📋 RESUMEN DE VALIDACIÓN")
        print("="*60)
        print(f"✅ Pruebas pasadas: {passed_tests}/{total_tests}")
        print(f"❌ Pruebas fallidas: {failed_tests}/{total_tests}")
        print(f"📊 Tasa de éxito: {success_rate:.1f}%")
        
        if success_rate >= 70:
            print("🎉 ¡EXCELENTE! El chatbot supera el 70% de precisión")
        elif success_rate >= 60:
            print("✅ BUENO: El chatbot alcanza el objetivo mínimo del 60%")
        else:
            print("⚠️ NECESITA MEJORAS: El chatbot está por debajo del 60%")
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': success_rate,
            'detailed_results': self.test_results
        }
    
    def save_results(self, results, filename=None):
        """Guarda los resultados de la validación en un archivo JSON"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"chatbot_validation_results_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: {filename}")
        return filename
    
    def analyze_failures(self, results):
        """Analiza las pruebas fallidas para identificar patrones"""
        failed_tests = [test for test in results['detailed_results'] if not test['passed']]
        
        if not failed_tests:
            print("\n🎉 ¡No hay pruebas fallidas que analizar!")
            return
        
        print(f"\n🔍 ANÁLISIS DE {len(failed_tests)} PRUEBAS FALLIDAS:")
        print("-" * 50)
        
        # Agrupar por tipo de fallo
        category_failures = []
        confidence_failures = []
        
        for test in failed_tests:
            if not test['category_match']:
                category_failures.append(test)
            if not test['confidence_ok']:
                confidence_failures.append(test)
        
        if category_failures:
            print(f"\n📂 Fallos de categorización ({len(category_failures)}):")
            for test in category_failures:
                print(f"   • '{test['question']}'")
                print(f"     Esperado: {test['expected_category']} | Obtenido: {test['actual_category']}")
        
        if confidence_failures:
            print(f"\n📊 Fallos de confianza ({len(confidence_failures)}):")
            for test in confidence_failures:
                print(f"   • '{test['question']}'")
                print(f"     Esperado: ≥{test['expected_confidence']*100:.0f}% | Obtenido: {test['actual_confidence']*100:.1f}%")
        
        # Recomendaciones
        print(f"\n💡 RECOMENDACIONES:")
        if len(category_failures) > len(confidence_failures):
            print("   • Priorizar mejora en la clasificación de categorías")
            print("   • Revisar y expandir los datos de entrenamiento")
        elif len(confidence_failures) > len(category_failures):
            print("   • Priorizar mejora en la confianza del modelo")
            print("   • Considerar ajustar los umbrales de confianza")
        else:
            print("   • Mejorar tanto la clasificación como la confianza")
            print("   • Revisar el modelo y los datos de entrenamiento")

def main():
    """Función principal para ejecutar la validación"""
    print("🤖 VALIDADOR DEL CHATBOT EDUCATIVO")
    print("=" * 50)
    
    # Verificar que el API esté disponible
    try:
        response = requests.get("http://localhost:5000", timeout=5)
        print("✅ API del chatbot detectado y funcionando")
    except requests.exceptions.RequestException:
        print("❌ Error: No se puede conectar al API del chatbot")
        print("   Asegúrate de que 'python chatbot_api.py' esté ejecutándose")
        return
    
    # Ejecutar validación
    validator = ChatbotValidator()
    results = validator.test_chatbot_questions()
    
    # Guardar resultados
    filename = validator.save_results(results)
    
    # Analizar fallos
    validator.analyze_failures(results)
    
    print(f"\n📄 Archivo de resultados: {filename}")
    print("🏁 Validación completada")

if __name__ == "__main__":
    main()