from django.contrib import admin
from .models import Comando


@admin.register(Comando)
class ComandoAdmin(admin.ModelAdmin):
    list_display = ('id', 'comando', 'fecha')
    list_filter = ('fecha', 'comando')
    search_fields = ('comando',)
    ordering = ('-fecha',)