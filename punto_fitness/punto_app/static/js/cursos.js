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

// Función para mostrar formulario de edición
function mostrarFormularioEdicion(id, id_tipo) {
  document.querySelectorAll(`.form-edicion-${id_tipo}`).forEach(form => {
    form.style.display = 'none';
  });
  document.getElementById(`form-editar-${id_tipo}-${id}`).style.display = 'table-row';
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicion(id, id_tipo) {
  document.getElementById(`form-editar-${id_tipo}-${id}`).style.display = 'none';
}

// Función para actualizar vista de datos
function actualizarVista(objeto, id_tipo) {
  const row = document.querySelector(`tr[data-id="${objeto.id}"]`);
  if (id_tipo=='curso') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.id;
      cells[2].textContent = objeto.nombre;
      cells[3].textContent = objeto.cupos;
      cells[4].textContent = objeto.fecha_realizacion;
      cells[5].textContent = objeto.estado;
      cells[6].textContent = objeto.establecimiento_id;
    }
  }
  if (id_tipo=='inscripcion') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.cliente_id;
      cells[2].textContent = objeto.curso_id;
      cells[3].textContent = objeto.fecha_inscripcion;
      cells[3].textContent = objeto.fecha_realizacion;
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

////////////////////////////////////////////
// FUNCIONES DE MANEJO DE EVENT LISTENERS //
////////////////////////////////////////////

// Creación de cursos de event listeners
function manejoCrearCurso(e) {
  e.preventDefault();

  const formData = {
    nombre: document.getElementById('curso-nombre').value,
    cupos: document.getElementById('curso-cupos').value,
    fecha_realizacion: document.getElementById('curso-fecha_realizacion').value,
    estado: document.getElementById('curso-estado').value,
    establecimiento_id: document.getElementById('curso-establecimiento').value,
  };

  crearCurso(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Curso creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear curso: ' + error.message);
    });
};

// Creación de inscripciones de event listeners
function manejoCrearInscripcion(e) {
  e.preventDefault();
  
  const formData = {
    usuario_id: document.getElementById('inscripcion-usuario').value,
    curso_id: document.getElementById('inscripcion-curso').value,
    fecha_inscripcion: document.getElementById('inscripcion-fecha_inscripcion').value,
  };
  
  crearInscripcion(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Inscripción creada exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear inscripción: ' + error.message);
    });
};

////////////////////////////////////
// INICIALIZACIÓN EVENT LISTENERS //
////////////////////////////////////

function inicializarEventListeners() {
  const formCrearCurso = document.getElementById('form-crear-curso');
  const formCrearInscripcion = document.getElementById('form-crear-inscripcion');
  if (formCrearCurso) {
    formCrearCurso.addEventListener('submit', manejoCrearCurso);
  }
  if (formCrearInscripcion) {
    formCrearInscripcion.addEventListener('submit', manejoCrearInscripcion);
  }
}

///////////////////////////////////////////////
// FUNCIONES DE FORMULARIOS DE ACTUALIZACIÓN //
///////////////////////////////////////////////

// Variable para identificar entre diferentes tablas
let id_tipo;

// Formularios de actualización de datos de curso
document.querySelectorAll('[name="form-editar-curso"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const cursoId = this.dataset.id;
    const formData = {
      nombre: this.querySelector('[name="curso-nombre"]').value,
      cupos: this.querySelector('[name="curso-cupos"]').value,
      fecha_realizacion: this.querySelector('[name="curso-fecha_realizacion"]').value,
      estado: this.querySelector('[name="curso-estado"]').value,
      establecimiento_id: this.querySelector('[name="curso-establecimiento"]').value
    };
    
    actualizarCurso(cursoId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='curso';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(cursoId, id_tipo);
        alert('curso actualizado correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

// Formularios de actualización de datos de inscripción
document.querySelectorAll('[name="form-editar-inscripcion"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const inscripcionId = this.dataset.id;
    const formData = {
      usuario_id: this.querySelector('[name="inscripcion-usuario"]').value,
      curso_id: this.querySelector('[name="inscripcion-curso"]').value,
      fecha_inscripcion: this.querySelector('[name="inscripcion-fecha_inscripcion"]').value
    };
    
    actualizarInscripcion(inscripcionId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='inscripcion';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(inscripcionId, id_tipo);
        alert('inscripcion actualizado correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

////////////////////////
// BOTONES DE EDICIÓN //
////////////////////////

// Boton editar curso
document.querySelectorAll('[name="btn-editar-curso"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='curso';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

// Boton editar inscripción
document.querySelectorAll('[name="btn-editar-inscripcion"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='inscripcion';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

////////////////////////////
// BOTONES DE ELIMINACIÓN //
////////////////////////////

// Boton eliminar curso
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

// Boton eliminar inscripción
document.querySelectorAll('[name="btn-eliminar-inscripcion"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    if (confirm('¿Eliminar esta inscripcion?')) {
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

/////////////////////////////////////
// BOTÓN DE CANCELACIÓN DE EDICIÓN //
/////////////////////////////////////

// Boton cancelar
document.querySelectorAll('.btn-cancelar').forEach(btn => {
  btn.addEventListener('click', function() {
    ocultarFormularioEdicion(this.getAttribute('data-id'));
  });
});
