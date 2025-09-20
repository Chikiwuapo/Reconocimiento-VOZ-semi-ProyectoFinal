import cv2
import numpy as np
import json
import base64
from io import BytesIO
from PIL import Image
import math
from typing import List, Dict, Tuple, Optional
from django.conf import settings
import os
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from .gesture_functions import gesture_executor

class GestureRecognitionService:
    """
    Servicio de reconocimiento de gestos usando OpenCV y algoritmos de machine learning.
    Procesa landmarks de manos enviados desde el frontend con MediaPipe.
    """
    
    def __init__(self):
        self.models_dir = os.path.join(settings.BASE_DIR, 'gesture_models')
        os.makedirs(self.models_dir, exist_ok=True)
        self.gesture_models = {}
        self.load_existing_models()
        
    def load_existing_models(self):
        """Carga modelos existentes desde el disco"""
        try:
            for filename in os.listdir(self.models_dir):
                if filename.endswith('.pkl'):
                    gesture_name = filename.replace('.pkl', '')
                    model_path = os.path.join(self.models_dir, filename)
                    self.gesture_models[gesture_name] = joblib.load(model_path)
        except Exception as e:
            print(f"Error loading models: {e}")
    
    def extract_hand_features(self, landmarks: List[Dict]) -> np.ndarray:
        """
        Extrae características de los landmarks de la mano.
        
        Args:
            landmarks: Lista de landmarks de MediaPipe con formato {x, y, z}
            
        Returns:
            Array de características normalizadas
        """
        if not landmarks or len(landmarks) != 21:
            return np.zeros(84)  # 21 landmarks * 4 features cada uno
        
        features = []
        
        # Convertir landmarks a array numpy
        points = np.array([[lm['x'], lm['y'], lm['z']] for lm in landmarks])
        
        # Normalizar respecto al punto de la muñeca (landmark 0)
        wrist = points[0]
        normalized_points = points - wrist
        
        # Calcular distancias desde la muñeca
        distances = np.linalg.norm(normalized_points, axis=1)
        features.extend(distances)
        
        # Calcular ángulos entre dedos
        finger_tips = [4, 8, 12, 16, 20]  # Puntas de los dedos
        finger_bases = [2, 5, 9, 13, 17]  # Bases de los dedos
        
        for i, (tip, base) in enumerate(zip(finger_tips, finger_bases)):
            # Vector del dedo
            finger_vector = normalized_points[tip] - normalized_points[base]
            # Ángulo con respecto al eje Y
            angle = math.atan2(finger_vector[0], finger_vector[1])
            features.append(angle)
        
        # Calcular distancias entre puntas de dedos
        for i in range(len(finger_tips)):
            for j in range(i + 1, len(finger_tips)):
                dist = np.linalg.norm(normalized_points[finger_tips[i]] - normalized_points[finger_tips[j]])
                features.append(dist)
        
        # Calcular área de la mano (convex hull)
        try:
            hull_points = points[:, :2]  # Solo x, y para el hull
            hull = cv2.convexHull(hull_points.astype(np.float32))
            area = cv2.contourArea(hull)
            features.append(area)
        except:
            features.append(0)
        
        # Rellenar hasta 84 características si es necesario
        while len(features) < 84:
            features.append(0)
        
        return np.array(features[:84])
    
    def train_gesture(self, gesture_name: str, training_data: List[List[Dict]]) -> Dict:
        """
        Entrena un modelo para reconocer un gesto específico.
        
        Args:
            gesture_name: Nombre del gesto
            training_data: Lista de muestras de landmarks
            
        Returns:
            Diccionario con resultados del entrenamiento
        """
        if len(training_data) < 5:
            return {
                'success': False,
                'error': 'Se necesitan al menos 5 muestras para entrenar'
            }
        
        try:
            # Extraer características de todas las muestras
            X = []
            for sample in training_data:
                features = self.extract_hand_features(sample)
                X.append(features)
            
            X = np.array(X)
            
            # Crear etiquetas (1 para el gesto, 0 para no-gesto)
            y = np.ones(len(X))
            
            # Generar muestras negativas (ruido)
            negative_samples = []
            for _ in range(len(X) // 2):
                # Crear landmarks aleatorios
                random_landmarks = []
                for _ in range(21):
                    random_landmarks.append({
                        'x': np.random.uniform(0, 1),
                        'y': np.random.uniform(0, 1),
                        'z': np.random.uniform(-0.1, 0.1)
                    })
                negative_features = self.extract_hand_features(random_landmarks)
                negative_samples.append(negative_features)
            
            if negative_samples:
                X_negative = np.array(negative_samples)
                X = np.vstack([X, X_negative])
                y = np.hstack([y, np.zeros(len(negative_samples))])
            
            # Dividir en entrenamiento y prueba
            if len(X) > 4:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42, stratify=y
                )
            else:
                X_train, X_test, y_train, y_test = X, X, y, y
            
            # Entrenar modelo Random Forest
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            model.fit(X_train, y_train)
            
            # Evaluar modelo
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Guardar modelo
            model_path = os.path.join(self.models_dir, f'{gesture_name}.pkl')
            joblib.dump(model, model_path)
            self.gesture_models[gesture_name] = model
            
            return {
                'success': True,
                'accuracy': float(accuracy),
                'samples_count': len(training_data),
                'model_path': model_path
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def recognize_gesture(self, landmarks: List[Dict]) -> Dict:
        """
        Reconoce un gesto basado en los landmarks proporcionados.
        
        Args:
            landmarks: Lista de landmarks de la mano
            
        Returns:
            Diccionario con el resultado del reconocimiento
        """
        if not landmarks:
            return {
                'gesture': None,
                'confidence': 0.0,
                'error': 'No se detectaron landmarks'
            }
        
        try:
            features = self.extract_hand_features(landmarks)
            features = features.reshape(1, -1)
            
            best_gesture = None
            best_confidence = 0.0
            
            for gesture_name, model in self.gesture_models.items():
                try:
                    # Predecir probabilidad
                    proba = model.predict_proba(features)[0]
                    if len(proba) > 1:
                        confidence = proba[1]  # Probabilidad de la clase positiva
                    else:
                        confidence = proba[0]
                    
                    if confidence > best_confidence and confidence > 0.7:  # Umbral de confianza
                        best_confidence = confidence
                        best_gesture = gesture_name
                        
                except Exception as e:
                    print(f"Error recognizing with model {gesture_name}: {e}")
                    continue
            
            return {
                'gesture': best_gesture,
                'confidence': float(best_confidence),
                'all_predictions': {
                    name: float(model.predict_proba(features)[0][1] if len(model.predict_proba(features)[0]) > 1 else model.predict_proba(features)[0][0])
                    for name, model in self.gesture_models.items()
                }
            }
            
        except Exception as e:
            return {
                'gesture': None,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def get_gesture_statistics(self, gesture_name: str) -> Dict:
        """
        Obtiene estadísticas de un gesto específico.
        
        Args:
            gesture_name: Nombre del gesto
            
        Returns:
            Diccionario con estadísticas del gesto
        """
        if gesture_name not in self.gesture_models:
            return {'error': 'Gesto no encontrado'}
        
        model_path = os.path.join(self.models_dir, f'{gesture_name}.pkl')
        
        try:
            stats = {
                'name': gesture_name,
                'model_exists': os.path.exists(model_path),
                'model_size': os.path.getsize(model_path) if os.path.exists(model_path) else 0,
                'n_estimators': self.gesture_models[gesture_name].n_estimators,
                'feature_importances': self.gesture_models[gesture_name].feature_importances_.tolist()
            }
            return stats
        except Exception as e:
            return {'error': str(e)}
    
    def delete_gesture_model(self, gesture_name: str) -> bool:
        """
        Elimina un modelo de gesto.
        
        Args:
            gesture_name: Nombre del gesto a eliminar
            
        Returns:
            True si se eliminó correctamente, False en caso contrario
        """
        try:
            model_path = os.path.join(self.models_dir, f'{gesture_name}.pkl')
            if os.path.exists(model_path):
                os.remove(model_path)
            
            if gesture_name in self.gesture_models:
                del self.gesture_models[gesture_name]
            
            return True
        except Exception as e:
            print(f"Error deleting gesture model {gesture_name}: {e}")
            return False
    
    def list_available_gestures(self) -> List[str]:
        """
        Lista todos los gestos disponibles.
        
        Returns:
            Lista de nombres de gestos
        """
        return list(self.gesture_models.keys())
    
    def execute_gesture_function(self, function_type: str, parameters: Dict) -> Dict:
        """Ejecuta una función asociada a un gesto"""
        try:
            return gesture_executor.execute_function(function_type, parameters)
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_image_for_landmarks(self, image_data: str) -> Dict:
        """
        Procesa una imagen base64 para extraer landmarks (simulado).
        En producción, esto se haría en el frontend con MediaPipe.
        
        Args:
            image_data: Imagen en formato base64
            
        Returns:
            Diccionario con landmarks simulados o error
        """
        try:
            # Decodificar imagen base64
            image_data = image_data.split(',')[1] if ',' in image_data else image_data
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
            
            # Convertir a OpenCV
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Aquí normalmente usaríamos MediaPipe, pero como no está disponible,
            # retornamos un mensaje indicando que se debe usar el frontend
            return {
                'success': False,
                'message': 'Use MediaPipe en el frontend para extraer landmarks',
                'image_processed': True,
                'image_size': cv_image.shape
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Instancia global del servicio
gesture_service = GestureRecognitionService()