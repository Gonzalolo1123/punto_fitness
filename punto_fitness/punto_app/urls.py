# miapp/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.principal, name='principal'),
    path('login/', views.login_view, name='login'),
    path('admin-dashboard/', views.pagina_admin, name='pagina_admin'),
    path('registro/', views.register_view, name='registro'),
    path('planes/', views.planes, name='planes'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
    path('principal/', views.principal, name='principal'),
    path('logout/', views.logout_cliente, name='logout'),
    path("verificar-correo/", views.verificar_correo, name="verificar_correo"),
    
    path('inventario/', views.inventario, name='inventario'),

    path('inventario/crear_producto/', views.admin_producto_crear, name='admin_producto_crear'),
    path('inventario/actualizar_producto/<int:producto_id>/', views.admin_producto_actualizar, name='admin_producto_actualizar'),
    path('inventario/borrar_producto/<int:producto_id>/', views.admin_producto_borrar, name='admin_producto_borrar'),

    path('inventario/crear_categoria/', views.admin_categoria_crear, name='admin_categoria_crear'),
    path('inventario/actualizar_categoria/<int:categoria_id>/', views.admin_categoria_actualizar, name='admin_categoria_actualizar'),
    path('inventario/borrar_categoria/<int:categoria_id>/', views.admin_categoria_borrar, name='admin_categoria_borrar'),
    
    path('maquinas/', views.maquinas, name='maquinas'),

    path('maquinas/crear_maquina/', views.admin_maquina_crear, name='admin_maquina_crear'),
    path('maquinas/actualizar_maquina/<int:maquina_id>/', views.admin_maquina_actualizar, name='admin_maquina_actualizar'),
    path('maquinas/borrar_maquina/<int:maquina_id>/', views.admin_maquina_borrar, name='admin_maquina_borrar'),
    
    path('usuarios/', views.usuarios, name='usuarios'),

    path('usuarios/crear_usuario/', views.admin_usuario_crear, name='admin_usuario_crear'),
    path('usuarios/actualizar_usuario/<int:usuario_id>/', views.admin_usuario_actualizar, name='admin_usuario_actualizar'),
    path('usuarios/borrar_usuario/<int:usuario_id>/', views.admin_usuario_borrar, name='admin_usuario_borrar'),

    
]