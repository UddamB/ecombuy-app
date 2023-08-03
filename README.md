# Ecombuy App 




## Description

A flexible e-commerce web app using Django REST API

I created this headless ecommerce app to learn more about Django (Django ORM, Celery, Redis) and other cool python tools for creating and deploying an ecom web app.

Unfortunately, Celery no longer supports Windows so I used WSL (Ubuntu) to run the migrations with Python 3.10 working on it.
## Tech Stack

**Front-end:** HTML/CSS

**Back-end:** MySQL, Django, Node.js

**Database Management:** DataGrip


## Screenshots

[![ecombuy.jpg](https://i.postimg.cc/8kF3VQ3R/ecombuy.jpg)](https://postimg.cc/K42QnVmj)

## Features

- Category
- Products
- Cart
- Image Uploads
- SMTP Email Management


## Demo
![admin-django-site-admin-google-chrome-2023-08-01-12-59-36_SWujeYM3 (1)](https://github.com/UddamB/ecombuy-app/assets/89602764/8f451fc1-4a9b-4600-bd0f-32304f97dd5e)



## Run Locally

Clone the project

```bash
  git clone https://github.com/UddamB/ecombuy
```

Go to the project directory

```bash
  cd ecombuy
```

Install dependencies

```bash
  pip install django-filter
  pip install django-cors-headers 
  pip install djoser
  pip install django-crispy-forms 
  pip install mysqlclient
  pip install drf-nested-routers
  pip install django-redis
  pip install django-celery
  pip install django-debug-toolbar
  pip install django-silk
```

Start the server

```bash
  pipenv shell
  sudo service mysql restart
  sudo service redis-server start
  docker run -p 6379:6379 redis
  python manage.py runserver
```


## Deployment

To deploy this project run

```bash
  python manage.py runserver
```

App is deployed externally via Azure and can be accessed through [ecombuy.azurewebsites.net ](https://ecombuy.azurewebsites.net/)


## Endpoint Reference

#### View Products

```http
  http://localhost:8000/store/products/
```

#### View Collections

```http
  http://localhost:8000/store/collections/
```

#### View Orders

```http
  http://localhost:8000/store/orders/
```

#### View Carts

```http
  http://localhost:8000/store/carts/
```



## Next Steps

- Implement new landing pages for each endpoint

- Add more front-end graphics to homepage

