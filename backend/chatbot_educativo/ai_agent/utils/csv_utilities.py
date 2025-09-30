"""
CSV Utilities
Utilidades para manejo de archivos CSV en el sistema de entrenamiento
"""

import os
import csv
import pandas as pd
from datetime import datetime
import logging
from typing import Dict, List, Optional, Any, Union
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CSVUtilities:
    """
    Utilidades para operaciones con archivos CSV
    """
    
    @staticmethod
    def create_csv_with_headers(file_path: str, headers: List[str], overwrite: bool = False):
        """
        Crea un archivo CSV con headers específicos
        """
        try:
            if os.path.exists(file_path) and not overwrite:
                logger.info(f"Archivo CSV ya existe: {file_path}")
                return True
            
            # Crear directorio si no existe
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
            
            logger.info(f"✅ Archivo CSV creado: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creando archivo CSV: {e}")
            return False
    
    @staticmethod
    def append_to_csv(file_path: str, data: Union[List, List[List]], headers: List[str] = None):
        """
        Añade datos a un archivo CSV existente
        """
        try:
            # Verificar si el archivo existe
            file_exists = os.path.exists(file_path)
            
            # Crear archivo con headers si no existe
            if not file_exists and headers:
                CSVUtilities.create_csv_with_headers(file_path, headers)
            
            # Preparar datos para escritura
            if data and isinstance(data[0], dict):
                # Si los datos son diccionarios, convertir a listas
                if not headers:
                    headers = list(data[0].keys())
                rows = [[item.get(header, '') for header in headers] for item in data]
            elif data and isinstance(data[0], list):
                # Si los datos ya son listas
                rows = data
            else:
                # Datos individuales
                rows = [data] if not isinstance(data[0], list) else data
            
            # Escribir datos
            with open(file_path, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(rows)
            
            logger.info(f"✅ {len(rows)} filas añadidas a: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error añadiendo datos a CSV: {e}")
            return False
    
    @staticmethod
    def read_csv_to_dict(file_path: str, limit: int = None, filter_column: str = None, 
                        filter_value: Any = None) -> List[Dict]:
        """
        Lee un archivo CSV y lo convierte a lista de diccionarios
        """
        try:
            if not os.path.exists(file_path):
                logger.warning(f"Archivo CSV no encontrado: {file_path}")
                return []
            
            df = pd.read_csv(file_path)
            
            # Aplicar filtros si se especifican
            if filter_column and filter_value and filter_column in df.columns:
                df = df[df[filter_column] == filter_value]
            
            # Limitar resultados si se especifica
            if limit:
                df = df.head(limit)
            
            # Convertir a lista de diccionarios
            return df.to_dict('records')
            
        except Exception as e:
            logger.error(f"❌ Error leyendo CSV: {e}")
            return []
    
    @staticmethod
    def get_csv_statistics(file_path: str) -> Dict:
        """
        Obtiene estadísticas básicas de un archivo CSV
        """
        try:
            if not os.path.exists(file_path):
                return {"error": "Archivo no encontrado"}
            
            df = pd.read_csv(file_path)
            
            stats = {
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "columns": list(df.columns),
                "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024 / 1024,
                "null_values": df.isnull().sum().to_dict(),
                "data_types": df.dtypes.to_dict()
            }
            
            # Estadísticas numéricas si hay columnas numéricas
            numeric_columns = df.select_dtypes(include=['number']).columns
            if len(numeric_columns) > 0:
                stats["numeric_summary"] = df[numeric_columns].describe().to_dict()
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Error obteniendo estadísticas: {e}")
            return {"error": str(e)}
    
    @staticmethod
    def merge_csv_files(file_paths: List[str], output_path: str, 
                       remove_duplicates: bool = True) -> bool:
        """
        Combina múltiples archivos CSV en uno solo
        """
        try:
            if not file_paths:
                logger.error("No se proporcionaron archivos para combinar")
                return False
            
            combined_df = pd.DataFrame()
            
            for file_path in file_paths:
                if os.path.exists(file_path):
                    df = pd.read_csv(file_path)
                    combined_df = pd.concat([combined_df, df], ignore_index=True)
                    logger.info(f"Archivo combinado: {file_path}")
                else:
                    logger.warning(f"Archivo no encontrado: {file_path}")
            
            # Remover duplicados si se especifica
            if remove_duplicates:
                initial_rows = len(combined_df)
                combined_df = combined_df.drop_duplicates()
                final_rows = len(combined_df)
                logger.info(f"Duplicados removidos: {initial_rows - final_rows}")
            
            # Guardar archivo combinado
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            combined_df.to_csv(output_path, index=False, encoding='utf-8')
            
            logger.info(f"✅ Archivos combinados guardados en: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error combinando archivos CSV: {e}")
            return False
    
    @staticmethod
    def csv_to_json(csv_path: str, json_path: str, orient: str = 'records') -> bool:
        """
        Convierte un archivo CSV a JSON
        """
        try:
            if not os.path.exists(csv_path):
                logger.error(f"Archivo CSV no encontrado: {csv_path}")
                return False
            
            df = pd.read_csv(csv_path)
            
            # Crear directorio de salida si no existe
            os.makedirs(os.path.dirname(json_path), exist_ok=True)
            
            # Convertir a JSON
            json_data = df.to_dict(orient)
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"✅ CSV convertido a JSON: {json_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error convirtiendo CSV a JSON: {e}")
            return False
    
    @staticmethod
    def json_to_csv(json_path: str, csv_path: str, flatten: bool = True) -> bool:
        """
        Convierte un archivo JSON a CSV
        """
        try:
            if not os.path.exists(json_path):
                logger.error(f"Archivo JSON no encontrado: {json_path}")
                return False
            
            with open(json_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            # Convertir a DataFrame
            if isinstance(json_data, list):
                df = pd.json_normalize(json_data) if flatten else pd.DataFrame(json_data)
            elif isinstance(json_data, dict):
                df = pd.json_normalize([json_data]) if flatten else pd.DataFrame([json_data])
            else:
                logger.error("Formato JSON no soportado")
                return False
            
            # Crear directorio de salida si no existe
            os.makedirs(os.path.dirname(csv_path), exist_ok=True)
            
            # Guardar como CSV
            df.to_csv(csv_path, index=False, encoding='utf-8')
            
            logger.info(f"✅ JSON convertido a CSV: {csv_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error convirtiendo JSON a CSV: {e}")
            return False
    
    @staticmethod
    def backup_csv(file_path: str, backup_dir: str = None) -> str:
        """
        Crea una copia de seguridad de un archivo CSV
        """
        try:
            if not os.path.exists(file_path):
                logger.error(f"Archivo CSV no encontrado: {file_path}")
                return None
            
            # Determinar directorio de backup
            if not backup_dir:
                backup_dir = os.path.join(os.path.dirname(file_path), "backups")
            
            os.makedirs(backup_dir, exist_ok=True)
            
            # Crear nombre de backup con timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.basename(file_path)
            name, ext = os.path.splitext(filename)
            backup_filename = f"{name}_backup_{timestamp}{ext}"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            # Copiar archivo
            import shutil
            shutil.copy2(file_path, backup_path)
            
            logger.info(f"✅ Backup creado: {backup_path}")
            return backup_path
            
        except Exception as e:
            logger.error(f"❌ Error creando backup: {e}")
            return None
    
    @staticmethod
    def validate_csv_structure(file_path: str, expected_headers: List[str]) -> Dict:
        """
        Valida la estructura de un archivo CSV
        """
        try:
            if not os.path.exists(file_path):
                return {"valid": False, "error": "Archivo no encontrado"}
            
            df = pd.read_csv(file_path, nrows=1)  # Solo leer headers
            actual_headers = list(df.columns)
            
            validation_result = {
                "valid": True,
                "expected_headers": expected_headers,
                "actual_headers": actual_headers,
                "missing_headers": [],
                "extra_headers": [],
                "header_match": actual_headers == expected_headers
            }
            
            # Verificar headers faltantes
            missing = [h for h in expected_headers if h not in actual_headers]
            if missing:
                validation_result["missing_headers"] = missing
                validation_result["valid"] = False
            
            # Verificar headers extra
            extra = [h for h in actual_headers if h not in expected_headers]
            if extra:
                validation_result["extra_headers"] = extra
            
            return validation_result
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    @staticmethod
    def clean_csv_data(file_path: str, output_path: str = None, 
                      remove_empty_rows: bool = True, 
                      remove_duplicates: bool = True,
                      fill_na_value: Any = None) -> bool:
        """
        Limpia datos de un archivo CSV
        """
        try:
            if not os.path.exists(file_path):
                logger.error(f"Archivo CSV no encontrado: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            initial_rows = len(df)
            
            # Remover filas vacías
            if remove_empty_rows:
                df = df.dropna(how='all')
                logger.info(f"Filas vacías removidas: {initial_rows - len(df)}")
            
            # Remover duplicados
            if remove_duplicates:
                before_dedup = len(df)
                df = df.drop_duplicates()
                logger.info(f"Duplicados removidos: {before_dedup - len(df)}")
            
            # Llenar valores NA
            if fill_na_value is not None:
                df = df.fillna(fill_na_value)
                logger.info(f"Valores NA llenados con: {fill_na_value}")
            
            # Guardar archivo limpio
            output_path = output_path or file_path
            df.to_csv(output_path, index=False, encoding='utf-8')
            
            logger.info(f"✅ Archivo CSV limpiado: {output_path}")
            logger.info(f"Filas finales: {len(df)} (de {initial_rows} originales)")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error limpiando CSV: {e}")
            return False