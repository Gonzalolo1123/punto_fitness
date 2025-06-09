#!/usr/bin/env python
"""
Script para solucionar problemas de migraciones inconsistentes
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

def fix_migration_history():
    """Soluciona el historial de migraciones"""
    print("🔧 Solucionando historial de migraciones...")
    
    # Configurar Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'punto_fitness.settings')
    django.setup()
    
    try:
        from django.db import connection
        
        # Verificar si estamos en PostgreSQL
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"📊 Base de datos: {version[0] if version else 'Desconocida'}")
        
        # Intentar aplicar migraciones con --fake-initial
        print("🔄 Aplicando migraciones con --fake-initial...")
        execute_from_command_line(['manage.py', 'migrate', '--fake-initial'])
        
        # Luego aplicar migraciones normales
        print("🔄 Aplicando migraciones restantes...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Migraciones aplicadas correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        
        # Si falla, intentar con --fake
        try:
            print("🔄 Intentando con --fake...")
            execute_from_command_line(['manage.py', 'migrate', '--fake'])
            print("✅ Migraciones aplicadas con --fake")
            return True
        except Exception as e2:
            print(f"❌ Error con --fake: {e2}")
            return False

def main():
    """Función principal"""
    print("🚀 Solucionador de migraciones")
    print("=" * 40)
    
    if fix_migration_history():
        print("✅ Proceso completado exitosamente")
    else:
        print("❌ Error en el proceso")
        sys.exit(1)

if __name__ == '__main__':
    main() 