"""
URLs para la API REST del sistema de reconocimiento de gestos
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import api_views

app_name = 'operaciones_api'

# URLs de la API
urlpatterns = [
    # ==================== GESTURE FUNCTIONS ====================
    path('functions/', 
         api_views.GestureFunctionListCreateAPIView.as_view(), 
         name='function-list-create'),
    path('functions/<int:pk>/', 
         api_views.GestureFunctionDetailAPIView.as_view(), 
         name='function-detail'),
    
    # ==================== GESTURES ====================
    path('gestures/', 
         api_views.GestureListCreateAPIView.as_view(), 
         name='gesture-list-create'),
    path('gestures/<int:pk>/', 
         api_views.GestureDetailAPIView.as_view(), 
         name='gesture-detail'),
    path('gestures/<int:gesture_id>/activate/', 
         api_views.activate_gesture, 
         name='gesture-activate'),
    path('gestures/<int:gesture_id>/deactivate/', 
         api_views.deactivate_gesture, 
         name='gesture-deactivate'),
    path('gestures/active/', 
         api_views.active_gestures, 
         name='active-gestures'),
    
    # ==================== TRAINING SESSIONS ====================
    path('training-sessions/', 
         api_views.TrainingSessionListCreateAPIView.as_view(), 
         name='training-session-list-create'),
    path('training-sessions/<int:pk>/', 
         api_views.TrainingSessionDetailAPIView.as_view(), 
         name='training-session-detail'),
    
    # ==================== TRAINING SAMPLES ====================
    path('training-sessions/<int:session_id>/samples/', 
         api_views.save_training_sample, 
         name='save-training-sample'),
    path('training-sessions/<int:session_id>/train/', 
         api_views.train_model, 
         name='train-model'),
    
    # ==================== GESTURE RECOGNITION ====================
    path('recognize/', 
         api_views.recognize_gesture, 
         name='recognize-gesture'),
    
    # ==================== RECOGNITION LOGS ====================
    path('recognition-logs/', 
         api_views.RecognitionLogListAPIView.as_view(), 
         name='recognition-log-list'),
    
    # ==================== STATISTICS ====================
    path('statistics/user/', 
         api_views.UserStatisticsAPIView.as_view(), 
         name='user-statistics'),
    path('statistics/gestures/', 
         api_views.GestureStatisticsAPIView.as_view(), 
         name='gesture-statistics'),
    
    # ==================== UTILITY ENDPOINTS ====================
    path('choices/', 
         api_views.gesture_choices, 
         name='gesture-choices'),
]