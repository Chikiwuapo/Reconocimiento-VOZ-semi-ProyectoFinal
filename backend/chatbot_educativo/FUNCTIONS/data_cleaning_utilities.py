"""
Utilidades de limpieza y depuración de datos
Funciones especializadas para validar y limpiar datos de entrenamiento
"""

import re
import unicodedata
import logging
from typing import List, Dict, Any, Set, Tuple
from collections import Counter
import pandas as pd

class DataCleaningUtilities:
    """
    Utilidades avanzadas para limpieza y depuración de datos
    """
    
    def __init__(self):
        """
        Inicializa las utilidades de limpieza
        """
        # Patrones de limpieza
        self.patterns = {
            'extra_spaces': re.compile(r'\s+'),
            'special_quotes': re.compile(r'["""]'),
            'special_apostrophes': re.compile(r"[''']"),
            'html_tags': re.compile(r'<[^>]+>'),
            'urls': re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'),
            'emails': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            'phone_numbers': re.compile(r'(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'),
            'excessive_punctuation': re.compile(r'[.!?]{2,}'),
            'non_printable': re.compile(r'[\x00-\x1f\x7f-\x9f]')
        }
        
        # Palabras comunes que no deben estar solas
        self.stop_words_es = {
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'le', 'ha', 'me', 'si', 'sin', 'sobre', 'este', 'ya', 'entre', 'cuando', 'todo', 'esta', 'ser', 'son', 'dos', 'también', 'fue', 'había', 'era', 'muy', 'años', 'hasta', 'desde', 'está', 'mi', 'porque', 'qué', 'sólo', 'han', 'yo', 'hay', 'vez', 'puede', 'todos', 'así', 'nos', 'ni', 'parte', 'tiene', 'él', 'uno', 'donde', 'bien', 'tiempo', 'mismo', 'ese', 'ahora', 'cada', 'e', 'vida', 'otro', 'después', 'te', 'otros', 'aunque', 'esa', 'eso', 'hace', 'otra', 'gobierno', 'tan', 'durante', 'siempre', 'día', 'tanto', 'ella', 'tres', 'sí', 'dijo', 'sido', 'gran', 'país', 'según', 'menos', 'mundo', 'año', 'antes', 'estado', 'contra', 'sino', 'forma', 'caso', 'nada', 'hacer', 'general', 'estaba', 'poco', 'estos', 'presidente', 'mayor', 'y', 'guerra', 'días', 'podría', 'agua', 'más', 'muchos', 'decir', 'debe', 'política', 'cómo', 'tras', 'primer', 'hacia', 'algunas', 'dar', 'lugar', 'grupo', 'momento', 'manera', 'miembros', 'ellos', 'hecho', 'ciudad', 'personas', 'ejemplo', 'además', 'dentro', 'hombre', 'tanto', 'mujer', 'casa', 'bajo', 'última', 'trabajo', 'sistema', 'entonces', 'programa', 'social', 'al', 'muchas', 'primera', 'empresas', 'hoy', 'información', 'número', 'punto', 'derecho', 'desarrollo', 'proceso', 'nacional', 'público', 'proyecto', 'ley', 'casos', 'mano', 'mercado', 'problemas', 'servicio', 'historia', 'través', 'condiciones', 'precio', 'medio', 'millones', 'gracias', 'medios', 'fin', 'internacional', 'seguridad', 'actividad', 'centro', 'realidad', 'razón', 'especial', 'cosas', 'nivel', 'mesa', 'principio', 'relación', 'frente', 'tipo', 'línea', 'modelo', 'nuevos', 'ojos', 'final', 'blanco', 'cultura', 'económica', 'conjunto', 'control', 'libro', 'datos', 'personal', 'investigación', 'cambio', 'comunidad', 'universidad', 'llamar', 'incluir', 'seguir', 'conseguir', 'sistema', 'época', 'conocer', 'igual', 'política', 'unión', 'centro', 'recursos', 'mientras', 'valor', 'universidad', 'familia', 'hora', 'crear', 'situación', 'educación', 'producir', 'entrar', 'existir', 'salir', 'república', 'expresar'
        }
        
        logging.info("Utilidades de limpieza inicializadas")
    
    def normalize_unicode(self, text: str) -> str:
        """
        Normaliza caracteres Unicode
        
        Args:
            text: Texto a normalizar
            
        Returns:
            Texto normalizado
        """
        # Normalizar a forma NFD (descompuesta)
        text = unicodedata.normalize('NFD', text)
        
        # Remover caracteres de control
        text = ''.join(char for char in text if unicodedata.category(char) != 'Cc')
        
        # Normalizar de vuelta a NFC (compuesta)
        return unicodedata.normalize('NFC', text)
    
    def remove_html_tags(self, text: str) -> str:
        """
        Remueve etiquetas HTML del texto
        
        Args:
            text: Texto con posibles etiquetas HTML
            
        Returns:
            Texto sin etiquetas HTML
        """
        return self.patterns['html_tags'].sub('', text)
    
    def clean_punctuation(self, text: str) -> str:
        """
        Limpia y normaliza puntuación
        
        Args:
            text: Texto a limpiar
            
        Returns:
            Texto con puntuación normalizada
        """
        # Normalizar comillas
        text = self.patterns['special_quotes'].sub('"', text)
        text = self.patterns['special_apostrophes'].sub("'", text)
        
        # Reducir puntuación excesiva
        text = self.patterns['excessive_punctuation'].sub('.', text)
        
        # Espacios alrededor de puntuación
        text = re.sub(r'\s*([.!?])\s*', r'\1 ', text)
        text = re.sub(r'\s*([,;:])\s*', r'\1 ', text)
        
        return text
    
    def remove_sensitive_data(self, text: str) -> str:
        """
        Remueve datos sensibles como URLs, emails, teléfonos
        
        Args:
            text: Texto a limpiar
            
        Returns:
            Texto sin datos sensibles
        """
        # Remover URLs
        text = self.patterns['urls'].sub('[URL]', text)
        
        # Remover emails
        text = self.patterns['emails'].sub('[EMAIL]', text)
        
        # Remover números de teléfono
        text = self.patterns['phone_numbers'].sub('[TELÉFONO]', text)
        
        return text
    
    def validate_text_quality(self, text: str) -> Tuple[bool, List[str]]:
        """
        Valida la calidad del texto
        
        Args:
            text: Texto a validar
            
        Returns:
            Tuple con (es_válido, lista_de_problemas)
        """
        problems = []
        
        if not text or not text.strip():
            problems.append("Texto vacío")
            return False, problems
        
        # Verificar longitud mínima
        if len(text.strip()) < 3:
            problems.append("Texto demasiado corto")
        
        # Verificar si es solo espacios o puntuación
        if re.match(r'^[\s\W]*$', text):
            problems.append("Solo contiene espacios y puntuación")
        
        # Verificar caracteres no imprimibles
        if self.patterns['non_printable'].search(text):
            problems.append("Contiene caracteres no imprimibles")
        
        # Verificar si es solo una palabra común
        words = text.strip().lower().split()
        if len(words) == 1 and words[0] in self.stop_words_es:
            problems.append("Solo contiene una palabra común")
        
        # Verificar repetición excesiva de caracteres
        if re.search(r'(.)\1{4,}', text):
            problems.append("Repetición excesiva de caracteres")
        
        # Verificar si parece spam o sin sentido
        if len(set(text.lower().replace(' ', ''))) < 3:
            problems.append("Diversidad de caracteres muy baja")
        
        return len(problems) == 0, problems
    
    def detect_language_inconsistencies(self, texts: List[str]) -> Dict[str, Any]:
        """
        Detecta inconsistencias de idioma en una lista de textos
        
        Args:
            texts: Lista de textos a analizar
            
        Returns:
            Diccionario con estadísticas de idioma
        """
        # Patrones para detectar idiomas
        spanish_patterns = [
            r'\b(el|la|los|las|un|una|de|del|al|y|o|pero|si|no|que|como|cuando|donde|por|para|con|sin|sobre|bajo|entre|durante|después|antes|hasta|desde|hacia|según|contra|mediante|salvo|excepto|incluso|también|además|así|entonces|ahora|aquí|allí|hoy|ayer|mañana|siempre|nunca|quizás|tal vez)\b',
            r'ción\b', r'dad\b', r'mente\b', r'ando\b', r'iendo\b'
        ]
        
        english_patterns = [
            r'\b(the|a|an|and|or|but|if|not|that|as|when|where|for|with|without|on|under|between|during|after|before|until|from|to|according|against|through|except|even|also|so|then|now|here|there|today|yesterday|tomorrow|always|never|maybe|perhaps)\b',
            r'ing\b', r'ed\b', r'ly\b', r'tion\b', r'ness\b'
        ]
        
        stats = {
            'total_texts': len(texts),
            'spanish_likely': 0,
            'english_likely': 0,
            'mixed_language': 0,
            'unclear': 0,
            'problematic_texts': []
        }
        
        for i, text in enumerate(texts):
            if not text:
                continue
                
            text_lower = text.lower()
            
            spanish_matches = sum(len(re.findall(pattern, text_lower)) for pattern in spanish_patterns)
            english_matches = sum(len(re.findall(pattern, text_lower)) for pattern in english_patterns)
            
            if spanish_matches > english_matches * 2:
                stats['spanish_likely'] += 1
            elif english_matches > spanish_matches * 2:
                stats['english_likely'] += 1
            elif spanish_matches > 0 and english_matches > 0:
                stats['mixed_language'] += 1
                stats['problematic_texts'].append((i, text[:100]))
            else:
                stats['unclear'] += 1
        
        return stats
    
    def find_duplicates_advanced(self, records: List[Dict[str, Any]]) -> Dict[str, List[int]]:
        """
        Encuentra duplicados usando múltiples criterios
        
        Args:
            records: Lista de registros
            
        Returns:
            Diccionario con tipos de duplicados y sus índices
        """
        duplicates = {
            'exact_input': [],
            'similar_input': [],
            'exact_output': [],
            'similar_output': [],
            'exact_pair': []
        }
        
        # Crear índices para búsqueda eficiente
        input_to_indices = {}
        output_to_indices = {}
        pair_to_indices = {}
        
        for i, record in enumerate(records):
            input_text = record.get('input', '').strip().lower()
            output_text = record.get('output', '').strip().lower()
            pair_key = (input_text, output_text)
            
            # Duplicados exactos de input
            if input_text in input_to_indices:
                duplicates['exact_input'].extend([input_to_indices[input_text], i])
            else:
                input_to_indices[input_text] = i
            
            # Duplicados exactos de output
            if output_text in output_to_indices:
                duplicates['exact_output'].extend([output_to_indices[output_text], i])
            else:
                output_to_indices[output_text] = i
            
            # Duplicados exactos de par input-output
            if pair_key in pair_to_indices:
                duplicates['exact_pair'].extend([pair_to_indices[pair_key], i])
            else:
                pair_to_indices[pair_key] = i
        
        # Remover duplicados en las listas de índices
        for key in duplicates:
            duplicates[key] = list(set(duplicates[key]))
        
        return duplicates
    
    def generate_cleaning_report(self, original_data: List[Dict[str, Any]], 
                               cleaned_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Genera un reporte detallado de la limpieza
        
        Args:
            original_data: Datos originales
            cleaned_data: Datos después de limpieza
            
        Returns:
            Reporte de limpieza
        """
        report = {
            'original_count': len(original_data),
            'cleaned_count': len(cleaned_data),
            'removed_count': len(original_data) - len(cleaned_data),
            'removal_rate': (len(original_data) - len(cleaned_data)) / len(original_data) * 100 if original_data else 0,
            'categories_original': {},
            'categories_cleaned': {},
            'text_changes': {
                'input_changes': 0,
                'output_changes': 0,
                'category_changes': 0
            },
            'quality_improvements': {
                'normalized_unicode': 0,
                'cleaned_punctuation': 0,
                'removed_html': 0,
                'removed_sensitive_data': 0
            }
        }
        
        # Analizar categorías originales
        for record in original_data:
            category = record.get('category', 'unknown')
            report['categories_original'][category] = report['categories_original'].get(category, 0) + 1
        
        # Analizar categorías limpiadas
        for record in cleaned_data:
            category = record.get('category', 'unknown')
            report['categories_cleaned'][category] = report['categories_cleaned'].get(category, 0) + 1
        
        # Comparar cambios (solo si tienen el mismo número de registros)
        if len(original_data) == len(cleaned_data):
            for orig, clean in zip(original_data, cleaned_data):
                if orig.get('input', '') != clean.get('input', ''):
                    report['text_changes']['input_changes'] += 1
                if orig.get('output', '') != clean.get('output', ''):
                    report['text_changes']['output_changes'] += 1
                if orig.get('category', '') != clean.get('category', ''):
                    report['text_changes']['category_changes'] += 1
        
        return report
    
    def print_cleaning_report(self, report: Dict[str, Any]):
        """
        Imprime un reporte de limpieza formateado
        
        Args:
            report: Reporte generado por generate_cleaning_report
        """
        print("\n" + "="*60)
        print("🧹 REPORTE DE LIMPIEZA DE DATOS")
        print("="*60)
        print(f"📊 Registros originales: {report['original_count']}")
        print(f"✅ Registros después de limpieza: {report['cleaned_count']}")
        print(f"🗑️  Registros removidos: {report['removed_count']}")
        print(f"📉 Tasa de remoción: {report['removal_rate']:.2f}%")
        
        if report['text_changes']['input_changes'] > 0:
            print(f"\n🔄 Cambios realizados:")
            print(f"   • Inputs modificados: {report['text_changes']['input_changes']}")
            print(f"   • Outputs modificados: {report['text_changes']['output_changes']}")
            print(f"   • Categorías modificadas: {report['text_changes']['category_changes']}")
        
        if report['categories_original']:
            print(f"\n📋 Distribución de categorías:")
            print("   Antes → Después")
            all_categories = set(report['categories_original'].keys()) | set(report['categories_cleaned'].keys())
            for category in sorted(all_categories):
                orig_count = report['categories_original'].get(category, 0)
                clean_count = report['categories_cleaned'].get(category, 0)
                print(f"   • {category}: {orig_count} → {clean_count}")
        
        print("="*60)

# Instancia global para uso fácil
data_cleaner = DataCleaningUtilities()