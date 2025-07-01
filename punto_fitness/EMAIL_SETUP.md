# Configuración de Email para Punto Fitness

## 📧 Configuración de Gmail

### Paso 1: Habilitar Verificación en Dos Pasos
1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad**
3. En "Iniciar sesión en Google", selecciona **Verificación en dos pasos**
4. Sigue los pasos para habilitarla

### Paso 2: Generar Contraseña de Aplicación
1. En la misma página de **Seguridad**
2. Busca **Contraseñas de aplicación**
3. Selecciona **Aplicación** → **Otra (nombre personalizado)**
4. Escribe "Django" como nombre
5. Copia la contraseña generada (16 caracteres)

### Paso 3: Configurar Credenciales
1. Edita el archivo `email_config.py`
2. Reemplaza `'tu_correo@gmail.com'` con tu correo de Gmail
3. Reemplaza `'tu_contraseña_de_aplicacion'` con la contraseña de 16 caracteres

Ejemplo:
```python
EMAIL_CONFIG = {
    'EMAIL_HOST_USER': 'mi_correo@gmail.com',
    'EMAIL_HOST_PASSWORD': 'abcd efgh ijkl mnop'  # Sin espacios
}
```

### Paso 4: Probar la Configuración
Ejecuta el script de prueba:
```bash
python test_email.py
```

## 🔧 Solución de Problemas

### Error: "Invalid credentials"
- Verifica que estés usando una contraseña de aplicación, no tu contraseña normal
- Asegúrate de que la verificación en dos pasos esté habilitada

### Error: "Connection refused"
- Verifica que el puerto 587 no esté bloqueado por tu firewall
- Asegúrate de tener conexión a internet

### Error: "Authentication failed"
- Verifica que el correo esté escrito correctamente
- Asegúrate de que la contraseña de aplicación no tenga espacios

## 📬 Qué Verás en tu Bandeja de Entrada

Una vez configurado, recibirás emails con:
- **Asunto**: "Código de Verificación - Punto Fitness"
- **Contenido**: Código de 6 dígitos para verificar tu cuenta
- **Expiración**: 10 minutos después del envío

## 🔒 Seguridad

- **Nunca** compartas tu contraseña de aplicación
- **Nunca** subas el archivo `email_config.py` a Git
- En producción, usa variables de entorno en lugar del archivo de configuración

## 🚀 Para Producción

Cuando despliegues en producción:
1. Usa variables de entorno
2. Configura un servidor SMTP profesional
3. Implementa rate limiting para evitar spam 