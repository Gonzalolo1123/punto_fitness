# Generated manually to consolidate migrations

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CategoriaProducto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('descripcion', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'categoria_producto',
            },
        ),
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('apellido', models.CharField(max_length=30)),
                ('email', models.EmailField(max_length=30)),
                ('contrasena', models.CharField(max_length=100)),
                ('telefono', models.IntegerField()),
                ('fecha_registro', models.DateField(auto_now_add=True)),
                ('estado', models.CharField(default='Activo', max_length=30)),
            ],
            options={
                'db_table': 'cliente',
            },
        ),
        migrations.CreateModel(
            name='Encargado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('telefono', models.IntegerField()),
                ('email', models.EmailField(max_length=30)),
            ],
            options={
                'db_table': 'encargado',
            },
        ),
        migrations.CreateModel(
            name='Establecimiento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('direccion', models.CharField(max_length=30)),
                ('telefono', models.IntegerField()),
                ('email', models.EmailField(max_length=30)),
                ('horario_apertura', models.TimeField()),
                ('horario_cierre', models.TimeField()),
            ],
            options={
                'db_table': 'establecimiento',
            },
        ),
        migrations.CreateModel(
            name='MetodoPago',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('descripcion', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'metodo_pago',
            },
        ),
        migrations.CreateModel(
            name='Proveedor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('telefono', models.IntegerField()),
                ('email', models.EmailField(max_length=30)),
            ],
            options={
                'db_table': 'proveedor',
            },
        ),
        migrations.CreateModel(
            name='TipoDocumentoPago',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
            ],
            options={
                'db_table': 'tipo_documento_pago',
            },
        ),
        migrations.CreateModel(
            name='CompraVendedor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField()),
                ('total', models.IntegerField()),
                ('iva', models.DecimalField(decimal_places=2, max_digits=6)),
                ('estado', models.BooleanField()),
                ('establecimiento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.establecimiento')),
            ],
            options={
                'db_table': 'compra_vendedor',
            },
        ),
        migrations.CreateModel(
            name='Administrador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nivel_acceso', models.CharField(max_length=30)),
                ('cliente', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='punto_app.cliente')),
                ('establecimiento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.establecimiento')),
            ],
            options={
                'db_table': 'administrador',
            },
        ),
        migrations.CreateModel(
            name='Membresia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('descripcion', models.CharField(max_length=50)),
                ('precio', models.IntegerField()),
                ('fecha_inicio', models.DateField()),
                ('fecha_fin', models.DateField()),
                ('establecimiento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.establecimiento')),
            ],
            options={
                'db_table': 'membresia',
            },
        ),
        migrations.CreateModel(
            name='ClienteMembresia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_inicio', models.DateField()),
                ('fecha_fin', models.DateField()),
                ('estado', models.BooleanField()),
                ('codigo_qr', models.CharField(max_length=30)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.cliente')),
                ('membresia', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.membresia')),
            ],
            options={
                'db_table': 'cliente_membresia',
            },
        ),
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=30)),
                ('descripcion', models.CharField(max_length=50)),
                ('precio', models.IntegerField()),
                ('stock_actual', models.IntegerField()),
                ('stock_minimo', models.IntegerField()),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.categoriaproducto')),
                ('compra', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.compravendedor')),
                ('establecimiento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.establecimiento')),
            ],
            options={
                'db_table': 'producto',
            },
        ),
        migrations.AddField(
            model_name='establecimiento',
            name='proveedor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.proveedor'),
        ),
        migrations.CreateModel(
            name='RegistroAcceso',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_hora_entrada', models.DateTimeField()),
                ('fecha_hora_salida', models.DateTimeField()),
                ('establecimiento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.establecimiento')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.cliente')),
            ],
            options={
                'db_table': 'registro_acceso',
            },
        ),
        migrations.CreateModel(
            name='DetalleCompra',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.IntegerField()),
                ('iva', models.DecimalField(decimal_places=2, max_digits=6)),
                ('subtotal', models.IntegerField()),
                ('precio_unitario', models.IntegerField()),
                ('compra', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.compravendedor')),
                ('producto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.producto')),
            ],
            options={
                'db_table': 'detalle_compra',
            },
        ),
        migrations.CreateModel(
            name='Inscripcion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_inscripcion', models.DateField()),
                ('estado', models.CharField(max_length=30)),
                ('fecha_realizacion', models.DateField(blank=True, null=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.cliente')),
                ('curso', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='punto_app.membresia')),
            ],
            options={
                'db_table': 'inscripcion',
            },
        ),
    ] 