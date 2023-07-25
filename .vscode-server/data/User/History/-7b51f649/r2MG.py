from django.core.cache import cache
from django.shortcuts import render
import requests

def say_hello(request):
    # filtering products using product id by title
    # queryset = Product.objects.filter(id__in=OrderItem.objects.values('product_id').distinct()).order_by('title')
    # select_related (1 instance)
    # queryset = Product.objects.select_related('collection').all()
    # prefetch_related (1+ instance)
    # querying last 5 products 
    # queryset = Order.objects.select_related('customer').prefetch_related('orderitem_set__product').order_by('-placed_at')[:5]
    # aggregating objects 
    # result = Product.objects.filter(id=1).aggregate(count=Count('id'))
    # creating new fields in SQL
    # queryset = Customer.objects.annotate(new_id=F('id') + 1)
    # Operations with different data sets
    # discounted_price = ExpressionWrapper(F('unit_price') * 0.8, output_field=DecimalField())
    # queryset = Product.objects.annotate(discounted_price=discounted_price)
    # gettings tags for a given object like a product
    # TaggedItem.objects.get_tags_for(Product, 1)
    # setting the featured product based on product id/primary key
    # Collection.objects.filter(pk=11).update(featured_product=None)
    # using transactions to avoid creating new orders when its item is not saved
    # with transaction.atomic():
    #    order = Order()
    #    order.customer_id = 1
    #    order.save()

    #    item = OrderItem()
    #    item.order = order
    #    item.product_id = -1
    #    item.quantity = 1
    #    item.unit_price = 10
    #    item.save()     
    # creating raw sql queries for complex operations
    # queryset = Product.objects.raw('SELECT id, title FROM store_product')

    key = 'httpbin_result'
    if cache.get(key) is None:
        response = requests.get('https://httpbin.org/delay/2')
        data = response.json()
        cache.set(key, data)
    return render(request, 'hello.html',{'name': cache.get(key)})