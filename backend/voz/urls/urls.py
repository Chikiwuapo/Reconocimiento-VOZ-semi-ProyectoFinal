from django.urls import path
from ..views import views

app_name = 'voz'

urlpatterns = [
    # Vista principal
    path('', views.index, name='index'),
    
    # Páginas HTML
    path('registro.html', views.registro_page, name='registro_page'),
    path('login.html', views.login_page, name='login_page'),
    
    # APIs para reconocimiento de voz
    path('iniciar/', views.iniciar_reconocimiento, name='iniciar_reconocimiento'),
    path('detener/', views.detener_reconocimiento, name='detener_reconocimiento'),
    path('estado/', views.estado_reconocimiento, name='estado_reconocimiento'),
    
    # APIs para comandos
    path('comandos/', views.obtener_comandos, name='obtener_comandos'),
    path('api/comandos/', views.ComandoAPIView.as_view(), name='comandos_api'),
    
    # APIs para usuarios
    path('registrar/', views.registrar_usuario, name='registrar_usuario'),
    path('login/', views.login_usuario, name='login_usuario'),
    
    # APIs para registro y reconocimiento de voz
    path('api/register_audio/', views.register_audio, name='register_audio'),
    path('api/get_pending_token/', views.get_pending_token, name='get_pending_token'),
    path('api/recognize_command/', views.recognize_command, name='recognize_command'),
    path('api/voice_status/', views.voice_status, name='voice_status'),
    path('api/voice_profile/<int:profile_id>/', views.delete_voice_profile, name='delete_voice_profile'),
    path('api/check_registered_users/', views.check_registered_users, name='check_registered_users'),
]