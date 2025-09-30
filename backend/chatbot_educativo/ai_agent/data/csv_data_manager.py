"""
CSV Data Manager for AI Agent
Gestor de datos en formato CSV para almacenar datos de entrenamiento, parámetros y resultados
"""

import os
import csv
import pandas as pd
from datetime import datetime
import logging
from typing import Dict, List, Optional, Any
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CSVDataManager:
    """
    Gestor de datos en formato CSV para el sistema de entrenamiento
    """
    
    def __init__(self, data_dir="ai_agent/data/csv_storage"):
        self.data_dir = data_dir
        self.training_data_file = os.path.join(data_dir, "training_data.csv")
        self.training_params_file = os.path.join(data_dir, "training_parameters.csv")
        self.training_results_file = os.path.join(data_dir, "training_results.csv")
        self.model_metrics_file = os.path.join(data_dir, "model_metrics.csv")
        
        # Crear directorio si no existe
        os.makedirs(data_dir, exist_ok=True)
        
        # Inicializar archivos CSV si no existen
        self._initialize_csv_files()
    
    def _initialize_csv_files(self):
        """Inicializa los archivos CSV con sus headers correspondientes"""
        
        # Headers para datos de entrenamiento
        training_data_headers = [
            'id', 'text', 'intent', 'category', 'response', 'confidence', 
            'created_at', 'updated_at', 'source'
        ]
        
        # Headers para parámetros de entrenamiento
        training_params_headers = [
            'session_id', 'timestamp', 'max_features', 'max_length', 'embedding_dim',
            'lstm_units', 'dropout_rate', 'batch_size', 'epochs', 'learning_rate',
            'validation_split', 'use_trae_optimization', 'use_trae_augmentation',
            'use_trae_validation', 'model_type'
        ]
        
        # Headers para resultados de entrenamiento
        training_results_headers = [
            'session_id', 'timestamp', 'success', 'training_duration_seconds',
            'total_samples', 'categories_count', 'accuracy', 'loss', 'val_accuracy',
            'val_loss', 'model_path', 'notes'
        ]
        
        # Headers para métricas del modelo
        model_metrics_headers = [
            'session_id', 'timestamp', 'metric_name', 'metric_value', 'epoch',
            'dataset_type', 'model_type'
        ]
        
        # Crear archivos si no existen
        self._create_csv_if_not_exists(self.training_data_file, training_data_headers)
        self._create_csv_if_not_exists(self.training_params_file, training_params_headers)
        self._create_csv_if_not_exists(self.training_results_file, training_results_headers)
        self._create_csv_if_not_exists(self.model_metrics_file, model_metrics_headers)
    
    def initialize_csv_files(self):
        """Método público para inicializar archivos CSV"""
        return self._initialize_csv_files()
    
    def _create_csv_if_not_exists(self, file_path: str, headers: List[str]):
        """Crea un archivo CSV con headers si no existe"""
        if not os.path.exists(file_path):
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
            logger.info(f"Archivo CSV creado: {file_path}")
    
    def save_training_data(self, training_data: List[Dict], source: str = "manual"):
        """
        Guarda datos de entrenamiento en formato CSV
        """
        try:
            timestamp = datetime.now().isoformat()
            
            # Preparar datos para CSV
            csv_rows = []
            for i, item in enumerate(training_data):
                row = [
                    f"{source}_{timestamp}_{i}",  # id único
                    item.get('text', ''),
                    item.get('intent', ''),
                    item.get('category', ''),
                    item.get('response', ''),
                    item.get('confidence', 0.5),
                    timestamp,
                    timestamp,
                    source
                ]
                csv_rows.append(row)
            
            # Escribir al archivo CSV
            with open(self.training_data_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(csv_rows)
            
            logger.info(f"✅ {len(csv_rows)} registros de entrenamiento guardados en CSV")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando datos de entrenamiento: {e}")
            return False
    
    def save_training_parameters(self, params: Dict, session_id: str = None):
        """
        Guarda parámetros de entrenamiento en formato CSV
        """
        try:
            if not session_id:
                session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            timestamp = datetime.now().isoformat()
            
            # Extraer parámetros del modelo
            model_settings = params.get('model_settings', {})
            training_settings = params.get('training_settings', {})
            trae_integration = params.get('trae_integration', {})
            
            row = [
                session_id,
                timestamp,
                model_settings.get('max_features', 10000),
                model_settings.get('max_length', 100),
                model_settings.get('embedding_dim', 128),
                model_settings.get('lstm_units', 64),
                model_settings.get('dropout_rate', 0.5),
                training_settings.get('batch_size', 32),
                training_settings.get('epochs', 50),
                training_settings.get('learning_rate', 0.001),
                training_settings.get('validation_split', 0.2),
                trae_integration.get('use_trae_optimization', False),
                trae_integration.get('use_trae_augmentation', False),
                trae_integration.get('use_trae_validation', False),
                params.get('model_type', 'tensorflow')
            ]
            
            with open(self.training_params_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(row)
            
            logger.info(f"✅ Parámetros de entrenamiento guardados para sesión: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando parámetros: {e}")
            return False
    
    def save_training_results(self, results: Dict, session_id: str = None):
        """
        Guarda resultados de entrenamiento en formato CSV
        """
        try:
            if not session_id:
                session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            timestamp = datetime.now().isoformat()
            
            # Extraer métricas del modelo
            model_metrics = results.get('model_metrics', {})
            data_info = results.get('data_info', {})
            
            row = [
                session_id,
                timestamp,
                results.get('success', False),
                results.get('training_duration_seconds', 0),
                data_info.get('total_samples', 0),
                data_info.get('categories', 0),
                model_metrics.get('accuracy', 0),
                model_metrics.get('loss', 0),
                model_metrics.get('val_accuracy', 0),
                model_metrics.get('val_loss', 0),
                results.get('model_path', ''),
                results.get('notes', '')
            ]
            
            with open(self.training_results_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(row)
            
            logger.info(f"✅ Resultados de entrenamiento guardados para sesión: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando resultados: {e}")
            return False
    
    def save_model_metrics(self, session_id: str, metrics: Dict, epoch: int = 0, 
                          dataset_type: str = "train", model_type: str = "tensorflow"):
        """
        Guarda métricas detalladas del modelo en formato CSV
        """
        try:
            timestamp = datetime.now().isoformat()
            csv_rows = []
            
            # Convertir métricas a filas CSV
            for metric_name, metric_value in metrics.items():
                row = [
                    session_id,
                    timestamp,
                    metric_name,
                    metric_value,
                    epoch,
                    dataset_type,
                    model_type
                ]
                csv_rows.append(row)
            
            with open(self.model_metrics_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(csv_rows)
            
            logger.info(f"✅ {len(csv_rows)} métricas guardadas para sesión: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando métricas: {e}")
            return False
    
    def load_training_parameters(self, limit: int = None) -> List[Dict]:
        """
        Carga parámetros de entrenamiento desde CSV
        """
        try:
            if not os.path.exists(self.training_params_file):
                logger.warning("Archivo de parámetros de entrenamiento no encontrado")
                return []
            
            df = pd.read_csv(self.training_params_file)
            
            # Limitar resultados si se especifica
            if limit:
                df = df.head(limit)
            
            # Convertir a lista de diccionarios
            return df.to_dict('records')
            
        except Exception as e:
            logger.error(f"❌ Error cargando parámetros de entrenamiento: {e}")
            return []
    
    def load_training_results(self, limit: int = None) -> List[Dict]:
        """
        Carga resultados de entrenamiento desde CSV
        """
        try:
            if not os.path.exists(self.training_results_file):
                logger.warning("Archivo de resultados de entrenamiento no encontrado")
                return []
            
            df = pd.read_csv(self.training_results_file)
            
            # Limitar resultados si se especifica
            if limit:
                df = df.head(limit)
            
            # Convertir a lista de diccionarios
            return df.to_dict('records')
            
        except Exception as e:
             logger.error(f"❌ Error cargando resultados de entrenamiento: {e}")
             return []
    
    def load_training_data(self, category: str = None, limit: int = None) -> List[Dict]:
        """
        Carga datos de entrenamiento desde CSV
        """
        try:
            if not os.path.exists(self.training_data_file):
                logger.warning("Archivo de datos de entrenamiento no encontrado")
                return []
            
            df = pd.read_csv(self.training_data_file)
            
            # Filtrar por categoría si se especifica
            if category:
                df = df[df['category'] == category]
            
            # Limitar resultados si se especifica
            if limit:
                df = df.head(limit)
            
            # Convertir a lista de diccionarios
            training_data = []
            for _, row in df.iterrows():
                training_data.append({
                    'text': row['text'],
                    'intent': row['intent'],
                    'category': row['category'],
                    'response': row['response'],
                    'confidence': row['confidence']
                })
            
            logger.info(f"✅ {len(training_data)} registros de entrenamiento cargados")
            return training_data
            
        except Exception as e:
            logger.error(f"❌ Error cargando datos de entrenamiento: {e}")
            return []
    
    def get_training_statistics(self) -> Dict:
        """
        Obtiene estadísticas de entrenamiento desde los archivos CSV
        """
        try:
            stats = {
                "total_training_sessions": 0,
                "latest_training": {},
                "model_performance_trend": [],
                "data_summary": {}
            }
            
            # Estadísticas de resultados de entrenamiento
            if os.path.exists(self.training_results_file):
                results_df = pd.read_csv(self.training_results_file)
                
                if not results_df.empty:
                    stats["total_training_sessions"] = len(results_df)
                    
                    # Último entrenamiento
                    latest = results_df.iloc[-1]
                    stats["latest_training"] = {
                        "session_id": latest['session_id'],
                        "timestamp": latest['timestamp'],
                        "accuracy": latest['accuracy'],
                        "duration_seconds": latest['training_duration_seconds'],
                        "total_samples": latest['total_samples']
                    }
                    
                    # Tendencia de rendimiento
                    stats["model_performance_trend"] = [
                        {
                            "session": i + 1,
                            "accuracy": row['accuracy'],
                            "timestamp": row['timestamp']
                        }
                        for i, (_, row) in enumerate(results_df.iterrows())
                    ]
            
            # Estadísticas de datos de entrenamiento
            if os.path.exists(self.training_data_file):
                data_df = pd.read_csv(self.training_data_file)
                
                if not data_df.empty:
                    stats["data_summary"] = {
                        "total_records": len(data_df),
                        "categories": data_df['category'].nunique(),
                        "unique_intents": data_df['intent'].nunique(),
                        "avg_confidence": data_df['confidence'].mean()
                    }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Error obteniendo estadísticas: {e}")
            return {"error": str(e)}
    
    def export_to_json(self, output_dir: str = "ai_agent/data/json_export"):
        """
        Exporta datos CSV a formato JSON para compatibilidad
        """
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            # Exportar datos de entrenamiento
            if os.path.exists(self.training_data_file):
                df = pd.read_csv(self.training_data_file)
                json_data = df.to_dict('records')
                
                with open(os.path.join(output_dir, 'training_data.json'), 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=2, ensure_ascii=False)
            
            # Exportar resultados de entrenamiento
            if os.path.exists(self.training_results_file):
                df = pd.read_csv(self.training_results_file)
                json_data = df.to_dict('records')
                
                with open(os.path.join(output_dir, 'training_results.json'), 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Datos exportados a JSON en: {output_dir}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error exportando a JSON: {e}")
            return False