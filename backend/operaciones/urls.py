from django.urls import path
from . import views

app_name = 'operaciones'

urlpatterns = [
    # Vistas principales
    path('', views.index, name='index'),
    path('ejemplo_frontend.html', views.index, name='ejemplo_frontend'),
    path('entrenamiento/', views.vista_entrenamiento, name='entrenamiento'),
    path('interaccion/', views.vista_interaccion, name='interaccion'),
    path('guia/', views.vista_guia, name='guia'),
    path('frontend/', views.frontend_view, name='frontend'),
    
    # APIs para AJAX
    path('gestos-entrenados/', views.gestos_entrenados, name='gestos_entrenados'),
    path('gestos_entrenados/', views.gestos_entrenados, name='gestos_entrenados_direct'),
    path('guardar-gesto/', views.guardar_gesto, name='guardar_gesto'),
    path('reconocer-gesto/', views.reconocer_gesto, name='reconocer_gesto'),
    path('reconocer-dos-manos/', views.reconocer_dos_manos, name='reconocer_dos_manos'),
    path('calcular-operacion/', views.calcular_operacion, name='calcular_operacion'),
    
    # Acciones
    path('eliminar-gesto/<int:gesto_id>/', views.eliminar_gesto, name='eliminar_gesto'),
]