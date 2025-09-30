from django.urls import path
from . import views

app_name = 'chatbot_educativo'

urlpatterns = [
    # Interfaz principal del chatbot
    path('', views.chat_interface, name='chat_interface'),
    
    # API endpoints
    path('api/chat/', views.chat_api, name='chat_api'),
    path('api/health/', views.health_check, name='health_check'),
    path('api/history/', views.chat_history, name='chat_history'),
    path('api/clear-session/', views.clear_session, name='clear_session'),
    path('api/analytics/<str:session_id>/', views.session_analytics, name='session_analytics'),
    
    # Vista basada en clase
    path('chatbot-view/', views.ChatbotView.as_view(), name='chatbot_view'),
]