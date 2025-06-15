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
        cells[2].textContent = usuario.correo;
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
            // Intentar leer el mensaje de error del servidor
            return response.json().then(errorData => {
                console.error('📋 Datos de error del servidor:', errorData);
                throw new Error(errorData.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }).catch(() => {
                // Si no se puede leer el JSON, lanzar error genérico
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            });
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
    console.log(`🚀 Iniciando actualización de usuario con ID: ${id}`);
    console.log(`📤 Datos a enviar:`, data);
    console.log(`🌐 URL de destino: ${BASE_URL}actualizar_usuario/${id}/`);
    
    return fetch(`${BASE_URL}actualizar_usuario/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('📥 Respuesta recibida del servidor:', response);
        console.log('📊 Status:', response.status);
        console.log('🌐 URL de la respuesta:', response.url);
        
        if (!response.ok) {
            console.error('❌ Error HTTP:', response.status, response.statusText);
            // Intentar leer el mensaje de error del servidor
            return response.json().then(errorData => {
                console.error('📋 Datos de error del servidor:', errorData);
                throw new Error(errorData.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }).catch(() => {
                // Si no se puede leer el JSON, lanzar error genérico
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('✅ Datos procesados del servidor:', data);
        return data;
    })
    .catch(error => {
        console.error('💥 Error en actualizarUsuario:', error);
        throw error;
    });
}

// Función para eliminar usuario
function eliminarUsuario(id) {
    return fetch(`${BASE_URL}borrar_usuario/${id}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        }
    })
    .then(response => {
        console.log('📥 Respuesta recibida del servidor:', response);
        console.log('📊 Status:', response.status);
        
        if (!response.ok) {
            console.error('❌ Error HTTP:', response.status, response.statusText);
            // Intentar leer el mensaje de error del servidor
            return response.json().then(errorData => {
                console.error('📋 Datos de error del servidor:', errorData);
                throw new Error(errorData.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }).catch(() => {
                // Si no se puede leer el JSON, lanzar error genérico
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('✅ Datos procesados del servidor:', data);
        return data;
    })
    .catch(error => {
        console.error('💥 Error en eliminarUsuario:', error);
        throw error;
    });
}

///////////////////////////////
// FUNCIONALIDAD MODALES EDICIÓN //
///////////////////////////////

// Función para abrir modal de edición
function abrirModalEdicion(tipo, id, datos) {
    console.log(`🔓 Abriendo modal de edición ${tipo} para ID ${id}...`);
    
    const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
    
    if (modalFondo) {
        // Llenar el formulario con los datos actuales
        llenarFormularioEdicion(tipo, datos);
        
        // Mostrar el modal
        modalFondo.style.display = 'flex';
        
        // Enfocar el primer input
        setTimeout(() => {
            const primerInput = modalFondo.querySelector('input, select');
            if (primerInput) {
                primerInput.focus();
            }
        }, 100);
        
        console.log(`✅ Modal de edición ${tipo} abierto correctamente`);
    } else {
        console.error(`❌ No se encontró el modal de edición para ${tipo}`);
    }
}

// Función para cerrar modal de edición
function cerrarModalEdicion(tipo) {
    console.log(`🔒 Cerrando modal de edición ${tipo}...`);
    
    const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
    
    if (modalFondo) {
        modalFondo.style.display = 'none';
        
        // Limpiar el formulario
        const form = modalFondo.querySelector('form');
        if (form) {
            form.reset();
        }
        
        console.log(`✅ Modal de edición ${tipo} cerrado correctamente`);
    } else {
        console.error(`❌ No se encontró el modal de edición para ${tipo}`);
    }
}

// Función para llenar el formulario de edición con datos
function llenarFormularioEdicion(tipo, datos) {
    const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
    if (!modalFondo) return;
    
    const form = modalFondo.querySelector('form');
    if (!form) return;
    
    // Llenar el campo ID oculto
    const idInput = form.querySelector(`input[name="${tipo}-id-editar"]`);
    if (idInput) {
        idInput.value = datos.id;
        console.log(`🔧 Campo ID ${tipo}-id-editar llenado con valor: ${datos.id}`);
    } else {
        console.error(`❌ No se encontró el campo ID ${tipo}-id-editar`);
    }
    
    // Llenar los campos según el tipo
    switch (tipo) {
        case 'usuario':
            form.querySelector('#usuario-nombre-editar').value = datos.nombre || '';
            form.querySelector('#usuario-apellido-editar').value = datos.apellido || '';
            form.querySelector('#usuario-correo-editar').value = datos.email || '';
            form.querySelector('#usuario-telefono-editar').value = datos.telefono || '';
            console.log(`🔧 Formulario de edición ${tipo} llenado con datos:`, datos);
            break;
    }
}

// Función para manejar el envío de formularios de edición
function manejarFormularioEdicion(tipo, formData) {
    const id = formData[`${tipo}-id-editar`];
    
    console.log(`🔍 ID obtenido del formulario: ${id}`);
    
    if (!id) {
        console.error('❌ No se encontró el ID del usuario en el formulario');
        Swal.fire({
            title: 'Error',
            html: '<p style="color: #555;">No se pudo identificar el usuario a actualizar.</p>',
            icon: 'error',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Eliminar el campo ID del formData
    delete formData[`${tipo}-id-editar`];
    
    // Mapear los nombres de campos según el tipo
    let dataToSend = {};
    
    switch (tipo) {
        case 'usuario':
            dataToSend = {
                nombre: formData['usuario-nombre-editar'],
                apellido: formData['usuario-apellido-editar'],
                correo: formData['usuario-correo-editar'],
                telefono: formData['usuario-telefono-editar']
            };
            break;
    }
    
    console.log(`📤 Datos a enviar para actualizar ${tipo}:`, dataToSend);
    
    // Llamar a la función de actualización correspondiente
    const funcionesActualizacion = {
        'usuario': actualizarUsuario
    };
    
    const funcionActualizacion = funcionesActualizacion[tipo];
    if (funcionActualizacion) {
        funcionActualizacion(id, dataToSend)
            .then(response => {
                if (response.success) {
                    console.log(`✅ ${tipo} actualizado correctamente`);
                    
                    // Usar SweetAlert2 para mostrar éxito
                    Swal.fire({
                        title: '¡Usuario Actualizado!',
                        html: `<p style="color: #555;">El usuario <strong>${response.data.nombre} ${response.data.apellido}</strong> ha sido actualizado exitosamente.</p>`,
                        icon: 'success',
                        confirmButtonColor: '#28a745',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        actualizarVista(response.data);
                        cerrarModalEdicion(tipo);
                    });
                } else {
                    console.error(`❌ Error al actualizar ${tipo}:`, response.error);
                    Swal.fire({
                        title: 'Error al Actualizar Usuario',
                        html: `<p style="color: #555;">${response.error}</p>`,
                        icon: 'error',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Entendido'
                    });
                }
            })
            .catch(error => {
                console.error(`❌ Error en la petición de actualización de ${tipo}:`, error);
                Swal.fire({
                    title: 'Error al Actualizar Usuario',
                    html: `<p style="color: #555;">${error.message}</p>`,
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido'
                });
            });
    }
}

// Función para obtener datos de una fila de la tabla
function obtenerDatosFila(tipo, id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return null;
    
    const cells = row.cells;
    let datos = { id: id };
    
    switch (tipo) {
        case 'usuario':
            if (cells.length >= 4) {
                datos = {
                    id: id,
                    nombre: cells[0].textContent,
                    apellido: cells[1].textContent,
                    email: cells[2].textContent,
                    telefono: cells[3].textContent
                };
            }
            break;
    }
    
    return datos;
}

// Función para inicializar los event listeners de los botones de edición
function inicializarBotonesEdicion() {
    console.log('🎯 Inicializando botones de edición...');
    
    // Botones de edición para usuarios
    const botones = document.querySelectorAll('[name="btn-editar-usuario"]');
    botones.forEach(boton => {
        boton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            console.log(`🖱️ Botón editar usuario clickeado para ID ${id}`);
            
            // Obtener datos básicos de la fila
            const datos = obtenerDatosFila('usuario', id);
            if (datos) {
                abrirModalEdicion('usuario', id, datos);
            } else {
                console.error(`❌ No se pudieron obtener los datos para usuario con ID ${id}`);
            }
        });
    });
    
    // Event listener para formulario de edición
    const form = document.getElementById('form-editar-usuario');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log(`📝 Formulario de edición usuario enviado`);
            
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            manejarFormularioEdicion('usuario', data);
        });
    }
    
    // Event listeners para cerrar modal de edición con click en fondo
    const modalFondo = document.getElementById('modal-fondo-editar-usuario');
    if (modalFondo) {
        modalFondo.addEventListener('click', function(event) {
            if (event.target === modalFondo) {
                console.log(`🖱️ Click en fondo del modal de edición usuario, cerrando...`);
                cerrarModalEdicion('usuario');
            }
        });
    }
    
    // Event listener para cerrar modal de edición con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalAbierto = document.querySelector('.modal-fondo[style*="flex"]');
            if (modalAbierto && modalAbierto.id === 'modal-fondo-editar-usuario') {
                console.log(`⌨️ Tecla ESC presionada, cerrando modal de edición usuario...`);
                cerrarModalEdicion('usuario');
            }
        }
    });
    
    console.log('✅ Botones de edición inicializados correctamente');
}

// Actualizar la función inicializarEventListeners para incluir la inicialización de botones de edición
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
            Swal.fire({
                title: 'Campos Incompletos',
                html: '<p style="color: #555;">Por favor, complete todos los campos requeridos.</p>',
                icon: 'warning',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'Entendido'
            });
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
                
                // Usar SweetAlert2 para mostrar éxito
                Swal.fire({
                    title: '¡Usuario Creado!',
                    html: `<p style="color: #555;">El usuario <strong>${data.nombre} ${data.apellido}</strong> ha sido creado exitosamente.</p><p style="color: #888; font-size: 0.9em;">Contraseña por defecto: <strong>123456</strong></p>`,
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    // Si es el formulario del modal, cerrarlo
                    if (formularioActual.id === 'form-crear-usuario-modal') {
                        cerrarModal();
                    }
                    
                    console.log('🔄 Recargando página...');
                    window.location.reload();
                });
            })
            .catch(error => {
                console.error('💥 Error al crear usuario:', error);
                console.error('📋 Stack trace:', error.stack);
                
                // Usar SweetAlert2 para mostrar error
                Swal.fire({
                    title: 'Error al Crear Usuario',
                    html: `<p style="color: #555;">${error.message}</p>`,
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido'
                });
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

    // Event listeners para botones de eliminación
    document.querySelectorAll('[name="btn-eliminar-usuario"]').forEach(boton => {
        boton.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            
            Swal.fire({
                title: '¿Eliminar Usuario?',
                html: '<p style="color: #555;">¿Está seguro de que desea eliminar este usuario?</p><p style="color: #888; font-size: 0.9em;">Esta acción no se puede deshacer.</p>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    eliminarUsuario(id)
                        .then(response => {
                            if (response.message) {
                                console.log('✅ Usuario eliminado correctamente');
                                Swal.fire({
                                    title: '¡Usuario Eliminado!',
                                    html: '<p style="color: #555;">El usuario ha sido eliminado exitosamente.</p>',
                                    icon: 'success',
                                    confirmButtonColor: '#28a745',
                                    confirmButtonText: 'Aceptar'
                                }).then(() => {
                                    window.location.reload();
                                });
                            } else {
                                console.error('❌ Error al eliminar usuario:', response.error);
                                Swal.fire({
                                    title: 'Error al Eliminar Usuario',
                                    html: `<p style="color: #555;">${response.error}</p>`,
                                    icon: 'error',
                                    confirmButtonColor: '#dc3545',
                                    confirmButtonText: 'Entendido'
                                });
                            }
                        })
                        .catch(error => {
                            console.error('❌ Error en la petición de eliminación:', error);
                            Swal.fire({
                                title: 'Error al Eliminar Usuario',
                                html: `<p style="color: #555;">${error.message}</p>`,
                                icon: 'error',
                                confirmButtonColor: '#dc3545',
                                confirmButtonText: 'Entendido'
                            });
                        });
                }
            });
        });
    });

    // Event listeners para botones de edición (modales)
    inicializarBotonesEdicion();

    // Modal Functionality
    const modalFondo = document.getElementById('modal-fondo');
    const modalForm = document.getElementById('modal-form');
    const abrirFormUsuarioBtn = document.getElementById('abrir-form-usuario');
    const cerrarModalBtn = document.getElementById('cerrar-modal');
    const cancelarModalBtn = document.getElementById('cancelar-modal');

    console.log('🎭 Elementos del modal encontrados:');
    console.log('  - Modal fondo:', modalFondo ? 'SÍ' : 'NO');
    console.log('  - Modal form:', modalForm ? 'SÍ' : 'NO');
    console.log('  - Botón abrir:', abrirFormUsuarioBtn ? 'SÍ' : 'NO');
    console.log('  - Botón cerrar:', cerrarModalBtn ? 'SÍ' : 'NO');
    console.log('  - Botón cancelar:', cancelarModalBtn ? 'SÍ' : 'NO');

    // Función para abrir el modal
    function abrirModal() {
        console.log('🔓 Abriendo modal...');
        modalFondo.style.display = 'flex';
        this.setAttribute('data-estado', 'abierto');
        this.textContent = '-';
        console.log('✅ Modal abierto correctamente');
        
        // Enfocar el primer input
        setTimeout(() => {
            const primerInput = document.getElementById('usuario-nombre-modal');
            if (primerInput) {
                primerInput.focus();
            }
        }, 100);
    }

    // Función para cerrar el modal
    function cerrarModal() {
        console.log('🔒 Cerrando modal...');
        modalFondo.style.display = 'none';
        abrirFormUsuarioBtn.setAttribute('data-estado', 'cerrado');
        abrirFormUsuarioBtn.textContent = '+';
        
        // Limpiar el formulario
        const form = document.getElementById('form-crear-usuario-modal');
        if (form) {
            form.reset();
        }
        console.log('✅ Modal cerrado correctamente');
    }

    if (abrirFormUsuarioBtn) {
        abrirFormUsuarioBtn.addEventListener('click', function () {
            console.log('🎯 Botón abrir formulario clickeado');
            const estado = this.getAttribute('data-estado');
            console.log('📊 Estado actual del modal:', estado);
            
            if (estado === 'cerrado') {
                abrirModal.call(this);
            } else {
                cerrarModal();
            }
        });
    }

    // Event listeners para cerrar el modal
    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener('click', cerrarModal);
    }

    if (cancelarModalBtn) {
        cancelarModalBtn.addEventListener('click', cerrarModal);
    }

    if (modalFondo) {
        modalFondo.addEventListener('click', function (event) {
            if (event.target === modalFondo) {
                console.log('🖱️ Click en fondo del modal, cerrando...');
                cerrarModal();
            }
        });
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalFondo.style.display === 'flex') {
            console.log('⌨️ Tecla ESC presionada, cerrando modal...');
            cerrarModal();
        }
    });
    
    console.log('✅ Event listeners inicializados correctamente');
}