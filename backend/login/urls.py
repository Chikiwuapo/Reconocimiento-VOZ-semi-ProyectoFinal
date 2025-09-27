from django.urls import path
from .views.views import (
    index,
    bienvenido_view,
    login_view,
    register_view,
    mantenimiento_view,
    estadistica_view,
    logout_view,
    api_encode,
    api_login,
    api_register_basic,
    api_validate_user,
    db_check,
    api_debug_decode,
)

urlpatterns = [
    path('', index, name='index'),
    path('bienvenido/', bienvenido_view, name='bienvenido'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('mantenimiento/', mantenimiento_view, name='mantenimiento'),
    path('estadistica/', estadistica_view, name='estadistica'),
    path('logout/', logout_view, name='logout'),

    # APIs
    path('api/encode/', api_encode, name='api_encode'),
    path('api/login/', api_login, name='api_login'),
    path('api/register-basic/', api_register_basic, name='api_register_basic'),
    path('api/validate-user/', api_validate_user, name='api_validate_user'),
    path('api/db-check/', db_check, name='db_check'),
    path('api/debug-decode/', api_debug_decode, name='api_debug_decode'),
]
