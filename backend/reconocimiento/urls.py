from django.urls import path
from . import views
from django.views.generic import TemplateView

app_name = 'reconocimiento'

urlpatterns = [
    # Páginas principales
    path("login/", TemplateView.as_view(template_name="reconocimiento/login.html"), name="login"),
    path("register/", TemplateView.as_view(template_name="reconocimiento/register.html"), name="register"),
    path("maintenance/", views.maintenance_view, name="maintenance"),
    
    # Logout
    path("logout/", views.logout_view, name="logout"),
    
    # API endpoints
    path("api/phase1/", views.phase1_view, name="api-phase1"),
]