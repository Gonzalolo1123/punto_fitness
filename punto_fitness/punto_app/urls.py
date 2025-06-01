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
    path('inventario/crear_producto/', views.admin_producto_crear, name='admin_producto_crear'),
    path('inventario/actualizar_producto/<int:producto_id>/', views.admin_producto_actualizar, name='admin_producto_actualizar'),
    path('inventario/borrar_producto/<int:producto_id>/', views.admin_producto_borrar, name='admin_producto_borrar'),
    path('inventario/crear_categoria/', views.admin_categoria_crear, name='admin_categoria_crear'),
    path('inventario/actualizar_categoria/<int:categoria_id>/', views.admin_categoria_actualizar, name='admin_categoria_actualizar'),
    path('inventario/borrar_categoria/<int:categoria_id>/', views.admin_categoria_borrar, name='admin_categoria_borrar'),

    # Adiciones nuevas para funcionamiento de crud de productos
    # Compras
    path('inventario/crear_compra_vendedor/', views.admin_compra_vendedor_crear, name='admin_compra_vendedor_crear'),
    path('inventario/actualizar_compra_vendedor/<int:compra_vendedor_id>/', views.admin_compra_vendedor_actualizar, name='admin_compra_vendedor_actualizar'),
    path('inventario/borrar_compra_vendedor/<int:compra_vendedor_id>/', views.admin_compra_vendedor_borrar, name='admin_compra_vendedor_borrar'),
    # Vendedores
    path('inventario/crear_vendedor/', views.admin_vendedor_crear, name='admin_vendedor_crear'),
    path('inventario/actualizar_vendedor/<int:vendedor_id>/', views.admin_vendedor_actualizar, name='admin_vendedor_actualizar'),
    path('inventario/borrar_vendedor/<int:vendedor_id>/', views.admin_vendedor_borrar, name='admin_vendedor_borrar'),
    # Establecimientos
    path('inventario/crear_establecimiento/', views.admin_establecimiento_crear, name='admin_establecimiento_crear'),
    path('inventario/actualizar_establecimiento/<int:establecimiento_id>/', views.admin_establecimiento_actualizar, name='admin_establecimiento_actualizar'),
    path('inventario/borrar_establecimiento/<int:establecimiento_id>/', views.admin_establecimiento_borrar, name='admin_establecimiento_borrar'),
    # Proveedores
    path('inventario/crear_proveedor/', views.admin_proveedor_crear, name='admin_proveedor_crear'),
    path('inventario/actualizar_proveedor/<int:proveedor_id>/', views.admin_proveedor_actualizar, name='admin_proveedor_actualizar'),
    path('inventario/borrar_proveedor/<int:proveedor_id>/', views.admin_proveedor_borrar, name='admin_proveedor_borrar'),

    path('cursos/', views.cursos, name='cursos'),
    path('cursos/crear_curso/', views.admin_curso_crear, name='admin_curso_crear'),
    path('cursos/actualizar_curso/<int:curso_id>/', views.admin_curso_actualizar, name='admin_curso_actualizar'),
    path('cursos/borrar_curso/<int:curso_id>/', views.admin_curso_borrar, name='admin_curso_borrar'),
    path('cursos/crear_inscripcion/', views.admin_inscripcion_crear, name='admin_inscripcion_crear'),
    path('cursos/actualizar_inscripcion/<int:inscripcion_id>/', views.admin_inscripcion_actualizar, name='admin_inscripcion_actualizar'),
    path('cursos/borrar_inscripcion/<int:inscripcion_id>/', views.admin_inscripcion_borrar, name='admin_inscripcion_borrar'),
    
    path('maquinas/', views.maquinas, name='maquinas'),
    path('maquinas/crear_maquina/', views.admin_maquina_crear, name='admin_maquina_crear'),
    path('maquinas/actualizar_maquina/<int:maquina_id>/', views.admin_maquina_actualizar, name='admin_maquina_actualizar'),
    path('maquinas/borrar_maquina/<int:maquina_id>/', views.admin_maquina_borrar, name='admin_maquina_borrar'),
    path('usuarios/', views.usuarios, name='usuarios'),
    path('usuarios/crear_usuario/', views.admin_usuario_crear, name='admin_usuario_crear'),
    path('usuarios/actualizar_usuario/<int:usuario_id>/', views.admin_usuario_actualizar, name='admin_usuario_actualizar'),
    path('usuarios/borrar_usuario/<int:usuario_id>/', views.admin_usuario_borrar, name='admin_usuario_borrar'),
    path('planes/', views.planes, name='planes'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
    path('principal/', views.principal, name='principal'),
    path('logout/', views.logout_cliente, name='logout'),
]