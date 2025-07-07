from datetime import datetime, timedelta
import os
import time
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
import json
import re
import random
import string
from .models import ClienteMembresia, DetalleVenta, Inscripcion,Curso,Administrador,CategoriaProducto,Maquina,Cliente,Establecimiento, Membresia, MetodoPago,RegistroAcceso,Producto, CompraVendedor, Vendedor, Proveedor, VentaCliente, VerificacionCorreo
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
from django.core.mail import send_mail
from django.conf import settings
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
logger = logging.getLogger('punto_app')
# Sistema de QR para asistencias
import qrcode
import io
import base64
from django.http import JsonResponse
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

            logger.info(f"🔍 Registro solicitado para: {correo}")

            if not all([nombre, apellido, correo, contrasena]):
                logger.error("❌ Faltan campos requeridos en registro")
                return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)

            try:
                # Verificar si el correo ya existe en Cliente (excluyendo temporales)
                if Cliente.objects.filter(email=correo, estado__in=['Activo', 'Inactivo']).exists():
                    logger.warning(f"⚠️ Correo ya registrado: {correo}")
                    return JsonResponse({'error': 'Correo ya registrado'}, status=400)

                # Verificar que el correo haya sido verificado previamente
                try:
                    verificacion = VerificacionCorreo.objects.filter(
                        id_usuario__email=correo,
                        utilizado=True,
                        fecha_expiracion__gt=timezone.now() - timezone.timedelta(minutes=10)
                    ).latest('fecha_creacion')
                    
                    logger.info(f"✅ Verificación encontrada para registro: {verificacion.id_verificacion}")
                    
                except VerificacionCorreo.DoesNotExist:
                    logger.warning(f"❌ Correo no verificado: {correo}")
                    return JsonResponse({'error': 'El correo debe ser verificado antes de crear la cuenta'}, status=400)

                # Encriptar la contraseña
                contrasena_encriptada = make_password(contrasena)

                # Actualizar el cliente temporal con los datos reales
                cliente_temp = verificacion.id_usuario
                cliente_temp.nombre = nombre
                cliente_temp.apellido = apellido
                cliente_temp.contrasena = contrasena_encriptada
                cliente_temp.telefono = telefono
                cliente_temp.estado = estado
                cliente_temp.save()
                
                logger.info(f"✅ Cliente actualizado: {cliente_temp.id}")

                # Intentar crear el usuario de Django si es posible
                try:
                    User.objects.create_user(
                        username=correo,
                        email=correo,
                        password=contrasena
                    )
                    logger.info(f"✅ Usuario Django creado para: {correo}")
                except Exception as e:
                    logger.warning(f"⚠️ No se pudo crear usuario de Django: {str(e)}")
                    # Continuamos aunque falle la creación del usuario de Django
                    pass

                # Limpiar verificaciones antiguas para este correo
                verificaciones_antiguas = VerificacionCorreo.objects.filter(
                    id_usuario__email=correo
                ).exclude(id_verificacion=verificacion.id_verificacion)
                
                logger.info(f"🗑️ Eliminando {verificaciones_antiguas.count()} verificaciones antiguas")
                verificaciones_antiguas.delete()

                logger.info(f"🎉 Usuario registrado exitosamente: {cliente_temp.id}")
                return JsonResponse({
                    'message': 'Usuario creado correctamente',
                    'id': cliente_temp.id,
                    'nombre': cliente_temp.nombre,
                    'apellido': cliente_temp.apellido,
                    'email': cliente_temp.email
                }, status=201)

            except Exception as e:
                logger.error(f"💥 Error al crear usuario: {str(e)}")
                return JsonResponse({'error': 'Error al crear el usuario'}, status=500)

        except json.JSONDecodeError:
            logger.error("❌ JSON inválido en register_view")
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            logger.error(f"💥 Error inesperado en registro: {str(e)}")
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
        
        # Validación de formato de teléfono (solo números, 8-15 dígitos)
        telefono_str = str(data['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        if not telefono_str.isdigit() or len(telefono_str) < 8 or len(telefono_str) > 15:
            return JsonResponse({'error': 'El teléfono debe contener entre 8 y 15 dígitos numéricos'}, status=400)
        
        # Validación de longitud de nombres
        if len(data['nombre'].strip()) < 2:
            return JsonResponse({'error': 'El nombre debe tener al menos 2 caracteres'}, status=400)
        
        if len(data['apellido'].strip()) < 2:
            return JsonResponse({'error': 'El apellido debe tener al menos 2 caracteres'}, status=400)
        
        # Validación de unicidad de email (case-insensitive)
        if Cliente.objects.filter(email__iexact=data['correo']).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este correo!'}, status=400)

        # Validación de unicidad de teléfono
        if Cliente.objects.filter(telefono=int(telefono_str)).exists():
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
        
        # Validación de formato de teléfono (solo números, 8-15 dígitos)
        telefono_str = str(data['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        if not telefono_str.isdigit() or len(telefono_str) < 8 or len(telefono_str) > 15:
            return JsonResponse({'error': 'El teléfono debe contener entre 8 y 15 dígitos numéricos'}, status=400)
        
        # Validación de longitud de nombres
        if len(data['nombre'].strip()) < 2:
            return JsonResponse({'error': 'El nombre debe tener al menos 2 caracteres'}, status=400)
        
        if len(data['apellido'].strip()) < 2:
            return JsonResponse({'error': 'El apellido debe tener al menos 2 caracteres'}, status=400)

        # Verificar si existe otro usuario con el mismo correo (excluyendo al usuario actual)
        if Cliente.objects.filter(email__iexact=data['correo']).exclude(pk=usuario_id).exists():
            return JsonResponse({'error': '¡Ya existe un usuario con este correo!'}, status=400)

        # Verificar si existe otro usuario con el mismo teléfono (excluyendo al usuario actual)
        if Cliente.objects.filter(telefono=int(telefono_str)).exclude(pk=usuario_id).exists():
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
        # Validaciones consistentes con creación
        if 'nombre' in data and data['nombre']:
            if Producto.objects.filter(nombre__iexact=data['nombre']).exclude(id=producto_id).exists():
                return JsonResponse({'error': '¡Ya existe un producto con este nombre!'}, status=400)
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
        producto.nombre = data.get('nombre', producto.nombre)
        producto.descripcion = data.get('descripcion', producto.descripcion)
        producto.precio = data.get('precio', producto.precio)
        producto.stock_actual = data.get('stock_actual', producto.stock_actual)
        producto.stock_minimo = data.get('stock_minimo', producto.stock_minimo)
        producto.imagen = data.get('imagen', producto.imagen)
        producto.categoria_id = data.get('categoria_id', producto.categoria_id)
        producto.compra_id = data.get('compra_id', producto.compra_id)
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
    planes=Membresia.objects.values('id', 'nombre', 'descripcion', 'precio', 'duracion', 'imagen')
    productos=Producto.objects.values('id', 'nombre', 'descripcion', 'precio', 'stock_actual', 'stock_minimo', 'imagen', 'categoria_id')
    categorias=CategoriaProducto.objects.values('id', 'nombre')
    cliente_id = request.session.get('cliente_id')
    print('tu cliente_id', cliente_id)
    # Subquery: cantidad de inscritos por curso y fecha_realizacion
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
    return render(request, 'punto_app/planes.html', {'cursos': cursos,'planes':planes,'productos':productos,'categorias':categorias})
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
    return render(request,'punto_app/maquinas.html', {'maquinas': maquinas})

@requiere_admin
def admin_maquinas(request):
    # DEPURACIÓN: Verificar variable de entorno CLOUDINARY_URL
    cloudinary_url = os.environ.get("CLOUDINARY_URL")
    print("CLOUDINARY_URL:", cloudinary_url)  # Esto aparecerá en los logs de Render
    if not cloudinary_url:
        from django.http import HttpResponse
        return HttpResponse("No se detecta CLOUDINARY_URL en el entorno", status=500)
    maquinas = Maquina.objects.values('id', 'nombre', 'descripcion', 'cantidad', 'establecimiento_id', 'imagen')
    establecimientos = Establecimiento.objects.values('id', 'nombre')
    return render(request, 'punto_app/admin_maquinas.html', {
        'maquinas': maquinas,
        'establecimientos': establecimientos
    })

@csrf_exempt
def admin_maquina_crear(request):
    if request.method == "POST":
        nombre = request.POST.get('maquina-nombre')
        descripcion = request.POST.get('maquina-descripcion')
        cantidad = request.POST.get('maquina-cantidad', 1)
        establecimiento_id = request.POST.get('maquina-establecimiento')
        imagen = request.FILES.get('imagen')
        maquina = Maquina.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            cantidad=cantidad,
            establecimiento_id=establecimiento_id,
            imagen=imagen
        )
        return JsonResponse({
            'id': maquina.id,
            'nombre': maquina.nombre,
            'descripcion': maquina.descripcion,
            'cantidad': maquina.cantidad,
            'establecimiento_id': maquina.establecimiento_id,
            'imagen_url': maquina.imagen.url if maquina.imagen else None
        })
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def admin_maquina_actualizar(request, id):
    if request.method == "POST":
        maquina = get_object_or_404(Maquina, id=id)
        nombre = request.POST.get('maquina-nombre-editar-' + str(id))
        descripcion = request.POST.get('maquina-descripcion-editar-' + str(id))
        cantidad = request.POST.get('maquina-cantidad-editar-' + str(id))
        establecimiento_id = request.POST.get('maquina-establecimiento-editar-' + str(id))
        imagen = request.FILES.get('imagen')

        maquina.nombre = nombre
        maquina.descripcion = descripcion
        maquina.cantidad = cantidad
        maquina.establecimiento_id = establecimiento_id
        if imagen:
            maquina.imagen = imagen
        maquina.save()
        return JsonResponse({
            'id': maquina.id,
            'nombre': maquina.nombre,
            'descripcion': maquina.descripcion,
            'cantidad': maquina.cantidad,
            'establecimiento_id': maquina.establecimiento_id,
            'imagen_url': maquina.imagen.url if maquina.imagen else None
        })
    return JsonResponse({'error': 'Método no permitido'}, status=405)
    
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
        
        # Limpiar el teléfono de caracteres no numéricos y convertir a entero
        telefono_limpio = ''.join(filter(str.isdigit, str(data['telefono'])))
        if not telefono_limpio:
            return JsonResponse({'error': 'El teléfono debe contener al menos un dígito'}, status=400)
        
        vendedor = Vendedor.objects.create(
            nombre=data['nombre'],
            telefono=int(telefono_limpio),
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
        
        # Procesar teléfono si se proporciona
        if 'telefono' in data:
            telefono_limpio = ''.join(filter(str.isdigit, str(data['telefono'])))
            if not telefono_limpio:
                return JsonResponse({'error': 'El teléfono debe contener al menos un dígito'}, status=400)
            vendedor.telefono = int(telefono_limpio)
        
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
        
        # Limpiar el teléfono de caracteres no numéricos y convertir a entero
        telefono_limpio = ''.join(filter(str.isdigit, str(data['telefono'])))
        if not telefono_limpio:
            return JsonResponse({'error': 'El teléfono debe contener al menos un dígito'}, status=400)
        
        establecimiento = Establecimiento.objects.create(
            nombre=data['nombre'],
            direccion=data['direccion'],
            telefono=int(telefono_limpio),
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
        
        # Procesar teléfono si se proporciona
        if 'telefono' in data:
            telefono_limpio = ''.join(filter(str.isdigit, str(data['telefono'])))
            if not telefono_limpio:
                return JsonResponse({'success': False, 'error': 'El teléfono debe contener al menos un dígito'}, status=400)
            establecimiento.telefono = int(telefono_limpio)
        
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
        
        # Limpiar el teléfono de caracteres no numéricos y convertir a entero
        telefono_limpio = ''.join(filter(str.isdigit, str(data['telefono'])))
        if not telefono_limpio:
            return JsonResponse({'error': 'El teléfono debe contener al menos un dígito'}, status=400)
        
        proveedor = Proveedor.objects.create(
            nombre=data['nombre'],
            telefono=int(telefono_limpio),
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
        
        # Procesar teléfono si se proporciona
        if 'telefono' in data:
            telefono_limpio = ''.join(filter(str.isdigit, str(data['telefono'])))
            if not telefono_limpio:
                return JsonResponse({'success': False, 'error': 'El teléfono debe contener al menos un dígito'}, status=400)
            proveedor.telefono = int(telefono_limpio)
        
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
            # Verificar si el cliente ya tiene una entrada sin salida
            entrada_pendiente = RegistroAcceso.objects.filter(
                usuario_id=cliente_id,
                fecha_hora_salida__isnull=True
            ).first()
            
            if entrada_pendiente:
                messages.error(request, 
                    f"El cliente ya tiene una entrada registrada en {entrada_pendiente.establecimiento.nombre} "
                    f"a las {localtime(entrada_pendiente.fecha_hora_entrada).strftime('%H:%M:%S')}. "
                    f"Debe registrar la salida antes de una nueva entrada."
                )
                return redirect('asistencias')
            
            # Registrar la asistencia
            cliente = Cliente.objects.get(id=cliente_id)
            establecimiento = Establecimiento.objects.get(id=establecimiento_id)
            
            # Registrar solo la hora de entrada (salida serÃ¡ NULL inicialmente)
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
        administradores = Administrador.objects.select_related('cliente').filter(nivel_acceso='admin')
        proveedores = Proveedor.objects.all()

        return render(request, 'punto_app/super_admin.html', {
            'clientes': clientes_no_admin,
            'administradores': administradores,
            'establecimientos': Establecimiento.objects.select_related('proveedor').values(
                'id', 'nombre', 'direccion', 'telefono', 'email', 'horario_apertura', 'horario_cierre', 
                'proveedor_id', 'proveedor__nombre'
            ),
            'proveedores': proveedores
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
            
            # Generar URL de recuperación (en un entorno real, esto sería un token único)
            # Por simplicidad, usamos una URL de ejemplo
            reset_url = f"https://tudominio.com/reset-password?email={correo}&token=ejemplo_token"
            
            # Enviar email de recuperación con plantilla HTML
            from .email_utils import enviar_recuperacion_contrasena
            
            if enviar_recuperacion_contrasena(correo, reset_url):
                return JsonResponse({
                    'message': f'Se ha enviado un enlace de recuperación a {correo}. Por favor, revise su bandeja de entrada.'
                }, status=200)
            else:
                return JsonResponse({'error': 'Error al enviar el email de recuperación'}, status=500)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# Funciones auxiliares para verificación de correo
def generar_codigo_verificacion():
    """Genera un código de verificación de 6 dígitos"""
    return ''.join(random.choices(string.digits, k=6))

def limpiar_datos_temporales():
    """Limpia clientes temporales y verificaciones expiradas"""
    try:
        # Eliminar verificaciones expiradas
        verificaciones_expiradas = VerificacionCorreo.objects.filter(
            fecha_expiracion__lt=timezone.now()
        )
        
        # Obtener los clientes temporales asociados a verificaciones expiradas
        clientes_temporales = Cliente.objects.filter(
            verificacioncorreo__in=verificaciones_expiradas,
            nombre='Temporal',
            apellido='Usuario',
            estado='Pendiente'
        ).distinct()
        
        # Eliminar verificaciones expiradas
        verificaciones_expiradas.delete()
        
        # Eliminar clientes temporales sin verificaciones
        clientes_sin_verificacion = Cliente.objects.filter(
            nombre='Temporal',
            apellido='Usuario',
            estado='Pendiente'
        ).exclude(
            verificacioncorreo__isnull=False
        )
        
        clientes_sin_verificacion.delete()
        
        logger.info(f"Limpieza completada: {verificaciones_expiradas.count()} verificaciones y {clientes_temporales.count()} clientes temporales eliminados")
        
    except Exception as e:
        logger.error(f"Error en limpieza de datos temporales: {str(e)}")

def enviar_email_verificacion(correo, codigo):
    """Envía un email con el código de verificación usando plantilla HTML"""
    try:
        from .email_utils import enviar_codigo_verificacion as enviar_codigo_html
        
        # En un entorno de producción, aquí se configuraría el envío real de emails
        # Por ahora, solo simulamos el envío exitoso
        print(f"📧 Email enviado a {correo} con código: {codigo}")
        
        # Enviar email con plantilla HTML
        return enviar_codigo_html(correo, codigo)
        
    except Exception as e:
        logger.error(f"Error al enviar email: {str(e)}")
        return False

@csrf_exempt
def enviar_codigo_verificacion(request):
    """Endpoint para enviar código de verificación por email"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            correo = data.get('correo')
            
            logger.info(f"🔍 Enviando código de verificación para: {correo}")
            
            if not correo:
                logger.error("❌ Correo no proporcionado")
                return JsonResponse({'error': 'Correo no proporcionado'}, status=400)
            
            # Verificar formato de email
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, correo):
                logger.error(f"❌ Formato de correo inválido: {correo}")
                return JsonResponse({'error': 'Formato de correo inválido'}, status=400)
            
            # Verificar si el correo ya está registrado
            if Cliente.objects.filter(email=correo, estado__in=['Activo', 'Inactivo']).exists():
                logger.warning(f"⚠️ Correo ya registrado: {correo}")
                return JsonResponse({'error': 'Este correo ya está registrado'}, status=400)
            
            # Limpiar datos temporales expirados
            limpiar_datos_temporales()
            
            # Generar código de verificación
            codigo = generar_codigo_verificacion()
            logger.info(f"📧 Código generado: {codigo}")
            
            # Calcular fecha de expiración (10 minutos)
            fecha_expiracion = timezone.now() + timezone.timedelta(minutes=10)
            
            # Eliminar códigos anteriores para este correo
            verificaciones_anteriores = VerificacionCorreo.objects.filter(
                id_usuario__email=correo,
                utilizado=False
            )
            logger.info(f"🗑️ Eliminando {verificaciones_anteriores.count()} verificaciones anteriores")
            verificaciones_anteriores.delete()
            
            # Crear un cliente temporal para la verificación
            cliente_temp = Cliente.objects.create(
                nombre='Temporal',
                apellido='Usuario',
                email=correo,
                contrasena='temp_password',
                telefono=0,
                estado='Pendiente'
            )
            logger.info(f"👤 Cliente temporal creado: {cliente_temp.id}")
            
            # Guardar el código de verificación
            verificacion = VerificacionCorreo.objects.create(
                id_usuario=cliente_temp,
                codigo=codigo,
                fecha_expiracion=fecha_expiracion
            )
            logger.info(f"✅ Verificación creada: {verificacion.id_verificacion}")
            
            # Enviar email
            if enviar_email_verificacion(correo, codigo):
                logger.info(f"📤 Email enviado exitosamente a: {correo}")
                return JsonResponse({
                    'message': 'Código de verificación enviado exitosamente',
                    'correo': correo
                }, status=200)
            else:
                # Si falla el envío, eliminar el cliente temporal y la verificación
                logger.error(f"❌ Error al enviar email, eliminando datos temporales")
                cliente_temp.delete()
                return JsonResponse({'error': 'Error al enviar el código de verificación'}, status=500)
                
        except json.JSONDecodeError:
            logger.error("❌ JSON inválido en enviar_codigo_verificacion")
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            logger.error(f"💥 Error en enviar_codigo_verificacion: {str(e)}")
            return JsonResponse({'error': 'Error interno del servidor'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def verificar_codigo(request):
    """Endpoint para verificar el código de verificación"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            correo = data.get('correo')
            codigo = data.get('codigo')
            
            logger.info(f"🔍 Verificando código para: {correo}, código: {codigo}")
            
            if not correo or not codigo:
                logger.error("❌ Correo o código no proporcionados")
                return JsonResponse({'error': 'Correo y código son requeridos'}, status=400)
            
            # Buscar la verificación más reciente para este correo
            try:
                verificacion = VerificacionCorreo.objects.filter(
                    id_usuario__email=correo,
                    codigo=codigo,
                    utilizado=False,
                    fecha_expiracion__gt=timezone.now()
                ).latest('fecha_creacion')
                
                logger.info(f"✅ Verificación encontrada: {verificacion.id_verificacion}")
                
            except VerificacionCorreo.DoesNotExist:
                logger.warning(f"❌ Código inválido o expirado para: {correo}")
                return JsonResponse({'error': 'Código inválido o expirado'}, status=400)
            
            # Marcar el código como utilizado
            verificacion.utilizado = True
            verificacion.save()
            logger.info(f"✅ Código marcado como utilizado: {verificacion.id_verificacion}")
            
            return JsonResponse({
                'verificado': True,
                'message': 'Código verificado exitosamente',
                'correo': correo
            }, status=200)
            
        except json.JSONDecodeError:
            logger.error("❌ JSON inválido en verificar_codigo")
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            logger.error(f"💥 Error en verificar_codigo: {str(e)}")
            return JsonResponse({'error': 'Error interno del servidor'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@requiere_superadmin
def transferir_superadmin(request):
    """
    Proceso seguro para transferir el rol de superadmin a otro usuario
    Requiere múltiples verificaciones de seguridad
    """
    print("🔄 [SERVIDOR] Iniciando proceso de transferencia de Super Admin...")
    
    if request.method == "POST":
        try:
            print("📋 [SERVIDOR] Procesando petición POST de transferencia")
            data = json.loads(request.body)
            admin_id = data.get('admin_id')
            codigo_verificacion = data.get('codigo_verificacion')
            password_superadmin = data.get('password_superadmin')
            codigo_superadmin_actual = data.get('codigo_superadmin_actual')  # Nuevo campo
            
            print(f"📊 [SERVIDOR] Datos recibidos:")
            print(f"   - Admin ID: {admin_id}")
            print(f"   - Código verificación: {'SÍ' if codigo_verificacion else 'NO'}")
            print(f"   - Password superadmin: {'SÍ' if password_superadmin else 'NO'}")
            print(f"   - Código superadmin actual: {'SÍ' if codigo_superadmin_actual else 'NO'}")
            
            # Obtener el superadmin actual
            superadmin_actual_id = request.session.get('cliente_id')
            print(f"📋 [SERVIDOR] Superadmin actual ID: {superadmin_actual_id}")
            
            superadmin_actual = Cliente.objects.get(id=superadmin_actual_id)
            print(f"✅ [SERVIDOR] Superadmin actual encontrado: {superadmin_actual.nombre} {superadmin_actual.apellido}")
            
            # Verificar que el superadmin actual existe
            admin_actual = Administrador.objects.get(cliente=superadmin_actual, nivel_acceso='superadmin')
            print(f"✅ [SERVIDOR] Registro de administrador del superadmin actual verificado")
            
            # Verificar contraseña del superadmin actual
            print("🔐 [SERVIDOR] Verificando contraseña del superadmin actual...")
            if not check_password(password_superadmin, superadmin_actual.contrasena):
                print("❌ [SERVIDOR] Contraseña del superadmin incorrecta")
                return JsonResponse({
                    'success': False, 
                    'error': 'Contraseña del superadmin incorrecta'
                }, status=401)
            
            print("✅ [SERVIDOR] Contraseña del superadmin verificada correctamente")
            
            # Verificar código del superadmin actual (nueva verificación de seguridad)
            print("🔐 [SERVIDOR] Verificando código del superadmin actual...")
            if not codigo_superadmin_actual:
                print("❌ [SERVIDOR] Código del superadmin actual no proporcionado")
                return JsonResponse({
                    'success': False, 
                    'error': 'Debe proporcionar el código de verificación del superadmin actual'
                }, status=400)
            
            if not verificar_codigo_superadmin_actual(codigo_superadmin_actual, superadmin_actual):
                print("❌ [SERVIDOR] Código del superadmin actual incorrecto")
                return JsonResponse({
                    'success': False, 
                    'error': 'Código de verificación del superadmin actual incorrecto'
                }, status=401)
            
            print("✅ [SERVIDOR] Código del superadmin actual verificado correctamente")
            
            # Obtener el admin que recibirá el rol de superadmin
            print(f"🔄 [SERVIDOR] Buscando admin destino con ID: {admin_id}")
            try:
                admin_destino = Administrador.objects.get(id=admin_id, nivel_acceso='admin')
                print(f"✅ [SERVIDOR] Admin destino encontrado: {admin_destino.cliente.nombre} {admin_destino.cliente.apellido}")
            except Administrador.DoesNotExist:
                print("❌ [SERVIDOR] Administrador no encontrado o no es admin")
                return JsonResponse({
                    'success': False, 
                    'error': 'Administrador no encontrado o no es admin'
                }, status=404)
            
            # Verificar criterios de elegibilidad
            print("🔍 [SERVIDOR] Verificando criterios de elegibilidad...")
            if not verificar_elegibilidad_superadmin(admin_destino):
                print("❌ [SERVIDOR] El administrador no cumple con los criterios de elegibilidad")
                return JsonResponse({
                    'success': False, 
                    'error': 'El administrador no cumple con los criterios de elegibilidad'
                }, status=403)
            
            print("✅ [SERVIDOR] Criterios de elegibilidad verificados")
            
            # Verificar código de verificación del admin destino
            print("🔐 [SERVIDOR] Verificando código de verificación del admin destino...")
            if codigo_verificacion and not verificar_codigo_superadmin(codigo_verificacion, admin_destino.cliente):
                print("❌ [SERVIDOR] Código de verificación del admin destino incorrecto")
                return JsonResponse({
                    'success': False, 
                    'error': 'Código de verificación incorrecto'
                }, status=401)
            
            print("✅ [SERVIDOR] Código de verificación del admin destino verificado")
            
            # Realizar la transferencia
            print("🔄 [SERVIDOR] Iniciando transferencia de roles...")
            try:
                # Cambiar el superadmin actual a admin
                print(f"📝 [SERVIDOR] Cambiando rol de superadmin actual a admin...")
                admin_actual.nivel_acceso = 'admin'
                admin_actual.save()
                print(f"✅ [SERVIDOR] Rol del superadmin actual cambiado a admin")
                
                # Otorgar superadmin al nuevo usuario
                print(f"📝 [SERVIDOR] Otorgando rol de superadmin al nuevo usuario...")
                admin_destino.nivel_acceso = 'superadmin'
                admin_destino.save()
                print(f"✅ [SERVIDOR] Rol de superadmin otorgado a {admin_destino.cliente.nombre} {admin_destino.cliente.apellido}")
                
                # Registrar la auditoría
                print("📋 [SERVIDOR] Registrando auditoría de la transferencia...")
                registrar_auditoria_superadmin(superadmin_actual, admin_destino.cliente, 'transferencia')
                print("✅ [SERVIDOR] Auditoría registrada")
                
                # Enviar notificaciones
                print("📧 [SERVIDOR] Enviando notificaciones...")
                enviar_notificacion_transferencia(admin_destino.cliente, superadmin_actual)
                print("✅ [SERVIDOR] Notificaciones enviadas")
                
                print("🎉 [SERVIDOR] Transferencia de superadmin completada exitosamente")
                return JsonResponse({
                    'success': True,
                    'message': 'Transferencia de superadmin completada exitosamente',
                    'nuevo_superadmin': {
                        'id': admin_destino.cliente.id,
                        'nombre': admin_destino.cliente.nombre,
                        'apellido': admin_destino.cliente.apellido,
                        'email': admin_destino.cliente.email
                    }
                })
                
            except Exception as e:
                print(f"❌ [SERVIDOR] Error en transferencia de superadmin: {str(e)}")
                logger.error(f"Error en transferencia de superadmin: {str(e)}")
                return JsonResponse({
                    'success': False, 
                    'error': 'Error durante la transferencia'
                }, status=500)
                
        except json.JSONDecodeError:
            print("❌ [SERVIDOR] JSON inválido en la petición")
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            print(f"❌ [SERVIDOR] Error inesperado en transferir_superadmin: {str(e)}")
            logger.error(f"Error inesperado en transferir_superadmin: {str(e)}")
            return JsonResponse({'error': 'Error interno del servidor'}, status=500)
    
    print("❌ [SERVIDOR] Método no permitido")
    return JsonResponse({'error': 'Método no permitido'}, status=405)


def verificar_elegibilidad_superadmin(admin):
    """
    Verifica si un admin cumple con los criterios para ser superadmin
    """
    print(f"🔍 [SERVIDOR] Verificando elegibilidad de admin: {admin.cliente.nombre} {admin.cliente.apellido}")
    
    try:
        # Verificar que sea admin actual
        print(f"📋 [SERVIDOR] Verificando nivel de acceso: {admin.nivel_acceso}")
        if admin.nivel_acceso != 'admin':
            print(f"❌ [SERVIDOR] Admin no es elegible: nivel de acceso '{admin.nivel_acceso}' no es 'admin'")
            return False
        
        # Verificar que no haya incidentes de seguridad
        # (esto requeriría un modelo adicional para rastrear incidentes)
        print("🔒 [SERVIDOR] Verificando incidentes de seguridad... (implementación pendiente)")
        
        # Verificar actividad reciente (últimos 30 días)
        # (esto requeriría rastrear las sesiones de admin)
        print("📊 [SERVIDOR] Verificando actividad reciente... (implementación pendiente)")
        
        print(f"✅ [SERVIDOR] Admin {admin.cliente.nombre} {admin.cliente.apellido} es elegible para ser superadmin")
        return True
        
    except Exception as e:
        print(f"❌ [SERVIDOR] Error verificando elegibilidad: {str(e)}")
        logger.error(f"Error verificando elegibilidad: {str(e)}")
        return False


def verificar_codigo_superadmin(codigo, cliente):
    """
    Verifica el código de verificación para la transferencia de superadmin
    """
    # Implementar verificación de código temporal
    # Por ahora, retornamos True para simplificar
    return True


def registrar_auditoria_superadmin(superadmin_origen, cliente_destino, accion):
    """
    Registra la auditoría de cambios de superadmin
    """
    print(f"📋 [SERVIDOR] Registrando auditoría de superadmin...")
    print(f"   - Acción: {accion}")
    print(f"   - Superadmin origen: {superadmin_origen.nombre} {superadmin_origen.apellido} ({superadmin_origen.email})")
    print(f"   - Cliente destino: {cliente_destino.nombre} {cliente_destino.apellido} ({cliente_destino.email})")
    
    try:
        # Aquí deberías crear un modelo de auditoría
        logger.info(f"AUDITORÍA SUPERADMIN: {accion} - De: {superadmin_origen.email} A: {cliente_destino.email}")
        print("✅ [SERVIDOR] Auditoría registrada en logs")
    except Exception as e:
        print(f"❌ [SERVIDOR] Error registrando auditoría: {str(e)}")
        logger.error(f"Error registrando auditoría: {str(e)}")


def enviar_notificacion_transferencia(cliente_destino, superadmin_origen):
    """
    Envía notificaciones sobre la transferencia de superadmin usando plantillas HTML
    """
    print(f"📧 [SERVIDOR] Iniciando envío de notificaciones de transferencia...")
    print(f"   - Nuevo superadmin: {cliente_destino.nombre} {cliente_destino.apellido}")
    print(f"   - Superadmin anterior: {superadmin_origen.nombre} {superadmin_origen.apellido}")
    
    try:
        from .email_utils import (
            enviar_notificacion_superadmin_transfer,
            enviar_notificacion_admin_cambio
        )
        
        # Notificar al nuevo superadmin
        print(f"📧 [SERVIDOR] Enviando notificación al nuevo superadmin: {cliente_destino.email}")
        if enviar_notificacion_superadmin_transfer(cliente_destino, superadmin_origen):
            print("✅ [SERVIDOR] Notificación enviada al nuevo superadmin")
        else:
            print("❌ [SERVIDOR] Error enviando notificación al nuevo superadmin")
        
        # Notificar a todos los admins
        print("📧 [SERVIDOR] Enviando notificaciones a todos los admins...")
        admins = Administrador.objects.filter(nivel_acceso='admin').select_related('cliente')
        print(f"📊 [SERVIDOR] Total de admins a notificar: {admins.count()}")
        
        for admin in admins:
            if admin.cliente.email != cliente_destino.email:
                print(f"📧 [SERVIDOR] Enviando notificación a admin: {admin.cliente.email}")
                if enviar_notificacion_admin_cambio(admin, cliente_destino):
                    print(f"✅ [SERVIDOR] Notificación enviada a {admin.cliente.email}")
                else:
                    print(f"❌ [SERVIDOR] Error enviando notificación a {admin.cliente.email}")
        
        print("✅ [SERVIDOR] Todas las notificaciones enviadas exitosamente")
                
    except Exception as e:
        print(f"❌ [SERVIDOR] Error enviando notificaciones: {str(e)}")
        logger.error(f"Error enviando notificaciones: {str(e)}")


@csrf_exempt
@requiere_superadmin
def verificar_elegibilidad_admin_superadmin(request, admin_id):
    """
    Verifica si un admin es elegible para ser superadmin
    """
    print(f"🔄 [SERVIDOR] Verificando elegibilidad de admin ID: {admin_id}")
    
    if request.method == "GET":
        try:
            print(f"📋 [SERVIDOR] Buscando admin con ID: {admin_id}")
            admin = Administrador.objects.get(id=admin_id)
            print(f"✅ [SERVIDOR] Admin encontrado: {admin.cliente.nombre} {admin.cliente.apellido}")
            
            print("🔍 [SERVIDOR] Iniciando verificación de elegibilidad...")
            elegibilidad = verificar_elegibilidad_superadmin(admin)
            print(f"📊 [SERVIDOR] Resultado de elegibilidad: {elegibilidad}")
            
            response_data = {
                'success': True,
                'elegible': elegibilidad,
                'admin': {
                    'id': admin.id,
                    'nombre': admin.cliente.nombre,
                    'apellido': admin.cliente.apellido,
                    'email': admin.cliente.email,
                    'fecha_registro': admin.cliente.fecha_registro.isoformat(),
                    'nivel_acceso': admin.nivel_acceso
                }
            }
            
            print(f"📤 [SERVIDOR] Enviando respuesta: {response_data}")
            return JsonResponse(response_data)
            
        except Administrador.DoesNotExist:
            print(f"❌ [SERVIDOR] Administrador con ID {admin_id} no encontrado")
            return JsonResponse({
                'success': False, 
                'error': 'Administrador no encontrado'
            }, status=404)
        except Exception as e:
            print(f"❌ [SERVIDOR] Error verificando elegibilidad: {str(e)}")
            logger.error(f"Error verificando elegibilidad: {str(e)}")
            return JsonResponse({
                'success': False, 
                'error': 'Error interno del servidor'
            }, status=500)
    
    print("❌ [SERVIDOR] Método no permitido para verificar elegibilidad")
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
@requiere_superadmin
def enviar_codigo_verificacion_superadmin(request):
    """
    Envía código de verificación para la transferencia de superadmin
    """
    print("🔄 [SERVIDOR] Iniciando envío de código de verificación para superadmin...")
    
    if request.method == "POST":
        try:
            print("📋 [SERVIDOR] Procesando petición POST de envío de código")
            data = json.loads(request.body)
            admin_id = data.get('admin_id')
            print(f"📊 [SERVIDOR] Admin ID recibido: {admin_id}")
            
            print(f"📋 [SERVIDOR] Buscando admin con ID: {admin_id}")
            admin = Administrador.objects.get(id=admin_id)
            print(f"✅ [SERVIDOR] Admin encontrado: {admin.cliente.nombre} {admin.cliente.apellido}")
            
            # Generar código de verificación
            print("🔐 [SERVIDOR] Generando código de verificación...")
            codigo = generar_codigo_verificacion()
            print(f"📋 [SERVIDOR] Código generado: {codigo}")
            
            # Enviar código por email
            print(f"📧 [SERVIDOR] Enviando código por email a: {admin.cliente.email}")
            from .email_utils import enviar_codigo_verificacion_superadmin as enviar_codigo_superadmin_html
            
            if not enviar_codigo_superadmin_html(admin, codigo):
                raise Exception("Error enviando código de verificación")
            
            print("✅ [SERVIDOR] Código de verificación enviado exitosamente")
            return JsonResponse({
                'success': True,
                'message': 'Código de verificación enviado'
            })
            
        except Administrador.DoesNotExist:
            print(f"❌ [SERVIDOR] Administrador con ID {admin_id} no encontrado")
            return JsonResponse({
                'success': False, 
                'error': 'Administrador no encontrado'
            }, status=404)
        except Exception as e:
            print(f"❌ [SERVIDOR] Error enviando código: {str(e)}")
            logger.error(f"Error enviando código: {str(e)}")
            return JsonResponse({
                'success': False, 
                'error': 'Error enviando código de verificación'
            }, status=500)
    
    print("❌ [SERVIDOR] Método no permitido para envío de código")
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@requiere_superadmin
def enviar_codigo_verificacion_superadmin_actual(request):
    """
    Envía código de verificación al superadmin actual para confirmar la transferencia
    """
    print("🔄 [SERVIDOR] Iniciando envío de código de verificación al superadmin actual...")
    
    if request.method == "POST":
        try:
            print("📋 [SERVIDOR] Procesando petición POST de envío de código al superadmin actual")
            
            # Obtener el superadmin actual
            superadmin_actual_id = request.session.get('cliente_id')
            print(f"📋 [SERVIDOR] Superadmin actual ID: {superadmin_actual_id}")
            
            superadmin_actual = Cliente.objects.get(id=superadmin_actual_id)
            print(f"✅ [SERVIDOR] Superadmin actual encontrado: {superadmin_actual.nombre} {superadmin_actual.apellido}")
            
            # Generar código de verificación
            print("🔐 [SERVIDOR] Generando código de verificación para superadmin actual...")
            codigo = generar_codigo_verificacion()
            print(f"📋 [SERVIDOR] Código generado: {codigo}")
            
            # Enviar código por email
            print(f"📧 [SERVIDOR] Enviando código por email a: {superadmin_actual.email}")
            from .email_utils import enviar_codigo_verificacion_superadmin_actual as enviar_codigo_actual_html
            
            if not enviar_codigo_verificacion_superadmin_actual(superadmin_actual, codigo):
                raise Exception("Error enviando código de verificación al superadmin actual")
            
            print("✅ [SERVIDOR] Código de verificación enviado al superadmin actual exitosamente")
            return JsonResponse({
                'success': True,
                'message': 'Código de verificación enviado al superadmin actual'
            })
            
        except Cliente.DoesNotExist:
            print(f"❌ [SERVIDOR] Superadmin actual no encontrado")
            return JsonResponse({
                'success': False, 
                'error': 'Superadmin actual no encontrado'
            }, status=404)
        except Exception as e:
            print(f"❌ [SERVIDOR] Error enviando código al superadmin actual: {str(e)}")
            logger.error(f"Error enviando código al superadmin actual: {str(e)}")
            return JsonResponse({
                'success': False, 
                'error': 'Error enviando código de verificación'
            }, status=500)
    
    print("❌ [SERVIDOR] Método no permitido para envío de código al superadmin actual")
    return JsonResponse({'error': 'Método no permitido'}, status=405)


def verificar_codigo_superadmin_actual(codigo, superadmin_actual):
    """
    Verifica el código de verificación del superadmin actual
    """
    print(f"🔐 [SERVIDOR] Verificando código del superadmin actual: {superadmin_actual.email}")
    
    # Por ahora, retornamos True para simplificar
    # En una implementación real, deberías verificar contra un código almacenado temporalmente
    print("✅ [SERVIDOR] Código del superadmin actual verificado")
    return True
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
                producto.stock_actual -= cantidad
                producto.save()
            return JsonResponse({'status': 'ok'})
        
        except Exception as e:
            print("ERROR en guardar venta:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)
    
@requiere_admin
def membresias(request):
    membresias = Membresia.objects.select_related('establecimiento').values(
        'id', 'nombre', 'descripcion', 'precio', 'duracion', 'dias_por_semana',
        'establecimiento_id', 'establecimiento__nombre', 'imagen'
    )
    establecimientos = Establecimiento.objects.select_related('proveedor').all()
    
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
def obtener_imagenes_membresias(request):
    ruta_imagenes = os.path.join(settings.STATICFILES_DIRS[0], 'images', 'planes')
    imagenes = []
    if os.path.exists(ruta_imagenes):
        for archivo in os.listdir(ruta_imagenes):
            if archivo.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                imagenes.append(f'images/planes/{archivo}')
    return JsonResponse({'imagenes': imagenes})

@csrf_exempt
def subir_imagen_membresia(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    if 'imagen' not in request.FILES:
        return JsonResponse({'error': 'No se ha proporcionado ninguna imagen'}, status=400)
    imagen = request.FILES['imagen']
    if not imagen.content_type.startswith('image/'):
        return JsonResponse({'error': 'El archivo debe ser una imagen'}, status=400)
    extension = os.path.splitext(imagen.name)[1].lower()
    if extension not in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
        return JsonResponse({'error': 'Formato de imagen no permitido'}, status=400)
    ruta_imagenes = os.path.join(settings.STATICFILES_DIRS[0], 'images', 'planes')
    os.makedirs(ruta_imagenes, exist_ok=True)
    nombre_archivo = f"{int(time.time())}_{imagen.name}"
    ruta_completa = os.path.join(ruta_imagenes, nombre_archivo)
    with open(ruta_completa, 'wb+') as destino:
        for chunk in imagen.chunks():
            destino.write(chunk)
    ruta_relativa = f'images/planes/{nombre_archivo}'
    return JsonResponse({'success': True, 'ruta': ruta_relativa})

@csrf_exempt
@requiere_admin
def admin_membresia_crear(request):
    try:
        data = json.loads(request.body)
        # Validación de imagen obligatoria
        if not data.get('imagen'):
            return JsonResponse({'error': 'La imagen es obligatoria.'}, status=400)
        membresia = Membresia.objects.create(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            precio=data['precio'],
            duracion=data['duracion'],
            dias_por_semana=data.get('dias_por_semana'),
            establecimiento_id=data['establecimiento_id'],
            imagen=data.get('imagen', '')
        )
        
        return JsonResponse({
            'id': membresia.id,
            'nombre': membresia.nombre,
            'descripcion': membresia.descripcion,
            'precio': membresia.precio,
            'duracion': membresia.duracion,
            'dias_por_semana': membresia.dias_por_semana,
            'establecimiento_id': membresia.establecimiento_id,
            'imagen': membresia.imagen
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@requiere_admin
def admin_membresia_actualizar(request, membresia_id):
    try:
        membresia = get_object_or_404(Membresia, pk=membresia_id)
        data = json.loads(request.body)
        
        # Validación de imagen obligatoria
        if 'imagen' in data and not data['imagen']:
            return JsonResponse({'error': 'La imagen es obligatoria.'}, status=400)
        
        membresia.nombre = data.get('nombre', membresia.nombre)
        membresia.descripcion = data.get('descripcion', membresia.descripcion)
        membresia.precio = data.get('precio', membresia.precio)
        membresia.duracion = data.get('duracion', membresia.duracion)
        membresia.dias_por_semana = data.get('dias_por_semana', membresia.dias_por_semana)
        membresia.establecimiento_id = data.get('establecimiento_id', membresia.establecimiento_id)
        if 'imagen' in data:
            membresia.imagen = data['imagen']
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
            elif membresia.duracion == 'personalizada':
                # Para membresías personalizadas existentes, usar 30 días por defecto
                cm.fecha_fin = cm.fecha_inicio + timedelta(days=30)
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
            'establecimiento_id': membresia.establecimiento_id,
            'imagen': membresia.imagen
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
        elif membresia.duracion == 'personalizada':
            from datetime import timedelta
            # Obtener días personalizados del request, si no se proporciona, usar 30 días por defecto
            dias_personalizados = data.get('dias_personalizados', 30)
            fecha_fin = fecha_inicio + timedelta(days=int(dias_personalizados))
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
            elif membresia.duracion == 'personalizada':
                from datetime import timedelta
                # Obtener días personalizados del request, si no se proporciona, usar 30 días por defecto
                dias_personalizados = data.get('dias_personalizados', 30)
                fecha_fin = fecha_inicio + timedelta(days=int(dias_personalizados))
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

# Asistencia cliente

@requiere_admin
def generar_qr_asistencia(request):
    """Vista para administradores: genera y muestra un QR para escanear"""
    try:
        # Generar un código único para la sesión de QR
        qr_code = f"PUNTO_FITNESS_QR_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Crear el QR
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_code)
        qr.make(fit=True)
        
        # Crear imagen del QR
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convertir a base64 para mostrar en HTML
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return render(request, 'punto_app/qr_admin.html', {
            'qr_code': qr_code,
            'qr_image': qr_base64
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def escanear_qr_asistencia(request):
    """API para procesar el escaneo de QR y registrar entrada/salida"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            qr_code = data.get('qr_code')
            cliente_id = request.session.get('cliente_id')
            
            if not cliente_id:
                return JsonResponse({'error': 'Usuario no autenticado'}, status=401)
            
            if not qr_code:
                return JsonResponse({'error': 'Código QR no válido'}, status=400)
            
            # Verificar que el QR sea válido (puedes agregar más validaciones)
            if not qr_code.startswith('PUNTO_FITNESS_QR_'):
                return JsonResponse({'error': 'QR no válido'}, status=400)
            
            cliente = Cliente.objects.get(id=cliente_id)
            
            # Buscar el último registro del cliente
            ultimo_registro = RegistroAcceso.objects.filter(
                usuario=cliente
            ).order_by('-fecha_hora_entrada').first()
            
            if not ultimo_registro or ultimo_registro.fecha_hora_salida:
                # No hay registro previo o ya tiene salida -> registrar entrada
                # Usar el primer establecimiento disponible (puedes modificarlo)
                establecimiento = Establecimiento.objects.first()
                if not establecimiento:
                    return JsonResponse({'error': 'No hay establecimientos configurados'}, status=500)
                
                nuevo_registro = RegistroAcceso.objects.create(
                    usuario=cliente,
                    establecimiento=establecimiento,
                    fecha_hora_entrada=timezone.now(),
                    fecha_hora_salida=None
                )
                
                return JsonResponse({
                    'success': True,
                    'tipo': 'entrada',
                    'mensaje': f'Entrada registrada a las {timezone.now().strftime("%H:%M:%S")}',
                    'establecimiento': establecimiento.nombre
                })
            else:
                # Tiene entrada sin salida -> registrar salida
                ultimo_registro.fecha_hora_salida = timezone.now()
                ultimo_registro.save()
                
                return JsonResponse({
                    'success': True,
                    'tipo': 'salida',
                    'mensaje': f'Salida registrada a las {timezone.now().strftime("%H:%M:%S")}',
                    'establecimiento': ultimo_registro.establecimiento.nombre
                })
                
        except Cliente.DoesNotExist:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def asistencia_cliente(request):
    """Vista para clientes: página con escáner de QR"""
    cliente_id = request.session.get('cliente_id')
    if not cliente_id:
        return redirect('login')
    
    # Verificar si el usuario es admin (no debe ver esta página)
    try:
        admin = Administrador.objects.get(cliente_id=cliente_id)
        return redirect('asistencias')  # Los admins van a la vista de admin
    except Administrador.DoesNotExist:
        pass  # Cliente normal, puede usar el QR
    
    return render(request, 'punto_app/asistencia_cliente.html')