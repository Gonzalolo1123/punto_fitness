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
                alert(`✅ ${data.admin.nombre} ${data.admin.apellido} es elegible para ser Super Admin.`);
            } else {
                console.log(`❌ [TRANSFERENCIA] Admin ${data.admin.nombre} ${data.admin.apellido} NO es elegible`);
                alert(`❌ ${data.admin.nombre} ${data.admin.apellido} NO es elegible para ser Super Admin.\n\nCriterios no cumplidos:\n- Debe ser admin actual\n- Debe tener actividad regular\n- No debe tener incidentes de seguridad`);
            }
        } else {
            console.log(`❌ [TRANSFERENCIA] Error en verificación: ${data.error}`);
            alert('Error al verificar elegibilidad: ' + data.error);
        }
    })
    .catch(error => {
        console.error('❌ [TRANSFERENCIA] Error en la petición:', error);
        alert('Error al verificar elegibilidad del administrador.');
    });
}

function enviarCodigoVerificacion() {
    console.log('🔄 [TRANSFERENCIA] Iniciando envío de código de verificación...');
    
    if (!window.adminSeleccionado) {
        console.log('❌ [TRANSFERENCIA] No hay admin seleccionado');
        alert('Debes seleccionar un administrador primero.');
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
            alert('✅ Código de verificación enviado al email del administrador seleccionado.');
            document.getElementById('enviar-codigo-btn').disabled = true;
            document.getElementById('enviar-codigo-btn').textContent = 'Código Enviado';
        } else {
            console.log(`❌ [TRANSFERENCIA] Error al enviar código: ${data.error}`);
            alert('Error al enviar código: ' + data.error);
        }
    })
    .catch(error => {
        console.error('❌ [TRANSFERENCIA] Error en envío de código:', error);
        alert('Error al enviar código de verificación.');
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
            alert('✅ Código de verificación enviado al email del superadmin actual.');
            document.getElementById('enviar-codigo-superadmin-actual-btn').disabled = true;
            document.getElementById('enviar-codigo-superadmin-actual-btn').textContent = 'Código Enviado';
        } else {
            console.log(`❌ [TRANSFERENCIA] Error al enviar código al superadmin actual: ${data.error}`);
            alert('Error al enviar código al superadmin actual: ' + data.error);
        }
    })
    .catch(error => {
        console.error('❌ [TRANSFERENCIA] Error en envío de código al superadmin actual:', error);
        alert('Error al enviar código de verificación al superadmin actual.');
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
        alert('Debes ingresar tu contraseña de Super Admin.');
        return;
    }
    
    if (!codigo) {
        console.log('❌ [TRANSFERENCIA] Falta código de verificación');
        alert('Debes ingresar el código de verificación.');
        return;
    }
    
    if (!codigoSuperadminActual) {
        console.log('❌ [TRANSFERENCIA] Falta código de verificación del superadmin actual');
        alert('Debes ingresar el código de verificación del superadmin actual.');
        return;
    }
    
    if (confirmacion !== 'TRANSFERIR') {
        console.log('❌ [TRANSFERENCIA] Confirmación incorrecta');
        alert('Debes escribir exactamente "TRANSFERIR" para confirmar.');
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
            alert('✅ Transferencia de Super Admin completada exitosamente.\n\nEl sistema se cerrará automáticamente.');
            // Cerrar sesión y redirigir
            setTimeout(() => {
                console.log('🔄 [TRANSFERENCIA] Redirigiendo a logout...');
                window.location.href = '/logout/';
            }, 3000);
        } else {
            console.log(`❌ [TRANSFERENCIA] Error en transferencia: ${data.error}`);
            alert('Error en la transferencia: ' + data.error);
        }
    })
    .catch(error => {
        console.error('❌ [TRANSFERENCIA] Error durante la transferencia:', error);
        alert('Error durante la transferencia de Super Admin.');
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
