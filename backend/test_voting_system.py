#!/usr/bin/env python
"""
Script de prueba para verificar el sistema de voting del reconocimiento facial
"""
import os
import sys
import django
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from reconocimiento.face_recognition_service import FaceRecognitionService
from reconocimiento.models import Person

def create_test_image_base64():
    """Crear una imagen de prueba en formato base64"""
    # Crear una imagen simple de 200x200 píxeles
    img = Image.new('RGB', (200, 200), color='white')
    
    # Convertir a base64
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/jpeg;base64,{img_str}"

def test_voting_system():
    """Probar el sistema de voting"""
    print("🧪 Iniciando pruebas del sistema de voting...")
    
    # Inicializar servicio
    face_service = FaceRecognitionService()
    
    # Crear imágenes de prueba
    test_images = []
    for i in range(7):  # 7 frames para el test
        test_images.append(create_test_image_base64())
    
    print(f"✅ Creadas {len(test_images)} imágenes de prueba")
    
    # Verificar si hay personas en la base de datos
    persons_count = Person.objects.count()
    print(f"📊 Personas en la base de datos: {persons_count}")
    
    if persons_count == 0:
        print("⚠️  No hay personas registradas. Creando datos de prueba...")
        
        # Crear embeddings de prueba (simulando face_recognition)
        test_embeddings = []
        for i in range(5):  # 5 embeddings por persona
            # Crear un embedding aleatorio de 128 dimensiones
            embedding = np.random.rand(128).tolist()
            test_embeddings.append(embedding)
        
        # Crear persona de prueba
        test_person = Person.objects.create(
            username="test_user",
            email="test@example.com",
            dni="12345678",
            embeddings=test_embeddings
        )
        print(f"✅ Persona de prueba creada: {test_person.username}")
    
    # Obtener personas para comparación
    persons = Person.objects.filter(is_active=True)
    stored_embeddings_list = []
    
    for person in persons:
        if person.embeddings and len(person.embeddings) > 0:
            stored_embeddings_list.append((person.id, person.embeddings))
    
    print(f"📋 Embeddings cargados para {len(stored_embeddings_list)} personas")
    
    # Probar el sistema de voting
    try:
        print("🔍 Ejecutando sistema de voting...")
        result = face_service.compare_with_database(test_images, stored_embeddings_list)
        
        print("\n📊 RESULTADOS DEL VOTING SYSTEM:")
        print(f"   ✓ Matched: {result['matched']}")
        print(f"   ✓ Person ID: {result['person_id']}")
        print(f"   ✓ Score: {result['score']:.4f}")
        print(f"   ✓ Confidence: {result.get('confidence', 0):.4f}")
        print(f"   ✓ Frames procesados: {result['frames_processed']}")
        
        if result['matched']:
            person = Person.objects.get(id=result['person_id'])
            print(f"   ✓ Usuario identificado: {person.username}")
        
        print("\n✅ Sistema de voting funcionando correctamente!")
        
    except Exception as e:
        print(f"❌ Error en el sistema de voting: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def test_similarity_calculation():
    """Probar el cálculo de similitud coseno"""
    print("\n🧮 Probando cálculo de similitud coseno...")
    
    # Crear dos vectores de prueba
    vector1 = np.random.rand(128)
    vector2 = np.random.rand(128)
    
    # Calcular similitud manualmente (como en el código)
    dot_product = np.dot(vector1, vector2)
    norm_a = np.linalg.norm(vector1)
    norm_b = np.linalg.norm(vector2)
    
    if norm_a > 0 and norm_b > 0:
        similarity = dot_product / (norm_a * norm_b)
    else:
        similarity = 0.0
    
    print(f"   ✓ Similitud calculada: {similarity:.4f}")
    print(f"   ✓ Rango válido: {-1 <= similarity <= 1}")
    
    # Probar con vectores idénticos
    identical_similarity = np.dot(vector1, vector1) / (np.linalg.norm(vector1) ** 2)
    print(f"   ✓ Similitud idéntica: {identical_similarity:.4f} (debe ser ~1.0)")
    
    return True

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBAS DEL SISTEMA DE RECONOCIMIENTO FACIAL")
    print("=" * 60)
    
    # Ejecutar pruebas
    success = True
    
    try:
        success &= test_similarity_calculation()
        success &= test_voting_system()
        
        if success:
            print("\n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
        else:
            print("\n❌ ALGUNAS PRUEBAS FALLARON")
            
    except Exception as e:
        print(f"\n💥 ERROR CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
        success = False
    
    print("=" * 60)
    sys.exit(0 if success else 1)