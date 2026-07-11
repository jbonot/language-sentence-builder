from rest_framework import viewsets

from .models import Word
from .serializers import WordSerializer


class WordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Word.objects.all()
    serializer_class = WordSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(language=language)
        return queryset
