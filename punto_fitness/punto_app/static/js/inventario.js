const BASE_URL = '/inventario/';

////////////////////////////////
//// PRODUCTOS Y CATEGORIAS ////
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

// Función para actualizar vista de datos (INCOMPLETO)
function actualizarVista(objeto, id_tipo) {
  const row = document.querySelector(`tr[data-id="${objeto.id}"]`);
  if (id_tipo=='producto') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.nombre;
      cells[2].textContent = objeto.stock_minimo;
      cells[3].textContent = objeto.precio;
    }
  }
  if (id_tipo=='categoria') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.nombre;
      cells[2].textContent = objeto.descripcion;
    }
  }
}

// Función para crear producto
function crearProducto(formData) {
  return fetch(`${BASE_URL}crear_producto/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para crear categoria
function crearCategoria(formData) {
  return fetch(`${BASE_URL}crear_categoria/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
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
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para actualizar categoria
function actualizarCategoria(id, data) {
  return fetch(`${BASE_URL}actualizar_categoria/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
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
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

// Función para eliminar categoria
function eliminarCategoria(id) {
  return fetch(`${BASE_URL}borrar_categoria/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

// Creación de productos de event listeners
function manejoCrearProducto(e) {
  e.preventDefault();

  const formData = {
    nombre: document.getElementById('producto-nombre').value,
    descripcion: document.getElementById('producto-descripcion').value,
    precio: document.getElementById('producto-precio').value,
    stock_actual: document.getElementById('producto-stock-actual').value,
    stock_minimo: document.getElementById('producto-stock-minimo').value,
    compra_id: 1,
    categoria_id: document.getElementById('producto-categoria').value,
    establecimiento_id: 1
  };

  crearProducto(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Producto creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear producto: ' + error.message);
    });
};

// Creación de categorías de event listeners
function manejoCrearCategoria(e) {
  e.preventDefault();
  
  const formData = {
    nombre: document.getElementById('categoria-nombre').value,
    descripcion: document.getElementById('categoria-descripcion').value,
  };
  
  crearCategoria(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Categoría creada exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear categoría: ' + error.message);
    });
};

// Event listeners
function inicializarEventListeners() {
  const formCrearProducto = document.getElementById('form-crear-producto');
  const formCrearCategoria = document.getElementById('form-crear-categoria');
  if (formCrearProducto) {
    formCrearProducto.addEventListener('submit', manejoCrearProducto);
  }
  if (formCrearCategoria) {
    formCrearCategoria.addEventListener('submit', manejoCrearCategoria);
  }
}

// Variable para identificar entre producto y categoria
let id_tipo;

// Formularios de actualización de datos de producto
document.querySelectorAll('[name="form-editar-producto"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const productoId = this.dataset.id;
    const formData = {
      nombre: this.querySelector('[name="producto-nombre"]').value,
      descripcion: this.querySelector('[name="producto-descripcion"]').value,
      precio: this.querySelector('[name="producto-precio"]').value,
      stock_minimo: this.querySelector('[name="producto-stock-minimo"]').value
    };
    
    actualizarProducto(productoId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='producto';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(productoId, id_tipo);
        alert('Producto actualizado correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

// Formularios de actualización de datos de categoria
document.querySelectorAll('[name="form-editar-categoria"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const categoriaId = this.dataset.id;
    const formData = {
      nombre: this.querySelector('[name="categoria-nombre"]').value,
      descripcion: this.querySelector('[name="categoria-descripcion"]').value,
    };
    
    actualizarCategoria(categoriaId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='categoria';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(categoriaId, id_tipo);
        alert('categoria actualizado correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

// Boton editar producto
document.querySelectorAll('[name="btn-editar-producto"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='producto';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

// Boton editar categoria
document.querySelectorAll('[name="btn-editar-categoria"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='categoria';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

// Boton eliminar producto
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

// Boton eliminar categoría
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
    ocultarFormularioEdicion(this.getAttribute('data-id'));
  });
});

// MODAL FUNCIONAL PARA TODOS LOS FORMULARIOS DE CREACIÓN
document.addEventListener('DOMContentLoaded', function () {
  // Modal reutilizable
  const modalFondo = document.getElementById('modal-fondo');
  const modalForm = document.getElementById('modal-form');
  const modalFormContent = document.getElementById('modal-form-content');

  // Botones "+" al lado de cada h2 para abrir el modal
  document.querySelectorAll('.btn-modal-abrir').forEach(btn => {
    btn.addEventListener('click', function () {
      const formId = this.getAttribute('data-form');
      const formContainer = document.getElementById(formId);
      if (formContainer) {
        // Clonar el nodo para evitar conflictos de IDs y eventos
        const clone = formContainer.cloneNode(true);
        clone.style.display = 'block';
        modalFormContent.innerHTML = '';
        modalFormContent.appendChild(clone);

        modalFondo.style.display = 'block';
        modalForm.style.display = 'block';

        // Agregar event listener al form dentro del modal
        const formInModal = modalFormContent.querySelector('form');
        if (formInModal) {
          formInModal.addEventListener('submit', function (e) {
            e.preventDefault();
            // Ejemplo para vendedor
            const nombre = this.querySelector('[name="vendedor-nombre"]').value;
            // ...otros campos...
            // Realiza el fetch aquí o llama a tu función de creación
            // Al finalizar:
            modalFondo.style.display = 'none';
            modalForm.style.display = 'none';
            modalFormContent.innerHTML = '';
            window.location.reload();
          });
        }
      }
    });
  });

  // Cerrar modal al hacer click en el fondo
  if (modalFondo) {
    modalFondo.addEventListener('click', function (event) {
      if (event.target === modalFondo) {
        modalFondo.style.display = 'none';
        modalForm.style.display = 'none';
        modalFormContent.innerHTML = '';
      }
    });
  }
});

// Mostrar/ocultar formularios de creación en el flujo normal de la página (sin modal)
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.btn-toggle-form').forEach(btn => {
    btn.addEventListener('click', function () {
      const formId = this.getAttribute('data-form');
      const modal = document.getElementById(formId);
      const estado = this.getAttribute('data-estado') || 'cerrado';
      if (!modal) return;

      if (estado === 'cerrado') {
        modal.style.display = 'block';
        this.setAttribute('data-estado', 'abierto');
        this.textContent = '-';
      } else {
        modal.style.display = 'none';
        this.setAttribute('data-estado', 'cerrado');
        this.textContent = '+';
      }
    });
  });
});