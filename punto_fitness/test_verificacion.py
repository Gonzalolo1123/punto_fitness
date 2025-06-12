#!/usr/bin/env python
"""
Script de prueba para verificar el flujo completo de verificación de correo
"""

import os
import sys
import django
import json
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'punto_fitness.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from punto_app.models import Cliente, VerificacionCorreo
from punto_app.views import generar_codigo_verificacion, enviar_email_verificacion

def test_flujo_verificacion():
    """Prueba el flujo completo de verificación"""
    print("🧪 Iniciando pruebas de verificación de correo...")
    
    # Crear cliente de prueba
    client = Client()
    
    # Datos de prueba
    test_email = "test@example.com"
    test_data = {
        "nombre": "Test",
        "apellido": "Usuario",
        "correo": test_email,
        "telefono": "123456789",
        "contrasena": "Test123!",
        "estado": "Activo"
    }
    
    try:
        # 1. Limpiar datos anteriores
        print("🗑️ Limpiando datos anteriores...")
        Cliente.objects.filter(email=test_email).delete()
        VerificacionCorreo.objects.filter(id_usuario__email=test_email).delete()
        
        # 2. Probar envío de código
        print("📧 Probando envío de código...")
        response = client.post('/enviar-codigo-verificacion/', 
                             data=json.dumps({"correo": test_email}),
                             content_type='application/json')
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.content.decode()}")
        
        if response.status_code == 200:
            # 3. Obtener el código generado
            verificacion = VerificacionCorreo.objects.filter(
                id_usuario__email=test_email,
                utilizado=False
            ).latest('fecha_creacion')
            
            codigo = verificacion.codigo
            print(f"   Código generado: {codigo}")
            
            # 4. Probar verificación de código
            print("🔍 Probando verificación de código...")
            response = client.post('/verificar-codigo/',
                                 data=json.dumps({
                                     "correo": test_email,
                                     "codigo": codigo
                                 }),
                                 content_type='application/json')
            
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.content.decode()}")
            
            if response.status_code == 200:
                # 5. Probar registro
                print("📝 Probando registro...")
                response = client.post('/registro/',
                                     data=json.dumps(test_data),
                                     content_type='application/json')
                
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.content.decode()}")
                
                if response.status_code == 201:
                    print("✅ ¡Flujo completo exitoso!")
                    
                    # Verificar que el usuario se creó correctamente
                    cliente = Cliente.objects.get(email=test_email)
                    print(f"   Usuario creado: {cliente.nombre} {cliente.apellido}")
                    print(f"   Estado: {cliente.estado}")
                    
                    return True
                else:
                    print("❌ Error en registro")
                    return False
            else:
                print("❌ Error en verificación de código")
                return False
        else:
            print("❌ Error en envío de código")
            return False
            
    except Exception as e:
        print(f"💥 Error durante las pruebas: {str(e)}")
        return False
    finally:
        # Limpiar datos de prueba
        print("🧹 Limpiando datos de prueba...")
        Cliente.objects.filter(email=test_email).delete()
        VerificacionCorreo.objects.filter(id_usuario__email=test_email).delete()

def test_funciones_auxiliares():
    """Prueba las funciones auxiliares"""
    print("\n🔧 Probando funciones auxiliares...")
    
    # Probar generación de código
    codigo = generar_codigo_verificacion()
    print(f"   Código generado: {codigo}")
    print(f"   Longitud: {len(codigo)}")
    print(f"   Es numérico: {codigo.isdigit()}")
    
    # Probar envío de email (simulado)
    resultado = enviar_email_verificacion("test@example.com", codigo)
    print(f"   Envío de email: {'✅' if resultado else '❌'}")
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del sistema de verificación...")
    
    # Probar funciones auxiliares
    test_funciones_auxiliares()
    
    # Probar flujo completo
    resultado = test_flujo_verificacion()
    
    if resultado:
        print("\n🎉 ¡Todas las pruebas pasaron exitosamente!")
    else:
        print("\n💥 Algunas pruebas fallaron")
        sys.exit(1) 