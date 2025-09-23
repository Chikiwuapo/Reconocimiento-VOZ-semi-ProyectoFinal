from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    """Manager para el modelo de usuario personalizado basado en email."""

    def create_user(self, email, dni, nombres, apellidos, password=None, **extra):
        if not email:
            raise ValueError("El email es obligatorio")
        if not dni:
            raise ValueError("El DNI es obligatorio")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            dni=dni,
            nombres=nombres,
            apellidos=apellidos,
            **extra,
        )
        if password:
            user.set_password(password)
        else:
            # Para flujos solo faciales, se deja sin contraseña usable
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, dni, nombres="Admin", apellidos="Admin", password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        if extra.get("is_staff") is not True:
            raise ValueError("Superuser debe tener is_staff=True")
        if extra.get("is_superuser") is not True:
            raise ValueError("Superuser debe tener is_superuser=True")
        return self.create_user(email, dni, nombres, apellidos, password, **extra)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Usuario autenticable por reconocimiento facial.
    - facial_data: embeddings/encoding facial en binario (ej. numpy.ndarray.tobytes())
    - position_data: JSON con coordenadas 3D relativas (ej. puntos clave de FaceMesh)
    """

    nombres = models.CharField(max_length=150)
    apellidos = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    dni = models.CharField(max_length=20, unique=True)

    # Compatibilidad inicial (un embedding)
    facial_data = models.BinaryField(null=True, blank=True)
    position_data = models.JSONField(null=True, blank=True)

    # Nuevos campos: múltiples muestras para reducir falsos negativos/positivos
    facial_embeddings = models.JSONField(default=list, blank=True)
    positions = models.JSONField(default=list, blank=True)

    failed_attempts = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["dni", "nombres", "apellidos"]

    def __str__(self):
        return f"{self.nombres} {self.apellidos} <{self.email}>"

