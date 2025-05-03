from django.contrib import admin
from .models import Cliente, Producto, Membresia

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'email', 'telefono', 'fecha_registro', 'estado')
    list_filter = ('estado',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'stock_actual', 'stock_minimo', 'categoria', 'establecimiento')
    list_filter = ('categoria', 'establecimiento')

@admin.register(Membresia)
class MembresiaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'precio', 'fecha_inicio', 'fecha_fin', 'establecimiento')
    list_filter = ('establecimiento',)
