import pickle
import os

# Cargar el vectorizer
path = os.path.join('chatbot_educativo', 'trained_models', 'enhanced_models', 'improved_enhanced_vectorizer_20250929_223652.pkl')
print('Cargando vectorizer...')

with open(path, 'rb') as f:
    vec = pickle.load(f)

print(f'Tipo: {type(vec)}')
print(f'Es dict: {isinstance(vec, dict)}')

if isinstance(vec, dict):
    print(f'Keys: {list(vec.keys())}')
    for key, value in vec.items():
        print(f'{key}: {type(value)}')
else:
    print(f'Atributos: {dir(vec)}')
    if hasattr(vec, 'transform'):
        print('✅ Tiene método transform')
    else:
        print('❌ NO tiene método transform')