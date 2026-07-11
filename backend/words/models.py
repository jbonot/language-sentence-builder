from django.db import models


class Word(models.Model):
    class Category(models.TextChoices):
        NOUN = 'noun', 'Noun'
        VERB = 'verb', 'Verb'
        ADJECTIVE = 'adjective', 'Adjective'
        ADVERB = 'adverb', 'Adverb'
        PRONOUN = 'pronoun', 'Pronoun'
        PREPOSITION = 'preposition', 'Preposition'
        CONJUNCTION = 'conjunction', 'Conjunction'
        ARTICLE = 'article', 'Article'
        INTERJECTION = 'interjection', 'Interjection'
        PREFIX = 'prefix', 'Prefix'
        SUFFIX = 'suffix', 'Suffix'
        OTHER = 'other', 'Other'

    class Language(models.TextChoices):
        ES = 'es', 'Spanish'
        FR = 'fr', 'French'
        DE = 'de', 'German'
        IT = 'it', 'Italian'
        PL = 'pl', 'Polish'
        SV = 'sv', 'Swedish'
        NL = 'nl', 'Dutch'

    text = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=Category.choices)
    language = models.CharField(max_length=10, choices=Language.choices)
    translation = models.CharField(
        max_length=100, null=True, blank=True, help_text='English translation of the word, if any.'
    )

    class Meta:
        ordering = ['language', 'category', 'text']

    def __str__(self):
        return f'{self.text} ({self.get_language_display()}, {self.get_category_display()}) = {self.translation}'
