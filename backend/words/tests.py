from rest_framework import status
from rest_framework.test import APITestCase

from .models import Word


class WordAPITests(APITestCase):
    def setUp(self):
        self.word = Word.objects.create(text='chat', category='noun', language='fr', translation='cat')

    def test_list_words(self):
        response = self.client.get('/api/words/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.word.id, [word['id'] for word in response.data])

    def test_retrieve_word(self):
        response = self.client.get(f'/api/words/{self.word.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['text'], 'chat')
