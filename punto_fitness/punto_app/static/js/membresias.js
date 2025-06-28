document.addEventListener('DOMContentLoaded', function() {
    inicializarModales();
    inicializarEventListeners();
    inicializarModalesClienteMembresia();
    inicializarEventListenersClienteMembresia();
});

// Funciones para manejar modales
function inicializarModales() {
    // Botón para abrir modal de creación
    const btnAbrirForm = document.getElementById('abrir-form-membresia');
    if (btnAbrirForm) {
        btnAbrirForm.addEventListener('click', function() {
            const estado = this.getAttribute('data-estado');
            if (estado === 'cerrado') {
                abrirModal('membresia', this);
            } else {
                cerrarModal('membresia', this);
            }
        });
    }

    // Event listeners para cerrar modales con click en fondo
    document.querySelectorAll('.modal-fondo').forEach(modalFondo => {
        modalFondo.addEventListener('click', function(event) {
            if (event.target === modalFondo) {
                const id_parts = modalFondo.id.split('-');
                if (id_parts.length > 2) {
                    const id_tipo = id_parts[2];
                    const id = id_parts[id_parts.length - 1];
                    cerrarModalEdicion(id_tipo, id);
                } else {
                    // Determinar qué tipo de modal cerrar basado en el ID
                    if (modalFondo.id === 'modal-fondo-membresia') {
                        cerrarModal('membresia');
                    } else if (modalFondo.id === 'modal-fondo-cliente-membresia') {
                        cerrarModal('cliente-membresia');
                    }
                }
            }
        });
    });
}

function inicializarEventListeners() {
    // Event listeners para botones de editar
    document.querySelectorAll('[name="btn-editar-membresia"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            abrirModalEdicion('membresia', id);
        });
    });

    // Event listeners para botones de eliminar
    document.querySelectorAll('[name="btn-eliminar-membresia"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta membresía?')) {
                eliminarMembresia(id);
            }
        });
    });

    // Event listener para formulario de creación
    const formCrear = document.getElementById('form-crear-membresia');
    if (formCrear) {
        formCrear.addEventListener('submit', function(e) {
            e.preventDefault();
            crearMembresia(this);
        });
    }

    // Event listeners para formularios de edición
    document.querySelectorAll('[name="form-editar-membresia"]').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            actualizarMembresia(id, this);
        });
    });
}

// Funciones para abrir/cerrar modales
function abrirModal(tipo, botonAbrir) {
    const modalFondo = document.getElementById(`modal-fondo-${tipo}`);
    if (modalFondo) {
        modalFondo.style.display = 'flex';
        botonAbrir.setAttribute('data-estado', 'abierto');
        botonAbrir.textContent = '-';
    }
}

function cerrarModal(tipo, botonAbrir = null) {
    const modalFondo = document.getElementById(`modal-fondo-${tipo}`);
    if (modalFondo) {
        modalFondo.style.display = 'none';
        if (botonAbrir) {
            botonAbrir.setAttribute('data-estado', 'cerrado');
            botonAbrir.textContent = '+';
        }
    }
}

function abrirModalEdicion(tipo, id) {
    const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}-${id}`);
    if (modalFondo) {
        modalFondo.style.display = 'flex';
    }
}

function cerrarModalEdicion(tipo, id) {
    const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}-${id}`);
    if (modalFondo) {
        modalFondo.style.display = 'none';
    }
}

// Funciones CRUD
async function crearMembresia(form) {
    try {
        const formData = new FormData(form);
        const data = {
            nombre: formData.get('membresia-nombre'),
            descripcion: formData.get('membresia-descripcion'),
            precio: formData.get('membresia-precio'),
            duracion: formData.get('membresia-duracion'),
            dias_por_semana: formData.get('membresia-dias-por-semana'),
            establecimiento_id: formData.get('membresia-establecimiento') || 1 // Por defecto el establecimiento 1 si no se especifica
        };

        const response = await fetch('/membresias/crear_membresia/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear la membresía');
        }
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        alert('Membresía creada exitosamente');
        cerrarModal('membresia');
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear la membresía: ' + error.message);
    }
}

async function actualizarMembresia(id, form) {
    try {
        const formData = new FormData(form);
        const data = {
            nombre: formData.get(`membresia-nombre-editar-${id}`),
            descripcion: formData.get(`membresia-descripcion-editar-${id}`),
            precio: formData.get(`membresia-precio-editar-${id}`),
            duracion: formData.get(`membresia-duracion-editar-${id}`),
            dias_por_semana: formData.get(`membresia-dias-por-semana-editar-${id}`),
            establecimiento_id: formData.get(`membresia-establecimiento-editar-${id}`)
        };

        const response = await fetch(`/membresias/actualizar_membresia/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar la membresía');
        }
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        alert('Membresía actualizada exitosamente');
        cerrarModalEdicion('membresia', id);
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la membresía: ' + error.message);
    }
}

async function eliminarMembresia(id) {
    try {
        const response = await fetch(`/membresias/borrar_membresia/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) throw new Error('Error al eliminar la membresía');
        
        alert('Membresía eliminada exitosamente');
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la membresía: ' + error.message);
    }
}

// Función auxiliar para obtener el token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Funciones para ClienteMembresia
function inicializarModalesClienteMembresia() {
    console.log('Inicializando modales de ClienteMembresia...');
    // Botón para abrir modal de creación de cliente membresía
    const btnAbrirFormClienteMembresia = document.getElementById('abrir-form-cliente-membresia');
    console.log('Botón abrir ClienteMembresia:', btnAbrirFormClienteMembresia);
    if (btnAbrirFormClienteMembresia) {
        btnAbrirFormClienteMembresia.addEventListener('click', function() {
            console.log('Botón ClienteMembresia clickeado');
            const estado = this.getAttribute('data-estado');
            if (estado === 'cerrado') {
                abrirModal('cliente-membresia', this);
            } else {
                cerrarModal('cliente-membresia', this);
            }
        });
    }
}

function inicializarEventListenersClienteMembresia() {
    console.log('Inicializando event listeners de ClienteMembresia...');
    // Event listeners para botones de editar cliente membresía
    const botonesEditar = document.querySelectorAll('[name="btn-editar-cliente-membresia"]');
    console.log('Botones editar ClienteMembresia encontrados:', botonesEditar.length);
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Botón editar ClienteMembresia clickeado');
            const id = this.getAttribute('data-id');
            abrirModalEdicion('cliente-membresia', id);
        });
    });

    // Event listeners para botones de eliminar cliente membresía
    const botonesEliminar = document.querySelectorAll('[name="btn-eliminar-cliente-membresia"]');
    console.log('Botones eliminar ClienteMembresia encontrados:', botonesEliminar.length);
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Botón eliminar ClienteMembresia clickeado');
            const id = this.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta membresía de cliente?')) {
                eliminarClienteMembresia(id);
            }
        });
    });

    // Event listener para formulario de creación de cliente membresía
    const formCrearClienteMembresia = document.getElementById('form-crear-cliente-membresia');
    console.log('Formulario crear ClienteMembresia:', formCrearClienteMembresia);
    if (formCrearClienteMembresia) {
        formCrearClienteMembresia.addEventListener('submit', function(e) {
            console.log('Formulario ClienteMembresia enviado');
            e.preventDefault();
            crearClienteMembresia(this);
        });
    }

    // Event listeners para formularios de edición de cliente membresía
    const formulariosEditar = document.querySelectorAll('[name="form-editar-cliente-membresia"]');
    console.log('Formularios editar ClienteMembresia encontrados:', formulariosEditar.length);
    formulariosEditar.forEach(form => {
        form.addEventListener('submit', function(e) {
            console.log('Formulario editar ClienteMembresia enviado');
            e.preventDefault();
            const id = this.getAttribute('data-id');
            actualizarClienteMembresia(id, this);
        });
    });
}

// Funciones CRUD para ClienteMembresia
async function crearClienteMembresia(form) {
    console.log('Iniciando creación de ClienteMembresia...');
    try {
        const formData = new FormData(form);
        const data = {
            usuario_id: formData.get('cliente-membresia-usuario'),
            membresia_id: formData.get('cliente-membresia-membresia'),
            fecha_inicio: formData.get('cliente-membresia-fecha-inicio'),
            fecha_fin: formData.get('cliente-membresia-fecha-fin'),
            estado: formData.get('cliente-membresia-estado') === 'True',
            codigo_qr: formData.get('cliente-membresia-codigo-qr')
        };
        
        console.log('Datos a enviar:', data);

        const response = await fetch('/membresias/crear_cliente_membresia/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        console.log('Respuesta del servidor:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear la membresía de cliente');
        }
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        console.log('ClienteMembresia creada exitosamente:', result);
        alert('Membresía de cliente creada exitosamente');
        cerrarModal('cliente-membresia');
        window.location.reload();
    } catch (error) {
        console.error('Error al crear ClienteMembresia:', error);
        alert('Error al crear la membresía de cliente: ' + error.message);
    }
}

async function actualizarClienteMembresia(id, form) {
    try {
        const formData = new FormData(form);
        const data = {
            usuario_id: formData.get(`cliente-membresia-usuario-editar-${id}`),
            membresia_id: formData.get(`cliente-membresia-membresia-editar-${id}`),
            fecha_inicio: formData.get(`cliente-membresia-fecha-inicio-editar-${id}`),
            fecha_fin: formData.get(`cliente-membresia-fecha-fin-editar-${id}`),
            estado: formData.get(`cliente-membresia-estado-editar-${id}`) === 'True',
            codigo_qr: formData.get(`cliente-membresia-codigo-qr-editar-${id}`)
        };

        const response = await fetch(`/membresias/actualizar_cliente_membresia/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar la membresía de cliente');
        }
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        alert('Membresía de cliente actualizada exitosamente');
        cerrarModalEdicion('cliente-membresia', id);
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la membresía de cliente: ' + error.message);
    }
}

async function eliminarClienteMembresia(id) {
    try {
        const response = await fetch(`/membresias/borrar_cliente_membresia/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) throw new Error('Error al eliminar la membresía de cliente');
        
        alert('Membresía de cliente eliminada exitosamente');
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la membresía de cliente: ' + error.message);
    }
} 