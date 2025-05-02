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
    path('productos/crear/', views.admin_producto_crear, name='admin_producto_crear'),
    path('productos/actualizar/<int:producto_id>/', views.admin_producto_actualizar, name='admin_producto_actualizar'),
    path('productos/borrar/<int:producto_id>/', views.admin_producto_borrar, name='admin_producto_borrar'),
    path('planes/', views.planes, name='planes'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
]