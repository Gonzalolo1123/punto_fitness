const BASE_URL = '/usuarios/';

document.addEventListener('DOMContentLoaded', function () {
    inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrfInput ? csrfInput.value : '';
}

// Función para mostrar formulario de edición
function mostrarFormularioEdicion(usuarioId) {
    document.querySelectorAll('.form-edicion-usuario').forEach(form => {
        form.style.display = 'none';
    });
    document.getElementById(`form-editar-usuario-${usuarioId}`).style.display = 'table-row';
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicion(usuarioId) {
    document.getElementById(`form-editar-usuario-${usuarioId}`).style.display = 'none';
}

// Función para actualizar vista de datos de usuario
function actualizarVista(usuario) {
    const row = document.querySelector(`tr[data-id="${usuario.id}"]`);
    if (row) {
        const cells = row.cells;
        cells[0].textContent = usuario.nombre;
        cells[1].textContent = usuario.apellido;
        cells[2].textContent = usuario.email;
        cells[3].textContent = usuario.telefono;
    }
}

// Función para crear usuario
function crearUsuario(formData) {
    return fetch(`${BASE_URL}crear_usuario/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
    }).then(response => response.json());
}

// Función para actualizar usuario
function actualizarUsuario(id, data) {
    return fetch(`${BASE_URL}actualizar_usuario/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

// Función para eliminar usuario
function eliminarUsuario(id) {
    return fetch(`${BASE_URL}borrar_usuario/${id}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        }
    }).then(response => response.json());
}

function inicializarEventListeners() {
    const formCrearUsuario = document.getElementById('form-crear-usuario');
    if (formCrearUsuario) {
        formCrearUsuario.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = {
                nombre: document.getElementById('usuario-nombre').value,
                apellido: document.getElementById('usuario-apellido').value,
                correo: document.getElementById('usuario-correo').value,
                telefono: document.getElementById('usuario-telefono').value
            };

            crearUsuario(formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    alert('Usuario creado exitosamente');
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al crear usuario: ' + error.message);
                });
        });
    }

    // Formularios de actualización de datos
    document.querySelectorAll('[name="form-editar-usuario"]').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const usuarioId = this.dataset.id;
            const formData = {
                nombre: this.querySelector('[name="usuario-nombre"]').value,
                apellido: this.querySelector('[name="usuario-apellido"]').value,
                correo: this.querySelector('[name="usuario-correo"]').value,
                telefono: this.querySelector('[name="usuario-telefono"]').value
            };

            actualizarUsuario(usuarioId, formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    actualizarVista(data);
                    ocultarFormularioEdicion(usuarioId);
                    alert('Usuario actualizado correctamente');
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al actualizar: ' + error.message);
                });
        });
    });

    // Boton editar
    document.querySelectorAll('[name="btn-editar-usuario"]').forEach(btn => {
        btn.addEventListener('click', function () {
            mostrarFormularioEdicion(this.getAttribute('data-id'));
        });
    });

    // Boton eliminar
    document.querySelectorAll('[name="btn-eliminar-usuario"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            if (confirm('¿Eliminar a este usuario?')) {
                eliminarUsuario(id)
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        document.querySelector(`tr[data-id="${id}"]`).remove();
                        document.querySelector(`#form-editar-usuario-${id}`)?.remove();
                        window.location.reload();
                    })
                    .catch(console.error);
            }
        });
    });

    // Modal Functionality
    const modalFondo = document.getElementById('modal-fondo');
    const modalForm = document.getElementById('modal-form');
    const modalFormContent = document.getElementById('modal-form-content');
    const abrirFormUsuarioBtn = document.getElementById('abrir-form-usuario');

    if (abrirFormUsuarioBtn) {
        abrirFormUsuarioBtn.addEventListener('click', function () {
            const estado = this.getAttribute('data-estado');
            if (estado === 'cerrado') {
                // Abrir formulario
                const formHtml = document.getElementById('form-crear-usuario-container').innerHTML;
                modalFormContent.innerHTML = formHtml;
                modalFondo.style.display = 'block';
                modalForm.style.display = 'block';
                this.setAttribute('data-estado', 'abierto');
                this.textContent = '-';
            } else {
                // Cerrar formulario
                modalFondo.style.display = 'none';
                modalForm.style.display = 'none';
                modalFormContent.innerHTML = '';
                this.setAttribute('data-estado', 'cerrado');
                this.textContent = '+';
            }
        });
    }

    if (modalFondo) {
        modalFondo.addEventListener('click', function (event) {
            if (event.target === modalFondo) {
                abrirFormUsuarioBtn.click(); // Simulate click on the open/close button
            }
        });
    }
}