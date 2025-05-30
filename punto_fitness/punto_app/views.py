from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
import json
from .models import CategoriaProducto, Cliente, Maquina
from django.contrib.auth.hashers import check_password
# Funcionamiento CRUD
from django.views.decorators.csrf import csrf_exempt
from .models import Producto
from django.db.models import Sum, Min
from django.db import IntegrityError

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

            if User.objects.filter(email=correo).exists() or Cliente.objects.filter(email=correo).exists():
                return JsonResponse({'error': 'El correo ya está registrado. Por favor, use otro correo.'}, status=400)

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

        except IntegrityError:
            return JsonResponse({'error': 'Correo ya registrado'}, status=400)
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

@csrf_exempt
def verificar_correo(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            correo = data.get('correo')

            if not correo:
                return JsonResponse({'error': 'Correo no proporcionado'}, status=400)

            # Verificar si el correo ya está registrado
            if Cliente.objects.filter(email=correo).exists():
                return JsonResponse({'existe': True, 'message': 'El correo ya está registrado'}, status=200)
            else:
                return JsonResponse({'existe': False, 'message': 'El correo está disponible'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

def inventario(request):
    productos = Producto.objects.values('id').annotate(
        nombre=Min('nombre'),
        precio=Min('precio'),
        categoria=Min('categoria'),
        stock_minimo=Min('stock_minimo'),
        stock_actual=Sum('stock_actual')
    )

    #productos = Producto.objects.values('id', 'nombre', 'precio', 'categoria','stock_minimo'
    #).annotate(
    #    stock_actual=Sum('stock_actual'),
    #    id=Min('id'))
    categorias = CategoriaProducto.objects.values('id', 'nombre', 'descripcion')

    return render(request, 'punto_app/admin_inventario.html', {'productos': productos, 'categorias': categorias})

@csrf_exempt
def admin_producto_crear(request):
    try:
        data = json.loads(request.body)
        producto = Producto.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio=data['precio'],
            stock_actual=data['stock_actual'],
            stock_minimo=data['stock_minimo'],
            compra_id=1,
            categoria_id=data['categoria_id'],
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

@csrf_exempt
def admin_categoria_crear(request):
    try:
        data = json.loads(request.body)

        if CategoriaProducto.objects.filter(nombre__iexact=data['nombre']).exists():
            return JsonResponse({'error': '¡Ya existe una categoría con este nombre!'}, status=400)

        if CategoriaProducto.objects.filter(descripcion__iexact=data['descripcion']).exists():
            return JsonResponse({'error': '¡Ya existe una categoría con esta descripción!'}, status=400)
        
        categoria = CategoriaProducto.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion']
        )
        return JsonResponse({
            'id': categoria.id,
            'nombre': categoria.nombre
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_categoria_actualizar(request, categoria_id):
    try:
        categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)
        data = json.loads(request.body)

        if CategoriaProducto.objects.filter(nombre__iexact=data['nombre']).exists():
            return JsonResponse({'error': '¡Ya existe una categoría con este nombre!'}, status=400)

        if CategoriaProducto.objects.filter(descripcion__iexact=data['descripcion']).exists():
            return JsonResponse({'error': '¡Ya existe una categoría con esta descripción!'}, status=400)
        
        categoria.nombre = data.get('nombre', categoria.nombre)
        categoria.descripcion = data.get('descripcion', categoria.descripcion)
        categoria.save()
        
        return JsonResponse({
            'id': categoria.id,
            'descripcion': categoria.descripcion,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_categoria_borrar(request, categoria_id):
    try:
        categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)
        categoria.delete()
        return JsonResponse({'message': 'Categoría eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def maquinas(request):
    maquinas = Maquina.objects.values('id', 'nombre', 'descripcion')
    return render(request, 'punto_app/admin_maquinas.html', {'maquinas': maquinas})

@csrf_exempt
def admin_maquina_crear(request):
    try:
        data = json.loads(request.body)

        if Maquina.objects.filter(nombre__iexact=data['nombre']).exists():
            return JsonResponse({'error': '¡Ya existe una máquina con este nombre!'}, status=400)

        if Maquina.objects.filter(descripcion__iexact=data['descripcion']).exists():
            return JsonResponse({'error': '¡Ya existe una máquina con esta descripción!'}, status=400)
        
        maquina = Maquina.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            establecimiento_id=1
        )
        return JsonResponse({
            'id': maquina.id,
            'nombre': maquina.nombre,
            'descripcion': maquina.descripcion
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_maquina_actualizar(request, maquina_id):
    try:
        maquina = get_object_or_404(Maquina, pk=maquina_id)
        data = json.loads(request.body)

        if Maquina.objects.filter(nombre__iexact=data['nombre']).exists():
            return JsonResponse({'error': '¡Ya existe una máquina con este nombre!'}, status=400)

        if Maquina.objects.filter(descripcion__iexact=data['descripcion']).exists():
            return JsonResponse({'error': '¡Ya existe una máquina con esta descripción!'}, status=400)
        
        maquina.nombre = data.get('nombre', maquina.nombre)
        maquina.descripcion = data.get('descripcion', maquina.descripcion)
        maquina.save()
        
        return JsonResponse({
            'id': maquina.id,
            'nombre': maquina.nombre,
            'descripcion': maquina.descripcion,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_maquina_borrar(request, maquina_id):
    try:
        maquina = get_object_or_404(Maquina, pk=maquina_id)
        maquina.delete()
        return JsonResponse({'message': 'Máquina eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def usuarios(request):
    usuarios = Cliente.objects.values('id', 'nombre', 'apellido', 'email', 'telefono')
    return render(request, 'punto_app/admin_usuarios.html', {'usuarios': usuarios})

@csrf_exempt
def admin_usuario_crear(request):
    try:
        data = json.loads(request.body)

        if Cliente.objects.filter(email__iexact=data['correo']).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este correo!'}, status=400)

        if Cliente.objects.filter(telefono__iexact=data['telefono']).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este telefono!'}, status=400)
        
        usuario = Cliente.objects.create(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['correo'],
            telefono=data['telefono']
        )
        return JsonResponse({
            'id': usuario.id,
            'nombre': usuario.nombre,
            'apellido': usuario.apellido,
            'correo': usuario.email,
            'telefono': usuario.telefono
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_usuario_actualizar(request, usuario_id):
    try:
        usuario = get_object_or_404(Cliente, pk=usuario_id)
        data = json.loads(request.body)

        if Cliente.objects.filter(email__iexact=data['correo']).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este correo!'}, status=400)

        if Cliente.objects.filter(telefono__iexact=data['telefono']).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este telefono!'}, status=400)
        
        usuario.nombre = data.get('nombre', usuario.nombre)
        usuario.apellido = data.get('apellido', usuario.apellido)
        usuario.email = data.get('correo', usuario.email)
        usuario.telefono = data.get('telefono', usuario.telefono)
        usuario.save()
        
        return JsonResponse({
            'id': usuario.id,
            'nombre': usuario.nombre,
            'apellido': usuario.apellido,
            'correo': usuario.email,
            'telefono': usuario.telefono
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_usuario_borrar(request, usuario_id):
    try:
        usuario = get_object_or_404(Cliente, pk=usuario_id)
        usuario.delete()
        return JsonResponse({'message': 'Usuario eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)