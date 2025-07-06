#!/usr/bin/env python
"""
Script para generar ejemplos de emails HTML
Ejecutar: python test_emails.py
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'punto_fitness.settings')
django.setup()

from django.template.loader import render_to_string
from datetime import datetime

def generar_ejemplo_verificacion():
    """Genera un ejemplo de email de verificación"""
    context = {
        'codigo': '123456',
        'subject': 'Código de Verificación - Punto Fitness'
    }
    
    html = render_to_string('emails/verification_code.html', context)
    
    with open('ejemplo_verificacion.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Ejemplo de verificación generado: ejemplo_verificacion.html")

def generar_ejemplo_superadmin_transfer():
    """Genera un ejemplo de email de transferencia de superadmin"""
    context = {
        'nombre_destino': 'Juan',
        'apellido_destino': 'Pérez',
        'nombre_origen': 'María',
        'apellido_origen': 'González',
        'subject': 'Has sido nombrado Super Administrador'
    }
    
    html = render_to_string('emails/superadmin_transfer.html', context)
    
    with open('ejemplo_superadmin_transfer.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Ejemplo de transferencia superadmin generado: ejemplo_superadmin_transfer.html")

def generar_ejemplo_admin_notification():
    """Genera un ejemplo de notificación a administradores"""
    context = {
        'nombre_admin': 'Carlos',
        'apellido_admin': 'Rodríguez',
        'nombre_nuevo_superadmin': 'Juan',
        'apellido_nuevo_superadmin': 'Pérez',
        'fecha_cambio': datetime.now().strftime('%d/%m/%Y %H:%M'),
        'subject': 'Cambio en la Administración del Sistema'
    }
    
    html = render_to_string('emails/admin_notification.html', context)
    
    with open('ejemplo_admin_notification.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Ejemplo de notificación admin generado: ejemplo_admin_notification.html")

def generar_ejemplo_superadmin_verification():
    """Genera un ejemplo de verificación de superadmin"""
    context = {
        'nombre': 'Juan',
        'apellido': 'Pérez',
        'codigo': '789012',
        'subject': 'Código de Verificación - Transferencia de Super Admin'
    }
    
    html = render_to_string('emails/superadmin_verification.html', context)
    
    with open('ejemplo_superadmin_verification.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Ejemplo de verificación superadmin generado: ejemplo_superadmin_verification.html")

def generar_ejemplo_password_recovery():
    """Genera un ejemplo de recuperación de contraseña"""
    context = {
        'reset_url': 'https://puntofitness.com/reset-password?email=usuario@ejemplo.com&token=abc123',
        'subject': 'Recuperación de Contraseña - Punto Fitness'
    }
    
    html = render_to_string('emails/password_recovery.html', context)
    
    with open('ejemplo_password_recovery.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Ejemplo de recuperación de contraseña generado: ejemplo_password_recovery.html")

def main():
    """Genera todos los ejemplos de emails"""
    print("🎨 Generando ejemplos de emails HTML...")
    print("=" * 50)
    
    try:
        generar_ejemplo_verificacion()
        generar_ejemplo_superadmin_transfer()
        generar_ejemplo_admin_notification()
        generar_ejemplo_superadmin_verification()
        generar_ejemplo_password_recovery()
        
        print("=" * 50)
        print("🎉 ¡Todos los ejemplos generados exitosamente!")
        print("\n📁 Archivos generados:")
        print("  - ejemplo_verificacion.html")
        print("  - ejemplo_superadmin_transfer.html")
        print("  - ejemplo_admin_notification.html")
        print("  - ejemplo_superadmin_verification.html")
        print("  - ejemplo_password_recovery.html")
        print("\n💡 Abre estos archivos en tu navegador para ver los diseños")
        
    except Exception as e:
        print(f"❌ Error generando ejemplos: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 