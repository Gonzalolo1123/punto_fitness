const BASE_URL = '/super_admin/';  // Actualiza la URL base

document.addEventListener('DOMContentLoaded', function () {
    inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : '';
}

// Funciones para modal
function abrirModal(tipo) {
    document.getElementById(`modal-fondo-${tipo}`).style.display = 'flex';
}

function cerrarModal(tipo) {
    document.getElementById(`modal-fondo-${tipo}`).style.display = 'none';
}

function abrirModalEdicion(tipo, id) {
    document.getElementById(`modal-fondo-editar-${tipo}-${id}`).style.display = 'flex';
}

function cerrarModalEdicion(tipo, id) {
    document.getElementById(`modal-fondo-editar-${tipo}-${id}`).style.display = 'none';
}

function mostrarModalConfirmacion(mensaje, onConfirm) {
    document.getElementById('mensaje-confirmacion').textContent = mensaje;
    document.getElementById('modal-fondo-confirmacion').style.display = 'flex';
    
    // Configurar el botón de confirmar
    const btnConfirmar = document.getElementById('confirmar-accion');
    btnConfirmar.onclick = function() {
        onConfirm();
        cerrarModal('confirmacion');
    };
}

// Función para actualizar vista
function actualizarVista(admin) {
    const row = document.querySelector(`tr[data-id="${admin.id}"]`);
    if (row) {
        const cells = row.cells;
        cells[0].textContent = admin.cliente.nombre;
        cells[1].textContent = admin.cliente.apellido;
        cells[2].textContent = admin.cliente.email;
        cells[3].textContent = admin.cliente.telefono;
        cells[4].textContent = admin.nivel_acceso;
    }
}

// Funciones CRUD
function crearAdmin(formData) {
    return fetch(`${BASE_URL}crear_admin/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
    }).then(response => response.json());
}

function actualizarAdmin(id, data) {
    return fetch(`${BASE_URL}actualizar_admin/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function eliminarAdmin(id) {
    return fetch(`${BASE_URL}borrar_admin/${id}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        }
    }).then(response => response.json());
}

// Función para enviar la petición para cambiar el rol de admin
function otorgarRolAdmin(clienteId, establecimientoId) {
    const data = {
        cliente_id: clienteId,
        es_admin: true, // Queremos darle el rol de admin
        establecimiento_id: establecimientoId // Opcional, si tu modelo de Administrador lo permite nulo o tienes un valor por defecto
    };

    fetch('/cambiar-rol-admin/', { // Usa la URL de tu endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Rol de administrador otorgado con éxito.');
                window.location.reload(); // Recargar la página para ver los cambios
            } else {
                alert('Error al otorgar rol de administrador: ' + result.error);
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            alert('Ocurrió un error al intentar cambiar el rol.');
        });
}

function inicializarEventListeners() {
    // Event listener para abrir modal de admin
    const btnAbrirModal = document.getElementById('abrir-form-admin');
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', function () {
            abrirModal('admin');
        });
    }

    // Event listener para cancelar en modal de confirmación
    const btnCancelarAccion = document.getElementById('cancelar-accion');
    if (btnCancelarAccion) {
        btnCancelarAccion.addEventListener('click', function () {
            cerrarModal('confirmacion');
        });
    }

    // Cerrar modales al hacer clic en el fondo
    document.querySelectorAll('.modal-fondo').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    // Botones de edición
    document.querySelectorAll('[name="btn-editar-admin"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const adminId = this.getAttribute('data-id');
            abrirModalEdicion('admin', adminId);
        });
    });

    // Formularios de edición
    document.querySelectorAll('[name="form-editar-admin"]').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const adminId = this.dataset.id;
            
            // Debug: verificar que el ID se obtiene correctamente
            console.log('Admin ID obtenido:', adminId);
            console.log('Tipo de adminId:', typeof adminId);
            
            if (!adminId || adminId === '') {
                alert('Error: No se pudo obtener el ID del administrador. Por favor, recarga la página.');
                return;
            }
            
            // Verificar que todos los campos existen antes de obtener sus valores
            const nombreField = this.querySelector(`[name="admin-nombre-editar-${adminId}"]`);
            const apellidoField = this.querySelector(`[name="admin-apellido-editar-${adminId}"]`);
            const correoField = this.querySelector(`[name="admin-correo-editar-${adminId}"]`);
            const telefonoField = this.querySelector(`[name="admin-telefono-editar-${adminId}"]`);
            const nivelField = this.querySelector(`[name="admin-nivel-editar-${adminId}"]`);
            
            // Debug: verificar que los campos se encuentran
            console.log('Campos encontrados:', {
                nombre: nombreField,
                apellido: apellidoField,
                correo: correoField,
                telefono: telefonoField,
                nivel: nivelField
            });
            
            if (!nombreField || !apellidoField || !correoField || !telefonoField || !nivelField) {
                alert('Error: No se pudieron encontrar todos los campos del formulario. Por favor, recarga la página.');
                return;
            }
            
            const formData = {
                nombre: nombreField.value,
                apellido: apellidoField.value,
                correo: correoField.value,
                telefono: telefonoField.value,
                nivel_acceso: nivelField.value
            };
            
            // Debug: verificar los datos del formulario
            console.log('Datos del formulario de administrador:', formData);

            actualizarAdmin(adminId, formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    actualizarVista(data);
                    cerrarModalEdicion('admin', adminId);
                    alert('Administrador actualizado correctamente');
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al actualizar: ' + error.message);
                });
        });
    });

    // Botones de eliminación
    document.querySelectorAll('[name="btn-eliminar-admin"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            mostrarModalConfirmacion('¿Estás seguro de que quieres eliminar a este administrador?', function() {
                eliminarAdmin(id)
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        document.querySelector(`tr[data-id="${id}"]`).remove();
                        document.querySelector(`#modal-fondo-editar-admin-${id}`)?.remove();
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error al eliminar administrador: ' + error.message);
                    });
            });
        });
    });

    // Botones para hacer admin a un cliente (en el modal)
    document.querySelectorAll('.btn-hacer-admin-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const clienteId = this.getAttribute('data-cliente-id');
            // Obtener el select correspondiente a este cliente
            const selectEst = document.querySelector('.select-establecimiento-modal[data-cliente-id="' + clienteId + '"]');
            const establecimientoId = selectEst ? selectEst.value : '';

            if (!establecimientoId) {
                alert('Por favor, selecciona un establecimiento antes de continuar.');
                return;
            }

            mostrarModalConfirmacion(`¿Estás seguro de que quieres hacer a este cliente (ID: ${clienteId}) administrador?`, function() {
                otorgarRolAdmin(clienteId, establecimientoId);
            });
        });
    });
}
