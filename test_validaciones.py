#!/usr/bin/env python3
"""
Script de prueba para validaciones de usuarios
Prueba casos edge y complejos para verificar que las validaciones funcionen correctamente
"""

import json
import re

def test_email_validation():
    """Prueba validaciones de email"""
    print("🔍 Probando validaciones de email:")
    
    # Regex usado en las validaciones
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Casos válidos
    valid_emails = [
        "usuario@test.com",
        "usuario.test@test.com",
        "usuario+test@test.com",
        "usuario_test@test.com",
        "usuario123@test.com",
        "usuario@test.co.uk",
        "usuario@test-domain.com",
        "usuario@test.com.mx"
    ]
    
    # Casos inválidos
    invalid_emails = [
        "",  # Vacío
        "   ",  # Solo espacios
        "usuario",  # Sin @
        "usuario@",  # Sin dominio
        "@test.com",  # Sin usuario
        "usuario@test",  # Sin TLD
        "usuario@.com",  # Sin dominio
        "usuario @test.com",  # Espacio antes de @
        "usuario@ test.com",  # Espacio después de @
        "usuario@@test.com",  # Doble @
        "usuario@test..com",  # Doble punto
        "usuario@test.com.",  # Punto al final
        ".usuario@test.com",  # Punto al inicio
        "usuario@test.c",  # TLD muy corto
        "usuario@test.comm",  # TLD muy largo
        "usuario@test.com ",  # Espacio al final
        " usuario@test.com",  # Espacio al inicio
    ]
    
    print("✅ Emails válidos:")
    for email in valid_emails:
        is_valid = bool(re.match(email_regex, email))
        status = "✅" if is_valid else "❌"
        print(f"  {status} '{email}' -> {is_valid}")
    
    print("\n❌ Emails inválidos:")
    for email in invalid_emails:
        is_valid = bool(re.match(email_regex, email))
        status = "❌" if not is_valid else "⚠️"
        print(f"  {status} '{email}' -> {is_valid}")

def test_phone_validation():
    """Prueba validaciones de teléfono"""
    print("\n📱 Probando validaciones de teléfono:")
    
    # Casos válidos
    valid_phones = [
        "123456789",  # 9 dígitos
        "1234567890",  # 10 dígitos
        "12345678901",  # 11 dígitos
        " 123456789 ",  # Con espacios
        "123-456-789",  # Con guiones
        "+123456789",  # Con +
        "123 456 789",  # Con espacios
        "1234567890",  # 10 dígitos
    ]
    
    # Casos inválidos
    invalid_phones = [
        "",  # Vacío
        "   ",  # Solo espacios
        "123",  # Muy corto
        "123456789012",  # Muy largo
        "12345678a",  # Con letras
        "12345678@",  # Con símbolos
        "12345678.",  # Con puntos
        "abc123def",  # Mezcla de letras y números
        "123-456-78",  # Muy corto con guiones
        "+123456789012",  # Muy largo con +
    ]
    
    def validate_phone(phone):
        """Función de validación de teléfono (igual que en views.py)"""
        telefono_str = str(phone).replace(' ', '').replace('-', '').replace('+', '')
        return telefono_str.isdigit() and 9 <= len(telefono_str) <= 11
    
    print("✅ Teléfonos válidos:")
    for phone in valid_phones:
        is_valid = validate_phone(phone)
        status = "✅" if is_valid else "❌"
        print(f"  {status} '{phone}' -> {is_valid}")
    
    print("\n❌ Teléfonos inválidos:")
    for phone in invalid_phones:
        is_valid = validate_phone(phone)
        status = "❌" if not is_valid else "⚠️"
        print(f"  {status} '{phone}' -> {is_valid}")

def test_name_validation():
    """Prueba validaciones de nombres"""
    print("\n👤 Probando validaciones de nombres:")
    
    # Casos válidos
    valid_names = [
        "Juan",
        "María",
        "José Luis",
        "Ana María",
        "Carlos",
        "Isabella",
        "Miguel Ángel",
        "Carmen",
        "Fernando",
        "Patricia"
    ]
    
    # Casos inválidos
    invalid_names = [
        "",  # Vacío
        "   ",  # Solo espacios
        "A",  # Muy corto
        "a",  # Muy corto
        "1",  # Solo número
        "123",  # Solo números
        "A1",  # Muy corto con número
        "   A   ",  # Espacios con letra corta
        "\t",  # Tab
        "\n",  # Nueva línea
        "   \n   ",  # Espacios y nueva línea
    ]
    
    def validate_name(name):
        """Función de validación de nombre (igual que en views.py)"""
        return len(name.strip()) >= 2
    
    print("✅ Nombres válidos:")
    for name in valid_names:
        is_valid = validate_name(name)
        status = "✅" if is_valid else "❌"
        print(f"  {status} '{name}' -> {is_valid}")
    
    print("\n❌ Nombres inválidos:")
    for name in invalid_names:
        is_valid = validate_name(name)
        status = "❌" if not is_valid else "⚠️"
        print(f"  {status} '{name}' -> {is_valid}")

def test_data_cleaning():
    """Prueba la limpieza de datos"""
    print("\n🧹 Probando limpieza de datos:")
    
    test_cases = [
        {
            "nombre": "  juan carlos  ",
            "apellido": "  pérez garcía  ",
            "correo": "  USUARIO@TEST.COM  ",
            "telefono": "  +56 9 1234 5678  "
        },
        {
            "nombre": "maría josé",
            "apellido": "de la cruz",
            "correo": "usuario.test@test.com",
            "telefono": "123-456-789"
        },
        {
            "nombre": "  A  ",
            "apellido": "  B  ",
            "correo": "  usuario@test  ",
            "telefono": "  123  "
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n📋 Caso {i}:")
        print(f"  Original: {case}")
        
        # Simular limpieza (como en views.py)
        nombre_limpio = case['nombre'].strip().title()
        apellido_limpio = case['apellido'].strip().title()
        correo_limpio = case['correo'].lower().strip()
        telefono_limpio = str(case['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        
        print(f"  Limpio:")
        print(f"    nombre: '{nombre_limpio}'")
        print(f"    apellido: '{apellido_limpio}'")
        print(f"    correo: '{correo_limpio}'")
        print(f"    telefono: '{telefono_limpio}'")

def test_edge_cases():
    """Prueba casos edge complejos"""
    print("\n🎯 Probando casos edge complejos:")
    
    edge_cases = [
        {
            "nombre": "\t\n\r   \t\n",
            "apellido": "   ",
            "correo": "   @   ",
            "telefono": "abc123def"
        },
        {
            "nombre": "1234567890123456789012345678901234567890",  # Muy largo
            "apellido": "A",  # Muy corto
            "correo": "usuario@test.com@test.com",  # Doble @
            "telefono": "12345678901234567890"  # Muy largo
        },
        {
            "nombre": "José María",  # Con acentos
            "apellido": "García-López",  # Con guión
            "correo": "usuario+tag@test.com",  # Con +
            "telefono": "+56 9 1234 5678"  # Con código de país
        },
        {
            "nombre": "   Juan   Carlos   ",  # Múltiples espacios
            "apellido": "   Pérez   García   ",
            "correo": "   USUARIO.TEST@TEST.COM   ",
            "telefono": "   +56 9 1234 - 5678   "
        }
    ]
    
    for i, case in enumerate(edge_cases, 1):
        print(f"\n🔍 Caso edge {i}:")
        print(f"  Input: {case}")
        
        # Validaciones
        nombre_valido = len(case['nombre'].strip()) >= 2
        apellido_valido = len(case['apellido'].strip()) >= 2
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        correo_valido = bool(re.match(email_regex, case['correo']))
        
        telefono_str = str(case['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        telefono_valido = telefono_str.isdigit() and 9 <= len(telefono_str) <= 11
        
        print(f"  Validaciones:")
        print(f"    nombre: {nombre_valido} (longitud: {len(case['nombre'].strip())})")
        print(f"    apellido: {apellido_valido} (longitud: {len(case['apellido'].strip())})")
        print(f"    correo: {correo_valido}")
        print(f"    telefono: {telefono_valido} (limpio: '{telefono_str}', longitud: {len(telefono_str)})")

if __name__ == "__main__":
    print("🧪 INICIANDO PRUEBAS DE VALIDACIONES DE USUARIOS")
    print("=" * 60)
    
    test_email_validation()
    test_phone_validation()
    test_name_validation()
    test_data_cleaning()
    test_edge_cases()
    
    print("\n" + "=" * 60)
    print("✅ PRUEBAS COMPLETADAS")
    print("\n💡 Recomendaciones:")
    print("  - Ejecuta este script para verificar todas las validaciones")
    print("  - Revisa los casos que muestran '⚠️' para posibles mejoras")
    print("  - Los casos '❌' deben ser rechazados por las validaciones")
    print("  - Los casos '✅' deben ser aceptados por las validaciones") 