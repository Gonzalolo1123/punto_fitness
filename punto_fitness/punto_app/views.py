from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
import json
from .models import Cliente
from django.contrib.auth.hashers import check_password
# Funcionamiento CRUD
from django.views.decorators.csrf import csrf_exempt
from .models import Producto
from django.db.models import Sum, Min

# Create your views here.
def principal(request):
    cliente_nombre = request.session.get('cliente_nombre')
    cliente_correo = request.session.get('cliente_correo')
    cliente_telefono= request.session.get('cliente_telefono')
    if not cliente_nombre:
        return render(request, 'punto_app/principal.html')

    return render(request, 'punto_app/principal.html', {'cliente_nombre': cliente_nombre,'cliente_correo':cliente_correo,'cliente_telefono':cliente_telefono})

def register_view(request):
    if request.method == "POST":
        try:
            print(request.body)
            data = json.loads(request.body)

            nombre = data.get('nombre')
            apellido = data.get('apellido')
            correo = data.get('correo')
            contrasena = data.get('contrasena')
            telefono = data.get('telefono')
            estado = data.get('estado', 'Activo')

            if not all([nombre, apellido, correo, contrasena]):
                return JsonResponse({'error': 'Faltan campos'}, status=400)

            if User.objects.filter(username=nombre).exists():
                return JsonResponse({'error': 'Nombre de usuario ya existe'}, status=400)

            if User.objects.filter(email=correo).exists():
                return JsonResponse({'error': 'Correo ya registrado'}, status=400)
            
            # Encriptar la contraseña
            contrasena_encriptada = make_password(contrasena)
            # Crear el cliente en la tabla 'cliente' en PostgreSQL
            cliente = Cliente.objects.create(
                nombre=nombre,
                apellido=apellido,
                email=correo,
                contrasena=contrasena_encriptada,  # Guárdalo como está en el modelo de cliente
                telefono=telefono,  # Teléfono
                estado=estado  # Estado
            )
            
            return JsonResponse({'message': 'Usuario y cliente creados correctamente'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        correo = data.get('correo')
        contrasena = data.get('contrasena')

         # Imprimir los datos recibidos
        print(f"Correo recibido: {correo}")
        print(f"Contraseña recibida: {contrasena}")

        # Buscar al cliente por correo
        try:
           cliente = Cliente.objects.get(email=correo)

        except Cliente.DoesNotExist:
            return JsonResponse({"success": False, "detail": "Cliente no encontrado"}, status=404)

        # Verificar si la contraseña es correcta
        if check_password(contrasena, cliente.contrasena):  # Asegúrate de que la contraseña se verifica de forma segura
            # Guardar datos en la sesión
            request.session['cliente_id'] = cliente.id
            request.session['cliente_nombre'] = cliente.nombre
            request.session['cliente_correo'] = cliente.email
            request.session['cliente_telefono'] = cliente.telefono
            return JsonResponse({"success": True, "message": "Inicio de sesión exitoso"})
        else:
            # Si la contraseña es incorrecta
            return JsonResponse({"success": False, "detail": "Credenciales incorrectas"}, status=400)

    return JsonResponse({"success": False, "detail": "Método no permitido"}, status=405)


def logout_cliente(request):
    request.session.flush()  # Elimina todos los datos de la sesión
    return redirect('/')     # 
def pagina_admin(request):
    return render(request, 'punto_app/admin_dashboard.html')

def panel_principal(request):
    return render(request, 'punto_app/panel.html')

def usuarios(request):
    return render(request, 'punto_app/usuarios.html')

def inventario(request):
    productos = Producto.objects.values('nombre', 'precio', 'categoria','stock_minimo'
    ).annotate(
        stock_actual=Sum('stock_actual'),
        id=Min('id'))

    return render(request, 'punto_app/inventario.html', {'productos': productos})
@csrf_exempt
def admin_producto_crear(request):
    try:
        data = json.loads(request.body)
        producto = Producto.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio=data['precio'],
            stock_actual=1,
            stock_minimo=data['stock_minimo'],
            compra_id=1,
            categoria_id=1,
            establecimiento_id=1
        )
        return JsonResponse({
            'id': producto.id,
            'nombre': producto.nombre,
            'stock': producto.stock_actual,
            'stock_minimo': producto.stock_minimo,
            'precio': producto.precio
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_producto_actualizar(request, producto_id):
    try:
        producto = get_object_or_404(Producto, pk=producto_id)
        data = json.loads(request.body)
        
        producto.nombre = data.get('nombre', producto.nombre)
        producto.descripcion = data.get('descripcion', producto.descripcion)
        producto.precio = data.get('precio', producto.precio)
        producto.stock_minimo = data.get('stock_minimo', producto.stock_minimo)
        producto.save()
        
        return JsonResponse({
            'id': producto.id,
            'nombre': producto.nombre,
            'stock_minimo': producto.stock_minimo,
            'precio': producto.precio
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
@csrf_exempt   
def admin_producto_borrar(request, producto_id):
    try:
        producto = get_object_or_404(Producto, pk=producto_id)
        producto.delete()
        return JsonResponse({'message': 'Producto eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
def planes(request):
    return render(request, 'punto_app/planes.html')

def estadisticas(request):
    return render(request, 'punto_app/estadisticas.html')