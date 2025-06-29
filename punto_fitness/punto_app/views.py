from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
import json
import re
from django.db.models.functions import TruncMonth
from .models import Inscripcion,Curso,Administrador,CategoriaProducto,Maquina,Cliente,Establecimiento,RegistroAcceso,Producto, CompraVendedor, Vendedor, Proveedor,DetalleVenta,VentaCliente,Membresia,ClienteMembresia,MetodoPago,TipoDocumentoPago
from django.contrib.auth.hashers import check_password
from .decorators import requiere_admin, requiere_superadmin
# Funcionamiento CRUD
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Min
from django.utils import timezone
import logging
from django.db.models import Count, OuterRef, Subquery, IntegerField, Exists
from django.db.models.functions import Coalesce
from django.utils.timezone import localtime
import os
from django.conf import settings
import time
from datetime import datetime
logger = logging.getLogger('punto_app')
# funcionamiento estadísticas
from datetime import datetime, timedelta
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone

# Create your views here.
def principal(request):
    # La información del cliente ya está disponible en el contexto debido al context_processor
    return render(request, 'punto_app/principal.html')

@csrf_exempt
def register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            apellido = data.get('apellido')
            correo = data.get('correo')
            contrasena = data.get('contrasena')
            telefono = data.get('telefono')
            estado = data.get('estado', 'Activo')

            if not all([nombre, apellido, correo, contrasena]):
                return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)

            try:
                # Verificar si el correo ya existe en Cliente
                if Cliente.objects.filter(email=correo).exists():
                    return JsonResponse({'error': 'Correo ya registrado'}, status=400)

                # Encriptar la contraseña
                contrasena_encriptada = make_password(contrasena)

                # Crear el cliente
                cliente = Cliente.objects.create(
                    nombre=nombre,
                    apellido=apellido,
                    email=correo,
                    contrasena=contrasena_encriptada,
                    telefono=telefono,
                    estado=estado
                )

                # Intentar crear el usuario de Django si es posible
                try:
                    User.objects.create_user(
                        username=correo,
                        email=correo,
                        password=contrasena
                    )
                except Exception as e:
                    logger.warning(f"No se pudo crear usuario de Django: {str(e)}")
                    # Continuamos aunque falle la creación del usuario de Django
                    pass

                return JsonResponse({
                    'message': 'Usuario creado correctamente',
                    'id': cliente.id,
                    'nombre': cliente.nombre,
                    'email': cliente.email
                }, status=201)

            except Exception as e:
                logger.error(f"Error al crear usuario: {str(e)}")
                return JsonResponse({'error': 'Error al crear el usuario'}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            logger.error(f"Error inesperado en registro: {str(e)}")
            return JsonResponse({'error': 'Error interno del servidor'}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt  # Solo si es una API
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            correo = data.get('correo')
            contrasena = data.get('contrasena')

            if not correo or not contrasena:
                logger.error("Intento de login sin correo o contraseña")
                return JsonResponse({"success": False, "detail": "Correo y contraseña son requeridos"}, status=400)

            try:
                cliente = Cliente.objects.get(email=correo)
            except Cliente.DoesNotExist:
                logger.warning(f"Intento de login con correo no existente: {correo}")
                return JsonResponse({"success": False, "detail": "Credenciales incorrectas"}, status=404)

            # Verificar contraseña
            if check_password(contrasena, cliente.contrasena):
                try:
                    # Autenticación estándar de Django
                    user = authenticate(request, username=correo, password=contrasena)
                    if user is None:
                        # Si el usuario no existe en auth_user, crearlo
                        user = User.objects.create_user(
                            username=correo,
                            email=correo,
                            password=contrasena
                        )
                    
                    login(request, user)

                    # Sistema de sesión personalizado
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
                        logger.info(f"Inicio de sesión exitoso (admin): {cliente.nombre} - Nivel: {nivel_acceso}")
                    else:
                        request.session['nivel_acceso'] = 'cliente'
                        response_data = {
                            "success": True,
                            "is_admin": False,
                            "nivel_acceso": 'cliente',
                            "message": "Inicio de sesión exitoso"
                        }
                        logger.info(f"Inicio de sesión exitoso (cliente): {cliente.nombre}")

                    return JsonResponse(response_data)
                except Exception as e:
                    logger.error(f"Error en autenticación: {str(e)}")
                    return JsonResponse({"success": False, "detail": "Error en la autenticación"}, status=500)
            else:
                logger.warning(f"Intento de login con contraseña incorrecta para: {correo}")
                return JsonResponse({"success": False, "detail": "Credenciales incorrectas"}, status=400)

        except json.JSONDecodeError:
            logger.error("Error al decodificar JSON en login")
            return JsonResponse({"success": False, "detail": "JSON inválido"}, status=400)
        except Exception as e:
            logger.error(f"Error inesperado en login_view: {str(e)}")
            return JsonResponse({"success": False, "detail": "Error interno del servidor"}, status=500)

    return JsonResponse({"success": False, "detail": "Método no permitido"}, status=405)

def logout_cliente(request):
    request.session.flush()  # Elimina todos los datos de la sesión
    return redirect('/')     # 

@requiere_admin
def pagina_admin(request):
    return render(request, 'punto_app/admin_dashboard.html')

def panel_principal(request):
    return render(request, 'punto_app/panel.html')

@requiere_admin
def usuarios(request):
    usuarios = Cliente.objects.values('id', 'nombre', 'apellido', 'email', 'telefono')
    return render(request, 'punto_app/admin_usuarios.html', {'usuarios': usuarios})

@csrf_exempt
def admin_usuario_crear(request):
    try:
        data = json.loads(request.body)
        
        # Validaciones de campos requeridos
        campos_requeridos = ['nombre', 'apellido', 'correo', 'telefono']
        for campo in campos_requeridos:
            if not data.get(campo) or not str(data.get(campo)).strip():
                return JsonResponse({'error': f'El campo {campo} es requerido'}, status=400)
        
        # Validación de formato de email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, data['correo']):
            return JsonResponse({'error': 'El formato del correo electrónico no es válido'}, status=400)
        
        # Validaciones adicionales de email
        email_clean = data['correo'].strip()
        if email_clean.startswith('.') or email_clean.endswith('.'):
            return JsonResponse({'error': 'El correo electrónico no puede comenzar o terminar con punto'}, status=400)
        
        if '..' in email_clean:
            return JsonResponse({'error': 'El correo electrónico no puede contener puntos consecutivos'}, status=400)
        
        if email_clean.count('@') != 1:
            return JsonResponse({'error': 'El correo electrónico debe contener exactamente un símbolo @'}, status=400)
        
        # Validación de formato de teléfono (solo números, 9-11 dígitos)
        telefono_str = str(data['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        if not telefono_str.isdigit() or len(telefono_str) < 9 or len(telefono_str) > 11:
            return JsonResponse({'error': 'El teléfono debe contener entre 9 y 11 dígitos numéricos'}, status=400)
        
        # Validación de longitud de nombres
        if len(data['nombre'].strip()) < 2:
            return JsonResponse({'error': 'El nombre debe tener al menos 2 caracteres'}, status=400)
        
        if len(data['apellido'].strip()) < 2:
            return JsonResponse({'error': 'El apellido debe tener al menos 2 caracteres'}, status=400)
        
        # Validación de unicidad de email (case-insensitive)
        if Cliente.objects.filter(email__iexact=data['correo']).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este correo!'}, status=400)

        # Validación de unicidad de teléfono (case-insensitive)
        if Cliente.objects.filter(telefono__iexact=telefono_str).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este teléfono!'}, status=400)
        
        # Crear el usuario con datos limpios y contraseña por defecto
        usuario = Cliente.objects.create(
            nombre=data['nombre'].strip().title(),
            apellido=data['apellido'].strip().title(),
            email=data['correo'].lower().strip(),
            telefono=int(telefono_str),
            contrasena=make_password('123456')  # Contraseña por defecto
        )
        
        return JsonResponse({
            'id': usuario.id,
            'nombre': usuario.nombre,
            'apellido': usuario.apellido,
            'correo': usuario.email,
            'telefono': usuario.telefono
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except ValueError as e:
        return JsonResponse({'error': f'Error en el formato de datos: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)

@csrf_exempt
def admin_usuario_actualizar(request, usuario_id):
    try:
        usuario = get_object_or_404(Cliente, pk=usuario_id)
        data = json.loads(request.body)
        
        # Validaciones de campos requeridos
        campos_requeridos = ['nombre', 'apellido', 'correo', 'telefono']
        for campo in campos_requeridos:
            if not data.get(campo) or not str(data.get(campo)).strip():
                return JsonResponse({'error': f'El campo {campo} es requerido'}, status=400)
        
        # Validación de formato de email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, data['correo']):
            return JsonResponse({'error': 'El formato del correo electrónico no es válido'}, status=400)
        
        # Validaciones adicionales de email
        email_clean = data['correo'].strip()
        if email_clean.startswith('.') or email_clean.endswith('.'):
            return JsonResponse({'error': 'El correo electrónico no puede comenzar o terminar con punto'}, status=400)
        
        if '..' in email_clean:
            return JsonResponse({'error': 'El correo electrónico no puede contener puntos consecutivos'}, status=400)
        
        if email_clean.count('@') != 1:
            return JsonResponse({'error': 'El correo electrónico debe contener exactamente un símbolo @'}, status=400)
        
        # Validación de formato de teléfono (solo números, 9-11 dígitos)
        telefono_str = str(data['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        if not telefono_str.isdigit() or len(telefono_str) < 9 or len(telefono_str) > 11:
            return JsonResponse({'error': 'El teléfono debe contener entre 9 y 11 dígitos numéricos'}, status=400)
        
        # Validación de longitud de nombres
        if len(data['nombre'].strip()) < 2:
            return JsonResponse({'error': 'El nombre debe tener al menos 2 caracteres'}, status=400)
        
        if len(data['apellido'].strip()) < 2:
            return JsonResponse({'error': 'El apellido debe tener al menos 2 caracteres'}, status=400)

        # Verificar si existe otro usuario con el mismo correo (excluyendo al usuario actual)
        if Cliente.objects.filter(email__iexact=data['correo']).exclude(pk=usuario_id).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este correo!'}, status=400)

        # Verificar si existe otro usuario con el mismo teléfono (excluyendo al usuario actual)
        if Cliente.objects.filter(telefono__iexact=telefono_str).exclude(pk=usuario_id).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este teléfono!'}, status=400)
        
        # Actualizar el usuario con datos limpios
        usuario.nombre = data['nombre'].strip().title()
        usuario.apellido = data['apellido'].strip().title()
        usuario.email = data['correo'].lower().strip()
        usuario.telefono = int(telefono_str)
        usuario.save()
        
        return JsonResponse({
            'success': True,
            'data': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'correo': usuario.email,
                'telefono': usuario.telefono
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except ValueError as e:
        return JsonResponse({'error': f'Error en el formato de datos: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)
    
@csrf_exempt
@requiere_admin
def admin_usuario_borrar(request, usuario_id):
    try:
        usuario = get_object_or_404(Cliente, pk=usuario_id)
        usuario.delete()
        return JsonResponse({'message': 'Usuario eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@requiere_admin
def inventario(request):
    productos = Producto.objects.select_related('compra', 'categoria', 'establecimiento').values(
        'id', 'nombre', 'descripcion', 'precio', 'stock_actual', 'stock_minimo', 
        'compra_id', 'categoria_id', 'establecimiento_id',
        'compra__fecha', 'compra__total', 'categoria__nombre', 'establecimiento__nombre', 'imagen'
    )
    categorias = CategoriaProducto.objects.values('id', 'nombre', 'descripcion')

    # nuevas adiciones para funcionamiento de crud de productos
    compras = CompraVendedor.objects.select_related('establecimiento', 'vendedor').values(
        'id', 'fecha', 'total', 'iva', 'estado', 'establecimiento_id', 'vendedor_id',
        'establecimiento__nombre', 'vendedor__nombre'
    )
    vendedores = Vendedor.objects.select_related('proveedor').values(
        'id', 'nombre', 'telefono', 'email', 'proveedor_id', 'proveedor__nombre'
    )
    establecimientos = Establecimiento.objects.select_related('proveedor').values(
        'id', 'nombre', 'direccion', 'telefono', 'email', 'horario_apertura', 'horario_cierre', 
        'proveedor_id', 'proveedor__nombre'
    )
    proveedores = Proveedor.objects.values('id', 'nombre', 'telefono', 'email')

    return render(request, 'punto_app/admin_inventario.html', {'productos': productos, 'categorias': categorias, 'compras': compras, 'vendedores': vendedores, 'establecimientos': establecimientos, 'proveedores': proveedores})

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
        print(f"📤 Datos recibidos para crear producto: {data}")
        
        # Validaciones de unicidad
        if Producto.objects.filter(nombre__iexact=data['nombre']).exists():
            return JsonResponse({'error': '¡Ya existe un producto con este nombre!'}, status=400)
        
        ##if Producto.objects.filter(descripcion__iexact=data['descripcion']).exists():
            ##return JsonResponse({'error': '¡Ya existe un producto con esta descripción!'}, status=400)
        
        # Validar que los IDs no sean nulos o vacíos
        if not data.get('categoria_id') or data['categoria_id'] == '':
            return JsonResponse({'error': 'Debe seleccionar una categoría'}, status=400)
        
        if not data.get('compra_id') or data['compra_id'] == '':
            return JsonResponse({'error': 'Debe seleccionar una compra'}, status=400)
        
        if not data.get('establecimiento_id') or data['establecimiento_id'] == '':
            return JsonResponse({'error': 'Debe seleccionar un establecimiento'}, status=400)

        if not data.get('imagen') or data['imagen'] == '':
            return JsonResponse({'error': 'Debe proporcionar una ruta de imagen'}, status=400)

        if not data['imagen'].startswith('images/productos/'):
            return JsonResponse({'error': 'La imagen debe estar en la carpeta images/productos/'}, status=400)
        
        producto = Producto.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio=data['precio'],
            stock_actual=data['stock_actual'],
            stock_minimo=data['stock_minimo'],
            compra_id=data['compra_id'],
            categoria_id=data['categoria_id'],
            establecimiento_id=data['establecimiento_id'],
            imagen=data['imagen']
        )
        
        print(f"✅ Producto creado exitosamente: {producto.id}")
        
        # Obtener los datos con las relaciones
        producto_con_relaciones = Producto.objects.select_related('compra', 'categoria', 'establecimiento').get(id=producto.id)
        
        return JsonResponse({
            'id': producto.id,
            'nombre': producto.nombre,
            'descripcion': producto.descripcion,
            'precio': producto.precio,
            'stock_actual': producto.stock_actual,
            'stock_minimo': producto.stock_minimo,
            'compra_id': producto.compra_id,
            'categoria_id': producto.categoria_id,
            'establecimiento_id': producto.establecimiento_id,
            'compra__fecha': producto_con_relaciones.compra.fecha.strftime('%Y-%m-%d'),
            'compra__total': producto_con_relaciones.compra.total,
            'categoria__nombre': producto_con_relaciones.categoria.nombre,
            'establecimiento__nombre': producto_con_relaciones.establecimiento.nombre
        }, status=201)
    except Exception as e:
        print(f"💥 Error al crear producto: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

        
@csrf_exempt
def admin_producto_actualizar(request, producto_id):
    try:
        producto = get_object_or_404(Producto, pk=producto_id)
        data = json.loads(request.body)
        
        # Validar la imagen si se proporciona
        if 'imagen' in data and data['imagen']:
            if not data['imagen'].startswith('images/productos/'):
                return JsonResponse({'error': 'La imagen debe estar en la carpeta images/productos/'}, status=400)
        
        producto.nombre = data.get('nombre', producto.nombre)
        producto.descripcion = data.get('descripcion', producto.descripcion)
        producto.precio = data.get('precio', producto.precio)
        producto.stock_actual = data.get('stock_actual', producto.stock_actual)
        producto.stock_minimo = data.get('stock_minimo', producto.stock_minimo)
        producto.imagen = data.get('imagen', producto.imagen)
        producto.categoria_id = data.get('categoria_id', producto.categoria_id)
        producto.compra_id = data.get('compra', producto.compra_id)
        producto.establecimiento_id = data.get('establecimiento_id', producto.establecimiento_id)
        producto.save()
        
        # Obtener los datos con las relaciones
        producto_con_relaciones = Producto.objects.select_related('compra', 'categoria', 'establecimiento').get(id=producto.id)
        
        return JsonResponse({
            'id': producto.id,
            'nombre': producto.nombre,
            'descripcion': producto.descripcion,
            'precio': producto.precio,
            'stock_actual': producto.stock_actual,
            'stock_minimo': producto.stock_minimo,
            'compra_id': producto.compra_id,
            'categoria_id': producto.categoria_id,
            'establecimiento_id': producto.establecimiento_id,
            'imagen': producto.imagen,
            'compra__fecha': producto_con_relaciones.compra.fecha.strftime('%Y-%m-%d'),
            'compra__total': producto_con_relaciones.compra.total,
            'categoria__nombre': producto_con_relaciones.categoria.nombre,
            'establecimiento__nombre': producto_con_relaciones.establecimiento.nombre
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

        # Validaciones de unicidad excluyendo a la categoría actual
        if 'nombre' in data and data['nombre'] != categoria.nombre:
            if CategoriaProducto.objects.filter(nombre__iexact=data['nombre']).exclude(id=categoria_id).exists():
                return JsonResponse({'error': '¡Ya existe una categoría con este nombre!'}, status=400)

        if 'descripcion' in data and data['descripcion'] != categoria.descripcion:
            if CategoriaProducto.objects.filter(descripcion__iexact=data['descripcion']).exclude(id=categoria_id).exists():
                return JsonResponse({'error': '¡Ya existe una categoría con esta descripción!'}, status=400)
        
        categoria.nombre = data.get('nombre', categoria.nombre)
        categoria.descripcion = data.get('descripcion', categoria.descripcion)
        categoria.save()
        
        return JsonResponse({
            'id': categoria.id,
            'nombre': categoria.nombre,
            'descripcion': categoria.descripcion,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
@requiere_admin
def admin_categoria_borrar(request, categoria_id):
    try:
        categoria = get_object_or_404(CategoriaProducto, pk=categoria_id)
        categoria.delete()
        return JsonResponse({'message': 'Categoría eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
def planes(request):
    ##cursos = list(Curso.objects.values('id', 'nombre', 'cupos', 'fecha_realizacion', 'estado','establecimiento'))
    ##inscritos =list(Inscripcion.objects.values('usuario', 'curso', 'fecha_inscripcion','fecha_realizacion'))
    # Subquery: cantidad de inscritos por curso y fecha_realizacion
    cliente_id = request.session.get('cliente_id')
    print('tu cliente_id', cliente_id)
    # Subconsulta: cantidad de inscritos por curso y fecha_realizacion
    inscripciones_subquery = Inscripcion.objects.filter(
        curso=OuterRef('pk'),
        fecha_realizacion=OuterRef('fecha_realizacion')
    ).values('curso').annotate(
        inscritos_count=Count('id')
    ).values('inscritos_count')[:1]

    # Subconsulta para verificar si el usuario está inscrito al curso
    inscrito_exist_subquery = Inscripcion.objects.filter(
        curso=OuterRef('pk'),
        usuario=cliente_id  # Aquí usamos el cliente_id de la sesión
    )

    # Cursos con número de inscritos + indicador si el usuario está inscrito
    cursos = list(
        Curso.objects.annotate(
            inscritos=Coalesce(Subquery(inscripciones_subquery, output_field=IntegerField()), 0),
            inscrito=Exists(inscrito_exist_subquery)
        ).values(
            'id', 'nombre', 'cupos', 'fecha_realizacion', 'estado',
            'establecimiento', 'inscritos', 'inscrito'
        )
    )
    return render(request, 'punto_app/planes.html', {'cursos': cursos})
def inscribir_curso(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        curso_id = data.get('curso_id')
        usuario_id=data.get('usuario_id')
        print(data)
        print(curso_id)
        print(usuario_id)
        inscripcion = Inscripcion.objects.create(
            usuario_id=data['usuario_id'],
            curso_id=data['curso_id'],
            fecha_inscripcion=timezone.now()
        )
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def cancelar_inscripcion(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            usuario_id = data.get('usuario_id')
            curso_id = data.get('curso_id')
            fecha_realizacion = data.get('fecha_realizacion')
            print(data)
            
            # Buscar la inscripción sin el campo fecha_realizacion para mayor flexibilidad
            inscripcion = get_object_or_404(Inscripcion, usuario_id=usuario_id, curso_id=curso_id)
            inscripcion.delete()

            return JsonResponse({'mensaje': 'Inscripción cancelada correctamente.'}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)
def maquinas(request):
    maquinas = Maquina.objects.values('id', 'nombre', 'descripcion', 'cantidad', 'establecimiento_id', 'imagen')
    establecimientos = Establecimiento.objects.values('id', 'nombre')
    return render(request, 'punto_app/maquinas.html', {
        'maquinas': maquinas,
        'establecimientos': establecimientos
    })

@requiere_admin
def admin_maquinas(request):
    maquinas = Maquina.objects.values('id', 'nombre', 'descripcion', 'cantidad', 'establecimiento_id', 'imagen')
    establecimientos = Establecimiento.objects.values('id', 'nombre')
    return render(request, 'punto_app/admin_maquinas.html', {
        'maquinas': maquinas,
        'establecimientos': establecimientos
    })

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
            cantidad=data.get('cantidad', 1),
            establecimiento_id=data['establecimiento_id'],
            imagen=data.get('imagen')
        )
        return JsonResponse({
            'id': maquina.id,
            'nombre': maquina.nombre,
            'descripcion': maquina.descripcion,
            'cantidad': maquina.cantidad,
            'imagen': maquina.imagen
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_maquina_actualizar(request, maquina_id):
    try:
        maquina = get_object_or_404(Maquina, pk=maquina_id)
        data = json.loads(request.body)

        # Validaciones de unicidad excluyendo a la máquina actual
        if 'nombre' in data and data['nombre'] != maquina.nombre:
            if Maquina.objects.filter(nombre__iexact=data['nombre']).exclude(id=maquina_id).exists():
                return JsonResponse({'error': '¡Ya existe una máquina con este nombre!'}, status=400)

        if 'descripcion' in data and data['descripcion'] != maquina.descripcion:
            if Maquina.objects.filter(descripcion__iexact=data['descripcion']).exclude(id=maquina_id).exists():
                return JsonResponse({'error': '¡Ya existe una máquina con esta descripción!'}, status=400)
        
        maquina.nombre = data.get('nombre', maquina.nombre)
        maquina.descripcion = data.get('descripcion', maquina.descripcion)
        maquina.cantidad = data.get('cantidad', maquina.cantidad)
        maquina.establecimiento_id = data.get('establecimiento_id', maquina.establecimiento_id)
        maquina.imagen = data.get('imagen', maquina.imagen)
        maquina.save()
        
        return JsonResponse({
            'id': maquina.id,
            'nombre': maquina.nombre,
            'descripcion': maquina.descripcion,
            'cantidad': maquina.cantidad,
            'establecimiento_id': maquina.establecimiento_id,
            'imagen': maquina.imagen
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
@requiere_admin
def admin_maquina_borrar(request, maquina_id):
    try:
        maquina = get_object_or_404(Maquina, pk=maquina_id)
        maquina.delete()
        return JsonResponse({'message': 'Máquina eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def obtener_imagenes_maquinas(request):
    if request.method == "GET":
        try:
            # Ruta a la carpeta de imágenes de máquinas
            ruta_imagenes = os.path.join(settings.STATICFILES_DIRS[0], 'images', 'maquinas')
            
            # Obtener lista de archivos de imagen
            imagenes = []
            if os.path.exists(ruta_imagenes):
                for archivo in os.listdir(ruta_imagenes):
                    if archivo.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        # Asegurarnos de que la ruta sea relativa a static
                        imagenes.append(f'images/maquinas/{archivo}')
            
            return JsonResponse({
                'imagenes': imagenes
            })
        except Exception as e:
            logger.error(f"Error al obtener imágenes: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)
    
    return JsonResponse({
        'error': 'Método no permitido'
    }, status=405)

@csrf_exempt
def subir_imagen_maquina(request):
    if request.method == "POST":
        try:
            if 'imagen' not in request.FILES:
                return JsonResponse({'error': 'No se ha proporcionado ninguna imagen'}, status=400)
            
            imagen = request.FILES['imagen']
            
            # Validar el tipo de archivo
            if not imagen.content_type.startswith('image/'):
                return JsonResponse({'error': 'El archivo debe ser una imagen'}, status=400)
            
            # Validar la extensión
            extension = os.path.splitext(imagen.name)[1].lower()
            if extension not in ['.png', '.jpg', '.jpeg', '.gif']:
                return JsonResponse({'error': 'Formato de imagen no permitido'}, status=400)
            
            # Crear el directorio si no existe
            ruta_imagenes = os.path.join(settings.STATICFILES_DIRS[0], 'images', 'maquinas')
            os.makedirs(ruta_imagenes, exist_ok=True)
            
            # Generar un nombre único para el archivo
            nombre_archivo = f"{int(time.time())}_{imagen.name}"
            ruta_completa = os.path.join(ruta_imagenes, nombre_archivo)
            
            # Guardar la imagen
            with open(ruta_completa, 'wb+') as destino:
                for chunk in imagen.chunks():
                    destino.write(chunk)
            
            # Devolver la ruta relativa de la imagen
            ruta_relativa = f'images/maquinas/{nombre_archivo}'
            return JsonResponse({
                'success': True,
                'ruta': ruta_relativa
            })
            
        except Exception as e:
            logger.error(f"Error al subir imagen: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def estadisticas(request):
    clientes = Cliente.objects.all()
    Venta_Cliente = VentaCliente.objects.all()
    Detalle_Venta = DetalleVenta.objects.all()
    return render(request, 'punto_app/admin_estadisticas.html')
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
        
        # Obtener los datos con las relaciones
        compra_con_relaciones = CompraVendedor.objects.select_related('establecimiento', 'vendedor').get(id=compra_vendedor.id)
        
        return JsonResponse({
            'id': compra_vendedor.id,
            'fecha': compra_vendedor.fecha,
            'total': compra_vendedor.total,
            'iva': compra_vendedor.iva,
            'estado': compra_vendedor.estado,
            'establecimiento_id': compra_vendedor.establecimiento_id,
            'vendedor_id': compra_vendedor.vendedor_id,
            'establecimiento__nombre': compra_con_relaciones.establecimiento.nombre,
            'vendedor__nombre': compra_con_relaciones.vendedor.nombre
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
        
        # Obtener los datos con las relaciones
        compra_con_relaciones = CompraVendedor.objects.select_related('establecimiento', 'vendedor').get(id=compra_vendedor.id)
        
        return JsonResponse({
            'id': compra_vendedor.id,
            'fecha': compra_vendedor.fecha,
            'total': compra_vendedor.total,
            'iva': compra_vendedor.iva,
            'estado': compra_vendedor.estado,
            'establecimiento_id': compra_vendedor.establecimiento_id,
            'vendedor_id': compra_vendedor.vendedor_id,
            'establecimiento__nombre': compra_con_relaciones.establecimiento.nombre,
            'vendedor__nombre': compra_con_relaciones.vendedor.nombre
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_compra_vendedor_borrar(request, compra_vendedor_id):
    try:
        compra_vendedor = get_object_or_404(CompraVendedor, pk=compra_vendedor_id)
        compra_vendedor.delete()
        return JsonResponse({'message': 'Compra eliminada correctamente'}, status=200)
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
        
        # Obtener los datos con las relaciones
        vendedor_con_relaciones = Vendedor.objects.select_related('proveedor').get(id=vendedor.id)
        
        return JsonResponse({
            'id': vendedor.id,
            'nombre': vendedor.nombre,
            'telefono': vendedor.telefono,
            'email': vendedor.email,
            'proveedor_id': vendedor.proveedor_id,
            'proveedor__nombre': vendedor_con_relaciones.proveedor.nombre
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
        vendedor.proveedor_id = data.get('proveedor', vendedor.proveedor_id)
        vendedor.save()
        
        # Obtener los datos con las relaciones
        vendedor_con_relaciones = Vendedor.objects.select_related('proveedor').get(id=vendedor.id)
        
        return JsonResponse({
            'id': vendedor.id,
            'nombre': vendedor.nombre,
            'telefono': vendedor.telefono,
            'email': vendedor.email,
            'proveedor_id': vendedor.proveedor_id,
            'proveedor__nombre': vendedor_con_relaciones.proveedor.nombre
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
@requiere_admin
def admin_vendedor_borrar(request, vendedor_id):
    try:
        vendedor = get_object_or_404(Vendedor, pk=vendedor_id)
        vendedor.delete()
        return JsonResponse({'message': 'Vendedor eliminado correctamente'}, status=200)
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
        
        # Obtener los datos con las relaciones
        establecimiento_con_relaciones = Establecimiento.objects.select_related('proveedor').get(id=establecimiento.id)
        
        return JsonResponse({
            'id': establecimiento.id,
            'nombre': establecimiento.nombre,
            'direccion': establecimiento.direccion,
            'telefono': establecimiento.telefono,
            'email': establecimiento.email,
            'horario_apertura': establecimiento.horario_apertura,
            'horario_cierre': establecimiento.horario_cierre,
            'proveedor_id': establecimiento.proveedor_id,
            'proveedor__nombre': establecimiento_con_relaciones.proveedor.nombre
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
        establecimiento.proveedor_id = data.get('proveedor', establecimiento.proveedor_id)
        establecimiento.save()
        
        return JsonResponse({
            'success': True,
            'data': {
                'id': establecimiento.id,
                'nombre': establecimiento.nombre,
                'direccion': establecimiento.direccion,
                'telefono': establecimiento.telefono,
                'email': establecimiento.email,
                'horario_apertura': establecimiento.horario_apertura,
                'horario_cierre': establecimiento.horario_cierre,
                'proveedor_id': establecimiento.proveedor_id,
                'proveedor__nombre': establecimiento.proveedor.nombre
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
@csrf_exempt   
def admin_establecimiento_borrar(request, establecimiento_id):
    try:
        establecimiento = get_object_or_404(Establecimiento, pk=establecimiento_id)
        establecimiento.delete()
        return JsonResponse({'message': 'Establecimiento eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_proveedor_crear(request):
    try:
        data = json.loads(request.body)
        
        proveedor = Proveedor.objects.create(
            nombre=data['nombre'],
            telefono=data['telefono'],
            email=data['email'],
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
            'success': True,
            'data': {
                'id': proveedor.id,
                'nombre': proveedor.nombre,
                'telefono': proveedor.telefono,
                'email': proveedor.email,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
   
    
@csrf_exempt   
def admin_proveedor_borrar(request, proveedor_id):
    try:
        proveedor = get_object_or_404(Proveedor, pk=proveedor_id)
        proveedor.delete()
        return JsonResponse({'message': 'Proveedor eliminado correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@requiere_admin
def cursos(request):
    cursos = Curso.objects.values('id', 'nombre', 'cupos', 'fecha_realizacion', 'estado', 'establecimiento_id')
    inscripciones = Inscripcion.objects.values('id', 'usuario_id', 'curso_id', 'fecha_inscripcion','fecha_realizacion')
    usuarios = Cliente.objects.values('id', 'nombre', 'apellido', 'email', 'telefono')
    establecimientos = Establecimiento.objects.values('id', 'nombre')
    return render(request, 'punto_app/admin_cursos.html', {'cursos': cursos, 'usuarios': usuarios, 'inscripciones': inscripciones, 'establecimientos': establecimientos})

@csrf_exempt
@requiere_admin
def admin_curso_crear(request):
    try:
        data = json.loads(request.body)
        curso = Curso.objects.create(
            nombre=data['nombre'],
            cupos=data['cupos'],
            fecha_realizacion=data['fecha_realizacion'],
            establecimiento_id=data['establecimiento_id']
        )
        return JsonResponse({
            'id': curso.id,
            'nombre': curso.nombre,
            'cupos': curso.cupos,
            'fecha_realizacion': curso.fecha_realizacion,
            'establecimiento_id': curso.establecimiento_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def admin_curso_actualizar(request, curso_id):
    try:
        curso = get_object_or_404(Curso, pk=curso_id)
        data = json.loads(request.body)
        
        # Validar que la fecha de realización no esté vacía
        fecha_realizacion = data.get('fecha_realizacion')
        if not fecha_realizacion:
            return JsonResponse({'error': 'La fecha de realización es obligatoria'}, status=400)
        
        curso.nombre = data.get('nombre', curso.nombre)
        curso.cupos = data.get('cupos', curso.cupos)
        curso.fecha_realizacion = fecha_realizacion
        curso.estado = data.get('estado', curso.estado)
        curso.establecimiento_id = data.get('establecimiento_id', curso.establecimiento_id)
        curso.save()
        
        return JsonResponse({
            'id': curso.id,
            'nombre': curso.nombre,
            'cupos': curso.cupos,
            'fecha_realizacion': curso.fecha_realizacion,
            'estado': curso.estado,
            'establecimiento_id': curso.establecimiento_id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
@requiere_admin
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
            fecha_inscripcion=timezone.now()
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
        
        # Validar que los campos requeridos no estén vacíos
        if 'usuario_id' in data:
            if not data['usuario_id']:
                return JsonResponse({'error': 'El usuario es requerido'}, status=400)
        else:
            return JsonResponse({'error': 'El usuario es requerido'}, status=400)
        
        if 'curso_id' in data:
            if not data['curso_id']:
                return JsonResponse({'error': 'El curso es requerido'}, status=400)
        else:
            return JsonResponse({'error': 'El curso es requerido'}, status=400)
        
        # Validar que el usuario existe
        if 'usuario_id' in data:
            try:
                Cliente.objects.get(id=data['usuario_id'])
            except Cliente.DoesNotExist:
                return JsonResponse({'error': 'El usuario seleccionado no existe'}, status=400)
        
        # Validar que el curso existe
        if 'curso_id' in data:
            try:
                Curso.objects.get(id=data['curso_id'])
            except Curso.DoesNotExist:
                return JsonResponse({'error': 'El curso seleccionado no existe'}, status=400)
        
        # Validar que no existe otra inscripción del mismo usuario al mismo curso
        if 'usuario_id' in data and 'curso_id' in data:
            inscripcion_existente = Inscripcion.objects.filter(
                usuario_id=data['usuario_id'],
                curso_id=data['curso_id']
            ).exclude(id=inscripcion_id).first()
            
            if inscripcion_existente:
                return JsonResponse({'error': 'El usuario ya está inscrito en este curso'}, status=400)
        
        inscripcion.usuario_id = data.get('usuario_id', inscripcion.usuario_id)
        inscripcion.curso_id = data.get('curso_id', inscripcion.curso_id)
        inscripcion.save()
        
        return JsonResponse({
            'id': inscripcion.id,
            'usuario_id': inscripcion.usuario_id,
            'curso_id': inscripcion.curso_id,
            'fecha_inscripcion': inscripcion.fecha_inscripcion
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
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
            hora_local = localtime(asistencia.fecha_hora_entrada)
            mensaje = hora_local.strftime('%H:%M:%S')
            messages.success(request, 
                f"Asistencia registrada: {cliente.nombre} en {establecimiento.nombre} "
                f"a las {mensaje}"
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
            hora_local = localtime(registro.fecha_hora_salida)
            mensaje = hora_local.strftime('%H:%M:%S')
            messages.success(request, 
                f"Salida registrada para {registro.usuario.nombre} {registro.usuario.apellido} "
                f"en {registro.establecimiento.nombre} "
                f"a las {mensaje}"
            )
            
        except RegistroAcceso.DoesNotExist:
            messages.error(request, "No se encontró una entrada pendiente de salida para este usuario en el establecimiento seleccionado")
        except Exception as e:
            messages.error(request, f"Error al registrar salida: {str(e)}")
            print(f'Error al registrar salida: {str(e)}')  # Log para depuración
        
        return redirect('asistencias')
    
    return redirect('asistencias')

@requiere_superadmin
def super_admin(request):
    try:
        cliente_id = request.session['cliente_id']
        cliente = Cliente.objects.get(id=cliente_id)
        
        # Obtener solo clientes que NO son administradores
        clientes_no_admin = Cliente.objects.filter(administrador__isnull=True)
        administradores = Administrador.objects.select_related('cliente').all()

        return render(request, 'punto_app/super_admin.html', {
            'clientes': clientes_no_admin,
            'administradores': administradores,
            'establecimientos': Establecimiento.objects.all()
        })
            
    except Cliente.DoesNotExist:
        return render(request, 'punto_app/no_autorizado.html')
    except Exception as e:
        logger.error(f"Error en super_admin: {str(e)}")
        return render(request, 'punto_app/no_autorizado.html')


@csrf_exempt
@requiere_superadmin
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
                    cliente=cliente,
                    defaults={'nivel_acceso': 'admin', 'establecimiento_id': establecimiento_id}
                )
                if not created:
                    admin.nivel_acceso = 'admin'
                    admin.establecimiento_id = establecimiento_id
                    admin.save()
            else:
                # Quitar admin
                Administrador.objects.filter(cliente=cliente).delete()
            return JsonResponse({'success': True})
        except Cliente.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Cliente no encontrado'})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@csrf_exempt
@requiere_superadmin
def crear_o_actualizar_admin(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            cliente_id = data.get('cliente_id')
            nivel_acceso = data.get('nivel_acceso')

            if not cliente_id or not nivel_acceso:
                return JsonResponse({'error': 'Faltan datos'}, status=400)

            cliente = Cliente.objects.get(id=cliente_id)

            # Lógica para asegurar solo un superadmin
            if nivel_acceso == 'superadmin':
                # Encontrar y demote a cualquier otro superadmin
                Administrador.objects.filter(nivel_acceso='superadmin').exclude(cliente=cliente).update(nivel_acceso='admin')

            admin, created = Administrador.objects.get_or_create(cliente=cliente)
            admin.nivel_acceso = nivel_acceso
            admin.save()

            return JsonResponse({
                'success': True,
                'admin': {
                    'id': admin.id,
                    'cliente': {
                        'nombre': cliente.nombre,
                        'apellido': cliente.apellido,
                        'email': cliente.email,
                        'telefono': cliente.telefono,
                    },
                    'nivel_acceso': admin.nivel_acceso,
                }
            })
        except Cliente.DoesNotExist:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@requiere_superadmin
def actualizar_admin(request, admin_id):
    if request.method == "PUT":
        try:
            admin_obj = get_object_or_404(Administrador, pk=admin_id)
            data = json.loads(request.body)

            # Actualizar datos del Cliente asociado
            cliente = admin_obj.cliente
            cliente.nombre = data.get('nombre', cliente.nombre)
            cliente.apellido = data.get('apellido', cliente.apellido)
            cliente.email = data.get('correo', cliente.email)
            cliente.telefono = data.get('telefono', cliente.telefono)
            cliente.save()

            # Actualizar el nivel de acceso del Administrador
            # Lógica para asegurar solo un superadmin
            if data.get('nivel_acceso') == 'superadmin':
                Administrador.objects.filter(nivel_acceso='superadmin').exclude(pk=admin_id).update(nivel_acceso='admin')

            admin_obj.nivel_acceso = data.get('nivel_acceso', admin_obj.nivel_acceso)
            admin_obj.save()

            return JsonResponse({
                'id': admin_obj.id,
                'cliente': {
                    'nombre': cliente.nombre,
                    'apellido': cliente.apellido,
                    'email': cliente.email,
                    'telefono': cliente.telefono,
                },
                'nivel_acceso': admin_obj.nivel_acceso,
            }, status=200)

        except Administrador.DoesNotExist:
            return JsonResponse({'error': 'Administrador no encontrado'}, status=404)
        except Cliente.DoesNotExist:
            return JsonResponse({'error': 'Cliente asociado no encontrado'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@requiere_superadmin
def borrar_admin(request, admin_id):
    if request.method == "DELETE":
        try:
            admin_obj = get_object_or_404(Administrador, pk=admin_id)
            admin_obj.delete()
            return JsonResponse({'message': 'Administrador eliminado correctamente'}, status=200)
        except Administrador.DoesNotExist:
            return JsonResponse({'error': 'Administrador no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def verificar_sesion(request):
    if request.method == "GET":
        # Verificar si el usuario está autenticado usando la sesión
        cliente_id = request.session.get('cliente_id')
        
        if cliente_id:
            try:
                cliente = Cliente.objects.get(id=cliente_id)
                admin_obj = Administrador.objects.filter(cliente=cliente).first()
                
                return JsonResponse({
                    'is_authenticated': True,
                    'cliente_nombre': cliente.nombre,
                    'cliente_email': cliente.email,
                    'cliente_telefono': cliente.telefono,
                    'nivel_acceso': admin_obj.nivel_acceso.lower() if admin_obj else 'cliente'
                })
            except Cliente.DoesNotExist:
                # Si el cliente no existe, limpiar la sesión
                request.session.flush()
                return JsonResponse({
                    'is_authenticated': False,
                    'requires_auth': False
                })
        else:
            return JsonResponse({
                'is_authenticated': False,
                'requires_auth': False
            })
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            cliente_id = data.get('cliente_id')
            
            if cliente_id:
                cliente = Cliente.objects.filter(id=cliente_id).first()
                if cliente:
                    return JsonResponse({
                        'autenticado': True,
                        'nombre': cliente.nombre,
                        'email': cliente.email
                    })
            
            return JsonResponse({'autenticado': False})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def recuperar_contrasena(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            correo = data.get('correo')
            
            if not correo:
                return JsonResponse({'error': 'Correo no proporcionado'}, status=400)
            
            # Verificar si el correo existe en la base de datos
            cliente = Cliente.objects.filter(email=correo).first()
            if not cliente:
                return JsonResponse({'error': 'No existe una cuenta con este correo electrónico'}, status=404)
            
            # Aquí normalmente se enviaría un email con un enlace de recuperación
            # Por ahora, solo simulamos el envío exitoso
            
            # En un entorno real, aquí se generaría un token único y se enviaría por email
            # Por simplicidad, solo retornamos un mensaje de éxito
            
            return JsonResponse({
                'message': f'Se ha enviado un enlace de recuperación a {correo}. Por favor, revise su bandeja de entrada.'
            }, status=200)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def obtener_imagenes_productos(request):
    if request.method == "GET":
        try:
            # Ruta a la carpeta de imágenes de productos
            ruta_imagenes = os.path.join(settings.STATICFILES_DIRS[0], 'images', 'productos')
            
            # Obtener lista de archivos de imagen
            imagenes = []
            if os.path.exists(ruta_imagenes):
                for archivo in os.listdir(ruta_imagenes):
                    if archivo.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        # Asegurarnos de que la ruta sea relativa a static
                        imagenes.append(f'images/productos/{archivo}')
            
            return JsonResponse({
                'imagenes': imagenes
            })
        except Exception as e:
            logger.error(f"Error al obtener imágenes: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)
    
    return JsonResponse({
        'error': 'Método no permitido'
    }, status=405)

@csrf_exempt
def subir_imagen_producto(request):
    if request.method == "POST":
        try:
            if 'imagen' not in request.FILES:
                return JsonResponse({'error': 'No se ha proporcionado ninguna imagen'}, status=400)
            
            imagen = request.FILES['imagen']
            
            # Validar el tipo de archivo
            if not imagen.content_type.startswith('image/'):
                return JsonResponse({'error': 'El archivo debe ser una imagen'}, status=400)
            
            # Validar la extensión
            extension = os.path.splitext(imagen.name)[1].lower()
            if extension not in ['.png', '.jpg', '.jpeg', '.gif']:
                return JsonResponse({'error': 'Formato de imagen no permitido'}, status=400)
            
            # Crear el directorio si no existe
            ruta_imagenes = os.path.join(settings.STATICFILES_DIRS[0], 'images', 'productos')
            os.makedirs(ruta_imagenes, exist_ok=True)
            
            # Generar un nombre único para el archivo
            nombre_archivo = f"{int(time.time())}_{imagen.name}"
            ruta_completa = os.path.join(ruta_imagenes, nombre_archivo)
            
            # Guardar la imagen
            with open(ruta_completa, 'wb+') as destino:
                for chunk in imagen.chunks():
                    destino.write(chunk)
            
            # Devolver la ruta relativa de la imagen
            ruta_relativa = f'images/productos/{nombre_archivo}'
            return JsonResponse({
                'success': True,
                'ruta': ruta_relativa
            })
            
        except Exception as e:
            logger.error(f"Error al subir imagen: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def venta_producto (request):
    productos = Producto.objects.all()
    categorias = CategoriaProducto.objects.all()
    return render(request, 'punto_app/ventaproducto.html',{'productos': productos,'categorias': categorias})


@csrf_exempt
def finalizar_compra(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("🛒 Datos recibidos del carrito:")

            productos_voucher = []
            total_general = 0

            for producto_data in data.get('productos', []):
                producto_id = producto_data.get('id')
                cantidad = int(producto_data.get('quantity'))
                precio = float(producto_data.get('price'))

                # Buscar producto en la base de datos
                try:
                    producto = Producto.objects.get(id=producto_id)
                except Producto.DoesNotExist:
                    return JsonResponse({'mensaje': f'Producto con ID {producto_id} no encontrado'}, status=404)

                # Verificar stock suficiente
                if producto.stock_actual < cantidad:
                    return JsonResponse({'mensaje': f'Stock insuficiente para {producto.nombre}'}, status=400)


                # Agregar al resumen del voucher
                total = precio * cantidad
                total_general += total

                productos_voucher.append({
                    'nombre': producto.nombre,
                    'precio_unitario': precio,
                    'cantidad': cantidad,
                    'total_producto': round(total, 2)
                })
            # Resumen general
            voucher = {
                'fecha': timezone.now().strftime('%Y-%m-%d'),
                'hora':timezone.now().strftime('%H:%M:%S'),
                'productos': productos_voucher,
                'total_general': round(total_general, 2),
                'subtotal':total_general,
                'porcentaje_iva':'19',
                'valor_iva':total_general*0.19,
            }

            print("\n📄 Voucher generado:")
            for p in voucher['productos']:
                print(f"Producto: {p['nombre']}, Cantidad: {p['cantidad']}, Precio: {p['precio_unitario']}, Total: {p['total_producto']}")
            print(f"🕒 Fecha: {voucher['fecha']}")
            print(f"💰 Total general de la compra: {voucher['total_general']}")

            return JsonResponse({'mensaje': 'Compra finalizada', 'voucher': voucher})

        except Exception as e:
            print("❌ Error al procesar la compra:", e)
            return JsonResponse({'mensaje': 'Error en la compra'}, status=400)

    return JsonResponse({'mensaje': 'Método no permitido'}, status=405)

def mostrar_voucher(request):
    if request.method == 'POST':
        try:
            clientes=list(Cliente.objects.values('id','nombre','apellido','email','telefono'))
            forma_pago = list(MetodoPago.objects.values('id','nombre'))
            voucher_data = json.loads(request.POST.get('voucher_data'))
            return render(request, 'punto_app/voucher_venta.html', {'voucher': voucher_data,'clientes':json.dumps(clientes),'forma_pago':json.dumps(forma_pago)})
        except Exception as e:
            return render(request, 'error.html', {'mensaje': 'Error al mostrar voucher.'})
    return render(request, 'error.html', {'mensaje': 'Método no permitido.'})

@csrf_exempt
def venta_confirmada(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        documento = request.POST.get('documento')
        telefono = request.POST.get('telefono')
        email = request.POST.get('email')
        metodo_pago_id = request.POST.get('metodo_pago')  # Se recibe el ID ahora
        productos_json = request.POST.get('productos_json')
        cliente_id = request.POST.get('cliente_id', '00')

        productos = json.loads(productos_json)

        try:
            # Obtener método de pago
            metodo_pago = MetodoPago.objects.get(id=metodo_pago_id)

            # Obtener establecimiento (ejemplo: si tienes uno por defecto)
            establecimiento = Establecimiento.objects.first()  # o según el usuario logueado

            # Calcular el total de la venta
            total = sum(int(p['total_producto']) for p in productos)

            if cliente_id == '00':
                # Si no hay cliente registrado, puedes crear un cliente temporal si lo deseas
                cliente = Cliente.objects.create(
                    nombre=nombre,
                    apellido='',
                    email=email,
                    telefono=telefono
                )
            else:
                cliente = Cliente.objects.get(id=cliente_id)

            # Crear la venta
            venta = VentaCliente.objects.create(
                establecimiento=establecimiento,
                metodo_pago=metodo_pago,
                usuario=cliente,
                fecha=timezone.now().date(),
                total=total
            )

            # Guardar detalles de venta
            for item in productos:
                nombre_codigo = item['nombre_codigo']
                cantidad = int(item['cantidad'])
                precio_unitario = int(item['precio_unitario'])
                subtotal = int(item['total_producto'])
                iva = round(subtotal * 0.19, 2)  # o como sea que calcules el IVA
                print(f"Buscando producto con nombre_codigo: {nombre_codigo}")

                # Buscar el producto por nombre o código
                
                producto = Producto.objects.filter(nombre__icontains=nombre_codigo).first()
                print('los productos son',producto)
                if not producto:
                    continue  # Saltar si no se encuentra

                DetalleVenta.objects.create(
                    cantidad=cantidad,
                    iva=iva,
                    subtotal=subtotal,
                    precio_unitario=precio_unitario,
                    producto=producto,
                    venta=venta
                )

            return JsonResponse({'status': 'ok'})
        
        except Exception as e:
            print("ERROR en guardar venta:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)


@requiere_admin
def membresias(request):
    membresias = Membresia.objects.select_related('establecimiento').values(
        'id', 'nombre', 'descripcion', 'precio', 'duracion', 'dias_por_semana',
        'establecimiento_id', 'establecimiento__nombre'
    )
    establecimientos = Establecimiento.objects.all()
    return render(request, 'punto_app/admin_membresias.html', {
        'membresias': membresias,
        'establecimientos': establecimientos
    })

@csrf_exempt
@requiere_admin
def admin_membresia_crear(request):
    try:
        data = json.loads(request.body)
        
        membresia = Membresia.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio=data['precio'],
            duracion=data['duracion'],
            dias_por_semana=data.get('dias_por_semana'),
            establecimiento_id=data['establecimiento_id']
        )
        
        return JsonResponse({
            'id': membresia.id,
            'nombre': membresia.nombre,
            'descripcion': membresia.descripcion,
            'precio': membresia.precio,
            'duracion': membresia.duracion,
            'dias_por_semana': membresia.dias_por_semana,
            'establecimiento_id': membresia.establecimiento_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_membresia_actualizar(request, membresia_id):
    try:
        membresia = get_object_or_404(Membresia, pk=membresia_id)
        data = json.loads(request.body)
        
        membresia.nombre = data.get('nombre', membresia.nombre)
        membresia.descripcion = data.get('descripcion', membresia.descripcion)
        membresia.precio = data.get('precio', membresia.precio)
        membresia.duracion = data.get('duracion', membresia.duracion)
        membresia.dias_por_semana = data.get('dias_por_semana', membresia.dias_por_semana)
        membresia.establecimiento_id = data.get('establecimiento_id', membresia.establecimiento_id)
        membresia.save()
        
        return JsonResponse({
            'id': membresia.id,
            'nombre': membresia.nombre,
            'descripcion': membresia.descripcion,
            'precio': membresia.precio,
            'duracion': membresia.duracion,
            'dias_por_semana': membresia.dias_por_semana,
            'establecimiento_id': membresia.establecimiento_id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_membresia_borrar(request, membresia_id):
    try:
        membresia = get_object_or_404(Membresia, pk=membresia_id)
        membresia.delete()
        return JsonResponse({'message': 'Membresía eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@requiere_admin
def membresias(request):
    membresias = Membresia.objects.select_related('establecimiento').values(
        'id', 'nombre', 'descripcion', 'precio', 'duracion', 'dias_por_semana',
        'establecimiento_id', 'establecimiento__nombre'
    )
    establecimientos = Establecimiento.objects.all()
    
    # Agregar datos de ClienteMembresia con fechas formateadas para input date
    cliente_membresias_raw = ClienteMembresia.objects.select_related('usuario', 'membresia').values(
        'id', 'usuario_id', 'membresia_id', 'fecha_inicio', 'fecha_fin', 'estado', 'codigo_qr',
        'usuario__nombre', 'usuario__apellido', 'usuario__email',
        'membresia__nombre', 'membresia__precio'
    )
    
    # Formatear las fechas para el input de tipo date
    cliente_membresias = []
    for cm in cliente_membresias_raw:
        cm_dict = dict(cm)
        if cm_dict['fecha_inicio']:
            cm_dict['fecha_inicio_formatted'] = cm_dict['fecha_inicio'].strftime('%Y-%m-%d')
        else:
            cm_dict['fecha_inicio_formatted'] = ''
        if cm_dict['fecha_fin']:
            cm_dict['fecha_fin_formatted'] = cm_dict['fecha_fin'].strftime('%Y-%m-%d')
        else:
            cm_dict['fecha_fin_formatted'] = ''
        cliente_membresias.append(cm_dict)
    
    clientes = Cliente.objects.all()
    
    return render(request, 'punto_app/admin_membresias.html', {
        'membresias': membresias,
        'establecimientos': establecimientos,
        'cliente_membresias': cliente_membresias,
        'clientes': clientes
    })

@csrf_exempt
@requiere_admin
def admin_membresia_crear(request):
    try:
        data = json.loads(request.body)
        
        membresia = Membresia.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio=data['precio'],
            duracion=data['duracion'],
            dias_por_semana=data.get('dias_por_semana'),
            establecimiento_id=data['establecimiento_id']
        )
        
        return JsonResponse({
            'id': membresia.id,
            'nombre': membresia.nombre,
            'descripcion': membresia.descripcion,
            'precio': membresia.precio,
            'duracion': membresia.duracion,
            'dias_por_semana': membresia.dias_por_semana,
            'establecimiento_id': membresia.establecimiento_id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_membresia_actualizar(request, membresia_id):
    try:
        membresia = get_object_or_404(Membresia, pk=membresia_id)
        data = json.loads(request.body)
        
        membresia.nombre = data.get('nombre', membresia.nombre)
        membresia.descripcion = data.get('descripcion', membresia.descripcion)
        membresia.precio = data.get('precio', membresia.precio)
        membresia.duracion = data.get('duracion', membresia.duracion)
        membresia.dias_por_semana = data.get('dias_por_semana', membresia.dias_por_semana)
        membresia.establecimiento_id = data.get('establecimiento_id', membresia.establecimiento_id)
        membresia.save()
        
        # Recalcular fecha_fin de todas las ClienteMembresia asociadas
        from datetime import timedelta
        from dateutil.relativedelta import relativedelta
        cliente_membresias = ClienteMembresia.objects.filter(membresia_id=membresia.id)
        for cm in cliente_membresias:
            if membresia.duracion == 'semanal':
                cm.fecha_fin = cm.fecha_inicio + timedelta(days=7)
            elif membresia.duracion == 'mensual':
                cm.fecha_fin = cm.fecha_inicio + relativedelta(months=1)
            elif membresia.duracion == 'anual':
                cm.fecha_fin = cm.fecha_inicio + relativedelta(years=1)
            else:
                cm.fecha_fin = cm.fecha_inicio
            cm.save()
        
        return JsonResponse({
            'id': membresia.id,
            'nombre': membresia.nombre,
            'descripcion': membresia.descripcion,
            'precio': membresia.precio,
            'duracion': membresia.duracion,
            'dias_por_semana': membresia.dias_por_semana,
            'establecimiento_id': membresia.establecimiento_id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_membresia_borrar(request, membresia_id):
    try:
        membresia = get_object_or_404(Membresia, pk=membresia_id)
        membresia.delete()
        return JsonResponse({'message': 'Membresía eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# Funciones CRUD para ClienteMembresia
@csrf_exempt
@requiere_admin
def admin_cliente_membresia_crear(request):
    try:
        data = json.loads(request.body)
        fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date()
        membresia = Membresia.objects.get(id=data['membresia_id'])
        # Calcular fecha_fin según la duración
        if membresia.duracion == 'semanal':
            from datetime import timedelta
            fecha_fin = fecha_inicio + timedelta(days=7)
        elif membresia.duracion == 'mensual':
            from dateutil.relativedelta import relativedelta
            fecha_fin = fecha_inicio + relativedelta(months=1)
        elif membresia.duracion == 'anual':
            from dateutil.relativedelta import relativedelta
            fecha_fin = fecha_inicio + relativedelta(years=1)
        else:
            fecha_fin = fecha_inicio
        
        cliente_membresia = ClienteMembresia.objects.create(
            usuario_id=data['usuario_id'],
            membresia_id=data['membresia_id'],
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=data['estado']
        )
        
        return JsonResponse({
            'id': cliente_membresia.id,
            'usuario_id': cliente_membresia.usuario_id,
            'membresia_id': cliente_membresia.membresia_id,
            'fecha_inicio': cliente_membresia.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': cliente_membresia.fecha_fin.strftime('%Y-%m-%d'),
            'estado': cliente_membresia.estado
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_cliente_membresia_actualizar(request, cliente_membresia_id):
    try:
        cliente_membresia = get_object_or_404(ClienteMembresia, pk=cliente_membresia_id)
        data = json.loads(request.body)
        
        cliente_membresia.usuario_id = data.get('usuario_id', cliente_membresia.usuario_id)
        cliente_membresia.membresia_id = data.get('membresia_id', cliente_membresia.membresia_id)
        
        # Recalcular fecha_inicio y fecha_fin si se edita la fecha de inicio o la membresía
        if 'fecha_inicio' in data or 'membresia_id' in data:
            if 'fecha_inicio' in data:
                fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date()
            else:
                fecha_inicio = cliente_membresia.fecha_inicio
            membresia = Membresia.objects.get(id=cliente_membresia.membresia_id)
            if 'membresia_id' in data:
                membresia = Membresia.objects.get(id=data['membresia_id'])
            if membresia.duracion == 'semanal':
                from datetime import timedelta
                fecha_fin = fecha_inicio + timedelta(days=7)
            elif membresia.duracion == 'mensual':
                from dateutil.relativedelta import relativedelta
                fecha_fin = fecha_inicio + relativedelta(months=1)
            elif membresia.duracion == 'anual':
                from dateutil.relativedelta import relativedelta
                fecha_fin = fecha_inicio + relativedelta(years=1)
            else:
                fecha_fin = fecha_inicio
            cliente_membresia.fecha_inicio = fecha_inicio
            cliente_membresia.fecha_fin = fecha_fin
        
        cliente_membresia.estado = data.get('estado', cliente_membresia.estado)
        cliente_membresia.save()
        
        return JsonResponse({
            'id': cliente_membresia.id,
            'usuario_id': cliente_membresia.usuario_id,
            'membresia_id': cliente_membresia.membresia_id,
            'fecha_inicio': cliente_membresia.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': cliente_membresia.fecha_fin.strftime('%Y-%m-%d'),
            'estado': cliente_membresia.estado
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_cliente_membresia_borrar(request, cliente_membresia_id):
    try:
        cliente_membresia = get_object_or_404(ClienteMembresia, pk=cliente_membresia_id)
        cliente_membresia.delete()
        return JsonResponse({'message': 'ClienteMembresia eliminada correctamente'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
    
@requiere_admin
def estadisticas_view(request):
    # Obtener fecha actual y fechas de referencia
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    six_months_ago = now - timedelta(days=180)
    
    # Debug: Verificar si hay datos en las tablas
    total_ventas = VentaCliente.objects.count()
    total_membresias = ClienteMembresia.objects.count()
    total_productos = Producto.objects.count()
    
    logger.info(f"Debug estadísticas - Total ventas: {total_ventas}, Total membresías: {total_membresias}, Total productos: {total_productos}")
    
    # 1. Ventas monetarias por diferentes períodos
    # Ventas diarias (últimos 7 días)
    ventas_diarias = (
        VentaCliente.objects
        .filter(fecha__gte=now.date() - timedelta(days=7))
        .annotate(dia=TruncDay('fecha'))
        .values('dia')
        .annotate(total=Sum('total'))
        .order_by('dia')
    )
    
    # Ventas semanales (últimas 4 semanas)
    ventas_semanales = (
        VentaCliente.objects
        .filter(fecha__gte=now.date() - timedelta(days=28))
        .annotate(semana=TruncWeek('fecha'))
        .values('semana')
        .annotate(total=Sum('total'))
        .order_by('semana')
    )
    
    # Ventas mensuales (últimos 6 meses)
    ventas_mensuales = (
        VentaCliente.objects
        .filter(fecha__gte=six_months_ago.date())
        .annotate(mes=TruncMonth('fecha'))
        .values('mes')
        .annotate(total=Sum('total'))
        .order_by('mes')
    )
    
    # Ventas anuales (todos los años disponibles)
    ventas_anuales = (
        VentaCliente.objects
        .annotate(anio=TruncYear('fecha'))
        .values('anio')
        .annotate(total=Sum('total'))
        .order_by('anio')
    )
    
    # Si no hay ventas recientes, mostrar todas las ventas disponibles
    if not ventas_mensuales.exists():
        ventas_mensuales = (
            VentaCliente.objects
            .annotate(mes=TruncMonth('fecha'))
            .values('mes')
            .annotate(total=Sum('total'))
            .order_by('mes')
        )
    
    if not ventas_semanales.exists():
        ventas_semanales = (
            VentaCliente.objects
            .annotate(semana=TruncWeek('fecha'))
            .values('semana')
            .annotate(total=Sum('total'))
            .order_by('semana')
        )
    
    if not ventas_diarias.exists():
        ventas_diarias = (
            VentaCliente.objects
            .annotate(dia=TruncDay('fecha'))
            .values('dia')
            .annotate(total=Sum('total'))
            .order_by('dia')
        )
    
    # 2. Ventas por categoría de producto por diferentes períodos
    # Ventas por categoría diarias (últimos 7 días)
    ventas_categoria_diarias = (
        DetalleVenta.objects
        .filter(venta__fecha__gte=now.date() - timedelta(days=7))
        .annotate(dia=TruncDay('venta__fecha'))
        .values('producto__categoria__nombre', 'dia')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('producto__categoria__nombre', 'dia')
    )
    
    # Ventas por categoría semanales (últimas 4 semanas)
    ventas_categoria_semanales = (
        DetalleVenta.objects
        .filter(venta__fecha__gte=now.date() - timedelta(days=28))
        .annotate(semana=TruncWeek('venta__fecha'))
        .values('producto__categoria__nombre', 'semana')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('producto__categoria__nombre', 'semana')
    )
    
    # Ventas por categoría mensuales (últimos 6 meses)
    ventas_categoria_mensuales = (
        DetalleVenta.objects
        .filter(venta__fecha__gte=six_months_ago.date())
        .annotate(mes=TruncMonth('venta__fecha'))
        .values('producto__categoria__nombre', 'mes')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('producto__categoria__nombre', 'mes')
    )
    
    # Ventas por categoría anuales (todos los años disponibles)
    ventas_categoria_anuales = (
        DetalleVenta.objects
        .annotate(anio=TruncYear('venta__fecha'))
        .values('producto__categoria__nombre', 'anio')
        .annotate(total_vendido=Sum('cantidad'))
        .order_by('producto__categoria__nombre', 'anio')
    )
    
    # Si no hay ventas por categoría recientes, mostrar todas las disponibles
    if not ventas_categoria_mensuales.exists():
        ventas_categoria_mensuales = (
            DetalleVenta.objects
            .annotate(mes=TruncMonth('venta__fecha'))
            .values('producto__categoria__nombre', 'mes')
            .annotate(total_vendido=Sum('cantidad'))
            .order_by('producto__categoria__nombre', 'mes')
        )
    
    if not ventas_categoria_semanales.exists():
        ventas_categoria_semanales = (
            DetalleVenta.objects
            .annotate(semana=TruncWeek('venta__fecha'))
            .values('producto__categoria__nombre', 'semana')
            .annotate(total_vendido=Sum('cantidad'))
            .order_by('producto__categoria__nombre', 'semana')
        )
    
    if not ventas_categoria_diarias.exists():
        ventas_categoria_diarias = (
            DetalleVenta.objects
            .annotate(dia=TruncDay('venta__fecha'))
            .values('producto__categoria__nombre', 'dia')
            .annotate(total_vendido=Sum('cantidad'))
            .order_by('producto__categoria__nombre', 'dia')
        )
    
    if not ventas_categoria_anuales.exists():
        ventas_categoria_anuales = (
            DetalleVenta.objects
            .annotate(anio=TruncYear('venta__fecha'))
            .values('producto__categoria__nombre', 'anio')
            .annotate(total_vendido=Sum('cantidad'))
            .order_by('producto__categoria__nombre', 'anio')
        )
    
    # 3. Productos más vendidos
    productos_mas_vendidos = (
        DetalleVenta.objects
        .values('producto__nombre')
        .annotate(total_vendidos=Sum('cantidad'))
        .order_by('-total_vendidos')[:10]
    )
    
    # 4. Ventas por producto específico (últimos 30 días)
    ventas_por_producto_diario = (
        DetalleVenta.objects
        .filter(venta__fecha__gte=thirty_days_ago.date())
        .values('producto__nombre', 'venta__fecha')
        .annotate(cantidad_vendida=Sum('cantidad'))
        .order_by('producto__nombre', 'venta__fecha')
    )
    
    # 5. Membresías vendidas por período
    membresias_diarias = (
        ClienteMembresia.objects
        .filter(fecha_inicio__gte=now.date() - timedelta(days=7))
        .annotate(dia=TruncDay('fecha_inicio'))
        .values('dia')
        .annotate(total=Count('id'))
        .order_by('dia')
    )
    
    membresias_semanales = (
        ClienteMembresia.objects
        .filter(fecha_inicio__gte=now.date() - timedelta(days=28))
        .annotate(semana=TruncWeek('fecha_inicio'))
        .values('semana')
        .annotate(total=Count('id'))
        .order_by('semana')
    )
    
    membresias_mensuales = (
        ClienteMembresia.objects
        .filter(fecha_inicio__gte=six_months_ago.date())
        .annotate(mes=TruncMonth('fecha_inicio'))
        .values('mes')
        .annotate(total=Count('id'))
        .order_by('mes')
    )
    
    # Si no hay membresías recientes, mostrar todas las membresías disponibles
    if not membresias_mensuales.exists():
        membresias_mensuales = (
            ClienteMembresia.objects
            .annotate(mes=TruncMonth('fecha_inicio'))
            .values('mes')
            .annotate(total=Count('id'))
            .order_by('mes')
        )
    
    if not membresias_semanales.exists():
        membresias_semanales = (
            ClienteMembresia.objects
            .annotate(semana=TruncWeek('fecha_inicio'))
            .values('semana')
            .annotate(total=Count('id'))
            .order_by('semana')
        )
    
    if not membresias_diarias.exists():
        membresias_diarias = (
            ClienteMembresia.objects
            .annotate(dia=TruncDay('fecha_inicio'))
            .values('dia')
            .annotate(total=Count('id'))
            .order_by('dia')
        )
    
    # Preparar datos para el contexto
    def format_ventas_data(ventas_data, date_format):
        labels = []
        data = []
        for venta in ventas_data:
            if 'dia' in venta:
                labels.append(venta['dia'].strftime(date_format))
                data.append(float(venta['total']))
            elif 'semana' in venta:
                labels.append(venta['semana'].strftime(date_format))
                data.append(float(venta['total']))
            elif 'mes' in venta:
                labels.append(venta['mes'].strftime(date_format))
                data.append(float(venta['total']))
            elif 'anio' in venta:
                labels.append(venta['anio'].strftime(date_format))
                data.append(float(venta['total']))
        return labels, data
    
    def format_ventas_categoria_data(ventas_categoria_data, date_format):
        # Organizar datos por categoría
        categorias_data = {}
        for venta in ventas_categoria_data:
            categoria = venta['producto__categoria__nombre'] or 'Sin categoría'
            if categoria not in categorias_data:
                categorias_data[categoria] = {}
            
            if 'dia' in venta:
                fecha = venta['dia'].strftime(date_format)
            elif 'semana' in venta:
                fecha = venta['semana'].strftime(date_format)
            elif 'mes' in venta:
                fecha = venta['mes'].strftime(date_format)
            elif 'anio' in venta:
                fecha = venta['anio'].strftime(date_format)
            
            categorias_data[categoria][fecha] = venta['total_vendido']
        
        return categorias_data
    
    def format_membresias_data(membresias_data, date_format):
        labels = []
        data = []
        for membresia in membresias_data:
            if 'dia' in membresia:
                labels.append(membresia['dia'].strftime(date_format))
                data.append(membresia['total'])
            elif 'semana' in membresia:
                labels.append(membresia['semana'].strftime(date_format))
                data.append(membresia['total'])
            elif 'mes' in membresia:
                labels.append(membresia['mes'].strftime(date_format))
                data.append(membresia['total'])
        return labels, data
    
    # Datos de ventas monetarias
    ventas_diarias_labels, ventas_diarias_data = format_ventas_data(ventas_diarias, '%d/%m')
    ventas_semanales_labels, ventas_semanales_data = format_ventas_data(ventas_semanales, '%d/%m')
    ventas_mensuales_labels, ventas_mensuales_data = format_ventas_data(ventas_mensuales, '%B %Y')
    ventas_anuales_labels, ventas_anuales_data = format_ventas_data(ventas_anuales, '%Y')
    
    # Datos de ventas por categoría
    ventas_categoria_diarias_data = format_ventas_categoria_data(ventas_categoria_diarias, '%d/%m')
    ventas_categoria_semanales_data = format_ventas_categoria_data(ventas_categoria_semanales, '%d/%m')
    ventas_categoria_mensuales_data = format_ventas_categoria_data(ventas_categoria_mensuales, '%B %Y')
    ventas_categoria_anuales_data = format_ventas_categoria_data(ventas_categoria_anuales, '%Y')
    
    # Obtener todas las categorías únicas
    categorias_unicas = set()
    for data in [ventas_categoria_diarias_data, ventas_categoria_semanales_data, 
                 ventas_categoria_mensuales_data, ventas_categoria_anuales_data]:
        categorias_unicas.update(data.keys())
    
    # Datos de membresías
    membresias_diarias_labels, membresias_diarias_data = format_membresias_data(membresias_diarias, '%d/%m')
    membresias_semanales_labels, membresias_semanales_data = format_membresias_data(membresias_semanales, '%d/%m')
    membresias_mensuales_labels, membresias_mensuales_data = format_membresias_data(membresias_mensuales, '%B %Y')
    
    # Productos más vendidos
    productos = [p['producto__nombre'] for p in productos_mas_vendidos]
    cantidades = [p['total_vendidos'] for p in productos_mas_vendidos]
    
    # Organizar ventas por producto para diferentes períodos
    ventas_por_producto = {}
    for venta in ventas_por_producto_diario:
        producto = venta['producto__nombre']
        fecha = venta['venta__fecha'].strftime('%d/%m')
        cantidad = venta['cantidad_vendida']
        
        if producto not in ventas_por_producto:
            ventas_por_producto[producto] = {'daily': {}, 'weekly': {}, 'monthly': {}}
        
        ventas_por_producto[producto]['daily'][fecha] = cantidad
    
    # Convertir a arrays para JavaScript
    for producto in ventas_por_producto:
        for periodo in ['daily', 'weekly', 'monthly']:
            if isinstance(ventas_por_producto[producto][periodo], dict):
                # Ordenar por fecha y convertir a arrays
                sorted_items = sorted(ventas_por_producto[producto][periodo].items())
                ventas_por_producto[producto][periodo] = [item[1] for item in sorted_items]
    
    # Debug: Log de datos encontrados
    logger.info(f"Ventas diarias encontradas: {len(ventas_diarias_data)}")
    logger.info(f"Ventas mensuales encontradas: {len(ventas_mensuales_data)}")
    logger.info(f"Membresías diarias encontradas: {len(membresias_diarias_data)}")
    logger.info(f"Membresías mensuales encontradas: {len(membresias_mensuales_data)}")
    logger.info(f"Productos encontrados: {len(productos)}")
    logger.info(f"Categorías encontradas: {list(categorias_unicas)}")
    
    contexto = {
        # Datos de ventas monetarias
        'ventas_diarias_labels': json.dumps(ventas_diarias_labels),
        'ventas_diarias_data': json.dumps(ventas_diarias_data),
        'ventas_semanales_labels': json.dumps(ventas_semanales_labels),
        'ventas_semanales_data': json.dumps(ventas_semanales_data),
        'ventas_mensuales_labels': json.dumps(ventas_mensuales_labels),
        'ventas_mensuales_data': json.dumps(ventas_mensuales_data),
        'ventas_anuales_labels': json.dumps(ventas_anuales_labels),
        'ventas_anuales_data': json.dumps(ventas_anuales_data),
        
        # Datos de ventas por categoría
        'ventas_categoria_diarias_data': json.dumps(ventas_categoria_diarias_data),
        'ventas_categoria_semanales_data': json.dumps(ventas_categoria_semanales_data),
        'ventas_categoria_mensuales_data': json.dumps(ventas_categoria_mensuales_data),
        'ventas_categoria_anuales_data': json.dumps(ventas_categoria_anuales_data),
        'categorias_unicas': json.dumps(list(categorias_unicas)),
        
        # Datos de productos
        'productos': json.dumps(productos),
        'cantidades': json.dumps(cantidades),
        'ventas_por_producto': json.dumps(ventas_por_producto),
        
        # Datos de membresías
        'membresias_diarias_labels': json.dumps(membresias_diarias_labels),
        'membresias_diarias_data': json.dumps(membresias_diarias_data),
        'membresias_semanales_labels': json.dumps(membresias_semanales_labels),
        'membresias_semanales_data': json.dumps(membresias_semanales_data),
        'membresias_mensuales_labels': json.dumps(membresias_mensuales_labels),
        'membresias_mensuales_data': json.dumps(membresias_mensuales_data),
        
        # Datos legacy para compatibilidad
        'etiquetas': json.dumps(ventas_mensuales_labels),
        'totales': json.dumps(ventas_mensuales_data),
    }

    return render(request, 'punto_app/admin_estadisticas.html', contexto)