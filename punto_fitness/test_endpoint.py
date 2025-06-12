#!/usr/bin/env python
"""
Script simple para probar el endpoint de envío de código de verificación
"""

import requests
import json

def test_endpoint():
    """Prueba el endpoint de envío de código"""
    url = "http://localhost:8000/enviar-codigo-verificacion/"
    
    # Datos de prueba
    data = {
        "correo": "test@example.com"
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": "test_token"  # Token de prueba
    }
    
    try:
        print("🧪 Probando endpoint de envío de código...")
        print(f"📧 Email: {data['correo']}")
        print(f"🌐 URL: {url}")
        
        response = requests.post(url, json=data, headers=headers)
        
        print(f"📨 Status: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Endpoint funcionando correctamente")
        else:
            print("❌ Error en el endpoint")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se pudo conectar al servidor")
        print("💡 Asegúrate de que el servidor Django esté corriendo:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"💥 Error inesperado: {str(e)}")

if __name__ == "__main__":
    test_endpoint() 