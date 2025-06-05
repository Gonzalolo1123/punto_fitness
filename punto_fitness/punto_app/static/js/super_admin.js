const BASE_URL = '/super_admin/';  // Actualiza la URL base

document.addEventListener('DOMContentLoaded', function () {
    inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : '';
}

// Funciones para mostrar/ocultar formulario
function mostrarFormularioEdicion(adminId) {
    document.querySelectorAll('.form-edicion-admin').forEach(form => {
        form.style.display = 'none';
    });
    document.getElementById(`form-editar-admin-${adminId}`).style.display = 'table-row';
}

function ocultarFormularioEdicion(adminId) {
    document.getElementById(`form-editar-admin-${adminId}`).style.display = 'none';
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

function inicializarEventListeners() {
    // Reemplaza el event listener del modal
    const btnToggleForm = document.getElementById('abrir-form-admin');
    if (btnToggleForm) {
        btnToggleForm.addEventListener('click', function() {
            const estado = this.getAttribute('data-estado');
            const formHtml = document.getElementById('form-crear-admin-container').innerHTML;
            
            if (estado === 'cerrado') {
                // Abrir formulario
                document.getElementById('modal-form-content').innerHTML = formHtml;
                document.getElementById('modal-fondo').style.display = 'block';
                document.getElementById('modal-form').style.display = 'block';
                this.setAttribute('data-estado', 'abierto');
                this.textContent = '-';
            } else {
                // Cerrar formulario
                document.getElementById('modal-fondo').style.display = 'none';
                document.getElementById('modal-form').style.display = 'none';
                document.getElementById('modal-form-content').innerHTML = '';
                this.setAttribute('data-estado', 'cerrado');
                this.textContent = '+';
            }
        });
    }

    // También cierra el formulario al hacer clic en el fondo modal
    document.getElementById('modal-fondo')?.addEventListener('click', function() {
        document.getElementById('modal-fondo').style.display = 'none';
        document.getElementById('modal-form').style.display = 'none';
        document.getElementById('modal-form-content').innerHTML = '';
        const btn = document.getElementById('abrir-form-admin');
        if (btn) {
            btn.setAttribute('data-estado', 'cerrado');
            btn.textContent = '-';
        }
    });

    // Botones de edición
    document.querySelectorAll('[name="btn-editar-admin"]').forEach(btn => {
        btn.addEventListener('click', function() {
            mostrarFormularioEdicion(this.getAttribute('data-id'));
        });
    });

    // Formularios de edición
    document.querySelectorAll('[name="form-editar-admin"]').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const adminId = this.dataset.id;
            const formData = {
                nombre: this.querySelector('[name="admin-nombre"]').value,
                apellido: this.querySelector('[name="admin-apellido"]').value,
                correo: this.querySelector('[name="admin-correo"]').value,
                telefono: this.querySelector('[name="admin-telefono"]').value,
                nivel_acceso: this.querySelector('[name="admin-nivel"]').value
            };

            actualizarAdmin(adminId, formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    actualizarVista(data);
                    ocultarFormularioEdicion(adminId);
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
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('¿Eliminar a este administrador?')) {
                eliminarAdmin(id)
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        document.querySelector(`tr[data-id="${id}"]`).remove();
                        document.querySelector(`#form-editar-admin-${id}`)?.remove();
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error al eliminar administrador: ' + error.message);
                    });
            }
        });
    });
}
