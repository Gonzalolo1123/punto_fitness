"""
Utilidades para el envío de emails con plantillas HTML
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def enviar_email_html(template_name, context, subject, to_email, from_email=None):
    """
    Envía un email usando una plantilla HTML
    
    Args:
        template_name (str): Nombre de la plantilla HTML
        context (dict): Contexto para la plantilla
        subject (str): Asunto del email
        to_email (str): Email del destinatario
        from_email (str): Email del remitente (opcional)
    """
    try:
        # Renderizar la plantilla HTML
        html_message = render_to_string(f'emails/{template_name}.html', context)
        
        # Crear versión de texto plano
        text_message = strip_tags(html_message)
        
        # Enviar email
        send_mail(
            subject=subject,
            message=text_message,
            from_email=from_email or settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"✅ Email enviado exitosamente a {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error enviando email a {to_email}: {str(e)}")
        return False

def enviar_codigo_verificacion(correo, codigo):
    """
    Envía código de verificación con plantilla HTML
    """
    context = {
        'codigo': codigo,
        'subject': 'Código de Verificación - Punto Fitness'
    }
    
    return enviar_email_html(
        template_name='verification_code',
        context=context,
        subject='Código de Verificación - Punto Fitness',
        to_email=correo
    )

def enviar_notificacion_superadmin_transfer(cliente_destino, superadmin_origen):
    """
    Envía notificación de transferencia de superadmin
    """
    context = {
        'nombre_destino': cliente_destino.nombre,
        'apellido_destino': cliente_destino.apellido,
        'nombre_origen': superadmin_origen.nombre,
        'apellido_origen': superadmin_origen.apellido,
        'subject': 'Has sido nombrado Super Administrador'
    }
    
    return enviar_email_html(
        template_name='superadmin_transfer',
        context=context,
        subject='Has sido nombrado Super Administrador',
        to_email=cliente_destino.email
    )

def enviar_notificacion_admin_cambio(admin, nuevo_superadmin):
    """
    Envía notificación a administradores sobre cambio de superadmin
    """
    context = {
        'nombre_admin': admin.cliente.nombre,
        'apellido_admin': admin.cliente.apellido,
        'nombre_nuevo_superadmin': nuevo_superadmin.nombre,
        'apellido_nuevo_superadmin': nuevo_superadmin.apellido,
        'fecha_cambio': datetime.now().strftime('%d/%m/%Y %H:%M'),
        'subject': 'Cambio en la Administración del Sistema'
    }
    
    return enviar_email_html(
        template_name='admin_notification',
        context=context,
        subject='Cambio en la Administración del Sistema',
        to_email=admin.cliente.email
    )

def enviar_codigo_verificacion_superadmin(admin, codigo):
    """
    Envía código de verificación para transferencia de superadmin
    """
    context = {
        'nombre': admin.cliente.nombre,
        'apellido': admin.cliente.apellido,
        'codigo': codigo,
        'subject': 'Código de Verificación - Transferencia de Super Admin'
    }
    
    return enviar_email_html(
        template_name='superadmin_verification',
        context=context,
        subject='Código de Verificación - Transferencia de Super Admin',
        to_email=admin.cliente.email
    )

def enviar_codigo_verificacion_superadmin_actual(superadmin_actual, codigo):
    """
    Envía código de verificación al superadmin actual
    """
    context = {
        'nombre': superadmin_actual.nombre,
        'apellido': superadmin_actual.apellido,
        'codigo': codigo,
        'subject': 'Código de Verificación - Confirmación de Transferencia'
    }
    
    return enviar_email_html(
        template_name='superadmin_current_verification',
        context=context,
        subject='Código de Verificación - Confirmación de Transferencia',
        to_email=superadmin_actual.email
    )

def enviar_recuperacion_contrasena(correo, reset_url):
    """
    Envía email de recuperación de contraseña
    """
    context = {
        'reset_url': reset_url,
        'subject': 'Recuperación de Contraseña - Punto Fitness'
    }
    
    return enviar_email_html(
        template_name='password_recovery',
        context=context,
        subject='Recuperación de Contraseña - Punto Fitness',
        to_email=correo
    ) 