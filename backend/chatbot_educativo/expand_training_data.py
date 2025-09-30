#!/usr/bin/env python3
"""
Expansión de datos de entrenamiento para categorías con baja confianza
Basado en el análisis de confianza, expande los datos para mejorar el rendimiento del modelo
"""

import pandas as pd
import json
import os
from datetime import datetime
import random

def load_existing_training_data():
    """Cargar datos de entrenamiento existentes"""
    
    # Buscar archivos de datos de entrenamiento
    training_files = [
        'training_data_archive/enhanced_training_data_20250929_174839.csv',
        'ai_agent/data/user_questions_training_data_20250929_203151.csv',
        'training_data_archive/training_data_improved_20250929_175456.csv'
    ]
    
    all_data = []
    
    for file_path in training_files:
        if os.path.exists(file_path):
            try:
                df = pd.read_csv(file_path)
                print(f"Cargado: {file_path} - {len(df)} registros")
                
                # Normalizar nombres de columnas
                if 'input' in df.columns and 'question' not in df.columns:
                    df = df.rename(columns={'input': 'question'})
                
                # Asegurar que tenemos las columnas necesarias
                if 'question' in df.columns and 'category' in df.columns:
                    # Seleccionar solo las columnas que necesitamos
                    df = df[['question', 'category']].copy()
                    all_data.append(df)
                else:
                    print(f"  Advertencia: {file_path} no tiene las columnas esperadas")
                    print(f"  Columnas disponibles: {list(df.columns)}")
                    
            except Exception as e:
                print(f"Error cargando {file_path}: {e}")
    
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        # Eliminar duplicados
        combined_df = combined_df.drop_duplicates(subset=['question'], keep='first')
        print(f"Total de datos combinados: {len(combined_df)} registros únicos")
        return combined_df
    else:
        print("No se encontraron archivos de entrenamiento válidos")
        return pd.DataFrame(columns=['question', 'category'])

def get_category_statistics(df):
    """Obtener estadísticas por categoría"""
    
    category_stats = df['category'].value_counts()
    print("\n=== ESTADÍSTICAS ACTUALES POR CATEGORÍA ===")
    for category, count in category_stats.items():
        print(f"{category}: {count} ejemplos")
    
    return category_stats

def generate_expanded_examples():
    """Generar ejemplos expandidos para categorías problemáticas"""
    
    # Categorías problemáticas identificadas en el análisis
    problematic_categories = {
        'authentication': [
            '¿Cómo puedo crear una cuenta nueva?',
            'No recuerdo mi usuario',
            'Cambiar contraseña',
            'Problemas para acceder',
            'Recuperar acceso a mi cuenta',
            'Validar mi email',
            'Confirmar registro',
            'Activar mi cuenta',
            'Cerrar sesión',
            'Mantener sesión activa',
            'Autenticación de dos factores',
            'Verificar identidad',
            'Restablecer credenciales',
            'Acceso denegado',
            'Cuenta bloqueada',
            'Permisos de usuario',
            'Configurar perfil',
            'Datos de acceso',
            'Seguridad de cuenta',
            'Política de contraseñas'
        ],
        'specific_questions': [
            '¿Qué materias están disponibles?',
            'Lista de cursos ofrecidos',
            'Contenido del programa',
            'Duración de los cursos',
            'Requisitos previos',
            'Certificaciones disponibles',
            'Modalidades de estudio',
            'Horarios de clases',
            'Profesores del curso',
            'Material de estudio',
            'Evaluaciones del curso',
            'Cronograma académico',
            'Recursos adicionales',
            'Bibliografía recomendada',
            'Laboratorios prácticos',
            'Proyectos finales',
            'Metodología de enseñanza',
            'Objetivos de aprendizaje',
            'Competencias a desarrollar',
            'Nivel de dificultad'
        ],
        'dashboard': [
            'Ver mi panel de control',
            'Acceder al tablero principal',
            'Mostrar estadísticas personales',
            'Resumen de actividades',
            'Panel de usuario',
            'Métricas de rendimiento',
            'Historial de progreso',
            'Gráficos de avance',
            'Indicadores de desempeño',
            'Tablero de resultados',
            'Vista general del perfil',
            'Resumen ejecutivo',
            'Panel de navegación',
            'Menú principal',
            'Página de inicio',
            'Centro de control',
            'Vista panorámica',
            'Información consolidada',
            'Reportes personalizados',
            'Análisis de datos'
        ],
        'out_of_context': [
            'Recetas de comida italiana',
            'Pronóstico del tiempo mañana',
            'Resultados de fútbol',
            'Noticias internacionales',
            'Precio del dólar',
            'Horarios de transporte público',
            'Películas en cartelera',
            'Música popular actual',
            'Consejos de jardinería',
            'Cuidado de mascotas',
            'Turismo y viajes',
            'Moda y tendencias',
            'Salud y medicina',
            'Política nacional',
            'Economía mundial',
            'Tecnología móvil',
            'Redes sociales',
            'Entretenimiento',
            'Deportes extremos',
            'Arte y cultura'
        ],
        'arithmetic': [
            'Resolver ecuaciones lineales',
            'Operaciones con fracciones',
            'Cálculo de porcentajes',
            'Problemas de geometría',
            'Álgebra básica',
            'Trigonometría elemental',
            'Estadística descriptiva',
            'Probabilidades simples',
            'Números decimales',
            'Potencias y raíces',
            'Factorización',
            'Sistemas de ecuaciones',
            'Funciones matemáticas',
            'Gráficas y coordenadas',
            'Medidas de tendencia central',
            'Conversión de unidades',
            'Regla de tres',
            'Interés simple y compuesto',
            'Áreas y perímetros',
            'Volúmenes y capacidades'
        ],
        'greeting': [
            'Buenos días, ¿cómo está?',
            'Buenas noches',
            'Saludos cordiales',
            'Hola, ¿qué tal?',
            'Buen día',
            'Buenas tardes a todos',
            'Hola, ¿cómo van?',
            'Saludos desde aquí',
            'Muy buenas',
            'Hola, ¿todo bien?',
            'Buenos días, equipo',
            'Hola, ¿cómo están todos?',
            'Saludos y bendiciones',
            'Hola, ¿qué hay de nuevo?',
            'Buenos días, profesor',
            'Hola, ¿cómo te va?',
            'Saludos afectuosos',
            'Hola, ¿todo en orden?',
            'Buenos días, compañeros',
            'Hola, ¿cómo amanecieron?'
        ]
    }
    
    return problematic_categories

def create_variations(base_examples):
    """Crear variaciones de los ejemplos base"""
    
    variations = []
    
    # Patrones de variación
    question_starters = ['¿', '¿Cómo ', '¿Dónde ', '¿Qué ', '¿Cuál ', '¿Cuándo ', '¿Por qué ']
    polite_endings = [' por favor', ' gracias', ', por favor', ', gracias']
    
    for example in base_examples:
        variations.append(example)
        
        # Agregar variaciones con diferentes inicios de pregunta
        if not example.startswith('¿'):
            for starter in ['¿Cómo ', '¿Dónde puedo ', '¿Qué tal ']:
                if starter == '¿Cómo ':
                    variation = f"{starter}{example.lower()}?"
                elif starter == '¿Dónde puedo ':
                    variation = f"{starter}{example.lower()}?"
                else:
                    variation = f"{starter}{example.lower()}?"
                variations.append(variation)
        
        # Agregar variaciones con cortesía
        for ending in polite_endings:
            if not example.endswith(ending.strip()):
                variation = example.rstrip('?') + ending + ('?' if example.endswith('?') else '')
                variations.append(variation)
    
    return list(set(variations))  # Eliminar duplicados

def expand_training_data(existing_df):
    """Expandir los datos de entrenamiento"""
    
    print("\n=== EXPANDIENDO DATOS DE ENTRENAMIENTO ===")
    
    # Obtener ejemplos expandidos
    expanded_examples = generate_expanded_examples()
    
    new_data = []
    
    for category, examples in expanded_examples.items():
        print(f"\nProcesando categoría: {category}")
        
        # Crear variaciones para cada ejemplo
        all_variations = create_variations(examples)
        
        print(f"  Ejemplos base: {len(examples)}")
        print(f"  Con variaciones: {len(all_variations)}")
        
        # Agregar a los nuevos datos
        for example in all_variations:
            new_data.append({
                'question': example,
                'category': category
            })
    
    # Crear DataFrame con nuevos datos
    new_df = pd.DataFrame(new_data)
    
    # Combinar con datos existentes
    if not existing_df.empty:
        # Filtrar ejemplos que ya existen
        existing_questions = set(existing_df['question'].str.lower())
        new_df = new_df[~new_df['question'].str.lower().isin(existing_questions)]
        
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        combined_df = new_df
    
    print(f"\nNuevos ejemplos agregados: {len(new_df)}")
    print(f"Total de ejemplos: {len(combined_df)}")
    
    return combined_df

def balance_categories(df, target_min_samples=50):
    """Balancear categorías para tener un mínimo de ejemplos"""
    
    print(f"\n=== BALANCEANDO CATEGORÍAS (mínimo {target_min_samples} ejemplos) ===")
    
    category_counts = df['category'].value_counts()
    
    balanced_data = []
    
    for category in category_counts.index:
        category_data = df[df['category'] == category].copy()
        current_count = len(category_data)
        
        if current_count < target_min_samples:
            # Necesitamos más ejemplos para esta categoría
            needed = target_min_samples - current_count
            
            # Duplicar ejemplos existentes con pequeñas variaciones
            existing_questions = category_data['question'].tolist()
            
            for i in range(needed):
                base_question = random.choice(existing_questions)
                
                # Crear variación simple
                variations = [
                    base_question,
                    base_question.replace('¿', '').replace('?', '') + '?',
                    f"Me puedes ayudar con: {base_question.lower()}",
                    f"Necesito información sobre: {base_question.lower()}",
                    f"Tengo una pregunta: {base_question.lower()}"
                ]
                
                variation = random.choice(variations)
                balanced_data.append({
                    'question': variation,
                    'category': category
                })
        
        # Agregar datos originales
        for _, row in category_data.iterrows():
            balanced_data.append({
                'question': row['question'],
                'category': row['category']
            })
    
    balanced_df = pd.DataFrame(balanced_data)
    balanced_df = balanced_df.drop_duplicates(subset=['question'], keep='first')
    
    print("Distribución final por categoría:")
    final_counts = balanced_df['category'].value_counts()
    for category, count in final_counts.items():
        print(f"  {category}: {count} ejemplos")
    
    return balanced_df

def save_expanded_data(df):
    """Guardar los datos expandidos"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"training_data_archive/expanded_training_data_{timestamp}.csv"
    
    # Crear directorio si no existe
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    try:
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"\nDatos expandidos guardados en: {filename}")
        
        # Crear reporte de expansión
        report = {
            'expansion_date': datetime.now().isoformat(),
            'total_examples': len(df),
            'category_distribution': df['category'].value_counts().to_dict(),
            'filename': filename,
            'expansion_summary': {
                'new_categories_added': [],
                'categories_expanded': list(df['category'].unique()),
                'total_categories': len(df['category'].unique())
            }
        }
        
        report_filename = f"reports/training_expansion_report_{timestamp}.json"
        os.makedirs(os.path.dirname(report_filename), exist_ok=True)
        
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Reporte de expansión guardado en: {report_filename}")
        
        return filename, report_filename
        
    except Exception as e:
        print(f"Error guardando datos: {e}")
        return None, None

def main():
    """Función principal"""
    
    print("=== EXPANSIÓN DE DATOS DE ENTRENAMIENTO ===")
    print("Expandiendo datos para categorías con baja confianza...\n")
    
    # Cargar datos existentes
    existing_df = load_existing_training_data()
    
    # Mostrar estadísticas actuales
    if not existing_df.empty:
        get_category_statistics(existing_df)
    
    # Expandir datos
    expanded_df = expand_training_data(existing_df)
    
    # Balancear categorías
    balanced_df = balance_categories(expanded_df, target_min_samples=60)
    
    # Guardar datos expandidos
    data_file, report_file = save_expanded_data(balanced_df)
    
    if data_file:
        print(f"\n✓ Expansión completada exitosamente")
        print(f"✓ Archivo de datos: {data_file}")
        print(f"✓ Reporte: {report_file}")
        print(f"✓ Total de ejemplos: {len(balanced_df)}")
        
        print("\n=== PRÓXIMOS PASOS ===")
        print("1. Revisar los datos expandidos")
        print("2. Entrenar un nuevo modelo con estos datos")
        print("3. Validar el rendimiento del modelo mejorado")
    else:
        print("❌ Error en la expansión de datos")

if __name__ == "__main__":
    main()