from locust import HttpUser, task
from random import randint

class WebsiteUser(HttpUser):
    # Viewing products 
    @task
    def view_products(self):
        collection_id = randint(2, 6)
        self.client.get(
            f'/store/products/?collection_id={collection_id}', 
            name='/store/products')
    
    @task
    def view_product(self):
        product_id =randint(1, 1000)
        self.client.get(
            f'/store/products/{product_id}', 
            name='/store/products/:id')
        
    def add_to_cart(self):
        randint(1, 1000)