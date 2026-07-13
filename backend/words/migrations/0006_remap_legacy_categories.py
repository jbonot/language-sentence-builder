# Generated manually on 2026-07-13

from django.db import migrations

# 0005_seed_final_vocabulary introduced a second, semantic taxonomy
# (actants / relators / operators / actions & states) that was never added
# to Word.Category, causing 400s whenever one of those words was saved in a
# sentence or working set. Rather than growing the category enum to match,
# remap each word to the closest existing part-of-speech category, keyed by
# its (category-independent) translation.
LEGACY_CATEGORY_REMAP = {
    'actants': {
        'interjection': {'please', 'thanks', 'hello', 'goodbye'},
        # everything else in this category is a concrete noun
    },
    'relators': {
        'adverb': {'then', 'now', 'where', 'when'},
        # everything else in this category is a preposition
    },
    'operators': {
        'conjunction': {'and', 'but', 'or', 'because', 'if'},
        'adverb': {'not', 'never', 'no', 'how', 'why'},
        'pronoun': {'none', 'many', 'some', 'all', 'one'},
    },
    'actions & states': {
        'verb': {
            'burn', 'hide', 'break', 'run', 'fear', 'hear', 'know', 'fall',
            'see', 'want',
        },
        # everything else in this category is an adjective
    },
}

LEGACY_DEFAULTS = {
    'actants': 'noun',
    'relators': 'preposition',
    'operators': 'pronoun',
    'actions & states': 'adjective',
}


def remap_legacy_categories(apps, schema_editor):
    Word = apps.get_model('words', 'Word')
    for legacy_category, target_by_translation in LEGACY_CATEGORY_REMAP.items():
        default = LEGACY_DEFAULTS[legacy_category]
        words = Word.objects.filter(category=legacy_category)
        for word in words:
            target = default
            for candidate, translations in target_by_translation.items():
                if word.translation in translations:
                    target = candidate
                    break
            word.category = target
            word.save(update_fields=['category'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('words', '0005_seed_final_vocabulary'),
    ]

    operations = [
        migrations.RunPython(remap_legacy_categories, noop),
    ]
