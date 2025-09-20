"""
URLs para la aplicación de operaciones (reconocimiento de gestos)
"""
from django.urls import path, include
from . import views

app_name = 'operaciones'

urlpatterns = [
    # ==================== VISTAS PRINCIPALES ====================
    path('', views.dashboard, name='dashboard'),
    
    # ==================== GESTIÓN DE FUNCIONES ====================
    path('functions/', views.gesture_functions_list, name='function_list'),
    path('functions/create/', views.create_gesture_function, name='function_create'),
    
    # ==================== GESTIÓN DE GESTOS ====================
    path('gestures/', views.gestures_list, name='gesture_list'),
    path('gestures/create/', views.create_gesture, name='gesture_create'),
    path('gestures/<int:gesture_id>/', views.gesture_detail, name='gesture_detail'),
    path('gestures/<int:gesture_id>/delete/', views.delete_gesture, name='gesture_delete'),
    path('gestures/<int:gesture_id>/guide/', views.gesture_guide, name='gesture_guide'),
    
    # ==================== ENTRENAMIENTO ====================
    path('training/', views.training_view, name='training_dashboard'),
    path('training/<int:gesture_id>/start/', views.start_training_session, name='start_training'),
    path('training/session/<int:session_id>/', views.training_capture, name='training_capture'),
    path('training/session/<int:session_id>/sample/', views.save_training_sample, name='save_training_sample'),
    path('training/session/<int:session_id>/train/', views.train_model, name='train_model'),
    
    # ==================== RECONOCIMIENTO ====================
    path('interaction/', views.interaction_view, name='interaction_view'),
    path('recognize/', views.recognize_gesture, name='recognize_gesture'),
    
    # ==================== ESTADÍSTICAS ====================
    path('statistics/', views.statistics_view, name='statistics_view'),
    
    # ==================== AUTENTICACIÓN ====================
    path('auth/', include('operaciones.auth_urls')),
    
    # ==================== API REST ====================
    path('api/', include('operaciones.api_urls')),
]