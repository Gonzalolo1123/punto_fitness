const BASE_URL = '/usuarios/';

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM cargado, inicializando event listeners...');
    inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    const token = csrfInput ? csrfInput.value : '';
    console.log('🔐 CSRF Token obtenido:', token ? 'SÍ' : 'NO', token ? `(${token.substring(0, 10)}...)` : '');
    return token;
}

// Función para mostrar formulario de edición
function mostrarFormularioEdicion(usuarioId) {
    console.log('👁️ Mostrando formulario de edición para usuario:', usuarioId);
    document.querySelectorAll('.form-edicion-usuario').forEach(form => {
        form.style.display = 'none';
    });
    const formularioEdicion = document.getElementById(`form-editar-usuario-${usuarioId}`);
    if (formularioEdicion) {
        formularioEdicion.style.display = 'table-row';
        console.log('✅ Formulario de edición mostrado correctamente');
    } else {
        console.error('❌ No se encontró el formulario de edición para el usuario:', usuarioId);
    }
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicion(usuarioId) {
    console.log('🙈 Ocultando formulario de edición para usuario:', usuarioId);
    const formularioEdicion = document.getElementById(`form-editar-usuario-${usuarioId}`);
    if (formularioEdicion) {
        formularioEdicion.style.display = 'none';
        console.log('✅ Formulario de edición ocultado correctamente');
    } else {
        console.error('❌ No se encontró el formulario de edición para el usuario:', usuarioId);
    }
}

// Función para actualizar vista de datos de usuario
function actualizarVista(usuario) {
    console.log('🔄 Actualizando vista para usuario:', usuario);
    const row = document.querySelector(`tr[data-id="${usuario.id}"]`);
    if (row) {
        const cells = row.cells;
        cells[0].textContent = usuario.nombre;
        cells[1].textContent = usuario.apellido;
        cells[2].textContent = usuario.email;
        cells[3].textContent = usuario.telefono;
        console.log('✅ Vista actualizada correctamente');
    } else {
        console.error('❌ No se encontró la fila para actualizar el usuario:', usuario.id);
    }
}

// Función para crear usuario
function crearUsuario(formData) {
    console.log('📤 Enviando datos para crear usuario:', formData);
    console.log('🌐 URL de destino:', `${BASE_URL}crear_usuario/`);
    console.log('🔑 CSRF Token en headers:', getCSRFToken());
    
    return fetch(`${BASE_URL}crear_usuario/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('📥 Respuesta recibida del servidor:', response);
        console.log('📊 Status:', response.status);
        console.log('📋 Headers:', response.headers);
        
        if (!response.ok) {
            console.error('❌ Error HTTP:', response.status, response.statusText);
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    })
    .then(data => {
        console.log('✅ Datos procesados del servidor:', data);
        return data;
    })
    .catch(error => {
        console.error('💥 Error en crearUsuario:', error);
        throw error;
    });
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
    console.log('🔧 Inicializando event listeners...');
    
    // Buscar el formulario estático (si existe)
    const formCrearUsuario = document.getElementById('form-crear-usuario');
    // Buscar el formulario del modal (está oculto inicialmente)
    const formCrearUsuarioModal = document.getElementById('form-crear-usuario-modal');
    
    console.log('📝 Formulario crear usuario (estático) encontrado:', formCrearUsuario ? 'SÍ' : 'NO');
    console.log('📝 Formulario crear usuario (modal) encontrado:', formCrearUsuarioModal ? 'SÍ' : 'NO');
    
    // Función para manejar el envío del formulario
    function manejarEnvioFormulario(e) {
        console.log('🎯 Evento submit del formulario capturado');
        e.preventDefault();
        console.log('⏹️ Prevenido el comportamiento por defecto del formulario');

        // Obtener el formulario que disparó el evento
        const formularioActual = e.target;
        console.log('📝 Formulario que disparó el evento:', formularioActual.id || formularioActual.className);

        // Buscar elementos dentro del formulario actual usando querySelector
        const nombreInput = formularioActual.querySelector('input[name="usuario-nombre"]');
        const apellidoInput = formularioActual.querySelector('input[name="usuario-apellido"]');
        const correoInput = formularioActual.querySelector('input[name="usuario-correo"]');
        const telefonoInput = formularioActual.querySelector('input[name="usuario-telefono"]');
        
        console.log('🔍 Elementos del formulario encontrados:');
        console.log('  - Nombre input:', nombreInput ? 'SÍ' : 'NO', nombreInput?.value);
        console.log('  - Apellido input:', apellidoInput ? 'SÍ' : 'NO', apellidoInput?.value);
        console.log('  - Correo input:', correoInput ? 'SÍ' : 'NO', correoInput?.value);
        console.log('  - Teléfono input:', telefonoInput ? 'SÍ' : 'NO', telefonoInput?.value);

        const formData = {
            nombre: nombreInput?.value || '',
            apellido: apellidoInput?.value || '',
            correo: correoInput?.value || '',
            telefono: telefonoInput?.value || ''
        };

        console.log('📋 Datos del formulario preparados:', formData);
        
        // Validar que todos los campos tengan datos
        const camposVacios = Object.entries(formData).filter(([key, value]) => !value.trim());
        if (camposVacios.length > 0) {
            console.warn('⚠️ Campos vacíos detectados:', camposVacios.map(([key]) => key));
            console.warn('⚠️ Valores actuales:', formData);
            alert('Por favor, complete todos los campos');
            return;
        }

        console.log('🚀 Iniciando proceso de creación de usuario...');
        crearUsuario(formData)
            .then(data => {
                console.log('✅ Usuario creado exitosamente:', data);
                if (data.error) {
                    console.error('❌ Error en respuesta del servidor:', data.error);
                    throw new Error(data.error);
                }
                alert('Usuario creado exitosamente');
                console.log('🔄 Recargando página...');
                window.location.reload();
            })
            .catch(error => {
                console.error('💥 Error al crear usuario:', error);
                console.error('📋 Stack trace:', error.stack);
                alert('Error al crear usuario: ' + error.message);
            });
    }
    
    // Agregar event listener al formulario estático si existe
    if (formCrearUsuario) {
        console.log('🔗 Agregando event listener al formulario estático');
        formCrearUsuario.addEventListener('submit', manejarEnvioFormulario);
    }
    
    // Agregar event listener al formulario del modal si existe (aunque esté oculto)
    if (formCrearUsuarioModal) {
        console.log('🔗 Agregando event listener al formulario del modal');
        formCrearUsuarioModal.addEventListener('submit', manejarEnvioFormulario);
    }
    
    if (!formCrearUsuario && !formCrearUsuarioModal) {
        console.warn('⚠️ No se encontró ningún formulario de crear usuario en el DOM');
    }

    // Formularios de actualización de datos
    document.querySelectorAll('[name="form-editar-usuario"]').forEach(form => {
        console.log('🔧 Agregando event listener al formulario de edición:', form.dataset.id);
        form.addEventListener('submit', function (e) {
            console.log('🎯 Evento submit del formulario de edición capturado');
            e.preventDefault();
            console.log('⏹️ Prevenido el comportamiento por defecto del formulario');
            
            const usuarioId = this.dataset.id;
            console.log('🆔 ID del usuario a actualizar:', usuarioId);
            
            // Buscar elementos dentro del formulario actual usando querySelector
            const nombreInput = this.querySelector('input[name="usuario-nombre"]');
            const apellidoInput = this.querySelector('input[name="usuario-apellido"]');
            const correoInput = this.querySelector('input[name="usuario-correo"]');
            const telefonoInput = this.querySelector('input[name="usuario-telefono"]');
            
            console.log('🔍 Elementos del formulario de edición encontrados:');
            console.log('  - Nombre input:', nombreInput ? 'SÍ' : 'NO', nombreInput?.value);
            console.log('  - Apellido input:', apellidoInput ? 'SÍ' : 'NO', apellidoInput?.value);
            console.log('  - Correo input:', correoInput ? 'SÍ' : 'NO', correoInput?.value);
            console.log('  - Teléfono input:', telefonoInput ? 'SÍ' : 'NO', telefonoInput?.value);
            
            const formData = {
                nombre: nombreInput?.value || '',
                apellido: apellidoInput?.value || '',
                correo: correoInput?.value || '',
                telefono: telefonoInput?.value || ''
            };

            console.log('📋 Datos del formulario de edición preparados:', formData);
            
            // Validar que todos los campos tengan datos
            const camposVacios = Object.entries(formData).filter(([key, value]) => !value.trim());
            if (camposVacios.length > 0) {
                console.warn('⚠️ Campos vacíos detectados en edición:', camposVacios.map(([key]) => key));
                console.warn('⚠️ Valores actuales:', formData);
                alert('Por favor, complete todos los campos');
                return;
            }

            console.log('🚀 Iniciando proceso de actualización de usuario...');
            actualizarUsuario(usuarioId, formData)
                .then(data => {
                    console.log('✅ Usuario actualizado exitosamente:', data);
                    if (data.error) {
                        console.error('❌ Error en respuesta del servidor:', data.error);
                        throw new Error(data.error);
                    }
                    actualizarVista(data);
                    ocultarFormularioEdicion(usuarioId);
                    alert('Usuario actualizado correctamente');
                    console.log('🔄 Recargando página...');
                    window.location.reload();
                })
                .catch(error => {
                    console.error('💥 Error al actualizar usuario:', error);
                    console.error('📋 Stack trace:', error.stack);
                    alert('Error al actualizar: ' + error.message);
                });
        });
    });

    // Boton editar
    document.querySelectorAll('[name="btn-editar-usuario"]').forEach(btn => {
        const usuarioId = btn.getAttribute('data-id');
        console.log('🔧 Agregando event listener al botón editar para usuario:', usuarioId);
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            console.log('✏️ Botón editar clickeado para usuario:', id);
            mostrarFormularioEdicion(id);
        });
    });

    // Boton eliminar
    document.querySelectorAll('[name="btn-eliminar-usuario"]').forEach(btn => {
        const usuarioId = btn.getAttribute('data-id');
        console.log('🔧 Agregando event listener al botón eliminar para usuario:', usuarioId);
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            console.log('🗑️ Botón eliminar clickeado para usuario:', id);
            if (confirm('¿Eliminar a este usuario?')) {
                console.log('🚀 Iniciando proceso de eliminación de usuario:', id);
                eliminarUsuario(id)
                    .then(data => {
                        console.log('✅ Usuario eliminado exitosamente:', data);
                        if (data.error) {
                            console.error('❌ Error en respuesta del servidor:', data.error);
                            throw new Error(data.error);
                        }
                        const row = document.querySelector(`tr[data-id="${id}"]`);
                        const formRow = document.querySelector(`#form-editar-usuario-${id}`);
                        if (row) {
                            row.remove();
                            console.log('✅ Fila del usuario eliminada del DOM');
                        }
                        if (formRow) {
                            formRow.remove();
                            console.log('✅ Formulario de edición eliminado del DOM');
                        }
                        console.log('🔄 Recargando página...');
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('💥 Error al eliminar usuario:', error);
                        console.error('📋 Stack trace:', error.stack);
                        alert('Error al eliminar usuario: ' + error.message);
                    });
            } else {
                console.log('❌ Eliminación cancelada por el usuario');
            }
        });
    });

    // Modal Functionality
    const modalFondo = document.getElementById('modal-fondo');
    const modalForm = document.getElementById('modal-form');
    const modalFormContent = document.getElementById('modal-form-content');
    const abrirFormUsuarioBtn = document.getElementById('abrir-form-usuario');

    console.log('🎭 Elementos del modal encontrados:');
    console.log('  - Modal fondo:', modalFondo ? 'SÍ' : 'NO');
    console.log('  - Modal form:', modalForm ? 'SÍ' : 'NO');
    console.log('  - Modal content:', modalFormContent ? 'SÍ' : 'NO');
    console.log('  - Botón abrir:', abrirFormUsuarioBtn ? 'SÍ' : 'NO');

    if (abrirFormUsuarioBtn) {
        abrirFormUsuarioBtn.addEventListener('click', function () {
            console.log('🎯 Botón abrir formulario clickeado');
            const estado = this.getAttribute('data-estado');
            console.log('📊 Estado actual del modal:', estado);
            
            if (estado === 'cerrado') {
                console.log('🔓 Abriendo modal...');
                // Abrir formulario
                const formContainer = document.getElementById('form-crear-usuario-container');
                console.log('📦 Contenedor del formulario encontrado:', formContainer ? 'SÍ' : 'NO');
                
                if (formContainer) {
                    const formHtml = formContainer.innerHTML;
                    console.log('📄 HTML del formulario obtenido, longitud:', formHtml.length);
                    modalFormContent.innerHTML = formHtml;
                    modalFondo.style.display = 'block';
                    modalForm.style.display = 'block';
                    this.setAttribute('data-estado', 'abierto');
                    this.textContent = '-';
                    console.log('✅ Modal abierto correctamente');
                    
                    // Re-inicializar el event listener del formulario dentro del modal
                    const formModal = modalFormContent.querySelector('#form-crear-usuario-modal');
                    if (formModal) {
                        console.log('🔄 Re-inicializando event listener del formulario en modal');
                        // Remover event listeners anteriores para evitar duplicados
                        formModal.removeEventListener('submit', manejarEnvioFormulario);
                        formModal.addEventListener('submit', manejarEnvioFormulario);
                        console.log('✅ Event listener agregado al formulario del modal');
                    } else {
                        console.warn('⚠️ No se encontró el formulario dentro del modal');
                    }
                } else {
                    console.error('❌ No se encontró el contenedor del formulario');
                }
            } else {
                console.log('🔒 Cerrando modal...');
                // Cerrar formulario
                modalFondo.style.display = 'none';
                modalForm.style.display = 'none';
                modalFormContent.innerHTML = '';
                this.setAttribute('data-estado', 'cerrado');
                this.textContent = '+';
                console.log('✅ Modal cerrado correctamente');
            }
        });
    }

    if (modalFondo) {
        modalFondo.addEventListener('click', function (event) {
            if (event.target === modalFondo) {
                console.log('🖱️ Click en fondo del modal, cerrando...');
                abrirFormUsuarioBtn.click(); // Simulate click on the open/close button
            }
        });
    }
    
    console.log('✅ Event listeners inicializados correctamente');
}