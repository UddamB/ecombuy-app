"""
WSGI config for storefront project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.c

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'storefront.settings.dev')

application = get_wsgi_application()
