"""
Utilidades para procesamiento de gestos, entrenamiento y reconocimiento
"""
import numpy as np
import json
import logging
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import joblib
import os
from django.conf import settings

logger = logging.getLogger(__name__)


class GestureProcessor:
    """
    Clase para procesar datos de landmarks de gestos de mano
    """
    
    def __init__(self):
        self.hand_connections = [
            # Conexiones de la mano para MediaPipe
            (0, 1), (1, 2), (2, 3), (3, 4),  # Pulgar
            (0, 5), (5, 6), (6, 7), (7, 8),  # Índice
            (0, 9), (9, 10), (10, 11), (11, 12),  # Medio
            (0, 13), (13, 14), (14, 15), (15, 16),  # Anular
            (0, 17), (17, 18), (18, 19), (19, 20),  # Meñique
        ]
    
    def extract_features(self, landmark_data: List[Dict]) -> Dict[str, Any]:
        """
        Extrae características de los landmarks de la mano
        
        Args:
            landmark_data: Lista de landmarks con coordenadas x, y, z
            
        Returns:
            Dict con características extraídas
        """
        try:
            if not landmark_data or len(landmark_data) != 21:
                raise ValueError("Se requieren exactamente 21 landmarks")
            
            # Convertir a numpy array
            landmarks = np.array([[lm['x'], lm['y'], lm['z']] for lm in landmark_data])
            
            # Normalizar respecto a la muñeca (landmark 0)
            wrist = landmarks[0]
            normalized_landmarks = landmarks - wrist
            
            # Características básicas
            features = {}
            
            # 1. Distancias entre puntos clave
            features.update(self._calculate_distances(normalized_landmarks))
            
            # 2. Ángulos entre dedos
            features.update(self._calculate_angles(normalized_landmarks))
            
            # 3. Posiciones relativas de las puntas de los dedos
            features.update(self._calculate_fingertip_positions(normalized_landmarks))
            
            # 4. Características geométricas
            features.update(self._calculate_geometric_features(normalized_landmarks))
            
            # 5. Características de curvatura
            features.update(self._calculate_curvature_features(normalized_landmarks))
            
            return features
            
        except Exception as e:
            logger.error(f"Error extrayendo características: {e}")
            return {}
    
    def _calculate_distances(self, landmarks: np.ndarray) -> Dict[str, float]:
        """Calcula distancias entre puntos clave"""
        distances = {}
        
        # Distancias de puntas de dedos a la muñeca
        fingertips = [4, 8, 12, 16, 20]  # Pulgar, índice, medio, anular, meñique
        fingertip_names = ['thumb', 'index', 'middle', 'ring', 'pinky']
        
        for i, tip in enumerate(fingertips):
            dist = np.linalg.norm(landmarks[tip] - landmarks[0])
            distances[f'{fingertip_names[i]}_to_wrist'] = float(dist)
        
        # Distancias entre puntas de dedos consecutivos
        for i in range(len(fingertips) - 1):
            dist = np.linalg.norm(landmarks[fingertips[i]] - landmarks[fingertips[i+1]])
            distances[f'{fingertip_names[i]}_to_{fingertip_names[i+1]}'] = float(dist)
        
        return distances
    
    def _calculate_angles(self, landmarks: np.ndarray) -> Dict[str, float]:
        """Calcula ángulos entre segmentos de dedos"""
        angles = {}
        
        # Definir segmentos de dedos
        finger_segments = {
            'thumb': [(1, 2), (2, 3), (3, 4)],
            'index': [(5, 6), (6, 7), (7, 8)],
            'middle': [(9, 10), (10, 11), (11, 12)],
            'ring': [(13, 14), (14, 15), (15, 16)],
            'pinky': [(17, 18), (18, 19), (19, 20)]
        }
        
        for finger_name, segments in finger_segments.items():
            for i, (start, end) in enumerate(segments):
                if i < len(segments) - 1:
                    # Calcular ángulo entre segmentos consecutivos
                    next_start, next_end = segments[i + 1]
                    
                    v1 = landmarks[end] - landmarks[start]
                    v2 = landmarks[next_end] - landmarks[next_start]
                    
                    # Calcular ángulo
                    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                    cos_angle = np.clip(cos_angle, -1.0, 1.0)
                    angle = np.arccos(cos_angle)
                    
                    angles[f'{finger_name}_angle_{i}'] = float(angle)
        
        return angles
    
    def _calculate_fingertip_positions(self, landmarks: np.ndarray) -> Dict[str, float]:
        """Calcula posiciones relativas de las puntas de los dedos"""
        positions = {}
        
        fingertips = [4, 8, 12, 16, 20]
        fingertip_names = ['thumb', 'index', 'middle', 'ring', 'pinky']
        
        for i, (tip, name) in enumerate(zip(fingertips, fingertip_names)):
            # Posición relativa a la palma (centro de la mano)
            palm_center = np.mean(landmarks[[0, 5, 9, 13, 17]], axis=0)
            relative_pos = landmarks[tip] - palm_center
            
            positions[f'{name}_rel_x'] = float(relative_pos[0])
            positions[f'{name}_rel_y'] = float(relative_pos[1])
            positions[f'{name}_rel_z'] = float(relative_pos[2])
        
        return positions
    
    def _calculate_geometric_features(self, landmarks: np.ndarray) -> Dict[str, float]:
        """Calcula características geométricas de la mano"""
        features = {}
        
        # Área aproximada de la mano
        fingertips = landmarks[[4, 8, 12, 16, 20]]
        wrist = landmarks[0]
        
        # Calcular área usando el método del polígono
        points = np.vstack([fingertips, wrist.reshape(1, -1)])
        area = self._polygon_area(points[:, :2])  # Solo usar x, y
        features['hand_area'] = float(area)
        
        # Extensión de la mano (distancia máxima entre puntos)
        max_dist = 0
        for i in range(len(landmarks)):
            for j in range(i + 1, len(landmarks)):
                dist = np.linalg.norm(landmarks[i] - landmarks[j])
                max_dist = max(max_dist, dist)
        features['hand_span'] = float(max_dist)
        
        # Compacidad de la mano
        if area > 0:
            perimeter = self._calculate_perimeter(points[:, :2])
            compactness = (perimeter ** 2) / (4 * np.pi * area)
            features['hand_compactness'] = float(compactness)
        else:
            features['hand_compactness'] = 0.0
        
        return features
    
    def _calculate_curvature_features(self, landmarks: np.ndarray) -> Dict[str, float]:
        """Calcula características de curvatura de los dedos"""
        features = {}
        
        finger_chains = {
            'thumb': [1, 2, 3, 4],
            'index': [5, 6, 7, 8],
            'middle': [9, 10, 11, 12],
            'ring': [13, 14, 15, 16],
            'pinky': [17, 18, 19, 20]
        }
        
        for finger_name, chain in finger_chains.items():
            # Calcular curvatura total del dedo
            total_curvature = 0
            for i in range(1, len(chain) - 1):
                p1 = landmarks[chain[i-1]]
                p2 = landmarks[chain[i]]
                p3 = landmarks[chain[i+1]]
                
                # Calcular curvatura usando tres puntos
                curvature = self._calculate_curvature_3points(p1, p2, p3)
                total_curvature += curvature
            
            features[f'{finger_name}_curvature'] = float(total_curvature)
        
        return features
    
    def _polygon_area(self, points: np.ndarray) -> float:
        """Calcula el área de un polígono usando la fórmula del shoelace"""
        n = len(points)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += points[i][0] * points[j][1]
            area -= points[j][0] * points[i][1]
        return abs(area) / 2.0
    
    def _calculate_perimeter(self, points: np.ndarray) -> float:
        """Calcula el perímetro de un polígono"""
        perimeter = 0.0
        n = len(points)
        for i in range(n):
            j = (i + 1) % n
            dist = np.linalg.norm(points[i] - points[j])
            perimeter += dist
        return perimeter
    
    def _calculate_curvature_3points(self, p1: np.ndarray, p2: np.ndarray, p3: np.ndarray) -> float:
        """Calcula la curvatura usando tres puntos"""
        # Vectores
        v1 = p2 - p1
        v2 = p3 - p2
        
        # Producto cruzado para obtener la curvatura
        cross_product = np.cross(v1[:2], v2[:2])  # Solo usar x, y
        
        # Magnitudes
        mag1 = np.linalg.norm(v1)
        mag2 = np.linalg.norm(v2)
        
        if mag1 * mag2 == 0:
            return 0.0
        
        # Curvatura
        curvature = abs(cross_product) / (mag1 * mag2)
        return curvature
    
    def calculate_quality_score(self, landmark_data: List[Dict]) -> float:
        """
        Calcula un score de calidad para los landmarks detectados
        
        Args:
            landmark_data: Lista de landmarks
            
        Returns:
            Score de calidad entre 0 y 1
        """
        try:
            if not landmark_data or len(landmark_data) != 21:
                return 0.0
            
            # Convertir a numpy array
            landmarks = np.array([[lm['x'], lm['y'], lm['z']] for lm in landmark_data])
            
            quality_factors = []
            
            # 1. Completitud de los landmarks
            completeness = len([lm for lm in landmark_data if all(k in lm for k in ['x', 'y', 'z'])]) / 21
            quality_factors.append(completeness)
            
            # 2. Estabilidad (varianza de las posiciones)
            variance = np.var(landmarks, axis=0).mean()
            stability = 1.0 / (1.0 + variance * 10)  # Normalizar
            quality_factors.append(stability)
            
            # 3. Consistencia anatómica (distancias razonables)
            anatomical_consistency = self._check_anatomical_consistency(landmarks)
            quality_factors.append(anatomical_consistency)
            
            # 4. Visibilidad (coordenadas z positivas)
            z_coords = landmarks[:, 2]
            visibility = np.mean(z_coords > -0.1)  # Umbral de visibilidad
            quality_factors.append(visibility)
            
            # Score final como promedio ponderado
            weights = [0.3, 0.2, 0.3, 0.2]
            quality_score = np.average(quality_factors, weights=weights)
            
            return float(np.clip(quality_score, 0.0, 1.0))
            
        except Exception as e:
            logger.error(f"Error calculando quality score: {e}")
            return 0.0
    
    def _check_anatomical_consistency(self, landmarks: np.ndarray) -> float:
        """Verifica la consistencia anatómica de los landmarks"""
        try:
            # Verificar que las distancias entre articulaciones sean razonables
            finger_chains = [
                [1, 2, 3, 4],    # Pulgar
                [5, 6, 7, 8],    # Índice
                [9, 10, 11, 12], # Medio
                [13, 14, 15, 16], # Anular
                [17, 18, 19, 20] # Meñique
            ]
            
            consistency_scores = []
            
            for chain in finger_chains:
                # Calcular distancias entre articulaciones consecutivas
                distances = []
                for i in range(len(chain) - 1):
                    dist = np.linalg.norm(landmarks[chain[i]] - landmarks[chain[i+1]])
                    distances.append(dist)
                
                # Verificar que las distancias estén en un rango razonable
                if distances:
                    avg_dist = np.mean(distances)
                    std_dist = np.std(distances)
                    
                    # Score basado en la consistencia de las distancias
                    if avg_dist > 0:
                        consistency = 1.0 / (1.0 + std_dist / avg_dist)
                    else:
                        consistency = 0.0
                    
                    consistency_scores.append(consistency)
            
            return np.mean(consistency_scores) if consistency_scores else 0.0
            
        except Exception:
            return 0.0


class ModelTrainer:
    """
    Clase para entrenar modelos de reconocimiento de gestos
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
    
    def train_gesture_model(self, training_session) -> Dict[str, Any]:
        """
        Entrena un modelo para reconocer un gesto específico
        
        Args:
            training_session: Sesión de entrenamiento con muestras
            
        Returns:
            Dict con resultado del entrenamiento
        """
        try:
            # Obtener muestras válidas
            samples = training_session.samples.filter(is_valid=True)
            
            if samples.count() < 10:
                return {
                    'success': False,
                    'error': 'Se necesitan al menos 10 muestras válidas'
                }
            
            # Preparar datos de entrenamiento
            X, y = self._prepare_training_data(samples)
            
            if len(X) == 0:
                return {
                    'success': False,
                    'error': 'No se pudieron extraer características de las muestras'
                }
            
            # Dividir datos en entrenamiento y validación
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Escalar características
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Entrenar modelo
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluar modelo
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Guardar modelo
            model_data = self._save_model(training_session.gesture, accuracy)
            
            return {
                'success': True,
                'accuracy': float(accuracy),
                'model_data': model_data,
                'samples_used': len(X)
            }
            
        except Exception as e:
            logger.error(f"Error entrenando modelo: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _prepare_training_data(self, samples) -> Tuple[np.ndarray, np.ndarray]:
        """Prepara los datos para el entrenamiento"""
        X = []
        y = []
        
        processor = GestureProcessor()
        
        for sample in samples:
            try:
                # Extraer características si no están disponibles
                if not sample.features:
                    features = processor.extract_features(sample.landmark_data)
                    sample.features = features
                    sample.save()
                else:
                    features = sample.features
                
                if features:
                    # Convertir características a vector numérico
                    feature_vector = self._features_to_vector(features)
                    if len(feature_vector) > 0:
                        X.append(feature_vector)
                        y.append(1)  # Clase positiva para el gesto
                        
                        # Agregar muestras negativas (ruido)
                        negative_sample = self._generate_negative_sample(feature_vector)
                        X.append(negative_sample)
                        y.append(0)  # Clase negativa
                
            except Exception as e:
                logger.warning(f"Error procesando muestra {sample.id}: {e}")
                continue
        
        return np.array(X), np.array(y)
    
    def _features_to_vector(self, features: Dict[str, Any]) -> np.ndarray:
        """Convierte el diccionario de características a vector numérico"""
        try:
            # Ordenar las claves para consistencia
            if not self.feature_names:
                self.feature_names = sorted([k for k, v in features.items() if isinstance(v, (int, float))])
            
            vector = []
            for feature_name in self.feature_names:
                value = features.get(feature_name, 0.0)
                if isinstance(value, (int, float)) and not np.isnan(value):
                    vector.append(float(value))
                else:
                    vector.append(0.0)
            
            return np.array(vector)
            
        except Exception as e:
            logger.error(f"Error convirtiendo características: {e}")
            return np.array([])
    
    def _generate_negative_sample(self, positive_sample: np.ndarray) -> np.ndarray:
        """Genera una muestra negativa añadiendo ruido"""
        noise_factor = 0.3
        noise = np.random.normal(0, noise_factor, positive_sample.shape)
        return positive_sample + noise
    
    def _save_model(self, gesture, accuracy: float) -> Dict[str, Any]:
        """Guarda el modelo entrenado"""
        try:
            # Crear directorio para modelos si no existe
            models_dir = os.path.join(settings.MEDIA_ROOT, 'gesture_models')
            os.makedirs(models_dir, exist_ok=True)
            
            # Nombre del archivo del modelo
            model_filename = f'gesture_{gesture.id}_{gesture.user.id}.joblib'
            model_path = os.path.join(models_dir, model_filename)
            
            # Guardar modelo y scaler
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'accuracy': accuracy,
                'gesture_id': gesture.id
            }
            
            joblib.dump(model_data, model_path)
            
            return {
                'model_path': model_path,
                'feature_names': self.feature_names,
                'accuracy': accuracy
            }
            
        except Exception as e:
            logger.error(f"Error guardando modelo: {e}")
            return {}


class GestureRecognizer:
    """
    Clase para reconocer gestos en tiempo real
    """
    
    def __init__(self):
        self.processor = GestureProcessor()
        self.loaded_models = {}  # Cache de modelos cargados
    
    def recognize(self, landmark_data: List[Dict], user_gestures) -> Dict[str, Any]:
        """
        Reconoce un gesto a partir de los landmarks
        
        Args:
            landmark_data: Datos de landmarks de la mano
            user_gestures: QuerySet de gestos del usuario
            
        Returns:
            Dict con resultado del reconocimiento
        """
        try:
            # Extraer características
            features = self.processor.extract_features(landmark_data)
            
            if not features:
                return {
                    'recognized': False,
                    'error': 'No se pudieron extraer características'
                }
            
            best_match = None
            best_confidence = 0.0
            
            # Evaluar contra cada gesto entrenado
            for gesture in user_gestures:
                try:
                    confidence = self._evaluate_gesture(features, gesture)
                    
                    if confidence > best_confidence and confidence > 0.6:  # Umbral mínimo
                        best_confidence = confidence
                        best_match = gesture
                        
                except Exception as e:
                    logger.warning(f"Error evaluando gesto {gesture.id}: {e}")
                    continue
            
            if best_match:
                return {
                    'recognized': True,
                    'gesture': best_match,
                    'confidence': best_confidence
                }
            else:
                return {
                    'recognized': False,
                    'message': 'No se encontró coincidencia suficiente'
                }
                
        except Exception as e:
            logger.error(f"Error en reconocimiento: {e}")
            return {
                'recognized': False,
                'error': str(e)
            }
    
    def _evaluate_gesture(self, features: Dict[str, Any], gesture) -> float:
        """Evalúa la similitud con un gesto específico"""
        try:
            # Cargar modelo si no está en cache
            if gesture.id not in self.loaded_models:
                model_data = self._load_gesture_model(gesture)
                if not model_data:
                    return 0.0
                self.loaded_models[gesture.id] = model_data
            
            model_data = self.loaded_models[gesture.id]
            model = model_data['model']
            scaler = model_data['scaler']
            feature_names = model_data['feature_names']
            
            # Convertir características a vector
            feature_vector = self._features_to_vector(features, feature_names)
            
            if len(feature_vector) == 0:
                return 0.0
            
            # Escalar características
            feature_vector_scaled = scaler.transform([feature_vector])
            
            # Predecir probabilidad
            probabilities = model.predict_proba(feature_vector_scaled)[0]
            
            # Retornar probabilidad de la clase positiva (índice 1)
            if len(probabilities) > 1:
                return float(probabilities[1])
            else:
                return 0.0
                
        except Exception as e:
            logger.error(f"Error evaluando gesto {gesture.id}: {e}")
            return 0.0
    
    def _load_gesture_model(self, gesture) -> Optional[Dict[str, Any]]:
        """Carga el modelo de un gesto específico"""
        try:
            models_dir = os.path.join(settings.MEDIA_ROOT, 'gesture_models')
            model_filename = f'gesture_{gesture.id}_{gesture.user.id}.joblib'
            model_path = os.path.join(models_dir, model_filename)
            
            if os.path.exists(model_path):
                return joblib.load(model_path)
            else:
                logger.warning(f"Modelo no encontrado: {model_path}")
                return None
                
        except Exception as e:
            logger.error(f"Error cargando modelo para gesto {gesture.id}: {e}")
            return None
    
    def _features_to_vector(self, features: Dict[str, Any], feature_names: List[str]) -> np.ndarray:
        """Convierte características a vector usando nombres específicos"""
        try:
            vector = []
            for feature_name in feature_names:
                value = features.get(feature_name, 0.0)
                if isinstance(value, (int, float)) and not np.isnan(value):
                    vector.append(float(value))
                else:
                    vector.append(0.0)
            
            return np.array(vector)
            
        except Exception as e:
            logger.error(f"Error convirtiendo características: {e}")
            return np.array([])