# miapp/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.principal, name='principal'),
    path('login/', views.login_view, name='login'),
    path('admin-dashboard/', views.pagina_admin, name='pagina_admin'),
    path('registro/', views.register_view, name='registro'),
    path('usuarios/', views.usuarios, name='usuarios'),
    path('inventario/', views.inventario, name='inventario'),
    path('planes/', views.planes, name='planes'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
]