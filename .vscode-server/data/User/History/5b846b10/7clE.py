from rest_framework import APIClient
import pytest

@pytest.fixture
def api_client():
    return APIClient()