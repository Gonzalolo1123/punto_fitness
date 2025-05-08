////////////////////
/// CATEGORIAS ////
////////////////////

// Función para mostrar formulario de edición
function mostrarFormularioEdicionCategoria(categoriaId) {
  document.querySelectorAll('.form-edicion-categoria').forEach(form => {
    form.style.display = 'none';
  });
  document.getElementById(`form-editar-categoria-${categoriaId}`).style.display = 'table-row';
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicionCategoria(categoriaId) {
  document.getElementById(`form-editar-categoria-${categoriaId}`).style.display = 'none';
}

// Función para actualizar vista de datos de categoria
function actualizarVista(categoria) {
  const row = document.querySelector(`tr[data-id="${categoria.id}"]`);
  if (row) {
    const cells = row.cells;
    cells[0].textContent = categoria.nombre;
    cells[2].textContent = categoria.descripcion;
  }
}

// Función para crear categoria
function crearCategoria(formData) {
  return fetch(`${BASE_URL}crear_categoria/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para actualizar categoria
function actualizarCategoria(id, data) {
  return fetch(`${BASE_URL}actualizar_categoria/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para eliminar categoria
function eliminarCategoria(id) {
  return fetch(`${BASE_URL}borrar_categoria/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    }
  }).then(response => response.json());
}

function inicializarEventListeners() {
  document.getElementById('form-crear-categoria').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
    };
    
    crearCategoria(formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        alert('Categoria creada');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
      });
  });

  // Formularios de actualización de datos
  document.querySelectorAll('[name="form-editar-categoria"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const categoriaId = this.dataset.id;
      
      const formData = {
        nombre: this.elements.nombre.value,
        descripcion: this.elements.descripcion.value,
      };
      
      actualizarCategoria(categoriaId, formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          actualizarVista(data);
          ocultarFormularioEdicionCategoria(categoriaId);
          alert('categoria actualizado correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar: ' + error.message);
        });
    });
  });

  // Boton editar
  document.querySelectorAll('[name="btn-editar-categoria"]').forEach(btn => {
    btn.addEventListener('click', function() {
      mostrarFormularioEdicionCategoria(this.getAttribute('data-id'));
    });
  });

  // Boton eliminar
  document.querySelectorAll('[name="btn-eliminar-categoria"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Eliminar esta categoria?')) {
        eliminarCategoria(id)
          .then(data => {
            if (data.error) throw new Error(data.error);
            document.querySelector(`tr[data-id="${id}"]`).remove();
            document.querySelector(`#form-editar-categoria-${id}`)?.remove();
            window.location.reload();
          })
          .catch(console.error);
      }
    });
  });

  // Boton cancelar
  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', function() {
      ocultarFormularioEdicionCategoria(this.getAttribute('data-id'));
    });
  });
}
