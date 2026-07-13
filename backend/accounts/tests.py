from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Sentence, User, UserSettings, WorkingSet

WORD_PAYLOAD = [{'text': 'gato', 'category': 'noun', 'translation': 'cat'}]


class RegisterLoginLogoutTests(APITestCase):
    def test_register_creates_user_settings_and_session(self):
        response = self.client.post(
            '/api/auth/register/', {'email': 'a@example.com', 'password': 'a-strong-password-1'}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'a@example.com')
        self.assertIsNone(response.data['settings']['language'])
        self.assertTrue(User.objects.filter(email='a@example.com').exists())
        self.assertTrue(UserSettings.objects.filter(user__email='a@example.com').exists())

        me = self.client.get('/api/auth/me/')
        self.assertTrue(me.data['authenticated'])

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(email='dup@example.com', password='a-strong-password-1')
        response = self.client.post(
            '/api/auth/register/', {'email': 'dup@example.com', 'password': 'a-strong-password-1'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_logout(self):
        User.objects.create_user(email='b@example.com', password='a-strong-password-1')

        login = self.client.post(
            '/api/auth/login/', {'email': 'b@example.com', 'password': 'a-strong-password-1'}
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        logout = self.client.post('/api/auth/logout/')
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)

        me = self.client.get('/api/auth/me/')
        self.assertFalse(me.data['authenticated'])

    def test_login_rejects_bad_credentials(self):
        User.objects.create_user(email='c@example.com', password='a-strong-password-1')
        response = self.client.post(
            '/api/auth/login/', {'email': 'c@example.com', 'password': 'wrong-password'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_anonymous(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['authenticated'])
        self.assertIsNone(response.data['user'])


class SettingsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='d@example.com', password='a-strong-password-1')
        UserSettings.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)

    def test_get_settings(self):
        response = self.client.get('/api/auth/settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['language'])

    def test_patch_settings(self):
        response = self.client.patch('/api/auth/settings/', {'language': 'fr'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['language'], 'fr')
        self.assertEqual(UserSettings.objects.get(user=self.user).language, 'fr')

    def test_settings_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/auth/settings/')
        # SessionAuthentication sets no WWW-Authenticate header, so DRF
        # denies with 403 rather than 401 for unauthenticated requests.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SentenceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='e@example.com', password='a-strong-password-1')
        self.other_user = User.objects.create_user(email='f@example.com', password='a-strong-password-1')
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_sentence(self):
        response = self.client.post(
            '/api/sentences/', {'language': 'fr', 'words': WORD_PAYLOAD}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        listing = self.client.get('/api/sentences/')
        self.assertEqual(len(listing.data), 1)

    def test_create_rejects_empty_words(self):
        response = self.client.post(
            '/api/sentences/', {'language': 'fr', 'words': []}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_own_sentence(self):
        sentence = Sentence.objects.create(owner=self.user, language='fr', words=WORD_PAYLOAD)
        response = self.client.delete(f'/api/sentences/{sentence.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Sentence.objects.filter(id=sentence.id).exists())

    def test_cannot_delete_other_users_sentence(self):
        sentence = Sentence.objects.create(owner=self.other_user, language='fr', words=WORD_PAYLOAD)
        response = self.client.delete(f'/api/sentences/{sentence.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Sentence.objects.filter(id=sentence.id).exists())

    def test_sentences_require_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/sentences/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class WorkingSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='j@example.com', password='a-strong-password-1')
        self.other_user = User.objects.create_user(email='k@example.com', password='a-strong-password-1')
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_working_set(self):
        response = self.client.post(
            '/api/working-sets/',
            {'name': 'Restaurant words', 'language': 'fr', 'words': WORD_PAYLOAD},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        listing = self.client.get('/api/working-sets/')
        self.assertEqual(len(listing.data), 1)
        self.assertEqual(listing.data[0]['name'], 'Restaurant words')

    def test_create_rejects_empty_words(self):
        response = self.client.post(
            '/api/working-sets/', {'name': 'Empty', 'language': 'fr', 'words': []}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_rejects_blank_name(self):
        response = self.client.post(
            '/api/working-sets/', {'name': '  ', 'language': 'fr', 'words': WORD_PAYLOAD}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_rejects_too_many_words(self):
        words = [{'text': f'word{i}', 'category': 'noun', 'translation': None} for i in range(51)]
        response = self.client.post(
            '/api/working-sets/', {'name': 'Big set', 'language': 'fr', 'words': words}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_own_working_set(self):
        working_set = WorkingSet.objects.create(
            owner=self.user, name='Mine', language='fr', words=WORD_PAYLOAD
        )
        response = self.client.delete(f'/api/working-sets/{working_set.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WorkingSet.objects.filter(id=working_set.id).exists())

    def test_cannot_delete_other_users_working_set(self):
        working_set = WorkingSet.objects.create(
            owner=self.other_user, name='Theirs', language='fr', words=WORD_PAYLOAD
        )
        response = self.client.delete(f'/api/working-sets/{working_set.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(WorkingSet.objects.filter(id=working_set.id).exists())

    def test_working_sets_require_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/working-sets/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CsrfEnforcementTests(APITestCase):
    client_class = APIClient

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

    def test_register_and_login_do_not_require_csrf_token(self):
        register = self.client.post(
            '/api/auth/register/', {'email': 'g@example.com', 'password': 'a-strong-password-1'}
        )
        self.assertEqual(register.status_code, status.HTTP_201_CREATED)

        # register() logs the user in immediately, so logging back out (to
        # return to an anonymous session) itself requires the CSRF token.
        logout = self.client.post(
            '/api/auth/logout/', HTTP_X_CSRFTOKEN=register.data['csrfToken']
        )
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)

        login = self.client.post(
            '/api/auth/login/', {'email': 'g@example.com', 'password': 'a-strong-password-1'}
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

    def test_logout_requires_csrf_token(self):
        User.objects.create_user(email='h@example.com', password='a-strong-password-1')
        self.client.post(
            '/api/auth/login/', {'email': 'h@example.com', 'password': 'a-strong-password-1'}
        )
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_succeeds_with_csrf_token(self):
        User.objects.create_user(email='i@example.com', password='a-strong-password-1')
        login = self.client.post(
            '/api/auth/login/', {'email': 'i@example.com', 'password': 'a-strong-password-1'}
        )
        token = login.data['csrfToken']
        response = self.client.post('/api/auth/logout/', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
