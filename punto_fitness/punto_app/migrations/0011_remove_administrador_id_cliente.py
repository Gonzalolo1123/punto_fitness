# Generated by Django 5.2 on 2025-05-29 05:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('punto_app', '0010_administrador_id_cliente'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='administrador',
            name='id_cliente',
        ),
    ]
