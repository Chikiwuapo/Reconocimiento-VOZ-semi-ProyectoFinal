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
    path('chatbot/', include('chatbot_educativo.urls', namespace='chatbot_educativo')),

    # API endpoints for each app
    path("api/operaciones/", include("operaciones.urls", namespace="api_operaciones")),
    path("api/vocales/", include("vocales.urls", namespace="api_vocales")),
    path("api/abecedario/", include("abecedario.urls", namespace="api_abecedario")),
    path("api/palabras/", include("palabras.urls", namespace="api_palabras")),
    
    # Web endpoints for each app
    path("operaciones/", include("operaciones.urls", namespace="web_operaciones")),
    path('voz/', include('voz.urls.urls')),
    path("vocales/", include("vocales.urls", namespace="web_vocales")),
    path("abecedario/", include("abecedario.urls", namespace="web_abecedario")),
    path("palabras/", include("palabras.urls", namespace="web_palabras")),
    
    path("", include("operaciones.urls", namespace="root_operaciones")),  # URLs principales en la raíz
]
