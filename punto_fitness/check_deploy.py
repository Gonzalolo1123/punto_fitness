#!/usr/bin/env python
"""
Script para verificar la configuración antes del despliegue
"""
import os
import sys
import django
from django.conf import settings

def check_environment():
    """Verificar variables de entorno"""
    print("🔍 Verificando variables de entorno...")
    
    # Verificar DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        print("✅ DATABASE_URL encontrada")
        print(f"   Host: {database_url.split('@')[1].split('/')[0] if '@' in database_url else 'No disponible'}")
    else:
        print("⚠️  DATABASE_URL no encontrada - usando configuración local")
    
    # Verificar SECRET_KEY
    secret_key = os.environ.get('SECRET_KEY')
    if secret_key:
        print("✅ SECRET_KEY encontrada")
    else:
        print("⚠️  SECRET_KEY no encontrada")
    
    print()

def check_database():
    """Verificar conexión a la base de datos"""
    print("🔍 Verificando conexión a la base de datos...")
    
    try:
        # Configurar Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'punto_fitness.settings')
        django.setup()
        
        # Probar conexión
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Conexión a la base de datos exitosa")
            
    except Exception as e:
        print(f"❌ Error de conexión a la base de datos: {e}")
        return False
    
    print()
    return True

def check_static_files():
    """Verificar archivos estáticos"""
    print("🔍 Verificando archivos estáticos...")
    
    try:
        static_root = settings.STATIC_ROOT
        static_dirs = settings.STATICFILES_DIRS
        
        print(f"✅ STATIC_ROOT: {static_root}")
        print(f"✅ STATICFILES_DIRS: {static_dirs}")
        
    except Exception as e:
        print(f"❌ Error en configuración de archivos estáticos: {e}")
        return False
    
    print()
    return True

def main():
    """Función principal"""
    print("🚀 Verificación de configuración para despliegue")
    print("=" * 50)
    
    check_environment()
    
    if check_database():
        check_static_files()
        print("✅ Verificación completada - Listo para despliegue")
    else:
        print("❌ Verificación falló - Revisa la configuración")
        sys.exit(1)

if __name__ == '__main__':
    main() 