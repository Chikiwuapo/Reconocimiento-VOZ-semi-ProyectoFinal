from django.contrib import admin
from .models import GestoMano, HistorialReconocimiento, OperacionMatematica

@admin.register(GestoMano)
class GestoManoAdmin(admin.ModelAdmin):
    list_display = ['numero_vinculado', 'operacion_vinculada', 'nombre_display', 'activo', 'precision_entrenamiento', 'fecha_creacion']
    list_filter = ['activo', 'operacion_vinculada', 'fecha_creacion']
    search_fields = ['nombre_display']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    list_editable = ['activo']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero_vinculado', 'operacion_vinculada', 'nombre_display', 'activo')
        }),
        ('Datos de Entrenamiento', {
            'fields': ('landmarks_data', 'precision_entrenamiento'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

@admin.register(HistorialReconocimiento)
class HistorialReconocimientoAdmin(admin.ModelAdmin):
    list_display = ['gesto_reconocido', 'confianza', 'fecha_reconocimiento']
    list_filter = ['gesto_reconocido', 'fecha_reconocimiento']
    search_fields = ['gesto_reconocido__nombre_display']
    readonly_fields = ['fecha_reconocimiento']
    date_hierarchy = 'fecha_reconocimiento'
    
    def has_add_permission(self, request):
        return False  # Solo lectura desde el admin

@admin.register(OperacionMatematica)
class OperacionMatematicaAdmin(admin.ModelAdmin):
    list_display = ['expresion_completa', 'fecha_operacion']
    list_filter = ['operador', 'fecha_operacion']
    search_fields = ['operando1', 'operando2', 'resultado']
    readonly_fields = ['fecha_operacion']
    date_hierarchy = 'fecha_operacion'
    filter_horizontal = ['gestos_utilizados']
    
    def has_add_permission(self, request):
        return False  # Solo lectura desde el admin
