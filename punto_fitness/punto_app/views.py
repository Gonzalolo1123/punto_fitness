from django.shortcuts import render, redirect
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
# Create your views here.
def principal(request):
    return render(request, 'punto_app/principal.html')

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
            # Si la contraseña es correcta, puedes iniciar sesión
            # Si estás usando sesiones en Django, puedes crear tu propio sistema de sesión o algo similar.
            return JsonResponse({"success": True, "message": "Inicio de sesión exitoso"})
        else:
            # Si la contraseña es incorrecta
            return JsonResponse({"success": False, "detail": "Credenciales incorrectas"}, status=400)

    return JsonResponse({"success": False, "detail": "Método no permitido"}, status=405)
def pagina_admin(request):
    return render(request, 'punto_app/admin_dashboard.html')

def panel_principal(request):
    return render(request, 'punto_app/panel.html')

def usuarios(request):
    return render(request, 'punto_app/usuarios.html')

def inventario(request):
    return render(request, 'punto_app/inventario.html')

def planes(request):
    return render(request, 'punto_app/planes.html')

def estadisticas(request):
    return render(request, 'punto_app/estadisticas.html')