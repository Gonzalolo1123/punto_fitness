# Punto Fitness

Aplicación web de gestión de gimnasio desarrollada con Django.

## Características

- Gestión de miembros del gimnasio
- Control de acceso
- Seguimiento de rutinas de ejercicio
- Panel de administración

## Configuración Local

### Requisitos

- Python 3.11+
- PostgreSQL
- pip

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Gonzalolo1123/punto_fitness.git
cd punto_fitness/punto_fitness
```

2. Crea un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instala las dependencias:
```bash
pip install -r requirements.txt
```

4. Configura la base de datos PostgreSQL:
```bash
# Crea la base de datos
createdb punto_fitness
```

5. Ejecuta las migraciones:
```bash
python manage.py migrate
```

6. Crea un superusuario:
```bash
python manage.py createsuperuser
```

7. Ejecuta el servidor de desarrollo:
```bash
python manage.py runserver
```

## Despliegue en Render

El proyecto está configurado para despliegue automático en Render.

### Configuración Automática

1. Conecta tu repositorio de GitHub a Render
2. Render detectará automáticamente el archivo `render.yaml`
3. Se creará automáticamente una base de datos PostgreSQL
4. El despliegue se ejecutará automáticamente

### Variables de Entorno

Render configurará automáticamente:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `SECRET_KEY`: Clave secreta de Django
- `DJANGO_SETTINGS_MODULE`: punto_fitness.settings

### Verificación

Para verificar la configuración antes del despliegue:
```bash
python check_deploy.py
```

## Solución de Problemas

### Error de Conexión a Base de Datos

Si encuentras errores de conexión durante el despliegue:

1. Verifica que la variable `DATABASE_URL` esté configurada en Render
2. Asegúrate de que la base de datos PostgreSQL esté creada
3. Ejecuta `python check_deploy.py` para diagnosticar problemas

### Error de Migraciones Inconsistentes

Si encuentras el error `InconsistentMigrationHistory`:

1. **En desarrollo local:**
   ```bash
   python fix_migrations.py
   ```

2. **En producción (Render):**
   - El script `fix_migrations.py` se ejecuta automáticamente durante el build
   - Si persiste el problema, puedes ejecutar manualmente:
   ```bash
   python manage.py migrate --fake-initial
   python manage.py migrate
   ```

3. **Solución manual:**
   ```bash
   # Marcar todas las migraciones como aplicadas
   python manage.py migrate --fake
   
   # Luego aplicar migraciones reales
   python manage.py migrate
   ```

### Archivos Estáticos

Los archivos estáticos se sirven automáticamente con WhiteNoise en producción.

## Estructura del Proyecto

```
punto_fitness/
├── punto_fitness/          # Configuración principal de Django
│   ├── settings.py         # Configuración del proyecto
│   ├── urls.py            # URLs principales
│   └── wsgi.py            # Configuración WSGI
├── punto_app/             # Aplicación principal
│   ├── models.py          # Modelos de datos
│   ├── views.py           # Vistas
│   └── templates/         # Plantillas HTML
├── requirements.txt       # Dependencias de Python
├── render.yaml           # Configuración de Render
├── fix_migrations.py     # Script para solucionar migraciones
└── manage.py             # Script de gestión de Django
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
