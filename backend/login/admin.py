from django.contrib import admin
from .models.models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("email", "dni", "nombres", "apellidos", "is_active", "is_staff")
    search_fields = ("email", "dni", "nombres", "apellidos")
    readonly_fields = ("date_joined",)

# Register your models here.
