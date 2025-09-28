from django.urls import path
from . import views

app_name = 'vocales'

urlpatterns = [
    # APIs para AJAX
    path('api/vocales-capturadas/', views.vocales_capturadas, name='vocales_capturadas'),
    path('api/guardar-gesto/', views.guardar_gesto, name='guardar_gesto'),
    path('api/reconocer-gesto/', views.reconocer_gesto, name='reconocer_gesto'),
    path('api/reconocer-dos-manos/', views.reconocer_dos_manos, name='reconocer_dos_manos'),
    path('api/estadisticas-practica/', views.estadisticas_practica, name='estadisticas_practica'),
    path('gestos_entrenados/', views.gestos_entrenados, name='gestos_entrenados'),
    
    # Acciones
    path('eliminar-gesto/<int:vocal_id>/', views.eliminar_gesto, name='eliminar_gesto'),

    # Redirección a la SPA del frontend (desarrollo)
    path('capture', views.frontend_capture_redirect, name='frontend_capture_redirect_no_slash'),
    path('capture/', views.frontend_capture_redirect, name='frontend_capture_redirect'),
]