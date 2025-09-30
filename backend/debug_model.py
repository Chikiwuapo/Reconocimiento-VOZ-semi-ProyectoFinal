import pickle
import os

# Cargar el modelo y vectorizer
model_path = os.path.join('chatbot_educativo', 'trained_models', 'enhanced_models', 'improved_enhanced_model_20250929_223652.pkl')
vectorizer_path = os.path.join('chatbot_educativo', 'trained_models', 'enhanced_models', 'improved_enhanced_vectorizer_20250929_223652.pkl')

print('Cargando modelo...')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

print('Cargando vectorizer...')
with open(vectorizer_path, 'rb') as f:
    vectorizer = pickle.load(f)

print(f'Tipo de modelo: {type(model)}')
print(f'Tipo de vectorizer: {type(vectorizer)}')

if hasattr(model, 'n_features_in_'):
    print(f'Features esperadas por el modelo: {model.n_features_in_}')

if isinstance(vectorizer, dict):
    for key, vec in vectorizer.items():
        if hasattr(vec, 'vocabulary_'):
            print(f'{key} - Features del vectorizer: {len(vec.vocabulary_)}')
        else:
            print(f'{key} - No tiene vocabulary_')

# Probar transformación
test_text = "¿Qué cursos tienen?"
print(f'\nProbando con texto: "{test_text}"')

if isinstance(vectorizer, dict) and 'tfidf_word' in vectorizer:
    main_vec = vectorizer['tfidf_word']
    transformed = main_vec.transform([test_text])
    print(f'Dimensiones después de transformar: {transformed.shape}')