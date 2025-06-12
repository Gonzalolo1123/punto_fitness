#!/usr/bin/env python
"""
Script de prueba para verificar la configuración de email
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'punto_fitness.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email_config():
    """Prueba la configuración de email"""
    print("🧪 Probando configuración de email...")
    print(f"📧 EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"📧 EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"📧 EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"📧 EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    
    # Verificar si las credenciales están configuradas
    if settings.EMAIL_HOST_USER == 'tu_correo@gmail.com':
        print("❌ ERROR: Debes configurar tus credenciales de email en email_config.py")
        print("📝 Instrucciones:")
        print("1. Edita el archivo email_config.py")
        print("2. Reemplaza 'tu_correo@gmail.com' con tu correo de Gmail")
        print("3. Reemplaza 'tu_contraseña_de_aplicacion' con tu contraseña de aplicación")
        return False
    
    if settings.EMAIL_HOST_PASSWORD == 'tu_contraseña_de_aplicacion':
        print("❌ ERROR: Debes configurar tu contraseña de aplicación en email_config.py")
        return False
    
    print("✅ Credenciales configuradas correctamente")
    
    # Probar envío de email
    try:
        print("📤 Enviando email de prueba...")
        send_mail(
            subject='Prueba de Email - Punto Fitness',
            message='Este es un email de prueba para verificar la configuración de Punto Fitness.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Enviar a ti mismo como prueba
            fail_silently=False,
        )
        print("✅ Email enviado exitosamente!")
        print(f"📬 Revisa tu bandeja de entrada: {settings.EMAIL_HOST_USER}")
        return True
        
    except Exception as e:
        print(f"❌ Error al enviar email: {str(e)}")
        print("🔧 Posibles soluciones:")
        print("1. Verifica que tu correo y contraseña sean correctos")
        print("2. Asegúrate de usar una contraseña de aplicación, no tu contraseña normal")
        print("3. Verifica que tengas habilitada la verificación en dos pasos en Gmail")
        print("4. Revisa que el puerto 587 no esté bloqueado por tu firewall")
        return False

if __name__ == "__main__":
    test_email_config() 