#!/usr/bin/env python3
"""
Entrenador de modelo mejorado con datos expandidos
Entrena un nuevo modelo usando los datos expandidos y parámetros optimizados
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.ensemble import VotingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from scipy.sparse import hstack
import warnings
warnings.filterwarnings('ignore')

def load_expanded_training_data():
    """Cargar los datos de entrenamiento expandidos"""
    
    # Buscar el archivo más reciente de datos expandidos
    data_files = []
    if os.path.exists('training_data_archive'):
        for file in os.listdir('training_data_archive'):
            if file.startswith('expanded_training_data_') and file.endswith('.csv'):
                data_files.append(os.path.join('training_data_archive', file))
    
    if not data_files:
        print("No se encontraron archivos de datos expandidos")
        return None
    
    # Usar el archivo más reciente
    latest_file = max(data_files)
    print(f"Cargando datos expandidos: {latest_file}")
    
    try:
        df = pd.read_csv(latest_file)
        print(f"Datos cargados: {len(df)} ejemplos")
        
        # Mostrar distribución por categoría
        print("\nDistribución por categoría:")
        category_counts = df['category'].value_counts()
        for category, count in category_counts.items():
            print(f"  {category}: {count} ejemplos")
        
        return df
        
    except Exception as e:
        print(f"Error cargando datos: {e}")
        return None

def preprocess_data(df):
    """Preprocesar los datos de entrenamiento"""
    
    print("\n=== PREPROCESAMIENTO DE DATOS ===")
    
    # Limpiar textos
    df['question'] = df['question'].astype(str)
    df['question'] = df['question'].str.strip()
    
    # Eliminar ejemplos vacíos o muy cortos
    df = df[df['question'].str.len() > 2]
    
    # Filtrar categorías con muy pocos ejemplos (menos de 10)
    category_counts = df['category'].value_counts()
    valid_categories = category_counts[category_counts >= 10].index
    df = df[df['category'].isin(valid_categories)]
    
    print(f"Después del filtrado: {len(df)} ejemplos")
    print(f"Categorías válidas: {len(valid_categories)}")
    
    return df

def create_enhanced_vectorizers():
    """Crear vectorizadores mejorados"""
    
    # Vectorizador TF-IDF para palabras
    tfidf_word = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 3),  # Incluir trigramas
        min_df=2,
        max_df=0.95,
        stop_words=None,  # No usar stop words para español
        lowercase=True,
        analyzer='word'
    )
    
    # Vectorizador TF-IDF para caracteres
    tfidf_char = TfidfVectorizer(
        max_features=3000,
        ngram_range=(2, 5),  # N-gramas de caracteres
        min_df=2,
        max_df=0.95,
        lowercase=True,
        analyzer='char'
    )
    
    # Vectorizador de conteo
    count_vectorizer = CountVectorizer(
        max_features=2000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        lowercase=True,
        analyzer='word'
    )
    
    return {
        'tfidf_word': tfidf_word,
        'tfidf_char': tfidf_char,
        'count': count_vectorizer
    }

def create_optimized_ensemble():
    """Crear ensemble optimizado de clasificadores"""
    
    # Clasificadores base con parámetros optimizados
    classifiers = [
        ('rf', RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )),
        ('gb', GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=8,
            min_samples_split=5,
            random_state=42
        )),
        ('svm', SVC(
            kernel='rbf',
            C=1.0,
            gamma='scale',
            probability=True,
            random_state=42,
            class_weight='balanced'
        )),
        ('lr', LogisticRegression(
            C=1.0,
            max_iter=1000,
            random_state=42,
            class_weight='balanced',
            solver='liblinear'
        ))
    ]
    
    # Crear VotingClassifier con votación suave
    ensemble = VotingClassifier(
        estimators=classifiers,
        voting='soft'  # Usar probabilidades para mejor confianza
    )
    
    return ensemble

def train_improved_model(df):
    """Entrenar el modelo mejorado"""
    
    print("\n=== ENTRENAMIENTO DEL MODELO MEJORADO ===")
    
    # Preparar datos
    X = df['question'].values
    y = df['category'].values
    
    # Codificar etiquetas
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    print(f"Clases únicas: {len(label_encoder.classes_)}")
    
    # Dividir datos
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"Entrenamiento: {len(X_train)} ejemplos")
    print(f"Prueba: {len(X_test)} ejemplos")
    
    # Crear vectorizadores
    vectorizers = create_enhanced_vectorizers()
    
    # Entrenar vectorizadores y transformar datos
    print("\nEntrenando vectorizadores...")
    
    X_train_tfidf_word = vectorizers['tfidf_word'].fit_transform(X_train)
    X_train_tfidf_char = vectorizers['tfidf_char'].fit_transform(X_train)
    X_train_count = vectorizers['count'].fit_transform(X_train)
    
    # Combinar características
    X_train_combined = hstack([X_train_tfidf_word, X_train_tfidf_char, X_train_count])
    
    print(f"Características combinadas: {X_train_combined.shape}")
    
    # Crear y entrenar modelo
    print("\nEntrenando modelo ensemble...")
    model = create_optimized_ensemble()
    model.fit(X_train_combined, y_train)
    
    # Evaluar en conjunto de prueba
    print("\nEvaluando modelo...")
    
    X_test_tfidf_word = vectorizers['tfidf_word'].transform(X_test)
    X_test_tfidf_char = vectorizers['tfidf_char'].transform(X_test)
    X_test_count = vectorizers['count'].transform(X_test)
    X_test_combined = hstack([X_test_tfidf_word, X_test_tfidf_char, X_test_count])
    
    # Predicciones
    y_pred = model.predict(X_test_combined)
    y_pred_proba = model.predict_proba(X_test_combined)
    
    # Métricas
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Precisión: {accuracy:.4f}")
    
    # Confianza promedio
    max_probas = np.max(y_pred_proba, axis=1)
    avg_confidence = np.mean(max_probas)
    print(f"Confianza promedio: {avg_confidence:.4f}")
    
    # Análisis de confianza por categoría
    confidence_by_category = {}
    for i, category_idx in enumerate(y_test):
        category = label_encoder.inverse_transform([category_idx])[0]
        confidence = max_probas[i]
        
        if category not in confidence_by_category:
            confidence_by_category[category] = []
        confidence_by_category[category].append(confidence)
    
    print("\nConfianza promedio por categoría:")
    for category, confidences in confidence_by_category.items():
        avg_conf = np.mean(confidences)
        print(f"  {category}: {avg_conf:.3f}")
    
    # Reporte de clasificación
    print("\nReporte de clasificación:")
    target_names = label_encoder.inverse_transform(range(len(label_encoder.classes_)))
    report = classification_report(y_test, y_pred, target_names=target_names, output_dict=True)
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    return {
        'model': model,
        'vectorizers': vectorizers,
        'label_encoder': label_encoder,
        'metrics': {
            'accuracy': accuracy,
            'avg_confidence': avg_confidence,
            'confidence_by_category': {k: np.mean(v) for k, v in confidence_by_category.items()},
            'classification_report': report
        },
        'test_data': {
            'X_test': X_test,
            'y_test': y_test,
            'y_pred': y_pred,
            'y_pred_proba': y_pred_proba
        }
    }

def validate_model_performance(model_data):
    """Validar el rendimiento del modelo con casos específicos"""
    
    print("\n=== VALIDACIÓN CON CASOS ESPECÍFICOS ===")
    
    test_cases = [
        ('Hola', 'greeting'),
        ('¿Cómo inicio sesión?', 'authentication'),
        ('¿Qué cursos hay?', 'specific_questions'),
        ('¿Dónde está el panel principal?', 'dashboard'),
        ('¿Cómo hago operaciones aritméticas?', 'arithmetic'),
        ('Recetas de cocina', 'out_of_context')
    ]
    
    model = model_data['model']
    vectorizers = model_data['vectorizers']
    label_encoder = model_data['label_encoder']
    
    validation_results = []
    
    for question, expected_category in test_cases:
        # Vectorizar pregunta
        X_tfidf_word = vectorizers['tfidf_word'].transform([question])
        X_tfidf_char = vectorizers['tfidf_char'].transform([question])
        X_count = vectorizers['count'].transform([question])
        X_combined = hstack([X_tfidf_word, X_tfidf_char, X_count])
        
        # Predecir
        prediction = model.predict(X_combined)[0]
        probabilities = model.predict_proba(X_combined)[0]
        
        predicted_category = label_encoder.inverse_transform([prediction])[0]
        confidence = max(probabilities)
        
        is_correct = predicted_category == expected_category
        status = "✓" if is_correct else "✗"
        
        print(f"{status} '{question}' -> {predicted_category} ({confidence:.3f}) [esperado: {expected_category}]")
        
        validation_results.append({
            'question': question,
            'expected': expected_category,
            'predicted': predicted_category,
            'confidence': confidence,
            'correct': is_correct
        })
    
    # Estadísticas de validación
    correct_predictions = sum(1 for r in validation_results if r['correct'])
    validation_accuracy = correct_predictions / len(validation_results)
    avg_validation_confidence = np.mean([r['confidence'] for r in validation_results])
    
    print(f"\nValidación - Precisión: {validation_accuracy:.3f}")
    print(f"Validación - Confianza promedio: {avg_validation_confidence:.3f}")
    
    return validation_results

def save_improved_model(model_data, validation_results):
    """Guardar el modelo mejorado"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Crear directorio si no existe
    model_dir = "trained_models/enhanced_models"
    os.makedirs(model_dir, exist_ok=True)
    
    # Nombres de archivos
    model_file = f"{model_dir}/improved_enhanced_model_{timestamp}.pkl"
    vectorizer_file = f"{model_dir}/improved_enhanced_vectorizer_{timestamp}.pkl"
    encoder_file = f"{model_dir}/improved_enhanced_encoder_{timestamp}.pkl"
    
    try:
        # Guardar componentes
        with open(model_file, 'wb') as f:
            pickle.dump(model_data['model'], f)
        
        with open(vectorizer_file, 'wb') as f:
            pickle.dump(model_data['vectorizers'], f)
        
        with open(encoder_file, 'wb') as f:
            pickle.dump(model_data['label_encoder'], f)
        
        print(f"\n✓ Modelo guardado: {model_file}")
        print(f"✓ Vectorizadores guardados: {vectorizer_file}")
        print(f"✓ Encoder guardado: {encoder_file}")
        
        # Crear reporte de entrenamiento
        report = {
            'training_date': datetime.now().isoformat(),
            'model_files': {
                'model': model_file,
                'vectorizer': vectorizer_file,
                'encoder': encoder_file
            },
            'metrics': model_data['metrics'],
            'validation_results': validation_results,
            'model_info': {
                'type': 'improved_enhanced_voting_classifier',
                'estimators': len(model_data['model'].estimators),
                'features': {
                    'tfidf_word_features': model_data['vectorizers']['tfidf_word'].get_feature_names_out().shape[0],
                    'tfidf_char_features': model_data['vectorizers']['tfidf_char'].get_feature_names_out().shape[0],
                    'count_features': model_data['vectorizers']['count'].get_feature_names_out().shape[0]
                },
                'classes': len(model_data['label_encoder'].classes_)
            }
        }
        
        # Guardar reporte
        report_file = f"trained_models/history_files/improved_enhanced_training_report_{timestamp}.json"
        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"✓ Reporte guardado: {report_file}")
        
        return {
            'model_file': model_file,
            'vectorizer_file': vectorizer_file,
            'encoder_file': encoder_file,
            'report_file': report_file
        }
        
    except Exception as e:
        print(f"Error guardando modelo: {e}")
        return None

def main():
    """Función principal"""
    
    print("=== ENTRENADOR DE MODELO MEJORADO ===")
    print("Entrenando modelo con datos expandidos y parámetros optimizados...\n")
    
    # Cargar datos expandidos
    df = load_expanded_training_data()
    if df is None:
        print("No se pudieron cargar los datos de entrenamiento")
        return
    
    # Preprocesar datos
    df = preprocess_data(df)
    
    # Entrenar modelo
    model_data = train_improved_model(df)
    
    # Validar rendimiento
    validation_results = validate_model_performance(model_data)
    
    # Guardar modelo
    saved_files = save_improved_model(model_data, validation_results)
    
    if saved_files:
        print(f"\n🎉 ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
        print(f"📊 Precisión: {model_data['metrics']['accuracy']:.3f}")
        print(f"🎯 Confianza promedio: {model_data['metrics']['avg_confidence']:.3f}")
        print(f"📁 Archivos guardados en: trained_models/enhanced_models/")
        
        print(f"\n=== PRÓXIMOS PASOS ===")
        print(f"1. Actualizar la API para usar el nuevo modelo")
        print(f"2. Probar el modelo en producción")
        print(f"3. Monitorear el rendimiento mejorado")
    else:
        print("❌ Error guardando el modelo")

if __name__ == "__main__":
    main()