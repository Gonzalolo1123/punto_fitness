const BASE_URL = '/inventario/';

////////////////////
//// PRODUCTOS /////
////////////////////

document.addEventListener('DOMContentLoaded', function() {
  inicializarEventListeners();
});

// Función para mostrar formulario de edición
function mostrarFormularioEdicionProducto(productoId) {
  document.querySelectorAll('.form-edicion-producto').forEach(form => {
    form.style.display = 'none';
  });
  document.getElementById(`form-editar-producto-${productoId}`).style.display = 'table-row';
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicionProducto(productoId) {
  document.getElementById(`form-editar-producto-${productoId}`).style.display = 'none';
}

// Función para actualizar vista de datos de producto
function actualizarVista(producto) {
  const row = document.querySelector(`tr[data-id="${producto.id}"]`);
  if (row) {
    const cells = row.cells;
    cells[0].textContent = producto.nombre;
    cells[2].textContent = producto.stock_minimo;
    cells[3].textContent = producto.precio;
  }
}

// Función para crear producto
function crearProducto(formData) {
  return fetch(`${BASE_URL}crear_producto/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para actualizar producto
function actualizarProducto(id, data) {
  return fetch(`${BASE_URL}actualizar_producto/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para eliminar producto
function eliminarProducto(id) {
  return fetch(`${BASE_URL}borrar_producto/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    }
  }).then(response => response.json());
}

function inicializarEventListeners() {
  document.getElementById('form-crear-producto').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
      precio: document.getElementById('precio').value,
      stock_actual: 1,
      stock_minimo: document.getElementById('stock_minimo').value,
      compra_id: 1,
      categoria_id: 1,
      establecimiento_id: 1
    };
    
    crearProducto(formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        alert('Producto creado');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
      });
  });

  // Formularios de actualización de datos
  document.querySelectorAll('[name="form-editar-producto"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const productoId = this.dataset.id;
      
      const formData = {
        nombre: this.elements.nombre.value,
        descripcion: this.elements.descripcion.value,
        precio: this.elements.precio.value,
        stock_minimo: this.elements.stock_minimo.value
      };
      
      actualizarProducto(productoId, formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          actualizarVista(data);
          ocultarFormularioEdicionProducto(productoId);
          alert('Producto actualizado correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar: ' + error.message);
        });
    });
  });

  // Boton editar
  document.querySelectorAll('[name="btn-editar-producto"]').forEach(btn => {
    btn.addEventListener('click', function() {
      mostrarFormularioEdicionProducto(this.getAttribute('data-id'));
    });
  });

  // Boton eliminar
  document.querySelectorAll('[name="btn-eliminar-producto"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Eliminar este producto?')) {
        eliminarProducto(id)
          .then(data => {
            if (data.error) throw new Error(data.error);
            document.querySelector(`tr[data-id="${id}"]`).remove();
            document.querySelector(`#form-editar-producto-${id}`)?.remove();
            window.location.reload();
          })
          .catch(console.error);
      }
    });
  });

  // Boton cancelar
  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', function() {
      ocultarFormularioEdicionProducto(this.getAttribute('data-id'));
    });
  });
}

