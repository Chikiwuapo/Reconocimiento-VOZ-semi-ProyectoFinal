#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # exit on error

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install system dependencies for AI/ML libraries
echo "🔧 Installing system dependencies..."
# These are handled by Render's Python runtime

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist (optional)
echo "👤 Creating superuser (if needed)..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
" || echo "Superuser creation skipped"

# Initialize chatbot models (if needed)
echo "🤖 Initializing chatbot models..."
python manage.py shell -c "
try:
    from chatbot_educativo.services.chatbot_service import ChatbotService
    service = ChatbotService()
    print('Chatbot service initialized successfully')
except Exception as e:
    print(f'Chatbot initialization warning: {e}')
" || echo "Chatbot initialization skipped"

echo "✅ Build completed successfully!"