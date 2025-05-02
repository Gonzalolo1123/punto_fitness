from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
# Funcionamiento CRUD
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Producto
import json

def principal(request):
    return render(request, 'punto_app/principal.html')
def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            messages.success(request, "Te has registrado exitosamente")
            return redirect('home')  # Redirige a la página de inicio después de registrarse
    else:
        form = UserCreationForm()
    return render(request, 'punto_app/registro.html', {'form': form})

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            # Verifica si el correo contiene "@admin.com"
            if user.email.endswith('@admin.com'):
                return redirect('punto_app/pagina_admin')  # Cambia por el nombre de tu URL

            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'punto_app/login.html', {'form': form})

def pagina_admin(request):
    return render(request, 'punto_app/admin_dashboard.html')

def panel_principal(request):
    return render(request, 'punto_app/panel.html')

def usuarios(request):
    return render(request, 'punto_app/usuarios.html')

def inventario(request):
    productos = Producto.objects.all()
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