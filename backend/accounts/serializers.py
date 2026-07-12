from django.contrib.auth import password_validation
from rest_framework import serializers

from words.models import Word

from .models import Sentence, User, UserSettings

MAX_SENTENCE_WORDS = 50


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['language']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class SentenceWordSerializer(serializers.Serializer):
    wordId = serializers.IntegerField(required=False, allow_null=True)
    text = serializers.CharField(allow_blank=False)
    category = serializers.ChoiceField(choices=Word.Category.choices)
    translation = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class SentenceSerializer(serializers.ModelSerializer):
    words = SentenceWordSerializer(many=True)

    class Meta:
        model = Sentence
        fields = ['id', 'language', 'words', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_words(self, value):
        if not value:
            raise serializers.ValidationError('A sentence must contain at least one word.')
        if len(value) > MAX_SENTENCE_WORDS:
            raise serializers.ValidationError(
                f'A sentence cannot contain more than {MAX_SENTENCE_WORDS} words.'
            )
        return value
