from django.urls import path
from .views.views import (
    index,
    login_view,
    register_view,
    mantenimiento_view,
    logout_view,
    api_encode,
    api_login,
    db_check,
    api_debug_decode,
)

urlpatterns = [
    path('', index, name='index'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('mantenimiento/', mantenimiento_view, name='mantenimiento'),
    path('logout/', logout_view, name='logout'),

    # APIs
    path('api/encode/', api_encode, name='api_encode'),
    path('api/login/', api_login, name='api_login'),
    path('api/db-check/', db_check, name='db_check'),
    path('api/debug-decode/', api_debug_decode, name='api_debug_decode'),
]
