from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

from words.models import Word

from .managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='settings',
    )
    language = models.CharField(
        max_length=10, choices=Word.Language.choices, null=True, blank=True, default=None
    )

    def __str__(self):
        return f'Settings for {self.user}'


class Sentence(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sentences'
    )
    language = models.CharField(max_length=10, choices=Word.Language.choices)
    words = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Sentence({self.id}) by {self.owner}'


class WorkingSet(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='working_sets'
    )
    name = models.CharField(max_length=100)
    language = models.CharField(max_length=10, choices=Word.Language.choices)
    words = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'WorkingSet({self.id}) by {self.owner}'
