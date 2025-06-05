from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
import json
from .models import Inscripcion,Curso,Administrador,CategoriaProducto,Maquina,Cliente,Establecimiento,RegistroAcceso,Producto, CompraVendedor, Vendedor, Proveedor
from django.contrib.auth.hashers import check_password
# Funcionamiento CRUD
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Min
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
import pytz


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

@csrf_exempt  # Solo si es una API
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            correo = data.get('correo')
            contrasena = data.get('contrasena')

            try:
                cliente = Cliente.objects.get(email=correo)
            except Cliente.DoesNotExist:
                return JsonResponse({"success": False, "detail": "Cliente no encontrado"}, status=404)

            # Verificar contraseña
            if check_password(contrasena, cliente.contrasena):
                # Autenticación estándar de Django
                user, created = User.objects.get_or_create(
                    username=correo,
                    defaults={'email': correo, 'password': cliente.contrasena}
                )
                user = authenticate(request, username=correo, password=contrasena)
                login(request, user)  # Esto hace que request.user.is_authenticated funcione

                # Tu sistema de sesión personalizado
                request.session['cliente_id'] = cliente.id
                request.session['cliente_nombre'] = cliente.nombre
                request.session['cliente_correo'] = cliente.email
                request.session['cliente_telefono'] = cliente.telefono

                admin_obj = Administrador.objects.filter(cliente=cliente).first()
                if admin_obj:
                    nivel_acceso = admin_obj.nivel_acceso.lower()
                    request.session['nivel_acceso'] = nivel_acceso
                    response_data = {
                        "success": True,
                        "is_admin": True,
                        "nivel_acceso": nivel_acceso,
                        "message": "Inicio de sesión exitoso"
                    }
                    print(f"\nInicio de sesión exitoso (admin): {cliente.nombre} - Nivel: {nivel_acceso}")
                else:
                    request.session['nivel_acceso'] = 'cliente'
                    response_data = {
                        "success": True,
                        "is_admin": False,
                        "nivel_acceso": 'cliente',
                        "message": "Inicio de sesión exitoso"
                    }
                    print(f"\nInicio de sesión exitoso (cliente): {cliente.nombre}")

                return JsonResponse(response_data)
            else:
                return JsonResponse({"success": False, "detail": "Credenciales incorrectas"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "detail": "JSON inválido"}, status=400)
        except Exception as e:
            print(f"Error en login_view: {str(e)}")
            return JsonResponse({"success": False, "detail": "Error interno del servidor"}, status=500)

    return JsonResponse({"success": False, "detail": "Método no permitido"}, status=405)

def logout_cliente(request):
    request.session.flush()  # Elimina todos los datos de la sesión
    return redirect('/')     # 
def pagina_admin(request):
    return render(request, 'punto_app/admin_dashboard.html')

def panel_principal(request):
    return render(request, 'punto_app/panel.html')

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
def planes(request):
    return render(request, 'punto_app/planes.html')
def maquinas(request):
    return render(request,'punto_app/maquinas.html', {'maquinas': range(1, 9)})

def admin_maquinas(request):
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
def estadisticas(request):
    return render(request, 'punto_app/estadisticas.html')
@csrf_exempt
def admin_compra_vendedor_crear(request):
    try:
        data = json.loads(request.body)
        
        compra_vendedor = CompraVendedor.objects.create(
            fecha=data['fecha'],
            total=data['total'],
            iva=data['iva'],
            estado=data['estado'],
            establecimiento_id=data['establecimiento_id'],
            vendedor_id=data['vendedor_id'],
        )
        return JsonResponse({
            'id': compra_vendedor.id,
            'fecha': compra_vendedor.fecha,
            'total': compra_vendedor.total,
            'iva': compra_vendedor.iva,
            'estado': compra_vendedor.estado,
            'establecimiento_id': compra_vendedor.establecimiento_id,
            'vendedor_id': compra_vendedor.vendedor_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_compra_vendedor_actualizar(request, compra_vendedor_id):
    try:
        compra_vendedor = get_object_or_404(CompraVendedor, pk=compra_vendedor_id)
        data = json.loads(request.body)
        
        compra_vendedor.fecha = data.get('fecha', compra_vendedor.fecha)
        compra_vendedor.total = data.get('total', compra_vendedor.total)
        compra_vendedor.iva = data.get('iva', compra_vendedor.iva)
        compra_vendedor.estado = data.get('estado', compra_vendedor.estado)
        compra_vendedor.establecimiento_id = data.get('establecimiento_id', compra_vendedor.establecimiento_id)
        compra_vendedor.vendedor_id = data.get('vendedor_id', compra_vendedor.vendedor_id)
        compra_vendedor.save()
        
        return JsonResponse({
            'id': compra_vendedor.id,
            'fecha': compra_vendedor.fecha,
            'total': compra_vendedor.total,
            'iva': compra_vendedor.iva,
            'estado': compra_vendedor.estado,
            'establecimiento_id': compra_vendedor.establecimiento_id,
            'vendedor_id': compra_vendedor.vendedor_id,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_compra_vendedor_borrar(request, compra_vendedor_id):
    try:
        compra_vendedor = get_object_or_404(CompraVendedor, pk=compra_vendedor_id)
        compra_vendedor.delete()
        return JsonResponse({'message': 'compra_vendedor eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_vendedor_crear(request):
    try:
        data = json.loads(request.body)
        
        vendedor = Vendedor.objects.create(
            nombre=data['nombre'],
            telefono=data['telefono'],
            email=data['email'],
            proveedor_id=data['proveedor_id'],
        )
        return JsonResponse({
            'id': vendedor.id,
            'nombre': vendedor.nombre,
            'telefono': vendedor.telefono,
            'email': vendedor.email,
            'proveedor_id': vendedor.proveedor_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_vendedor_actualizar(request, vendedor_id):
    try:
        vendedor = get_object_or_404(Vendedor, pk=vendedor_id)
        data = json.loads(request.body)
        
        vendedor.nombre = data.get('nombre', vendedor.nombre)
        vendedor.telefono = data.get('telefono', vendedor.telefono)
        vendedor.email = data.get('email', vendedor.email)
        vendedor.proveedor_id = data.get('proveedor_id', vendedor.proveedor_id)
        vendedor.save()
        
        return JsonResponse({
            'id': vendedor.id,
            'nombre': vendedor.nombre,
            'telefono': vendedor.telefono,
            'email': vendedor.email,
            'proveedor_id': vendedor.proveedor_id,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_vendedor_borrar(request, vendedor_id):
    try:
        vendedor = get_object_or_404(Vendedor, pk=vendedor_id)
        vendedor.delete()
        return JsonResponse({'message': 'vendedor eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_establecimiento_crear(request):
    try:
        data = json.loads(request.body)
        
        establecimiento = Establecimiento.objects.create(
            nombre=data['nombre'],
            direccion=data['direccion'],
            telefono=data['telefono'],
            email=data['email'],
            horario_apertura=data['horario_apertura'],
            horario_cierre=data['horario_cierre'],
            proveedor_id=data['proveedor_id'],
        )
        return JsonResponse({
            'id': establecimiento.id,
            'nombre': establecimiento.nombre,
            'direccion': establecimiento.direccion,
            'telefono': establecimiento.telefono,
            'email': establecimiento.email,
            'horario_apertura': establecimiento.horario_apertura,
            'horario_cierre': establecimiento.horario_cierre,
            'proveedor_id': establecimiento.proveedor_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_establecimiento_actualizar(request, establecimiento_id):
    try:
        establecimiento = get_object_or_404(Establecimiento, pk=establecimiento_id)
        data = json.loads(request.body)
        
        establecimiento.nombre = data.get('nombre', establecimiento.nombre)
        establecimiento.direccion = data.get('direccion', establecimiento.direccion)
        establecimiento.telefono = data.get('telefono', establecimiento.telefono)
        establecimiento.email = data.get('email', establecimiento.email)
        establecimiento.horario_apertura = data.get('horario_apertura', establecimiento.horario_apertura)
        establecimiento.horario_cierre = data.get('horario_cierre', establecimiento.horario_cierre)
        establecimiento.proveedor_id = data.get('proveedor_id', establecimiento.proveedor_id)
        establecimiento.save()
        
        return JsonResponse({
            'id': establecimiento.id,
            'nombre': establecimiento.nombre,
            'direccion': establecimiento.direccion,
            'telefono': establecimiento.telefono,
            'email': establecimiento.email,
            'horario_apertura': establecimiento.horario_apertura,
            'horario_cierre': establecimiento.horario_cierre,
            'proveedor_id': establecimiento.proveedor_id,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_establecimiento_borrar(request, establecimiento_id):
    try:
        establecimiento = get_object_or_404(Establecimiento, pk=establecimiento_id)
        establecimiento.delete()
        return JsonResponse({'message': 'establecimiento eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_proveedor_crear(request):
    try:
        data = json.loads(request.body)
        
        proveedor = Proveedor.objects.create(
            nombre=data['nombre'],
            telefono=data['telefono'],
            blabla=data['blabla'],
        )
        return JsonResponse({
            'id': proveedor.id,
            'nombre': proveedor.nombre,
            'telefono': proveedor.telefono,
            'email': proveedor.email
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def admin_proveedor_actualizar(request, proveedor_id):
    try:
        proveedor = get_object_or_404(Proveedor, pk=proveedor_id)
        data = json.loads(request.body)
        
        proveedor.nombre = data.get('nombre', proveedor.nombre)
        proveedor.telefono = data.get('telefono', proveedor.telefono)
        proveedor.email = data.get('email', proveedor.email)
        proveedor.save()
        
        return JsonResponse({
            'id': proveedor.id,
            'nombre': proveedor.nombre,
            'telefono': proveedor.telefono,
            'email': proveedor.email,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
   
    
@csrf_exempt   
def admin_proveedor_borrar(request, proveedor_id):
    try:
        proveedor = get_object_or_404(Proveedor, pk=proveedor_id)
        proveedor.delete()
        return JsonResponse({'message': 'proveedor eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
def cursos(request):
    cursos = Curso.objects.values('id', 'nombre', 'cupos', 'fecha_realizacion', 'estado', 'establecimiento')
    inscripciones = Inscripcion.objects.values('id', 'usuario', 'curso', 'fecha_inscripcion')
    usuarios = Cliente.objects.values('id', 'nombre', 'apellido', 'email', 'telefono')
    establecimientos = Establecimiento.objects.values('id', 'nombre')
    return render(request, 'punto_app/admin_cursos.html', {'cursos': cursos, 'usuarios': usuarios, 'inscripciones': inscripciones, 'establecimientos': establecimientos})

@csrf_exempt
def admin_curso_crear(request):
    try:
        data = json.loads(request.body)
        
        curso = Curso.objects.create(
            nombre=data['nombre'],
            cupos=data['cupos'],
            fecha_realizacion=data['fecha_realizacion'],
            estado=data['estado'],
            establecimiento_id=data['establecimiento_id']
        )
        return JsonResponse({
            'id': curso.id,
            'nombre': curso.nombre,
            'cupos': curso.cupos,
            'fecha_realizacion': curso.fecha_realizacion,
            'estado': curso.estado,
            'establecimiento_id': curso.establecimiento_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_curso_actualizar(request, curso_id):
    try:
        curso = get_object_or_404(Curso, pk=curso_id)
        data = json.loads(request.body)
        
        curso.nombre = data.get('nombre', curso.nombre)
        curso.cupos = data.get('cupos', curso.cupos)
        curso.fecha_realizacion = data.get('fecha_realizacion', curso.fecha_realizacion)
        curso.estado = data.get('estado', curso.estado)
        curso.establecimiento = data.get('establecimiento', curso.establecimiento)
        curso.save()
        
        return JsonResponse({
            'id': curso.id,
            'nombre': curso.nombre,
            'cupos': curso.cupos,
            'fecha_realizacion': curso.fecha_realizacion,
            'estado': curso.estado,
            'establecimiento': curso.establecimiento
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_curso_borrar(request, curso_id):
    try:
        curso = get_object_or_404(Curso, pk=curso_id)
        curso.delete()
        return JsonResponse({'message': 'Curso eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_inscripcion_crear(request):
    try:
        data = json.loads(request.body)
        
        inscripcion = Inscripcion.objects.create(
            usuario_id=data['usuario_id'],
            curso_id=data['curso_id'],
            fecha_inscripcion=data['fecha_inscripcion']
        )
        return JsonResponse({
            'id': inscripcion.id,
            'usuario_id': inscripcion.usuario_id,
            'curso_id': inscripcion.curso_id,
            'fecha_inscripcion': inscripcion.fecha_inscripcion
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_inscripcion_actualizar(request, inscripcion_id):
    try:
        inscripcion = get_object_or_404(Inscripcion, pk=inscripcion_id)
        data = json.loads(request.body)
        
        inscripcion.usuario = data.get('usuario', inscripcion.usuario)
        inscripcion.curso = data.get('curso', inscripcion.curso)
        inscripcion.fecha_inscripcion = data.get('fecha_inscripcion', inscripcion.fecha_inscripcion)
        inscripcion.save()
        
        return JsonResponse({
            'id': inscripcion.id,
            'usuario': inscripcion.usuario,
            'curso': inscripcion.curso,
            'fecha_inscripcion': inscripcion.fecha_inscripcion
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_inscripcion_borrar(request, inscripcion_id):
    try:
        inscripcion = get_object_or_404(Inscripcion, pk=inscripcion_id)
        inscripcion.delete()
        return JsonResponse({'message': 'Inscripcion eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def asistencias(request):
    clientes = Cliente.objects.values('id', 'nombre', 'apellido', 'email')
    establecimientos = Establecimiento.objects.values('id','nombre','direccion')
    return render(request,'punto_app/asistencias.html', {'clientes': clientes,'establecimientos':establecimientos})
def confirmar_asistencia(request):
    if request.method == 'POST':
        cliente_id = request.POST.get('cliente_id')
        establecimiento_id = request.POST.get('establecimiento_id')
        establecimiento_nombre = request.POST.get('establecimiento_nombre')
        establecimiento_direccion = request.POST.get('establecimiento_direccion')
        
        if not cliente_id:
            messages.error(request, "ID de cliente no recibido")
            return redirect('asistencias')
        
        if not all([establecimiento_id, establecimiento_nombre, establecimiento_direccion]):
            messages.error(request, "Debe seleccionar un establecimiento")
            return redirect('asistencias')
        
        try:
            # Registrar la asistencia
            cliente = Cliente.objects.get(id=cliente_id)
            establecimiento = Establecimiento.objects.get(id=establecimiento_id)
            
            # Registrar solo la hora de entrada (salida será NULL inicialmente)
            asistencia = RegistroAcceso.objects.create(
                usuario=cliente,
                establecimiento=establecimiento,
                fecha_hora_entrada=timezone.now(),
                fecha_hora_salida=None  # Salida inicialmente nula
            )
            
            messages.success(request, 
                f"Asistencia registrada: {cliente.nombre} en {establecimiento.nombre} "
                f"a las {asistencia.fecha_hora_entrada.strftime('%H:%M:%S')}"
            )
            
        except Cliente.DoesNotExist:
            messages.error(request, "Cliente no encontrado")
        except Exception as e:
            messages.error(request, f"Error al registrar asistencia: {str(e)}")
        
        return redirect('asistencias')
    
    return redirect('asistencias')

def confirmar_salida(request):
    if request.method == 'POST':
        cliente_id = request.POST.get('cliente_id')
        establecimiento_id = request.POST.get('establecimiento_id')
        
        print(f'Datos recibidos - Cliente ID: {cliente_id}, Establecimiento ID: {establecimiento_id}')
        
        if not cliente_id or not establecimiento_id:
            messages.error(request, "Datos incompletos para registrar la salida")
            return redirect('asistencias')
        
        try:
            # Buscar el último registro de entrada sin salida para este cliente en este establecimiento
            registro = RegistroAcceso.objects.filter(
                usuario_id=cliente_id,  # Usar usuario_id en lugar de usuario
                establecimiento_id=establecimiento_id,  # Usar establecimiento_id en lugar de establecimiento
                fecha_hora_salida__isnull=True
            ).latest('fecha_hora_entrada')
            
            # Registrar la hora de salida
            registro.fecha_hora_salida = timezone.now()
            registro.save()
            
            messages.success(request, 
                f"Salida registrada para {registro.usuario.nombre} {registro.usuario.apellido} "
                f"en {registro.establecimiento.nombre} "
                f"a las {registro.fecha_hora_salida.strftime('%H:%M:%S')}"
            )
            
        except RegistroAcceso.DoesNotExist:
            messages.error(request, "No se encontró una entrada pendiente de salida para este usuario en el establecimiento seleccionado")
        except Exception as e:
            messages.error(request, f"Error al registrar salida: {str(e)}")
            print(f'Error al registrar salida: {str(e)}')  # Log para depuración
        
        return redirect('asistencias')
    
    return redirect('asistencias')
def super_admin(request):
    # Verificar primero la sesión (que es lo que estás usando realmente)
    if 'cliente_id' not in request.session:
        print("Acceso denegado - No hay sesión activa (cliente_id no encontrado)")
        return render(request, 'punto_app/no_autorizado.html')

    try:
        cliente_id = request.session['cliente_id']
        cliente = Cliente.objects.get(id=cliente_id)
        nivel_acceso = request.session.get('nivel_acceso', 'cliente')

        print(f"\nIntento de acceso a super_admin:")
        print(f"Cliente ID: {cliente_id}")
        print(f"Email cliente: {cliente.email}")
        print(f"Nivel acceso session: {nivel_acceso}")

        if nivel_acceso == 'superadmin':
            print(f"Autorización exitosa - Nivel detectado: {nivel_acceso}")
            clientes = Cliente.objects.all().select_related()
            administradores = {a.cliente_id: a for a in Administrador.objects.all()}
            
            return render(request, 'punto_app/super_admin.html', {
                'clientes': clientes,
                'administradores':  Administrador.objects.select_related('cliente').all(),
                'establecimientos': Establecimiento.objects.all()
            })
            
    except Cliente.DoesNotExist:
        print("Acceso denegado - Cliente no encontrado en DB")
    except Exception as e:
        print(f"Error en super_admin: {str(e)}")
    
    print(f"Acceso denegado - Nivel de acceso insuficiente o error: {request.session.get('nivel_acceso', 'none')}")
    return render(request, 'punto_app/no_autorizado.html')


@csrf_exempt
def cambiar_rol_admin(request):
    if request.method == "POST":
        data = json.loads(request.body)
        cliente_id = data.get('cliente_id')
        es_admin = data.get('es_admin')
        establecimiento_id = data.get('establecimiento_id')
        try:
            cliente = Cliente.objects.get(id=cliente_id)
            if es_admin:
                # Otorgar admin (si no existe)
                admin, created = Administrador.objects.get_or_create(
                    id_cliente=cliente,
                    defaults={'nivel_acceso': 'admin', 'establecimiento_id': establecimiento_id}
                )
                if not created:
                    admin.nivel_acceso = 'admin'
                    admin.establecimiento_id = establecimiento_id
                    admin.save()
            else:
                # Quitar admin
                Administrador.objects.filter(id_cliente=cliente).delete()
            return JsonResponse({'success': True})
        except Cliente.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Cliente no encontrado'})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})