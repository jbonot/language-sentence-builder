from django.contrib.auth.hashers import make_password
from django.db import migrations

OWNER_EMAIL = 'otis@example.com'
OWNER_PASSWORD = 'changeme123'
WORKING_SET_NAME = 'Otis Monologue'

# (french, english, category, german, dutch, polish, swedish)
VOCABULARY = [
    ('bon', 'good', 'adjective', 'gut', 'goed', 'dobry', 'bra'),
    ('mauvais', 'bad', 'adjective', 'schlecht', 'slecht', 'zły', 'dålig'),
    ('situation', 'situation', 'noun', 'Situation', 'situatie', 'sytuacja', 'situation'),
    ('résumer', 'to summarize', 'verb', 'zusammenfassen', 'samenvatten', 'podsumować', 'sammanfatta'),
    ('vie', 'life', 'noun', 'Leben', 'leven', 'życie', 'liv'),
    ("aujourd'hui", 'today', 'adverb', 'heute', 'vandaag', 'dzisiaj', 'idag'),
    ('rencontre', 'encounter', 'noun', 'Begegnung', 'ontmoeting', 'spotkanie', 'möte'),
    ('personne', 'person', 'noun', 'Mensch', 'mens', 'człowiek', 'människa'),
    ('tendre', 'to extend', 'verb', 'ausstrecken', 'uitstrekken', 'wyciągnąć', 'sträcka'),
    ('main', 'hand', 'noun', 'Hand', 'hand', 'dłoń', 'hand'),
    ('moment', 'moment', 'noun', 'Moment', 'moment', 'moment', 'tidpunkt'),
    ('seul', 'alone', 'adjective', 'allein', 'alleen', 'sam', 'ensam'),
    ('curieux', 'curious', 'adjective', 'neugierig', 'nieuwsgierig', 'ciekawy', 'märklig'),
    ('hasard', 'chance', 'noun', 'Zufall', 'toeval', 'przypadek', 'slump'),
    ('forger', 'to forge', 'verb', 'schmieden', 'smeden', 'kształtować', 'forma'),
    ('destinée', 'destiny', 'noun', 'Schicksal', 'lot', 'przeznaczenie', 'öde'),
    ('goût', 'taste', 'noun', 'Geschmack', 'smaak', 'smak', 'smak'),
    ('geste', 'gesture', 'noun', 'Geste', 'gebaar', 'gest', 'gest'),
    ('interlocuteur', 'interlocutor', 'noun', 'Gesprächspartner', 'gesprekspartner', 'rozmówca', 'samtalspartner'),
    ('miroir', 'mirror', 'noun', 'Spiegel', 'spiegel', 'lustro', 'spegel'),
    ('avancer', 'to advance', 'verb', 'vorankommen', 'vooruitgaan', 'posuwać się naprzód', 'gå framåt'),
    ('amour', 'love', 'noun', 'Liebe', 'liefde', 'miłość', 'kärlek'),
    ('dire', 'to say', 'verb', 'sagen', 'zeggen', 'mówić', 'säga'),
    ('merci', 'thank you', 'noun', 'Danke', 'bedankt', 'dziękuję', 'tack'),
    ('chanter', 'to sing', 'verb', 'singen', 'zingen', 'śpiewać', 'sjunga'),
    ('danser', 'to dance', 'verb', 'tanzen', 'dansen', 'tańczyć', 'dansa'),
    ('humanité', 'humanity', 'noun', 'Menschlichkeit', 'menselijkheid', 'ludzkość', 'mänsklighet'),
    ('construction', 'construction', 'noun', 'Konstruktion', 'constructie', 'budowa', 'konstruktion'),
    ('mécanique', 'mechanical', 'adjective', 'mechanisch', 'mechanisch', 'mechaniczny', 'mekanisk'),
    ('demain', 'tomorrow', 'adverb', 'morgen', 'morgen', 'jutro', 'imorgon'),
    ('communauté', 'community', 'noun', 'Gemeinschaft', 'gemeenschap', 'społeczność', 'gemenskap'),
    ('don', 'gift', 'noun', 'Geschenk', 'geschenk', 'dar', 'gåva'),
    ('soi', 'oneself', 'pronoun', 'sich', 'zich', 'siebie', 'sig'),
    ('pousser', 'to push', 'verb', 'schieben', 'duwen', 'pchać', 'skjuta'),
    ('entreprendre', 'to undertake', 'verb', 'unternehmen', 'ondernemen', 'podjąć', 'åta sig'),
    ('simplement', 'simply', 'adverb', 'einfach', 'gewoon', 'po prostu', 'helt enkelt'),
    ('répondre', 'to answer', 'verb', 'antworten', 'antwoorden', 'odpowiadać', 'svara'),
    ('beaucoup', 'a lot', 'adverb', 'viel', 'veel', 'dużo', 'mycket'),
    ('finalement', 'finally', 'adverb', 'schließlich', 'eindelijk', 'w końcu', 'äntligen'),
    ('aider', 'to help', 'verb', 'helfen', 'helpen', 'pomagać', 'hjälpa'),
    ('face', 'face', 'noun', 'Gesicht', 'gezicht', 'twarz', 'ansikte'),
    ('beau', 'beautiful', 'adjective', 'schön', 'mooi', 'piękny', 'vacker'),
    ('bien', 'well', 'adverb', 'gut', 'goed', 'dobrze', 'bra'),
    ('faire', 'to do', 'verb', 'machen', 'doen', 'robić', 'göra'),
    ('pouvoir', 'to be able to', 'verb', 'können', 'kunnen', 'móc', 'kunna'),
    ('devoir', 'to have to', 'verb', 'müssen', 'moeten', 'musieć', 'måste'),
    ('chez', 'at', 'preposition', 'bei', 'bij', 'u', 'hos'),
    ("d'abord", 'first', 'adverb', 'zuerst', 'eerst', 'najpierw', 'först'),
    ('croire', 'to believe', 'verb', 'glauben', 'geloven', 'wierzyć', 'tro'),
]

LANGUAGE_COLUMNS = [
    ('fr', 0),
    ('de', 3),
    ('nl', 4),
    ('pl', 5),
    ('sv', 6),
]


def seed_otis_monologue(apps, schema_editor):
    Word = apps.get_model('words', 'Word')
    User = apps.get_model('accounts', 'User')
    UserSettings = apps.get_model('accounts', 'UserSettings')
    WorkingSet = apps.get_model('accounts', 'WorkingSet')

    french_words = []
    other_words = []
    for row in VOCABULARY:
        _, english, category, *_rest = row
        for language, index in LANGUAGE_COLUMNS:
            word = Word(text=row[index], category=category, language=language, translation=english)
            if language == 'fr':
                french_words.append(word)
            else:
                other_words.append(word)

    created_french_words = Word.objects.bulk_create(french_words)
    Word.objects.bulk_create(other_words)

    user = User.objects.create(
        email=OWNER_EMAIL,
        password=make_password(OWNER_PASSWORD),
        is_staff=False,
        is_superuser=False,
        is_active=True,
    )
    UserSettings.objects.create(user=user)

    words_snapshot = [
        {
            'wordId': word.id,
            'text': word.text,
            'category': word.category,
            'translation': word.translation,
        }
        for word in created_french_words
    ]

    WorkingSet.objects.create(
        owner=user,
        name=WORKING_SET_NAME,
        language='fr',
        words=words_snapshot,
    )


def unseed_otis_monologue(apps, schema_editor):
    Word = apps.get_model('words', 'Word')
    User = apps.get_model('accounts', 'User')
    WorkingSet = apps.get_model('accounts', 'WorkingSet')

    WorkingSet.objects.filter(name=WORKING_SET_NAME).delete()
    User.objects.filter(email=OWNER_EMAIL).delete()
    Word.objects.filter(
        language__in=['fr', 'de', 'nl', 'pl', 'sv'],
        text__in=[row[index] for row in VOCABULARY for _, index in LANGUAGE_COLUMNS],
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_alter_sentence_language_alter_usersettings_language_and_more'),
        ('words', '0006_delete_spanish_words'),
    ]

    operations = [
        migrations.RunPython(seed_otis_monologue, unseed_otis_monologue),
    ]
