from django.shortcuts import render
from .tasks import notify_customers

# Sending email templates to smtp server
def say_hello(request):
    notify_customers.delay('Hello')
    return render(request, 'hello.html', {'name': 'Uddam'})
