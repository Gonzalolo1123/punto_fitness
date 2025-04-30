from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
# Create your views here.
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
    return render(request, 'punto_app/inventario.html')

def planes(request):
    return render(request, 'punto_app/planes.html')

def estadisticas(request):
    return render(request, 'punto_app/estadisticas.html')