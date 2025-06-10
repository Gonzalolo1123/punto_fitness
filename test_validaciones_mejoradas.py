#!/usr/bin/env python3
"""
Script de prueba para validaciones mejoradas de usuarios
Prueba casos edge específicos que fallaron en las pruebas anteriores
"""

import re

def test_improved_email_validation():
    """Prueba validaciones mejoradas de email"""
    print("🔍 Probando validaciones mejoradas de email:")
    
    # Regex base
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Casos problemáticos identificados
    problematic_emails = [
        "usuario@test..com",  # Puntos consecutivos
        ".usuario@test.com",  # Punto al inicio
        "usuario@test.com.",  # Punto al final
        "usuario@test.comm",  # TLD muy largo
        "usuario@@test.com",  # Doble @
        "usuario@test.com@test.com",  # Múltiples @
        "usuario@test.c",  # TLD muy corto
        "usuario@test",  # Sin TLD
        "usuario@.com",  # Sin dominio
        "usuario @test.com",  # Espacio antes de @
        "usuario@ test.com",  # Espacio después de @
        "usuario@test.com ",  # Espacio al final
        " usuario@test.com",  # Espacio al inicio
        "",  # Vacío
        "   ",  # Solo espacios
        "usuario",  # Sin @
        "usuario@",  # Sin dominio
        "@test.com",  # Sin usuario
    ]
    
    print("❌ Emails que deben ser rechazados:")
    for email in problematic_emails:
        # Validación regex
        regex_valid = bool(re.match(email_regex, email))
        
        # Validaciones adicionales
        email_clean = email.strip()
        starts_with_dot = email_clean.startswith('.')
        ends_with_dot = email_clean.endswith('.')
        has_consecutive_dots = '..' in email_clean
        wrong_at_count = email_clean.count('@') != 1
        
        # Validación completa
        is_valid = regex_valid and not starts_with_dot and not ends_with_dot and not has_consecutive_dots and not wrong_at_count
        
        status = "❌" if not is_valid else "⚠️"
        print(f"  {status} '{email}' -> {is_valid}")
        if is_valid:
            print(f"      ⚠️  Este email debería ser rechazado pero pasó la validación")
    
    # Casos válidos
    valid_emails = [
        "usuario@test.com",
        "usuario.test@test.com",
        "usuario+test@test.com",
        "usuario_test@test.com",
        "usuario123@test.com",
        "usuario@test.co.uk",
        "usuario@test-domain.com",
        "usuario@test.com.mx",
        "usuario@test.co",
        "usuario@test.org",
        "usuario@test.net"
    ]
    
    print("\n✅ Emails válidos:")
    for email in valid_emails:
        # Validación regex
        regex_valid = bool(re.match(email_regex, email))
        
        # Validaciones adicionales
        email_clean = email.strip()
        starts_with_dot = email_clean.startswith('.')
        ends_with_dot = email_clean.endswith('.')
        has_consecutive_dots = '..' in email_clean
        wrong_at_count = email_clean.count('@') != 1
        
        # Validación completa
        is_valid = regex_valid and not starts_with_dot and not ends_with_dot and not has_consecutive_dots and not wrong_at_count
        
        status = "✅" if is_valid else "❌"
        print(f"  {status} '{email}' -> {is_valid}")

def test_complex_edge_cases():
    """Prueba casos edge complejos con espacios y caracteres especiales"""
    print("\n🎯 Probando casos edge complejos:")
    
    edge_cases = [
        # Casos con espacios complejos
        {
            "nombre": "\t\n\r   \t\n",
            "apellido": "   ",
            "correo": "   @   ",
            "telefono": "abc123def"
        },
        {
            "nombre": "   Juan   Carlos   ",
            "apellido": "   Pérez   García   ",
            "correo": "   USUARIO.TEST@TEST.COM   ",
            "telefono": "   +56 9 1234 - 5678   "
        },
        {
            "nombre": "  A  ",
            "apellido": "  B  ",
            "correo": "  usuario@test  ",
            "telefono": "  123  "
        },
        # Casos con caracteres especiales
        {
            "nombre": "José María",
            "apellido": "García-López",
            "correo": "usuario+tag@test.com",
            "telefono": "+56 9 1234 5678"
        },
        {
            "nombre": "1234567890123456789012345678901234567890",  # Muy largo
            "apellido": "A",  # Muy corto
            "correo": "usuario@test.com@test.com",  # Doble @
            "telefono": "12345678901234567890"  # Muy largo
        },
        # Casos con caracteres de control
        {
            "nombre": "\x00\x01\x02",  # Caracteres de control
            "apellido": "\x1f\x7f",  # Más caracteres de control
            "correo": "usuario\x00@test.com",  # Carácter de control en email
            "telefono": "123\x00456"  # Carácter de control en teléfono
        }
    ]
    
    for i, case in enumerate(edge_cases, 1):
        print(f"\n🔍 Caso edge {i}:")
        print(f"  Input: {case}")
        
        # Validaciones de campos requeridos
        nombre_valido = len(case['nombre'].strip()) >= 2
        apellido_valido = len(case['apellido'].strip()) >= 2
        
        # Validación de email mejorada
        email_clean = case['correo'].strip()
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        regex_valid = bool(re.match(email_regex, email_clean))
        starts_with_dot = email_clean.startswith('.')
        ends_with_dot = email_clean.endswith('.')
        has_consecutive_dots = '..' in email_clean
        wrong_at_count = email_clean.count('@') != 1
        correo_valido = regex_valid and not starts_with_dot and not ends_with_dot and not has_consecutive_dots and not wrong_at_count
        
        # Validación de teléfono
        telefono_str = str(case['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        telefono_valido = telefono_str.isdigit() and 9 <= len(telefono_str) <= 11
        
        print(f"  Validaciones:")
        print(f"    nombre: {nombre_valido} (longitud: {len(case['nombre'].strip())})")
        print(f"    apellido: {apellido_valido} (longitud: {len(case['apellido'].strip())})")
        print(f"    correo: {correo_valido} (limpio: '{email_clean}')")
        print(f"    telefono: {telefono_valido} (limpio: '{telefono_str}', longitud: {len(telefono_str)})")
        
        # Mostrar detalles de validación de email
        if not correo_valido:
            print(f"      Detalles email:")
            print(f"        regex_valid: {regex_valid}")
            print(f"        starts_with_dot: {starts_with_dot}")
            print(f"        ends_with_dot: {ends_with_dot}")
            print(f"        has_consecutive_dots: {has_consecutive_dots}")
            print(f"        wrong_at_count: {wrong_at_count}")

def test_data_cleaning_edge_cases():
    """Prueba la limpieza de datos con casos edge"""
    print("\n🧹 Probando limpieza de datos con casos edge:")
    
    cleaning_cases = [
        {
            "nombre": "  juan carlos  ",
            "apellido": "  pérez garcía  ",
            "correo": "  USUARIO@TEST.COM  ",
            "telefono": "  +56 9 1234 5678  "
        },
        {
            "nombre": "\t\nJuan\t\nCarlos\t\n",
            "apellido": "\r\nPérez\r\nGarcía\r\n",
            "correo": "\t\nUSUARIO@TEST.COM\t\n",
            "telefono": "\r\n+56 9 1234 5678\r\n"
        },
        {
            "nombre": "   A   ",
            "apellido": "   B   ",
            "correo": "   usuario@test   ",
            "telefono": "   abc123def   "
        },
        {
            "nombre": "1234567890123456789012345678901234567890",  # Muy largo
            "apellido": "A",  # Muy corto
            "correo": "usuario@test.com@test.com",  # Doble @
            "telefono": "12345678901234567890"  # Muy largo
        }
    ]
    
    for i, case in enumerate(cleaning_cases, 1):
        print(f"\n📋 Caso de limpieza {i}:")
        print(f"  Original: {case}")
        
        # Simular limpieza (como en views.py)
        nombre_limpio = case['nombre'].strip().title()
        apellido_limpio = case['apellido'].strip().title()
        correo_limpio = case['correo'].lower().strip()
        telefono_limpio = str(case['telefono']).replace(' ', '').replace('-', '').replace('+', '')
        
        print(f"  Limpio:")
        print(f"    nombre: '{nombre_limpio}' (longitud: {len(nombre_limpio)})")
        print(f"    apellido: '{apellido_limpio}' (longitud: {len(apellido_limpio)})")
        print(f"    correo: '{correo_limpio}' (longitud: {len(correo_limpio)})")
        print(f"    telefono: '{telefono_limpio}' (longitud: {len(telefono_limpio)})")
        
        # Validaciones después de limpieza
        nombre_valido = len(nombre_limpio) >= 2
        apellido_valido = len(apellido_limpio) >= 2
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        regex_valid = bool(re.match(email_regex, correo_limpio))
        starts_with_dot = correo_limpio.startswith('.')
        ends_with_dot = correo_limpio.endswith('.')
        has_consecutive_dots = '..' in correo_limpio
        wrong_at_count = correo_limpio.count('@') != 1
        correo_valido = regex_valid and not starts_with_dot and not ends_with_dot and not has_consecutive_dots and not wrong_at_count
        
        telefono_valido = telefono_limpio.isdigit() and 9 <= len(telefono_limpio) <= 11
        
        print(f"  Validaciones después de limpieza:")
        print(f"    nombre: {nombre_valido}")
        print(f"    apellido: {apellido_valido}")
        print(f"    correo: {correo_valido}")
        print(f"    telefono: {telefono_valido}")

if __name__ == "__main__":
    print("🧪 INICIANDO PRUEBAS DE VALIDACIONES MEJORADAS")
    print("=" * 70)
    
    test_improved_email_validation()
    test_complex_edge_cases()
    test_data_cleaning_edge_cases()
    
    print("\n" + "=" * 70)
    print("✅ PRUEBAS COMPLETADAS")
    print("\n💡 Resultados:")
    print("  - Los casos '❌' deben ser rechazados por las validaciones")
    print("  - Los casos '✅' deben ser aceptados por las validaciones")
    print("  - Los casos '⚠️' indican problemas que necesitan atención")
    print("\n🔧 Mejoras implementadas:")
    print("  - Validación de puntos al inicio/final de email")
    print("  - Validación de puntos consecutivos en email")
    print("  - Validación de múltiples símbolos @")
    print("  - Mejor manejo de espacios y caracteres especiales") 