from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

STARTER_WORKING_SET_NAMES = ['Otis Monologue']

from .models import Sentence, User, UserSettings, WorkingSet
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    SentenceSerializer,
    UserSerializer,
    UserSettingsSerializer,
    WorkingSetSerializer,
)


def _auth_payload(request, user):
    settings_obj, _ = UserSettings.objects.get_or_create(user=user)
    return {
        'user': UserSerializer(user).data,
        'settings': UserSettingsSerializer(settings_obj).data,
        'csrfToken': get_token(request),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        UserSettings.objects.create(user=user)
        login(request, user)
        return Response(_auth_payload(request, user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if user is None:
            return Response(
                {'detail': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST
            )
        login(request, user)
        return Response(_auth_payload(request, user), status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            payload = _auth_payload(request, request.user)
            payload['authenticated'] = True
            return Response(payload)
        return Response(
            {'authenticated': False, 'user': None, 'settings': None, 'csrfToken': get_token(request)}
        )


class UserSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_object(self):
        settings_obj, _ = UserSettings.objects.get_or_create(user=self.request.user)
        return settings_obj


class SentenceViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = SentenceSerializer

    def get_queryset(self):
        return Sentence.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WorkingSetViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkingSetSerializer

    def get_queryset(self):
        return WorkingSet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def starter(self, request):
        queryset = WorkingSet.objects.filter(name__in=STARTER_WORKING_SET_NAMES)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
