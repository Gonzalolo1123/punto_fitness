document.addEventListener('DOMContentLoaded', function() {
    const selectEstablecimiento = document.getElementById('establecimiento');
    
    // Función para actualizar todos los campos relacionados con el establecimiento
    function actualizarEstablecimiento() {
        const establecimientoId = selectEstablecimiento.value;
        const establecimientoNombre = selectEstablecimiento.options[selectEstablecimiento.selectedIndex].getAttribute('data-nombre');
        const establecimientoDireccion = selectEstablecimiento.options[selectEstablecimiento.selectedIndex].getAttribute('data-direccion');
        
        // Actualizar formularios de entrada (asistencia)
        document.querySelectorAll('.form-asistencia').forEach(form => {
            const clienteId = form.querySelector('input[name="cliente_id"]').value;
            form.querySelector(`#establecimiento_id_${clienteId}`).value = establecimientoId;
            form.querySelector(`#establecimiento_nombre_${clienteId}`).value = establecimientoNombre;
            form.querySelector(`#establecimiento_direccion_${clienteId}`).value = establecimientoDireccion;
        });
        
        // Actualizar formularios de salida
        document.querySelectorAll('.form-salida').forEach(form => {
            const clienteId = form.querySelector('input[name="cliente_id"]').value;
            form.querySelector(`#salida_establecimiento_id_${clienteId}`).value = establecimientoId;
        });
    }
    
    // Evento change para el select
    selectEstablecimiento.addEventListener('change', actualizarEstablecimiento);
    
    // Actualizar al cargar si ya hay un valor seleccionado
    if (selectEstablecimiento.value) {
        actualizarEstablecimiento();
    }
    
    // Validación SOLO para formularios de asistencia
    document.querySelectorAll('.form-asistencia').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!selectEstablecimiento.value) {
                e.preventDefault();
                alert('Por favor, seleccione un establecimiento');
            }
        });
    });

    // Validación SOLO para formularios de salida
    document.querySelectorAll('.form-salida').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!selectEstablecimiento.value) {
                e.preventDefault();
                alert('Por favor, seleccione un establecimiento');
            }
        });
    });
});