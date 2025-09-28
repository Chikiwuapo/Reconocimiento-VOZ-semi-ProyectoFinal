"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('login.urls')),
    
    # API endpoints for each app
    path("api/operaciones/", include("operaciones.urls")),
    path("api/vocales/", include("vocales.urls")),
    path("api/abecedario/", include("abecedario.urls")),
    path("api/palabras/", include("palabras.urls")),
    
    # Web endpoints for each app
    path("operaciones/", include("operaciones.urls")),
    path("vocales/", include("vocales.urls")),
    path("abecedario/", include("abecedario.urls")),
    path("palabras/", include("palabras.urls")),
    
    path("", include("operaciones.urls")),  # URLs principales en la raíz
]
