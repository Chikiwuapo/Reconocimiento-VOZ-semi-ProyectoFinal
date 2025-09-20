"""
URLs para autenticación del sistema de reconocimiento de gestos
"""
from django.urls import path
from . import auth_views

app_name = 'auth'

urlpatterns = [
    # ==================== VISTAS WEB ====================
    path('login/', auth_views.login_view, name='login'),
    path('register/', auth_views.register_view, name='register'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('profile/', auth_views.profile_view, name='profile'),
    
    # ==================== API REST ====================
    path('api/login/', auth_views.api_login, name='api-login'),
    path('api/register/', auth_views.api_register, name='api-register'),
    path('api/logout/', auth_views.api_logout, name='api-logout'),
    path('api/profile/', auth_views.api_user_profile, name='api-profile'),
    path('api/profile/update/', auth_views.api_update_profile, name='api-update-profile'),
    path('api/change-password/', auth_views.api_change_password, name='api-change-password'),
]