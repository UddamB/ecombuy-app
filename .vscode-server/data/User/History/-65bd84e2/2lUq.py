import collections
from django.contrib.auth.models import User
from rest_framework import status
from store.models import Collection
import pytest
from model_bakery import baker

@pytest.fixture
def create_collection(api_client):
    def do_create_collection(collection):
        return api_client.post('/store/collections/', collection)
    return do_create_collection

@pytest.fixture
def authenticate(api_client):
     def do_authenticate(is_staff=False):
          return api_client.force_authenticate(user=User(is_staff=is_staff))
     return do_authenticate

# Creating a test for the collections endpoint
@pytest.mark.django_db
class TestCreateCollection: 
    def test_if_user_is_anonymous_returns_401(self, create_collection):
        response = create_collection({ 'title': 'a' })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

# Test for if user is not admin
    def test_if_user_is_not_admin_returns_403(self, api_client, create_collection):
        authenticate()

        response = create_collection({ 'title': 'a' })

        assert response.status_code == status.HTTP_403_FORBIDDEN

# Testing to see if data is invalid
    def test_if_data_is_invalid_returns_400(self, api_client, create_collection):
        authenticate(is_staff=True)
        
        response = create_collection({ 'title': '' })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['title'] is not None

# Testing to see if data is valid
    def test_if_data_is_valid_returns_201(self, api_client, create_collection):
            authenticate(is_staff=True)

            response = create_collection({ 'title': 'a' })

            assert response.status_code == status.HTTP_201_CREATED
            assert response.data['id'] > 0

@pytest.mark.django_db
class TestRetrieveCollection:
     def test_if_collection_exists_returns_200(self, api_client):
          baker.make(Collection)
          print(collections.__dict__)

          assert False
    