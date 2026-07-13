from django.db import migrations


def delete_spanish_words(apps, schema_editor):
    Word = apps.get_model('words', 'Word')
    Word.objects.filter(language='es').delete()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('words', '0005_alter_word_language'),
    ]

    operations = [
        migrations.RunPython(delete_spanish_words, noop),
    ]
