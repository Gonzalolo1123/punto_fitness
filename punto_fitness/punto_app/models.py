from django.db import models

# Create your models here.
from django.db import models

class MetodoPago(models.Model):
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=50)

class TipoDocumentoPago(models.Model):
    nombre = models.CharField(max_length=30)

class Proveedor(models.Model):
    nombre = models.CharField(max_length=30)
    telefono = models.IntegerField()
    email = models.EmailField(max_length=30)

class Encargado(models.Model):
    nombre = models.CharField(max_length=30)
    telefono = models.IntegerField()
    email = models.EmailField(max_length=30)

class Establecimiento(models.Model):
    nombre = models.CharField(max_length=30)
    direccion = models.CharField(max_length=30)
    telefono = models.IntegerField()
    email = models.EmailField(max_length=30)
    horario_apertura = models.TimeField()
    horario_cierre = models.TimeField()
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)

class Administrador(models.Model):
    nivel_acceso = models.CharField(max_length=30)
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE)

class Cliente(models.Model):
    nombre = models.CharField(max_length=30)
    apellido = models.CharField(max_length=30)
    email = models.EmailField(max_length=30)
    contrasena = models.CharField(max_length=30)
    telefono = models.IntegerField()
    fecha_registro = models.DateField()
    estado = models.CharField(max_length=30)

class RegistroAcceso(models.Model):
    usuario = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE)
    fecha_hora_entrada = models.DateTimeField()
    fecha_hora_salida = models.DateTimeField()

class CategoriaProducto(models.Model):
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=50)

class Vendedor(models.Model):
    nombre = models.CharField(max_length=30)
    telefono = models.IntegerField()
    email = models.EmailField(max_length=30)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)

class CompraVendedor(models.Model):
    fecha = models.DateTimeField()
    total = models.IntegerField()
    iva = models.DecimalField(max_digits=6, decimal_places=2)
    estado = models.BooleanField()
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE)
    vendedor = models.ForeignKey(Vendedor, on_delete=models.CASCADE)

class Producto(models.Model):
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=50)
    precio = models.IntegerField()
    stock_actual = models.IntegerField()
    stock_minimo = models.IntegerField()
    compra = models.ForeignKey(CompraVendedor, on_delete=models.CASCADE)
    categoria = models.ForeignKey(CategoriaProducto, on_delete=models.CASCADE)
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE)

class DetalleCompra(models.Model):
    cantidad = models.IntegerField()
    iva = models.DecimalField(max_digits=6, decimal_places=2)
    subtotal = models.IntegerField()
    precio_unitario = models.IntegerField()
    compra = models.ForeignKey(CompraVendedor, on_delete=models.CASCADE)
    tipo_documento = models.ForeignKey(TipoDocumentoPago, on_delete=models.CASCADE)
    metodo_pago = models.ForeignKey(MetodoPago, on_delete=models.CASCADE)

class VentaCliente(models.Model):
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE)
    metodo_pago = models.ForeignKey(MetodoPago, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha = models.DateField()
    total = models.IntegerField()

class DetalleVenta(models.Model):
    cantidad = models.IntegerField()
    iva = models.DecimalField(max_digits=6, decimal_places=2)
    subtotal = models.IntegerField()
    precio_unitario = models.IntegerField()
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    venta = models.ForeignKey(VentaCliente, on_delete=models.CASCADE)

class Membresia(models.Model):
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=50)
    precio = models.IntegerField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

class ClienteMembresia(models.Model):
    usuario = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    membresia = models.ForeignKey(Membresia, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.BooleanField()
    codigo_qr = models.CharField(max_length=30)
