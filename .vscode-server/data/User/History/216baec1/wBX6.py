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
    
    @task
    def add_to_cart(self):
        product_id = randint(1, 10)
        self.client.post(
            f'/store/carts/{self.cart_id}/items',
            name='store/carts/items',
            json={'product_id': product_id, 'quantity': 1}
        )

    @task
    def on_start(self):
        response = self.client.post('/store/carts')
        result = response.json()
        self.cart_id = result['id']