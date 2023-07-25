from locust import HttpUser, task
from random import randint

class WebsiteUser(HttpUser):
    @task
    def view_products(self):
        collection_id = randint(2, 6)
        self.client.get('/store/products/?collection_id={collection_id}')