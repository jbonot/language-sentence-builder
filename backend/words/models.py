from django.db import models


class Word(models.Model):
    class Category(models.TextChoices):
        # Ordered to walk left-to-right through an English Subject-Verb-Object
        # sentence: article/adjective/noun/pronoun build the subject (and
        # later the object), verb/adverb form the predicate, and
        # preposition/conjunction extend it into further phrases and clauses.
        ARTICLE = 'article', 'Article'
        ADJECTIVE = 'adjective', 'Adjective'
        NOUN = 'noun', 'Noun'
        PRONOUN = 'pronoun', 'Pronoun'
        VERB = 'verb', 'Verb'
        ADVERB = 'adverb', 'Adverb'
        PREPOSITION = 'preposition', 'Preposition'
        CONJUNCTION = 'conjunction', 'Conjunction'
        INTERJECTION = 'interjection', 'Interjection'
        PREFIX = 'prefix', 'Prefix'
        SUFFIX = 'suffix', 'Suffix'
        OTHER = 'other', 'Other'

    class Language(models.TextChoices):
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
