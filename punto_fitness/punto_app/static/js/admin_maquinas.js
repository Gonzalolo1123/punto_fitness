const BASE_URL = '/maquinas/';

////////////////////
//// MAQUINAS /////
////////////////////

document.addEventListener('DOMContentLoaded', function() {
  inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
  const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
  return csrfInput ? csrfInput.value : '';
}

// Función para mostrar formulario de edición
function mostrarFormularioEdicion(maquinaId) {
  document.querySelectorAll('.form-edicion-maquina').forEach(form => {
    form.style.display = 'none';
  });
  document.getElementById(`form-editar-maquina-${maquinaId}`).style.display = 'table-row';
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicion(maquinaId) {
  document.getElementById(`form-editar-maquina-${maquinaId}`).style.display = 'none';
}

// Función para actualizar vista de datos de maquina
function actualizarVista(maquina) {
  const row = document.querySelector(`tr[data-id="${maquina.id}"]`);
  if (row) {
    const cells = row.cells;
    cells[0].textContent = maquina.nombre;
    cells[2].textContent = maquina.descripcion;
  }
}

// Función para crear maquina
function crearMaquina(formData) {
  return fetch(`${BASE_URL}crear_maquina/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para actualizar maquina
function actualizarMaquina(id, data) {
  return fetch(`${BASE_URL}actualizar_maquina/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para eliminar maquina
function eliminarMaquina(id) {
  return fetch(`${BASE_URL}borrar_maquina/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

function inicializarEventListeners() {
  const formCrearMaquina = document.getElementById('form-crear-maquina');
  if (formCrearMaquina) {
    formCrearMaquina.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        nombre: document.getElementById('maquina-nombre').value,
        descripcion: document.getElementById('maquina-descripcion').value,
        establecimiento_id: 1
      };
      
      crearMaquina(formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          alert('Máquina creada exitosamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al crear máquina: ' + error.message);
        });
    });
  }
}

  // Formularios de actualización de datos
  document.querySelectorAll('[name="form-editar-maquina"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const maquinaId = this.dataset.id;
      const formData = {
        nombre: this.querySelector('[name="maquina-nombre"]').value,
        descripcion: this.querySelector('[name="maquina-descripcion"]').value,
      };
      
      actualizarMaquina(maquinaId, formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          actualizarVista(data);
          ocultarFormularioEdicion(maquinaId);
          alert('maquina actualizado correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar: ' + error.message);
        });
    });
  });

  // Boton editar
  document.querySelectorAll('[name="btn-editar-maquina"]').forEach(btn => {
    btn.addEventListener('click', function() {
      mostrarFormularioEdicion(this.getAttribute('data-id'));
    });
  });

  // Boton eliminar
  document.querySelectorAll('[name="btn-eliminar-maquina"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Eliminar esta maquina?')) {
        eliminarMaquina(id)
          .then(data => {
            if (data.error) throw new Error(data.error);
            document.querySelector(`tr[data-id="${id}"]`).remove();
            document.querySelector(`#form-editar-maquina-${id}`)?.remove();
            window.location.reload();
          })
          .catch(console.error);
      }
    });
  });

  // Boton cancelar
  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', function() {
      ocultarFormularioEdicion(this.getAttribute('data-id'));
    });
  });

