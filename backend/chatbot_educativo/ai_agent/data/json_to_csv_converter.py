"""
Conversor de datos de entrenamiento de JSON a CSV
Incluye validación, limpieza y depuración de datos
Mantiene la integridad de la información durante la conversión
"""

import json
import csv
import pandas as pd
import re
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Tuple
from comprehensive_training_data import comprehensive_data

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('json_to_csv_conversion.log'),
        logging.StreamHandler()
    ]
)

class JSONToCSVConverter:
    """
    Conversor de datos de entrenamiento de JSON a CSV con validación y limpieza
    """
    
    def __init__(self, output_dir: str = "csv_storage"):
        """
        Inicializa el conversor
        
        Args:
            output_dir: Directorio de salida para archivos CSV
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Estadísticas de conversión
        self.stats = {
            'total_records': 0,
            'valid_records': 0,
            'cleaned_records': 0,
            'invalid_records': 0,
            'categories': {},
            'errors': []
        }
        
        # Configuración de limpieza
        self.cleaning_config = {
            'remove_extra_spaces': True,
            'normalize_punctuation': True,
            'validate_encoding': True,
            'check_duplicates': True,
            'min_input_length': 2,
            'min_output_length': 5,
            'max_input_length': 500,
            'max_output_length': 2000
        }
        
        logging.info(f"Conversor inicializado. Directorio de salida: {self.output_dir}")
    
    def validate_record(self, record: Dict[str, Any], index: int) -> Tuple[bool, List[str]]:
        """
        Valida un registro individual
        
        Args:
            record: Registro a validar
            index: Índice del registro
            
        Returns:
            Tuple con (es_válido, lista_de_errores)
        """
        errors = []
        
        # Verificar campos requeridos
        required_fields = ['input', 'output', 'category']
        for field in required_fields:
            if field not in record:
                errors.append(f"Campo requerido '{field}' faltante")
            elif not record[field] or str(record[field]).strip() == '':
                errors.append(f"Campo '{field}' está vacío")
        
        if errors:
            return False, errors
        
        # Validar tipos de datos
        if not isinstance(record['input'], str):
            errors.append("Campo 'input' debe ser string")
        if not isinstance(record['output'], str):
            errors.append("Campo 'output' debe ser string")
        if not isinstance(record['category'], str):
            errors.append("Campo 'category' debe ser string")
        
        # Validar longitudes
        input_len = len(str(record['input']).strip())
        output_len = len(str(record['output']).strip())
        
        if input_len < self.cleaning_config['min_input_length']:
            errors.append(f"Input muy corto ({input_len} chars, mínimo {self.cleaning_config['min_input_length']})")
        if input_len > self.cleaning_config['max_input_length']:
            errors.append(f"Input muy largo ({input_len} chars, máximo {self.cleaning_config['max_input_length']})")
        if output_len < self.cleaning_config['min_output_length']:
            errors.append(f"Output muy corto ({output_len} chars, mínimo {self.cleaning_config['min_output_length']})")
        if output_len > self.cleaning_config['max_output_length']:
            errors.append(f"Output muy largo ({output_len} chars, máximo {self.cleaning_config['max_output_length']})")
        
        # Validar encoding
        if self.cleaning_config['validate_encoding']:
            try:
                record['input'].encode('utf-8')
                record['output'].encode('utf-8')
            except UnicodeEncodeError:
                errors.append("Problemas de encoding UTF-8")
        
        return len(errors) == 0, errors
    
    def clean_text(self, text: str) -> str:
        """
        Limpia y normaliza texto
        
        Args:
            text: Texto a limpiar
            
        Returns:
            Texto limpio
        """
        if not isinstance(text, str):
            text = str(text)
        
        # Remover espacios extra
        if self.cleaning_config['remove_extra_spaces']:
            text = re.sub(r'\s+', ' ', text.strip())
        
        # Normalizar puntuación
        if self.cleaning_config['normalize_punctuation']:
            # Normalizar comillas
            text = re.sub(r'["""]', '"', text)
            text = re.sub(r"[''']", "'", text)
            # Normalizar espacios alrededor de puntuación
            text = re.sub(r'\s*([.!?])\s*', r'\1 ', text)
            text = re.sub(r'\s*([,;:])\s*', r'\1 ', text)
        
        return text.strip()
    
    def clean_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Limpia un registro individual
        
        Args:
            record: Registro a limpiar
            
        Returns:
            Registro limpio
        """
        cleaned_record = record.copy()
        
        # Limpiar campos de texto
        if 'input' in cleaned_record:
            cleaned_record['input'] = self.clean_text(cleaned_record['input'])
        if 'output' in cleaned_record:
            cleaned_record['output'] = self.clean_text(cleaned_record['output'])
        if 'category' in cleaned_record:
            cleaned_record['category'] = cleaned_record['category'].strip().lower()
        
        # Asegurar campos opcionales
        if 'confidence' not in cleaned_record:
            cleaned_record['confidence'] = 1.0
        if 'source' not in cleaned_record:
            cleaned_record['source'] = 'json_conversion'
        
        # Agregar metadatos de conversión
        cleaned_record['converted_at'] = datetime.now().isoformat()
        cleaned_record['original_index'] = record.get('original_index', -1)
        
        return cleaned_record
    
    def detect_duplicates(self, data: List[Dict[str, Any]]) -> List[int]:
        """
        Detecta registros duplicados
        
        Args:
            data: Lista de registros
            
        Returns:
            Lista de índices de registros duplicados
        """
        seen = set()
        duplicates = []
        
        for i, record in enumerate(data):
            # Crear clave única basada en input y category
            key = (record.get('input', '').lower().strip(), 
                   record.get('category', '').lower().strip())
            
            if key in seen:
                duplicates.append(i)
            else:
                seen.add(key)
        
        return duplicates
    
    def convert_to_csv(self, json_data: List[Dict[str, Any]], output_filename: str) -> bool:
        """
        Convierte datos JSON a CSV con validación y limpieza
        
        Args:
            json_data: Datos en formato JSON
            output_filename: Nombre del archivo CSV de salida
            
        Returns:
            True si la conversión fue exitosa
        """
        try:
            logging.info(f"Iniciando conversión de {len(json_data)} registros")
            
            # Agregar índice original a cada registro
            for i, record in enumerate(json_data):
                record['original_index'] = i
            
            self.stats['total_records'] = len(json_data)
            
            # Detectar duplicados
            if self.cleaning_config['check_duplicates']:
                duplicates = self.detect_duplicates(json_data)
                logging.info(f"Detectados {len(duplicates)} registros duplicados")
            
            # Procesar cada registro
            valid_records = []
            
            for i, record in enumerate(json_data):
                # Validar registro
                is_valid, errors = self.validate_record(record, i)
                
                if not is_valid:
                    self.stats['invalid_records'] += 1
                    self.stats['errors'].extend([f"Registro {i}: {error}" for error in errors])
                    logging.warning(f"Registro {i} inválido: {errors}")
                    continue
                
                # Limpiar registro
                cleaned_record = self.clean_record(record)
                
                # Verificar si fue limpiado
                if (cleaned_record['input'] != record.get('input', '') or 
                    cleaned_record['output'] != record.get('output', '')):
                    self.stats['cleaned_records'] += 1
                
                valid_records.append(cleaned_record)
                self.stats['valid_records'] += 1
                
                # Actualizar estadísticas de categorías
                category = cleaned_record['category']
                if category not in self.stats['categories']:
                    self.stats['categories'][category] = 0
                self.stats['categories'][category] += 1
            
            # Guardar a CSV
            output_path = self.output_dir / output_filename
            
            if valid_records:
                df = pd.DataFrame(valid_records)
                df.to_csv(output_path, index=False, encoding='utf-8')
                logging.info(f"Datos guardados en {output_path}")
                
                # Guardar también estadísticas
                stats_path = self.output_dir / f"{output_filename.replace('.csv', '_stats.json')}"
                with open(stats_path, 'w', encoding='utf-8') as f:
                    json.dump(self.stats, f, indent=2, ensure_ascii=False)
                
                return True
            else:
                logging.error("No hay registros válidos para guardar")
                return False
                
        except Exception as e:
            logging.error(f"Error durante la conversión: {str(e)}")
            return False
    
    def print_conversion_summary(self):
        """
        Imprime un resumen de la conversión
        """
        print("\n" + "="*60)
        print("📊 RESUMEN DE CONVERSIÓN JSON A CSV")
        print("="*60)
        print(f"📈 Total de registros procesados: {self.stats['total_records']}")
        print(f"✅ Registros válidos: {self.stats['valid_records']}")
        print(f"🧹 Registros limpiados: {self.stats['cleaned_records']}")
        print(f"❌ Registros inválidos: {self.stats['invalid_records']}")
        
        if self.stats['categories']:
            print(f"\n📋 Distribución por categorías:")
            for category, count in sorted(self.stats['categories'].items()):
                print(f"   • {category}: {count} registros")
        
        if self.stats['errors']:
            print(f"\n⚠️  Errores encontrados ({len(self.stats['errors'])}):")
            for error in self.stats['errors'][:10]:  # Mostrar solo los primeros 10
                print(f"   • {error}")
            if len(self.stats['errors']) > 10:
                print(f"   ... y {len(self.stats['errors']) - 10} errores más")
        
        success_rate = (self.stats['valid_records'] / self.stats['total_records'] * 100) if self.stats['total_records'] > 0 else 0
        print(f"\n🎯 Tasa de éxito: {success_rate:.2f}%")
        print("="*60)

def main():
    """
    Función principal para ejecutar la conversión
    """
    print("🚀 Iniciando conversión de datos de entrenamiento JSON a CSV")
    
    # Crear conversor
    converter = JSONToCSVConverter()
    
    # Obtener datos de entrenamiento
    print("📥 Cargando datos de entrenamiento...")
    training_data = comprehensive_data.get_all_training_data()
    
    # Ejecutar conversión
    print("🔄 Ejecutando conversión con validación y limpieza...")
    success = converter.convert_to_csv(training_data, "training_data_converted.csv")
    
    # Mostrar resumen
    converter.print_conversion_summary()
    
    if success:
        print("✅ Conversión completada exitosamente!")
        return True
    else:
        print("❌ La conversión falló. Revisa los logs para más detalles.")
        return False

if __name__ == "__main__":
    main()