from django.contrib import admin

from .models import Word


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ('text', 'translation', 'category', 'language')
    list_filter = ('category', 'language')
    search_fields = ('text', 'translation')
