const BASE_URL = '/super_admin/';  // Actualiza la URL base

document.addEventListener('DOMContentLoaded', function () {
    inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return '';
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
                mostrarExitoValidacion('Rol de administrador otorgado con éxito.', '¡Rol Otorgado!');
            } else {
                mostrarErroresValidacion([result.error], 'Error al Otorgar Rol');
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            mostrarErroresValidacion(['Ocurrió un error al intentar cambiar el rol.'], 'Error de Conexión');
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
        // Agregar validaciones en tiempo real a los campos
        const adminId = form.dataset.id;
        
        // Validación en tiempo real para nombre
        const nombreField = form.querySelector(`[name="admin-nombre-editar-${adminId}"]`) || document.getElementById(`admin-nombre-editar-${adminId}`);
        if (nombreField) {
            nombreField.addEventListener('blur', function() {
                const errores = validarNombre(this.value, 'nombre', 3, 30, false);
                mostrarErroresCampo(this, errores);
            });
            
            nombreField.addEventListener('input', function() {
                limpiarErroresCampo(this);
            });
        }
        
        // Validación en tiempo real para apellido
        const apellidoField = form.querySelector(`[name="admin-apellido-editar-${adminId}"]`) || document.getElementById(`admin-apellido-editar-${adminId}`);
        if (apellidoField) {
            apellidoField.addEventListener('blur', function() {
                const errores = validarNombre(this.value, 'apellido', 3, 30, false);
                mostrarErroresCampo(this, errores);
            });
            
            apellidoField.addEventListener('input', function() {
                limpiarErroresCampo(this);
            });
        }
        
        // Validación en tiempo real para correo
        const correoField = form.querySelector(`[name="admin-correo-editar-${adminId}"]`) || document.getElementById(`admin-correo-editar-${adminId}`);
        if (correoField) {
            correoField.addEventListener('blur', function() {
                const errores = validarEmail(this.value, 'correo electrónico', 100, true);
                mostrarErroresCampo(this, errores);
            });
            
            correoField.addEventListener('input', function() {
                limpiarErroresCampo(this);
            });
        }
        
        // Validación en tiempo real para teléfono
        const telefonoField = form.querySelector(`[name="admin-telefono-editar-${adminId}"]`) || document.getElementById(`admin-telefono-editar-${adminId}`);
        if (telefonoField) {
            telefonoField.addEventListener('blur', function() {
                const errores = validarTelefonoChileno(this.value, 'teléfono', true);
                mostrarErroresCampo(this, errores);
            });
            
            telefonoField.addEventListener('input', function() {
                limpiarErroresCampo(this);
            });
        }
        
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const adminId = this.dataset.id;
            
            if (!adminId || adminId === '') {
                mostrarErroresValidacion(['No se pudo obtener el ID del administrador. Por favor, recarga la página.'], 'Error del Sistema');
                return;
            }
            
            // Verificar que todos los campos existen antes de obtener sus valores
            const nombreField = this.querySelector(`[name="admin-nombre-editar-${adminId}"]`);
            const apellidoField = this.querySelector(`[name="admin-apellido-editar-${adminId}"]`);
            const correoField = this.querySelector(`[name="admin-correo-editar-${adminId}"]`);
            const telefonoField = this.querySelector(`[name="admin-telefono-editar-${adminId}"]`);
            
            // Estrategia alternativa: buscar por ID en lugar de por nombre
            const nombreFieldById = document.getElementById(`admin-nombre-editar-${adminId}`);
            const apellidoFieldById = document.getElementById(`admin-apellido-editar-${adminId}`);
            const correoFieldById = document.getElementById(`admin-correo-editar-${adminId}`);
            const telefonoFieldById = document.getElementById(`admin-telefono-editar-${adminId}`);
            
            // Usar los campos encontrados por ID si los de nombre no funcionan
            const finalNombreField = nombreField || nombreFieldById;
            const finalApellidoField = apellidoField || apellidoFieldById;
            const finalCorreoField = correoField || correoFieldById;
            const finalTelefonoField = telefonoField || telefonoFieldById;
            
            if (!finalNombreField || !finalApellidoField || !finalCorreoField || !finalTelefonoField) {
                mostrarErroresValidacion(['No se pudieron encontrar todos los campos del formulario. Por favor, recarga la página.'], 'Error del Sistema');
                return;
            }
            
            // Aplicar validaciones usando las funciones de validaciones.js
            const validaciones = [
                () => validarNombre(finalNombreField.value, 'nombre', 3, 30, false),
                () => validarNombre(finalApellidoField.value, 'apellido', 3, 30, false),
                () => validarEmail(finalCorreoField.value, 'correo electrónico', 100, true),
                () => validarTelefonoChileno(finalTelefonoField.value, 'teléfono', true)
            ];
            
            // Validar el formulario completo
            if (!validarFormulario(validaciones, 'Errores en el Formulario de Administrador')) {
                return; // Detener el envío si hay errores
            }
            
            // Obtener el nivel de acceso actual de la fila de la tabla
            const filaTabla = document.querySelector(`tr[data-id="${adminId}"]`);
            const nivelAccesoActual = filaTabla ? filaTabla.cells[4].textContent.trim() : 'admin';
            
            const formData = {
                nombre: finalNombreField.value.trim(),
                apellido: finalApellidoField.value.trim(),
                correo: finalCorreoField.value.trim(),
                telefono: finalTelefonoField.value.trim(),
                nivel_acceso: nivelAccesoActual
            };

            actualizarAdmin(adminId, formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    actualizarVista(data);
                    cerrarModalEdicion('admin', adminId);
                    mostrarExitoValidacion('Administrador actualizado correctamente', '¡Actualización Exitosa!');
                })
                .catch(error => {
                    console.error('Error:', error);
                    mostrarErroresValidacion([error.message], 'Error al Actualizar Administrador');
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
                        mostrarErroresValidacion([error.message], 'Error al Eliminar Administrador');
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
                mostrarErroresValidacion(['Por favor, selecciona un establecimiento antes de continuar.'], 'Establecimiento Requerido');
                return;
            }

            mostrarModalConfirmacion(`¿Estás seguro de que quieres hacer a este cliente (ID: ${clienteId}) administrador?`, function() {
                otorgarRolAdmin(clienteId, establecimientoId);
            });
        });
    });

    // MODALES DE ESTABLECIMIENTOS

    // Abrir modal de agregar establecimiento
    const btnAbrirEst = document.getElementById('abrir-form-establecimiento');
    const modalFondoEst = document.getElementById('modal-fondo-establecimiento');
    if (btnAbrirEst && modalFondoEst) {
        btnAbrirEst.addEventListener('click', function() {
            modalFondoEst.style.display = 'flex';
            btnAbrirEst.setAttribute('data-estado', 'abierto');
            btnAbrirEst.textContent = '-';
        });
        // Cerrar modal al hacer click fuera del formulario
        modalFondoEst.addEventListener('click', function(event) {
            if (event.target === modalFondoEst) {
                modalFondoEst.style.display = 'none';
                btnAbrirEst.setAttribute('data-estado', 'cerrado');
                btnAbrirEst.textContent = '+';
            }
        });
    }

    // Cerrar modal con botón cancelar
    const btnCancelarEst = document.querySelector('#modal-form-establecimiento .btn-cancelar');
    if (btnCancelarEst && modalFondoEst) {
        btnCancelarEst.addEventListener('click', function() {
            modalFondoEst.style.display = 'none';
            btnAbrirEst.setAttribute('data-estado', 'cerrado');
            btnAbrirEst.textContent = '+';
        });
    }

    // Abrir modal de edición de establecimiento
    document.querySelectorAll('[name="btn-editar-establecimiento"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            
            // Rellenar el formulario con los datos de la fila
            const fila = this.closest('tr');
            if (fila) {
                document.getElementById('establecimiento-id-editar').value = id;
                document.getElementById('establecimiento-nombre-editar').value = fila.children[0].textContent;
                document.getElementById('establecimiento-direccion-editar').value = fila.children[1].textContent;
                document.getElementById('establecimiento-telefono-editar').value = fila.children[2].textContent;
                document.getElementById('establecimiento-email-editar').value = fila.children[3].textContent;
                // Formatear horarios para inputs de tipo time (HH:MM)
                const horarioApertura = fila.children[4].textContent.trim();
                const horarioCierre = fila.children[5].textContent.trim();
                
                // Convertir formato HH:MM:SS a HH:MM si es necesario
                const formatearHora = (hora) => {
                    if (hora && hora.includes(':')) {
                        const partes = hora.split(':');
                        return `${partes[0]}:${partes[1]}`;
                    }
                    return hora;
                };
                
                document.getElementById('establecimiento-horario_apertura-editar').value = formatearHora(horarioApertura);
                document.getElementById('establecimiento-horario_cierre-editar').value = formatearHora(horarioCierre);
                // Seleccionar proveedor
                const proveedorNombre = fila.children[6].textContent;
                const selectProveedor = document.getElementById('establecimiento-proveedor-editar');
                if (selectProveedor) {
                    for (let opt of selectProveedor.options) {
                        if (opt.textContent === proveedorNombre) {
                            opt.selected = true;
                            break;
                        }
                    }
                }
            }
            
            // Abrir el modal usando la función estándar
            abrirModal('editar-establecimiento');
        });
    });

    // SUBMIT EDITAR ESTABLECIMIENTO
    const formEditarEst = document.getElementById('form-editar-establecimiento');
    if (formEditarEst) {
        formEditarEst.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('establecimiento-id-editar').value;
            const formData = {
                nombre: formEditarEst['establecimiento-nombre'].value.trim(),
                direccion: formEditarEst['establecimiento-direccion'].value.trim(),
                telefono: formEditarEst['establecimiento-telefono'].value.trim(),
                email: formEditarEst['establecimiento-email'].value.trim(),
                horario_apertura: formEditarEst['establecimiento-horario_apertura'].value.trim(),
                horario_cierre: formEditarEst['establecimiento-horario_cierre'].value.trim(),
                proveedor: formEditarEst['establecimiento-proveedor'].value
            };
            // Para validación, proveedor_id = proveedor
            console.log('🔍 [EDITAR] Validando formulario antes de enviar...');
            const errores = validarFormularioEstablecimiento({...formData, proveedor_id: formData.proveedor});
            console.log('🔍 [EDITAR] Resultado de validación:', errores);
            if (errores.length > 0) {
                console.log('❌ [EDITAR] Errores encontrados, mostrando alerta...');
                mostrarErroresValidacion(errores, 'Errores en el formulario de establecimiento');
                return;
            }
            console.log('✅ [EDITAR] Validación exitosa, procediendo a actualizar establecimiento...');
            actualizarEstablecimiento(id, formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    mostrarExitoValidacion('Establecimiento actualizado exitosamente', '¡Actualización Exitosa!');
                    actualizarFilaEstablecimiento(id, data.data);
                    cerrarModal('editar-establecimiento');
                })
                .catch(error => {
                    console.error('Error:', error);
                    mostrarErroresValidacion([error.message], 'Error al Actualizar Establecimiento');
                });
        });
    }

    // ELIMINAR ESTABLECIMIENTO
    document.querySelectorAll('[name="btn-eliminar-establecimiento"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            mostrarModalConfirmacion('¿Está seguro de que desea eliminar este establecimiento?', function() {
                eliminarEstablecimiento(id)
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        mostrarExitoValidacion('Establecimiento eliminado exitosamente', '¡Eliminación Exitosa!');
                        eliminarFilaEstablecimiento(id);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        mostrarErroresValidacion([error.message], 'Error al Eliminar Establecimiento');
                    });
            });
        });
    });

    // (Opcional) Cerrar modales con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalFondoEst = document.getElementById('modal-fondo-establecimiento');
            const modalFondoEditarEst = document.getElementById('modal-fondo-editar-establecimiento');
            const btnAbrirEst = document.getElementById('abrir-form-establecimiento');
            
            if (modalFondoEst && modalFondoEst.style.display === 'flex') {
                modalFondoEst.style.display = 'none';
                if (btnAbrirEst) {
                    btnAbrirEst.setAttribute('data-estado', 'cerrado');
                    btnAbrirEst.textContent = '+';
                }
            }
            if (modalFondoEditarEst && modalFondoEditarEst.style.display === 'flex') {
                modalFondoEditarEst.style.display = 'none';
            }
        }
    });

    // CREAR ESTABLECIMIENTO
    const formCrearEst = document.getElementById('form-crear-establecimiento');
    if (formCrearEst) {
        formCrearEst.addEventListener('submit', function(e) {
            e.preventDefault();
            const modalFondoEst = document.getElementById('modal-fondo-establecimiento');
            const btnAbrirEst = document.getElementById('abrir-form-establecimiento');
            // Recolectar datos
            const formData = {
                nombre: formCrearEst['establecimiento-nombre'].value.trim(),
                direccion: formCrearEst['establecimiento-direccion'].value.trim(),
                telefono: formCrearEst['establecimiento-telefono'].value.trim(),
                email: formCrearEst['establecimiento-email'].value.trim(),
                horario_apertura: formCrearEst['establecimiento-horario_apertura'].value.trim(),
                horario_cierre: formCrearEst['establecimiento-horario_cierre'].value.trim(),
                proveedor_id: formCrearEst['establecimiento-proveedor'].value
            };
            console.log('🔍 [CREAR] Validando formulario antes de enviar...');
            const errores = validarFormularioEstablecimiento(formData);
            console.log('🔍 [CREAR] Resultado de validación:', errores);
            if (errores.length > 0) {
                console.log('❌ [CREAR] Errores encontrados, mostrando alerta...');
                mostrarErroresValidacion(errores, 'Errores en el formulario de establecimiento');
                return;
            }
            console.log('✅ [CREAR] Validación exitosa, procediendo a crear establecimiento...');
            crearEstablecimiento(formData)
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    mostrarExitoValidacion('Establecimiento creado exitosamente', '¡Creación Exitosa!');
                    agregarFilaEstablecimiento(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    mostrarErroresValidacion([error.message], 'Error al Crear Establecimiento');
                })
                .finally(() => {
                    modalFondoEst.style.display = 'none';
                    btnAbrirEst.setAttribute('data-estado', 'cerrado');
                    btnAbrirEst.textContent = '+';
                });
        });
    }
}

// Funciones para transferencia de Super Admin
function cargarAdminsParaTransferir() {
    console.log('🔄 [TRANSFERENCIA] Iniciando carga de administradores para transferir...');
    
    // Obtener solo los admins (no superadmins) de la tabla
    const admins = [];
    document.querySelectorAll('tr[data-id]').forEach(row => {
        const nivelAcceso = row.cells[4].textContent.trim();
        console.log(`📋 [TRANSFERENCIA] Revisando fila con nivel: ${nivelAcceso}`);
        
        if (nivelAcceso === 'admin') {
            const adminId = row.getAttribute('data-id');
            const nombre = row.cells[0].textContent;
            const apellido = row.cells[1].textContent;
            const email = row.cells[2].textContent;
            const telefono = row.cells[3].textContent;
            
            console.log(`✅ [TRANSFERENCIA] Admin encontrado: ${nombre} ${apellido} (ID: ${adminId})`);
            
            admins.push({
                id: adminId,
                nombre: nombre,
                apellido: apellido,
                email: email,
                telefono: telefono
            });
        }
    });
    
    console.log(`📊 [TRANSFERENCIA] Total de admins encontrados: ${admins.length}`);
    console.log('📋 [TRANSFERENCIA] Lista de admins:', admins);
    
    return admins;
}

function mostrarAdminsParaTransferir() {
    console.log('🔄 [TRANSFERENCIA] Mostrando lista de administradores...');
    
    const admins = cargarAdminsParaTransferir();
    const container = document.getElementById('admins-lista-transferir');
    
    console.log(`📋 [TRANSFERENCIA] Container encontrado:`, container);
    
    if (admins.length === 0) {
        console.log('⚠️ [TRANSFERENCIA] No hay administradores disponibles');
        container.innerHTML = '<p class="no-admins">No hay administradores disponibles para transferir el rol de Super Admin.</p>';
        return;
    }
    
    console.log('🔄 [TRANSFERENCIA] Generando HTML para lista de admins...');
    
    let html = '';
    admins.forEach(admin => {
        html += `
            <div class="admin-item" data-admin-id="${admin.id}">
                <div class="admin-info">
                    <strong>${admin.nombre} ${admin.apellido}</strong>
                    <span class="admin-email">${admin.email}</span>
                    <span class="admin-telefono">${admin.telefono}</span>
                </div>
                <div class="admin-acciones">
                    <button class="filtro-btn btn-seleccionar-admin" data-admin-id="${admin.id}">Seleccionar</button>
                    <button class="filtro-btn btn-verificar-elegibilidad" data-admin-id="${admin.id}">Verificar Elegibilidad</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('✅ [TRANSFERENCIA] HTML generado y aplicado al container');
    
    // Agregar event listeners a los botones
    console.log('🔄 [TRANSFERENCIA] Configurando event listeners...');
    
    document.querySelectorAll('.btn-seleccionar-admin').forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            console.log(`🔄 [TRANSFERENCIA] Botón seleccionar clickeado para admin ID: ${adminId}`);
            seleccionarAdminParaTransferir(adminId);
        });
    });
    
    document.querySelectorAll('.btn-verificar-elegibilidad').forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            console.log(`🔄 [TRANSFERENCIA] Botón verificar elegibilidad clickeado para admin ID: ${adminId}`);
            verificarElegibilidadAdmin(adminId);
        });
    });
    
    console.log('✅ [TRANSFERENCIA] Event listeners configurados correctamente');
}

// Funciones auxiliares para validaciones en tiempo real
function mostrarErroresCampo(campo, errores) {
    if (errores.length === 0) {
        limpiarErroresCampo(campo);
        return;
    }
    
    // Limpiar errores anteriores
    limpiarErroresCampo(campo);
    
    // Agregar clase de error al campo
    campo.classList.add('error');
    
    // Crear elemento de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje';
    errorDiv.style.color = '#d33';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = errores[0]; // Mostrar solo el primer error
    
    // Insertar después del campo
    campo.parentNode.appendChild(errorDiv);
}

function limpiarErroresCampo(campo) {
    // Remover clase de error
    campo.classList.remove('error');
    
    // Remover mensajes de error existentes
    const errorMensajes = campo.parentNode.querySelectorAll('.error-mensaje');
    errorMensajes.forEach(mensaje => mensaje.remove());
}

function seleccionarAdminParaTransferir(adminId) {
    console.log(`🔄 [TRANSFERENCIA] Seleccionando admin para transferir. ID: ${adminId}`);
    
    // Ocultar la lista y mostrar el formulario
    document.getElementById('admins-lista-transferir').style.display = 'none';
    document.getElementById('form-transferir-superadmin').style.display = 'block';
    
    console.log('✅ [TRANSFERENCIA] Vista cambiada: lista oculta, formulario mostrado');
    
    // Guardar el admin seleccionado
    window.adminSeleccionado = adminId;
    console.log(`💾 [TRANSFERENCIA] Admin seleccionado guardado en window.adminSeleccionado: ${adminId}`);
    
    // Mostrar información del admin seleccionado
    const adminItem = document.querySelector(`[data-admin-id="${adminId}"]`);
    const adminInfo = adminItem.querySelector('.admin-info');
    const adminName = adminInfo.querySelector('strong').textContent;
    
    console.log(`📋 [TRANSFERENCIA] Información del admin seleccionado: ${adminName}`);
    
    const formContainer = document.getElementById('form-transferir-superadmin');
    const infoDiv = document.createElement('div');
    infoDiv.className = 'admin-seleccionado-info';
    infoDiv.innerHTML = `
        <div style="background-color: #e3f2fd; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
            <strong>Administrador seleccionado:</strong> ${adminName}
        </div>
    `;
    formContainer.insertBefore(infoDiv, formContainer.firstChild);
    
    console.log('✅ [TRANSFERENCIA] Información del admin agregada al formulario');
}

function verificarElegibilidadAdmin(adminId) {
    console.log(`🔄 [TRANSFERENCIA] Verificando elegibilidad del admin ID: ${adminId}`);
    
    fetch(`${BASE_URL}verificar_elegibilidad/${adminId}/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCSRFToken()
        }
    })
    .then(response => {
        console.log(`📡 [TRANSFERENCIA] Respuesta del servidor recibida:`, response);
        return response.json();
    })
    .then(data => {
        console.log(`📊 [TRANSFERENCIA] Datos de elegibilidad recibidos:`, data);
        
        if (data.success) {
            if (data.elegible) {
                console.log(`✅ [TRANSFERENCIA] Admin ${data.admin.nombre} ${data.admin.apellido} es elegible`);
                mostrarExitoValidacion(`${data.admin.nombre} ${data.admin.apellido} es elegible para ser Super Admin.`, '✅ Elegibilidad Confirmada');
            } else {
                console.log(`❌ [TRANSFERENCIA] Admin ${data.admin.nombre} ${data.admin.apellido} NO es elegible`);
                mostrarErroresValidacion([
                    `${data.admin.nombre} ${data.admin.apellido} NO es elegible para ser Super Admin.`,
                    '',
                    'Criterios no cumplidos:',
                    '• Debe ser admin actual',
                    '• Debe tener actividad regular', 
                    '• No debe tener incidentes de seguridad'
                ], '❌ No Elegible');
            }
        } else {
            console.log(`❌ [TRANSFERENCIA] Error en verificación: ${data.error}`);
            mostrarErroresValidacion([data.error], 'Error al Verificar Elegibilidad');
        }
    })
            .catch(error => {
            console.error('❌ [TRANSFERENCIA] Error en la petición:', error);
            mostrarErroresValidacion(['Error al verificar elegibilidad del administrador.'], 'Error de Conexión');
        });
}

function enviarCodigoVerificacion() {
    console.log('🔄 [TRANSFERENCIA] Iniciando envío de código de verificación...');
    
    if (!window.adminSeleccionado) {
        console.log('❌ [TRANSFERENCIA] No hay admin seleccionado');
        mostrarErroresValidacion(['Debes seleccionar un administrador primero.'], 'Administrador Requerido');
        return;
    }
    
    console.log(`📋 [TRANSFERENCIA] Admin seleccionado para envío de código: ${window.adminSeleccionado}`);
    
    const requestData = {
        admin_id: window.adminSeleccionado
    };
    
    console.log('📤 [TRANSFERENCIA] Datos a enviar:', requestData);
    
    fetch(`${BASE_URL}enviar_codigo_verificacion/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log(`📡 [TRANSFERENCIA] Respuesta del servidor para envío de código:`, response);
        return response.json();
    })
    .then(data => {
        console.log(`📊 [TRANSFERENCIA] Respuesta del envío de código:`, data);
        
        if (data.success) {
            console.log('✅ [TRANSFERENCIA] Código enviado exitosamente');
            mostrarExitoValidacion('Código de verificación enviado al email del administrador seleccionado.', '✅ Código Enviado');
            document.getElementById('enviar-codigo-btn').disabled = true;
            document.getElementById('enviar-codigo-btn').textContent = 'Código Enviado';
        } else {
            console.log(`❌ [TRANSFERENCIA] Error al enviar código: ${data.error}`);
            mostrarErroresValidacion([data.error], 'Error al Enviar Código');
        }
    })
            .catch(error => {
            console.error('❌ [TRANSFERENCIA] Error en envío de código:', error);
            mostrarErroresValidacion(['Error al enviar código de verificación.'], 'Error de Conexión');
        });
}

function enviarCodigoVerificacionSuperadminActual() {
    console.log('🔄 [TRANSFERENCIA] Iniciando envío de código de verificación al superadmin actual...');
    
    fetch(`${BASE_URL}enviar_codigo_verificacion_actual/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({})
    })
    .then(response => {
        console.log(`📡 [TRANSFERENCIA] Respuesta del servidor para envío de código al superadmin actual:`, response);
        return response.json();
    })
    .then(data => {
        console.log(`📊 [TRANSFERENCIA] Respuesta del envío de código al superadmin actual:`, data);
        
        if (data.success) {
            console.log('✅ [TRANSFERENCIA] Código enviado al superadmin actual exitosamente');
            mostrarExitoValidacion('Código de verificación enviado al email del superadmin actual.', '✅ Código Enviado');
            document.getElementById('enviar-codigo-superadmin-actual-btn').disabled = true;
            document.getElementById('enviar-codigo-superadmin-actual-btn').textContent = 'Código Enviado';
        } else {
            console.log(`❌ [TRANSFERENCIA] Error al enviar código al superadmin actual: ${data.error}`);
            mostrarErroresValidacion([data.error], 'Error al Enviar Código');
        }
    })
            .catch(error => {
            console.error('❌ [TRANSFERENCIA] Error en envío de código al superadmin actual:', error);
            mostrarErroresValidacion(['Error al enviar código de verificación al superadmin actual.'], 'Error de Conexión');
        });
}

function transferirSuperAdmin() {
    console.log('🔄 [TRANSFERENCIA] Iniciando proceso de transferencia de Super Admin...');
    
    const password = document.getElementById('password-superadmin').value;
    const codigo = document.getElementById('codigo-verificacion').value;
    const codigoSuperadminActual = document.getElementById('codigo-superadmin-actual').value;  // Nuevo campo
    const confirmacion = document.getElementById('confirmacion-final').value;
    
    console.log('📋 [TRANSFERENCIA] Datos del formulario:');
    console.log('- Password ingresada:', password ? 'SÍ' : 'NO');
    console.log('- Código ingresado:', codigo ? 'SÍ' : 'NO');
    console.log('- Código superadmin actual:', codigoSuperadminActual ? 'SÍ' : 'NO');  // Nuevo campo
    console.log('- Confirmación:', confirmacion);
    console.log('- Admin seleccionado:', window.adminSeleccionado);
    
    if (!password) {
        console.log('❌ [TRANSFERENCIA] Falta contraseña');
        mostrarErroresValidacion(['Debes ingresar tu contraseña de Super Admin.'], 'Contraseña Requerida');
        return;
    }
    
    if (!codigo) {
        console.log('❌ [TRANSFERENCIA] Falta código de verificación');
        mostrarErroresValidacion(['Debes ingresar el código de verificación.'], 'Código Requerido');
        return;
    }
    
    if (!codigoSuperadminActual) {
        console.log('❌ [TRANSFERENCIA] Falta código de verificación del superadmin actual');
        mostrarErroresValidacion(['Debes ingresar el código de verificación del superadmin actual.'], 'Código Requerido');
        return;
    }
    
    if (confirmacion !== 'TRANSFERIR') {
        console.log('❌ [TRANSFERENCIA] Confirmación incorrecta');
        mostrarErroresValidacion(['Debes escribir exactamente "TRANSFERIR" para confirmar.'], 'Confirmación Incorrecta');
        return;
    }
    
    console.log('✅ [TRANSFERENCIA] Validaciones del formulario pasadas');
    
    // Confirmación final
    const confirmacionFinal = confirm(
        '⚠️ ADVERTENCIA FINAL ⚠️\n\n' +
        'Estás a punto de transferir el control total del sistema.\n' +
        'Esta acción es IRREVERSIBLE.\n\n' +
        '¿Estás completamente seguro de que quieres proceder?'
    );
    
    if (!confirmacionFinal) {
        console.log('❌ [TRANSFERENCIA] Usuario canceló la confirmación final');
        return;
    }
    
    console.log('✅ [TRANSFERENCIA] Confirmación final aceptada, enviando petición...');
    
    const requestData = {
        admin_id: window.adminSeleccionado,
        password_superadmin: password,
        codigo_verificacion: codigo,
        codigo_superadmin_actual: codigoSuperadminActual  // Nuevo campo
    };
    
    console.log('📤 [TRANSFERENCIA] Datos de transferencia a enviar:', {
        admin_id: requestData.admin_id,
        password_superadmin: '***OCULTA***',
        codigo_verificacion: requestData.codigo_verificacion,
        codigo_superadmin_actual: requestData.codigo_superadmin_actual
    });
    
    fetch(`${BASE_URL}transferir_superadmin/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log(`📡 [TRANSFERENCIA] Respuesta del servidor para transferencia:`, response);
        return response.json();
    })
    .then(data => {
        console.log(`📊 [TRANSFERENCIA] Respuesta de transferencia:`, data);
        
        if (data.success) {
            console.log('✅ [TRANSFERENCIA] Transferencia completada exitosamente');
            Swal.fire({
                title: '✅ Transferencia Completada',
                text: 'Transferencia de Super Admin completada exitosamente. El sistema se cerrará automáticamente.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'Entendido'
            }).then(() => {
                // Cerrar sesión y redirigir
                console.log('🔄 [TRANSFERENCIA] Redirigiendo a logout...');
                window.location.href = '/logout/';
            });
        } else {
            console.log(`❌ [TRANSFERENCIA] Error en transferencia: ${data.error}`);
            mostrarErroresValidacion([data.error], 'Error en la Transferencia');
        }
    })
            .catch(error => {
            console.error('❌ [TRANSFERENCIA] Error durante la transferencia:', error);
            mostrarErroresValidacion(['Error durante la transferencia de Super Admin.'], 'Error de Conexión');
        });
}

// Agregar event listeners para transferencia de superadmin
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 [TRANSFERENCIA] Configurando event listeners para transferencia de superadmin...');
    
    // Event listener para el botón de transferir superadmin
    const btnTransferirSuperadmin = document.getElementById('transferir-superadmin-btn');
    if (btnTransferirSuperadmin) {
        console.log('✅ [TRANSFERENCIA] Botón transferir superadmin encontrado');
        btnTransferirSuperadmin.addEventListener('click', function() {
            console.log('🔄 [TRANSFERENCIA] Botón transferir superadmin clickeado');
            abrirModal('transferir-superadmin');
            mostrarAdminsParaTransferir();
        });
    } else {
        console.log('❌ [TRANSFERENCIA] Botón transferir superadmin NO encontrado');
    }
    
    // Event listener para enviar código de verificación
    const btnEnviarCodigo = document.getElementById('enviar-codigo-btn');
    if (btnEnviarCodigo) {
        console.log('✅ [TRANSFERENCIA] Botón enviar código encontrado');
        btnEnviarCodigo.addEventListener('click', enviarCodigoVerificacion);
    } else {
        console.log('❌ [TRANSFERENCIA] Botón enviar código NO encontrado');
    }
    
    // Event listener para enviar código de verificación al superadmin actual
    const btnEnviarCodigoSuperadminActual = document.getElementById('enviar-codigo-superadmin-actual-btn');
    if (btnEnviarCodigoSuperadminActual) {
        console.log('✅ [TRANSFERENCIA] Botón enviar código superadmin actual encontrado');
        btnEnviarCodigoSuperadminActual.addEventListener('click', enviarCodigoVerificacionSuperadminActual);
    } else {
        console.log('❌ [TRANSFERENCIA] Botón enviar código superadmin actual NO encontrado');
    }
    
    // Event listener para confirmar transferencia
    const btnConfirmarTransferir = document.getElementById('confirmar-transferir-superadmin');
    if (btnConfirmarTransferir) {
        console.log('✅ [TRANSFERENCIA] Botón confirmar transferencia encontrado');
        btnConfirmarTransferir.addEventListener('click', transferirSuperAdmin);
    } else {
        console.log('❌ [TRANSFERENCIA] Botón confirmar transferencia NO encontrado');
    }
    
    console.log('✅ [TRANSFERENCIA] Event listeners para transferencia configurados');
});

// Función para crear establecimiento
function crearEstablecimiento(formData) {
    return fetch(`${BASE_URL}crear_establecimiento/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(formData),
    })
        .then(res => res.json());
}

// Función para actualizar establecimiento
function actualizarEstablecimiento(id, formData) {
    return fetch(`${BASE_URL}actualizar_establecimiento/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(formData),
    })
        .then(res => res.json());
}

// Función para eliminar establecimiento
function eliminarEstablecimiento(id) {
    return fetch(`${BASE_URL}borrar_establecimiento/${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
    })
        .then(res => res.json());
}

// Función para actualizar fila de establecimiento en la tabla
function actualizarFilaEstablecimiento(id, data) {
    const fila = document.querySelector(`tr[data-id="${id}"]`);
    if (fila) {
        const cells = fila.cells;
        cells[0].textContent = data.nombre || '';
        cells[1].textContent = data.direccion || '';
        cells[2].textContent = data.telefono || '';
        cells[3].textContent = data.email || '';
        cells[4].textContent = formatearHoraParaMostrar(data.horario_apertura);
        cells[5].textContent = formatearHoraParaMostrar(data.horario_cierre);
        cells[6].textContent = data.proveedor__nombre || '';
    }
}

// Función para eliminar fila de establecimiento de la tabla
function eliminarFilaEstablecimiento(id) {
    const fila = document.querySelector(`tr[data-id="${id}"]`);
    if (fila) {
        fila.remove();
    }
}

// Función para agregar nueva fila de establecimiento a la tabla
function agregarFilaEstablecimiento(data) {
    const tbody = document.querySelector('section[name="seccion-establecimientos"] tbody');
    if (tbody) {
        const nuevaFila = document.createElement('tr');
        nuevaFila.setAttribute('data-id', data.id);
        nuevaFila.setAttribute('data-proveedor-id', data.proveedor_id);
        
        nuevaFila.innerHTML = `
            <td>${data.nombre || ''}</td>
            <td>${data.direccion || ''}</td>
            <td>${data.telefono || ''}</td>
            <td>${data.email || ''}</td>
            <td>${formatearHoraParaMostrar(data.horario_apertura)}</td>
            <td>${formatearHoraParaMostrar(data.horario_cierre)}</td>
            <td>${data.proveedor__nombre || ''}</td>
            <td>
                <div class="action-buttons-container">
                    <button class="filtro-btn" name="btn-editar-establecimiento" data-id="${data.id}">Actualizar</button>
                    <button class="filtro-btn" name="btn-eliminar-establecimiento" data-id="${data.id}">Eliminar</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(nuevaFila);
        
        // Agregar event listeners a los nuevos botones
        const btnEditar = nuevaFila.querySelector('[name="btn-editar-establecimiento"]');
        const btnEliminar = nuevaFila.querySelector('[name="btn-eliminar-establecimiento"]');
        
        if (btnEditar) {
            btnEditar.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const fila = this.closest('tr');
                if (fila) {
                    document.getElementById('establecimiento-id-editar').value = id;
                    document.getElementById('establecimiento-nombre-editar').value = fila.children[0].textContent;
                    document.getElementById('establecimiento-direccion-editar').value = fila.children[1].textContent;
                    document.getElementById('establecimiento-telefono-editar').value = fila.children[2].textContent;
                    document.getElementById('establecimiento-email-editar').value = fila.children[3].textContent;
                    
                    const horarioApertura = fila.children[4].textContent.trim();
                    const horarioCierre = fila.children[5].textContent.trim();
                    
                    const formatearHora = (hora) => {
                        if (hora && hora.includes(':')) {
                            const partes = hora.split(':');
                            return `${partes[0]}:${partes[1]}`;
                        }
                        return hora;
                    };
                    
                    document.getElementById('establecimiento-horario_apertura-editar').value = formatearHora(horarioApertura);
                    document.getElementById('establecimiento-horario_cierre-editar').value = formatearHora(horarioCierre);
                    
                    const proveedorNombre = fila.children[6].textContent;
                    const selectProveedor = document.getElementById('establecimiento-proveedor-editar');
                    if (selectProveedor) {
                        for (let opt of selectProveedor.options) {
                            if (opt.textContent === proveedorNombre) {
                                opt.selected = true;
                                break;
                            }
                        }
                    }
                }
                abrirModal('editar-establecimiento');
            });
        }
        
        if (btnEliminar) {
            btnEliminar.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                mostrarModalConfirmacion('¿Está seguro de que desea eliminar este establecimiento?', function() {
                    eliminarEstablecimiento(id)
                        .then(data => {
                            if (data.error) throw new Error(data.error);
                            mostrarExitoValidacion('Establecimiento eliminado exitosamente', '¡Eliminación Exitosa!');
                            eliminarFilaEstablecimiento(id);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            mostrarErroresValidacion([error.message], 'Error al Eliminar Establecimiento');
                        });
                });
            });
        }
    }
}

// Función para formatear hora para mostrar en la tabla
function formatearHoraParaMostrar(hora) {
    if (!hora) return '';
    if (typeof hora === 'string') {
        // Si ya es string, verificar si tiene formato HH:MM:SS
        if (hora.includes(':')) {
            const partes = hora.split(':');
            return `${partes[0]}:${partes[1]}`;
        }
        return hora;
    }
    // Si es un objeto Time, convertirlo a string
    return hora.toString().substring(0, 5);
}

// VALIDACIONES PARA FORMULARIO DE ESTABLECIMIENTO (SUPERADMIN)

function validarFormularioEstablecimiento({nombre, direccion, telefono, email, horario_apertura, horario_cierre, proveedor_id}) {
    console.log('🔍 [VALIDACIÓN] Iniciando validación de formulario de establecimiento');
    console.log('📋 [VALIDACIÓN] Datos recibidos:', {nombre, direccion, telefono, email, horario_apertura, horario_cierre, proveedor_id});
    
    let errores = [];
    
    const erroresNombre = validarNombre(nombre, 'nombre', 3, 30, false, false);
    console.log('🔍 [VALIDACIÓN] Errores en nombre:', erroresNombre);
    errores = errores.concat(erroresNombre);
    
    const erroresDireccion = validarDireccionChilena(direccion, 'dirección', 5, 100, false);
    console.log('🔍 [VALIDACIÓN] Errores en dirección:', erroresDireccion);
    errores = errores.concat(erroresDireccion);
    
    const erroresTelefono = validarTelefonoChileno(telefono, 'teléfono', true, false);
    console.log('🔍 [VALIDACIÓN] Errores en teléfono:', erroresTelefono);
    errores = errores.concat(erroresTelefono);
    
    const erroresEmail = validarEmail(email, 'correo electrónico', 100, true, false);
    console.log('🔍 [VALIDACIÓN] Errores en email:', erroresEmail);
    errores = errores.concat(erroresEmail);
    
    const erroresHorarioApertura = validarHorario(horario_apertura, 'horario de apertura', 6, 12, true, false);
    console.log('🔍 [VALIDACIÓN] Errores en horario apertura:', erroresHorarioApertura);
    errores = errores.concat(erroresHorarioApertura);
    
    const erroresHorarioCierre = validarHorario(horario_cierre, 'horario de cierre', 12, 23, true, false);
    console.log('🔍 [VALIDACIÓN] Errores en horario cierre:', erroresHorarioCierre);
    errores = errores.concat(erroresHorarioCierre);
    
    if (!proveedor_id) {
        console.log('🔍 [VALIDACIÓN] Error: No se seleccionó proveedor');
        errores.push('Debe seleccionar un proveedor');
    }
    
    console.log('🔍 [VALIDACIÓN] Total de errores encontrados:', errores.length);
    console.log('🔍 [VALIDACIÓN] Lista de errores:', errores);
    
    return errores;
}

