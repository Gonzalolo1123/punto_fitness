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
    // Reemplaza el event listener del modal
    const btnToggleForm = document.getElementById('abrir-form-admin');
    const clientesNoAdminWrapper = document.getElementById('clientes-no-admin-wrapper'); // Nueva referencia

    if (btnToggleForm) {
        btnToggleForm.addEventListener('click', function () {
            const estado = this.getAttribute('data-estado');
            const modalFormContent = document.getElementById('modal-form-content');
            const formCrearAdminContainer = document.getElementById('form-crear-admin-container');

            if (estado === 'cerrado') {
                // Abrir formulario y mostrar tabla de clientes no admin
                if (formCrearAdminContainer && modalFormContent) {
                    modalFormContent.innerHTML = formCrearAdminContainer.innerHTML; // Pasa el contenido del formulario al modal
                }
                document.getElementById('modal-fondo').style.display = 'block';
                document.getElementById('modal-form').style.display = 'block';
                if (clientesNoAdminWrapper) {
                    clientesNoAdminWrapper.style.display = 'block'; // Mostrar la tabla
                }
                this.setAttribute('data-estado', 'abierto');
                this.textContent = '-';
                // Re-inicializar event listeners para el nuevo formulario inyectado en el modal
                inicializarFormularioCrearAdmin();
            } else {
                // Cerrar formulario y ocultar tabla de clientes no admin
                ocultarFormularioModal();
            }
        });
    }

    // También cierra el formulario al hacer clic en el fondo modal
    document.getElementById('modal-fondo')?.addEventListener('click', function () {
        ocultarFormularioModal();
    });

    // Función auxiliar para cerrar el modal y la tabla de clientes no admin
    function ocultarFormularioModal() {
        document.getElementById('modal-fondo').style.display = 'none';
        document.getElementById('modal-form').style.display = 'none';
        document.getElementById('modal-form-content').innerHTML = '';
        if (clientesNoAdminWrapper) {
            clientesNoAdminWrapper.style.display = 'none'; // Ocultar la tabla
        }
        const btn = document.getElementById('abrir-form-admin');
        if (btn) {
            btn.setAttribute('data-estado', 'cerrado');
            btn.textContent = '+';
        }
    }

    // Nueva función para inicializar el formulario de crear admin (para cuando se inyecta en el modal)
    function inicializarFormularioCrearAdmin() {
        const formCrearAdminModal = document.getElementById('form-crear-admin-modal');
        if (formCrearAdminModal) {
            formCrearAdminModal.addEventListener('submit', function (e) {
                e.preventDefault();

                const clienteId = this.querySelector('#cliente-select').value;
                const nivelAcceso = this.querySelector('#admin-nivel').value;

                if (!clienteId) {
                    alert('Por favor, selecciona un cliente.');
                    return;
                }

                const formData = {
                    cliente_id: clienteId,
                    nivel_acceso: nivelAcceso
                };

                console.log('Enviando datos para crear/actualizar admin:', formData);

                crearAdmin(formData)
                    .then(data => {
                        if (data.error) {
                            throw new Error(data.error);
                        }
                        alert('Administrador agregado/actualizado correctamente.');
                        ocultarFormularioModal();
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error al agregar/actualizar administrador:', error);
                        alert('Error: ' + error.message);
                    });
            });
        }
    }

    // Botones de edición
    document.querySelectorAll('[name="btn-editar-admin"]').forEach(btn => {
        btn.addEventListener('click', function () {
            mostrarFormularioEdicion(this.getAttribute('data-id'));
        });
    });

    // Formularios de edición
    document.querySelectorAll('[name="form-editar-admin"]').forEach(form => {
        form.addEventListener('submit', function (e) {
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
        btn.addEventListener('click', function () {
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

    // Botones para hacer admin a un cliente
    document.querySelectorAll('.btn-hacer-admin').forEach(btn => {
        btn.addEventListener('click', function() {
            const clienteId = this.getAttribute('data-cliente-id');
            // Obtener el select correspondiente a este cliente
            const selectEst = document.querySelector('.select-establecimiento[data-cliente-id="' + clienteId + '"]');
            const establecimientoId = selectEst ? selectEst.value : '';

            if (!establecimientoId) {
                alert('Por favor, selecciona un establecimiento antes de continuar.');
                return;
            }

            if (confirm(`¿Estás seguro de que quieres hacer a este cliente (ID: ${clienteId}) administrador?`)) {
                otorgarRolAdmin(clienteId, establecimientoId);
            }
        });
    });
}
