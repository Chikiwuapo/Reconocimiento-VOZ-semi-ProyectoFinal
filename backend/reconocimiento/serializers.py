from rest_framework import serializers
from .models import Capture


class Phase1RequestSerializer(serializers.Serializer):
    """Serializer para la request del endpoint phase1"""
    images = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        max_length=15,
        help_text="Lista de imágenes en base64 (1-15 frames)"
    )


class Phase1ResponseSerializer(serializers.Serializer):
    """Serializer para la response del endpoint phase1"""
    status = serializers.CharField()
    matched = serializers.BooleanField()
    person_id = serializers.IntegerField(allow_null=True)
    score = serializers.FloatField()
    message = serializers.CharField(required=False)


class CaptureSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Capture"""
    
    class Meta:
        model = Capture
        fields = [
            'id', 'timestamp', 'match_score', 'matched', 
            'region_scores', 'frames_count', 'ip_address'
        ]
        read_only_fields = ['id', 'timestamp']