import os
import dj_database_url
from .common import *

DEBUG = False

SECRET_KEY = os.environ['SECRET_KEY']

ALLOWED_HOSTS = ['ecombuy-prod-46c16877e662.herokuapp.com']

DATABASES = {
    'default': dj_database_url.config()
}

CELERY_BROKER_URL = 'redis://localhost:6379/1'