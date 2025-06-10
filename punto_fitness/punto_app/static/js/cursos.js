const BASE_URL = '/cursos/';

////////////////////////////////
//// CURSOS E INSCRIPCIONES ////
////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
  inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
  const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
  return csrfInput ? csrfInput.value : '';
}

// Función para mostrar formulario de edición (ahora abre el modal)
function mostrarFormularioEdicion(id, id_tipo) {
  console.log(`🎯 Abriendo modal de edición para ${id_tipo} con ID: ${id}`);
  console.log(`🔍 Buscando modal con ID: modal-fondo-editar-${id_tipo}-${id}`);
  const modalFondo = document.getElementById(`modal-fondo-editar-${id_tipo}-${id}`);
  if (modalFondo) {
    modalFondo.style.display = 'flex';
    setTimeout(() => {
      const primerInput = modalFondo.querySelector('input, select');
      if (primerInput) {
        primerInput.focus();
      }
    }, 100);
  } else {
    console.error(`❌ No se encontró el modal de edición para ${id_tipo} con ID: ${id}`);
  }
}

// Función para ocultar formulario de edición (ahora cierra el modal)
function cerrarModalEdicion(id_tipo, id) {
  console.log(`🔒 Cerrando modal de edición para ${id_tipo} con ID: ${id}`);
  const modalFondo = document.getElementById(`modal-fondo-editar-${id_tipo}-${id}`);
  if (modalFondo) {
    modalFondo.style.display = 'none';
    const form = modalFondo.querySelector('form');
    if (form) {
      form.reset();
    }
  }
}

// Función para actualizar vista de datos
function actualizarVista(objeto, id_tipo) {
  const row = document.querySelector(`tr[data-id="${objeto.id}"]`);
  if (id_tipo=='curso') {
    if (row) {
      const cells = row.cells;
      cells[1].textContent = objeto.nombre;
      cells[2].textContent = objeto.cupos;
      cells[3].textContent = new Date(objeto.fecha_realizacion).toLocaleDateString('es-ES');
      cells[4].textContent = objeto.estado;
      // La celda del establecimiento se actualizará con window.location.reload()
    }
  }
  if (id_tipo=='inscripcion') {
    if (row) {
      // Las celdas de inscripción se actualizarán con window.location.reload()
    }
  }
}

///////////////////////////
// FUNCIONES DE CREACIÓN //
///////////////////////////

// Función para crear curso
function crearCurso(formData) {
  return fetch(`${BASE_URL}crear_curso/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para crear inscripción
function crearInscripcion(formData) {
  return fetch(`${BASE_URL}crear_inscripcion/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

////////////////////////////////
// FUNCIONES DE ACTUALIZACIÓN //
////////////////////////////////

// Función para actualizar curso
function actualizarCurso(id, data) {
  return fetch(`${BASE_URL}actualizar_curso/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para actualizar inscripción
function actualizarInscripcion(id, data) {
  return fetch(`${BASE_URL}actualizar_inscripcion/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

//////////////////////////////
// FUNCIONES DE ELIMINACIÓN //
//////////////////////////////

// Función para eliminar curso
function eliminarCurso(id) {
  return fetch(`${BASE_URL}borrar_curso/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

// Función para eliminar inscripción
function eliminarInscripcion(id) {
  return fetch(`${BASE_URL}borrar_inscripcion/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

////////////////////////////////////
// INICIALIZACIÓN EVENT LISTENERS //
////////////////////////////////////

function inicializarEventListeners() {
  console.log('🔧 Inicializando event listeners de cursos...');

  // Event listeners para formularios de creación
  const formCrearCurso = document.getElementById('form-crear-curso');
  const formCrearInscripcion = document.getElementById('form-crear-inscripcion');

  if (formCrearCurso) {
    formCrearCurso.addEventListener('submit', manejoCrearCurso);
  }
  if (formCrearInscripcion) {
    formCrearInscripcion.addEventListener('submit', manejoCrearInscripcion);
  }

  // Event listeners para botones de edición
document.querySelectorAll('[name="btn-editar-curso"]').forEach(btn => {
  btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      mostrarFormularioEdicion(id, 'curso');
  });
});

document.querySelectorAll('[name="btn-editar-inscripcion"]').forEach(btn => {
  btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      mostrarFormularioEdicion(id, 'inscripcion');
  });
});

  // Event listeners para botones de eliminación
document.querySelectorAll('[name="btn-eliminar-curso"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');

    if (confirm('¿Eliminar este curso?')) {
      eliminarCurso(id)
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.querySelector(`tr[data-id="${id}"]`).remove();
          document.querySelector(`#form-editar-curso-${id}`)?.remove();
          window.location.reload();
        })
        .catch(console.error);
    }
  });
});

document.querySelectorAll('[name="btn-eliminar-inscripcion"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    if (confirm('¿Eliminar esta inscripción?')) {
      eliminarInscripcion(id)
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.querySelector(`tr[data-id="${id}"]`).remove();
          document.querySelector(`#form-editar-inscripcion-${id}`)?.remove();
          window.location.reload();
        })
        .catch(console.error);
    }
  });
});

  // Event listeners para formularios de edición
  document.querySelectorAll('[name="form-editar-curso"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-id');
      const formData = {
        nombre: this.querySelector('[name="curso-nombre"]')?.value ?? '',
        cupos: parseInt(this.querySelector('[name="curso-cupos"]')?.value) || 0,
        fecha_realizacion: this.querySelector('[name="curso-fecha_realizacion"]')?.value ?? '',
        establecimiento_id: this.querySelector('[name="curso-establecimiento"]')?.value ?? ''
      };
      
      actualizarCurso(id, formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          actualizarVista(data, 'curso');
          cerrarModalEdicion('curso', id);
          alert('Curso actualizado correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar: ' + error.message);
        });
    });
  });

  document.querySelectorAll('[name="form-editar-inscripcion"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-id');
      const formData = {
        usuario_id: this.querySelector('[name="inscripcion-usuario"]')?.value ?? '',
        curso_id: this.querySelector('[name="inscripcion-curso"]')?.value ?? ''
      };
      
      actualizarInscripcion(id, formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          actualizarVista(data, 'inscripcion');
          cerrarModalEdicion('inscripcion', id);
          alert('Inscripción actualizada correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar: ' + error.message);
        });
    });
  });

  // Modal Functionality
  inicializarModales();
  
  console.log('✅ Event listeners de cursos inicializados correctamente');
}

///////////////////////////
// FUNCIONALIDAD MODALES //
///////////////////////////

function inicializarModales() {
  console.log('🎭 Inicializando modales de cursos...');

  // Botones para abrir modales de creación
  const botonesModalesCreacion = {
    'curso': document.getElementById('abrir-form-curso'),
    'inscripcion': document.getElementById('abrir-form-inscripcion')
  };

  // Event listeners para botones de abrir modal de creación
  Object.entries(botonesModalesCreacion).forEach(([tipo, boton]) => {
    if (boton) {
      boton.addEventListener('click', function() {
        console.log(`🎯 Botón abrir modal ${tipo} clickeado`);
        const estado = this.getAttribute('data-estado');
        
        if (estado === 'cerrado') {
          abrirModal(tipo, this);
        } else {
          cerrarModal(tipo, this);
        }
      });
    }
  });

  // Event listeners para cerrar modales de creación con click en fondo
  Object.keys(botonesModalesCreacion).forEach(tipo => {
    const modalFondo = document.getElementById(`modal-fondo-${tipo}`);
    if (modalFondo) {
      modalFondo.addEventListener('click', function(event) {
        if (event.target === modalFondo) {
          console.log(`🖱️ Click en fondo del modal ${tipo}, cerrando...`);
          cerrarModal(tipo);
        }
      });
    }
  });

  // Event listeners para cerrar modales de edición con click en fondo
  document.querySelectorAll('.modal-fondo[id^="modal-fondo-editar-"]').forEach(modalFondo => {
    modalFondo.addEventListener('click', function(event) {
      if (event.target === modalFondo) {
        console.log(`🖱️ Click en fondo del modal de edición, cerrando...`);
        const id_parts = modalFondo.id.split('-');
        const id_tipo = id_parts[2];
        const id = id_parts[id_parts.length - 1];
        cerrarModalEdicion(id_tipo, id);
      }
    });
  });

  // Event listener para cerrar modales con ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const modalAbiertoCreacion = document.querySelector('.modal-fondo[id^="modal-fondo-"][style*="flex"]');
      const modalAbiertoEdicion = document.querySelector('.modal-fondo[id^="modal-fondo-editar-"][style*="flex"]');

      if (modalAbiertoCreacion) {
        const tipo = modalAbiertoCreacion.id.replace('modal-fondo-', '');
        console.log(`⌨️ Tecla ESC presionada, cerrando modal ${tipo}...`);
        cerrarModal(tipo);
      } else if (modalAbiertoEdicion) {
        const id_parts = modalAbiertoEdicion.id.split('-');
        const id_tipo = id_parts[2];
        const id = id_parts[id_parts.length - 1];
        console.log(`⌨️ Tecla ESC presionada, cerrando modal de edición ${id_tipo} con ID: ${id}...`);
        cerrarModalEdicion(id_tipo, id);
      }
    }
  });

  console.log('✅ Modales de cursos inicializados correctamente');
}

// Función para abrir modal de creación
function abrirModal(tipo, boton = null) {
  console.log(`🔓 Abriendo modal ${tipo}...`);
  
  const modalFondo = document.getElementById(`modal-fondo-${tipo}`);
  const botonAbrir = boton || document.getElementById(`abrir-form-${tipo}`);
  
  if (modalFondo && botonAbrir) {
    modalFondo.style.display = 'flex';
    botonAbrir.setAttribute('data-estado', 'abierto');
    botonAbrir.textContent = '-';
    
    // Enfocar el primer input
    setTimeout(() => {
      const primerInput = modalFondo.querySelector('input, select');
      if (primerInput) {
        primerInput.focus();
      }
    }, 100);
    
    console.log(`✅ Modal ${tipo} abierto correctamente`);
  } else {
    console.error(`❌ No se encontró el modal o botón para ${tipo}`);
  }
}

// Función para cerrar modal de creación
function cerrarModal(tipo, boton = null) {
  console.log(`🔒 Cerrando modal ${tipo}...`);
  
  const modalFondo = document.getElementById(`modal-fondo-${tipo}`);
  const botonAbrir = boton || document.getElementById(`abrir-form-${tipo}`);
  
  if (modalFondo && botonAbrir) {
    modalFondo.style.display = 'none';
    botonAbrir.setAttribute('data-estado', 'cerrado');
    botonAbrir.textContent = '+';
    
    // Limpiar el formulario
    const form = modalFondo.querySelector('form');
    if (form) {
      form.reset();
    }
    
    console.log(`✅ Modal ${tipo} cerrado correctamente`);
  } else {
    console.error(`❌ No se encontró el modal o botón para ${tipo}`);
  }
}

////////////////////////////////////////////
// FUNCIONES DE MANEJO DE EVENT LISTENERS //
////////////////////////////////////////////

// Creación de cursos de event listeners
function manejoCrearCurso(e) {
  e.preventDefault();

  const formData = {
    nombre: document.getElementById('curso-nombre-modal').value,
    cupos: document.getElementById('curso-cupos-modal').value,
    fecha_realizacion: document.getElementById('curso-fecha_realizacion-modal').value,
    establecimiento_id: document.getElementById('curso-establecimiento-modal').value,
  };

  crearCurso(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Curso creado exitosamente');
      cerrarModal('curso');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear curso: ' + error.message);
    });
}

// Creación de inscripciones de event listeners
function manejoCrearInscripcion(e) {
  e.preventDefault();
  
  const formData = {
    usuario_id: document.getElementById('inscripcion-usuario-modal').value,
    curso_id: document.getElementById('inscripcion-curso-modal').value,
  };
  
  crearInscripcion(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Inscripción creada exitosamente');
      cerrarModal('inscripcion');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear inscripción: ' + error.message);
    });
}