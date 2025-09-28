from django.urls import path
from . import views

app_name = 'abecedario'

urlpatterns = [
    # APIs para AJAX
    path('api/letras-capturadas/', views.letras_capturadas, name='letras_capturadas'),
    path('api/guardar-gesto/', views.guardar_gesto, name='guardar_gesto'),
    path('api/reconocer-gesto/', views.reconocer_gesto, name='reconocer_gesto'),
    path('api/reconocer-dos-manos/', views.reconocer_dos_manos, name='reconocer_dos_manos'),
    path('api/estadisticas-practica/', views.estadisticas_practica, name='estadisticas_practica'),
    path('gestos_entrenados/', views.gestos_entrenados, name='gestos_entrenados'),
    
    # Acciones
    path('eliminar-gesto/<int:letra_id>/', views.eliminar_gesto, name='eliminar_gesto'),
]