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
      cells[2].textContent = objeto.descripcion;
      cells[3].textContent = objeto.precio;
      cells[4].textContent = objeto.stock_actual;
      cells[5].textContent = objeto.stock_minimo;
      cells[6].textContent = objeto.compra_id;
      cells[7].textContent = objeto.categoria_id;
      cells[8].textContent = objeto.establecimiento_id;
    }
  }
  if (id_tipo=='categoria') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.nombre;
      cells[2].textContent = objeto.descripcion;
    }
  }
  if (id_tipo=='compra') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.fecha;
      cells[2].textContent = objeto.total;
      cells[3].textContent = objeto.iva;
      cells[4].textContent = objeto.estado;
      cells[5].textContent = objeto.establecimiento_id;
      cells[6].textContent = objeto.vendedor_id;
    }
  }
  if (id_tipo=='vendedor') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.nombre;
      cells[2].textContent = objeto.telefono;
      cells[3].textContent = objeto.email;
      cells[4].textContent = objeto.proveedor_id;
    }
  }
  if (id_tipo=='establecimiento') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.nombre;
      cells[2].textContent = objeto.direccion;
      cells[3].textContent = objeto.telefono;
      cells[4].textContent = objeto.email;
      cells[5].textContent = objeto.horario_apertura;
      cells[6].textContent = objeto.horario_cierre;
      cells[6].textContent = objeto.proveedor_id;
    }
  }
  if (id_tipo=='proveedor') {
    if (row) {
      const cells = row.cells;
      cells[0].textContent = objeto.nombre;
      cells[2].textContent = objeto.telefono;
      cells[3].textContent = objeto.email;
    }
  }
}

///////////////////////////
// FUNCIONES DE CREACIÓN //
///////////////////////////

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

// Función para crear compra
function crearCompraVendedor(formData) {
  return fetch(`${BASE_URL}crear_compra_vendedor/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para crear vendedor
function crearVendedor(formData) {
  return fetch(`${BASE_URL}crear_vendedor/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para crear establecimiento
function crearEstablecimiento(formData) {
  return fetch(`${BASE_URL}crear_establecimiento/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(formData)
  }).then(response => response.json());
}

// Función para crear proveedor
function crearProveedor(formData) {
  return fetch(`${BASE_URL}crear_proveedor/`, {
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

// Función para actualizar compra
function actualizarCompraVendedor(id, data) {
  return fetch(`${BASE_URL}actualizar_compra_vendedor/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para actualizar vendedor
function actualizarVendedor(id, data) {
  return fetch(`${BASE_URL}actualizar_vendedor/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para actualizar establecimiento
function actualizarEstablecimiento(id, data) {
  return fetch(`${BASE_URL}actualizar_establecimiento/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => response.json());
}

// Función para actualizar proveedor
function actualizarProveedor(id, data) {
  return fetch(`${BASE_URL}actualizar_proveedor/${id}/`, {
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

// Función para eliminar compra
function eliminarCompraVendedor(id) {
  return fetch(`${BASE_URL}borrar_compra_vendedor/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

// Función para eliminar vendedor
function eliminarVendedor(id) {
  return fetch(`${BASE_URL}borrar_vendedor/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

// Función para eliminar establecimiento
function eliminarEstablecimiento(id) {
  return fetch(`${BASE_URL}borrar_establecimiento/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => response.json());
}

// Función para eliminar proveedor
function eliminarProveedor(id) {
  return fetch(`${BASE_URL}borrar_proveedor/${id}/`, {
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

// Creación de compra de event listeners
function manejoCrearCompraVendedor(e) {
  e.preventDefault();
  
  const formData = {
    fecha: document.getElementById('compra-fecha').value,
    total: document.getElementById('compra-total').value,
    iva: document.getElementById('compra-iva').value,
    estado: document.getElementById('compra-estado').value,
    establecimiento_id: document.getElementById('compra-establecimiento').value,
    vendedor_id: document.getElementById('compra-vendedor').value,
  };
  
  crearCompraVendedor(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Compra creada exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear compra: ' + error.message);
    });
};

// Creación de vendedor de event listeners
function manejoCrearVendedor(e) {
  e.preventDefault();
  
  const formData = {
    nombre: document.getElementById('vendedor-nombre').value,
    telefono: document.getElementById('vendedor-telefono').value,
    email: document.getElementById('vendedor-email').value,
    proveedor_id: document.getElementById('vendedor-proveedor').value,
  };
  
  crearVendedor(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Vendedor creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear vendedor: ' + error.message);
    });
};

// Creación de establecimiento de event listeners
function manejoCrearEstablecimiento(e) {
  e.preventDefault();
  
  const formData = {
    nombre: document.getElementById('establecimiento-nombre').value,
    direccion: document.getElementById('establecimiento-direccion').value,
    telefono: document.getElementById('establecimiento-telefono').value,
    email: document.getElementById('establecimiento-email').value,
    horario_apertura: document.getElementById('establecimiento-horario_apertura').value,
    horario_cierre: document.getElementById('establecimiento-horario_cierre').value,
    proveedor_id: document.getElementById('establecimiento-proveedor').value,
  };
  
  crearEstablecimiento(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Establecimiento creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear establecimiento: ' + error.message);
    });
};

// Creación de proveedor de event listeners
function manejoCrearProveedor(e) {
  e.preventDefault();
  
  const formData = {
    nombre: document.getElementById('proveedor-nombre').value,
    telefono: document.getElementById('proveedor-telefono').value,
    email: document.getElementById('proveedor-email').value,
  };
  
  crearProveedor(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      alert('Proveedor creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear proveedor: ' + error.message);
    });
};

////////////////////////////////////
// INICIALIZACIÓN EVENT LISTENERS //
////////////////////////////////////

function inicializarEventListeners() {
  const formCrearProducto = document.getElementById('form-crear-producto');
  const formCrearCategoria = document.getElementById('form-crear-categoria');
  const formCrearCompraVendedor = document.getElementById('form-crear-compra');
  const formCrearVendedor = document.getElementById('form-crear-vendedor');
  const formCrearEstablecimiento = document.getElementById('form-crear-establecimiento');
  const formCrearProveedor = document.getElementById('form-crear-proveedor');
  if (formCrearProducto) {
    formCrearProducto.addEventListener('submit', manejoCrearProducto);
  }
  if (formCrearCategoria) {
    formCrearCategoria.addEventListener('submit', manejoCrearCategoria);
  }
  if (formCrearCompraVendedor) {
    formCrearCompraVendedor.addEventListener('submit', manejoCrearCompraVendedor);
  }
  if (formCrearVendedor) {
    formCrearVendedor.addEventListener('submit', manejoCrearVendedor);
  }
  if (formCrearEstablecimiento) {
    formCrearEstablecimiento.addEventListener('submit', manejoCrearEstablecimiento);
  }
  if (formCrearProveedor) {
    formCrearProveedor.addEventListener('submit', manejoCrearProveedor);
  }
}

///////////////////////////////////////////////
// FUNCIONES DE FORMULARIOS DE ACTUALIZACIÓN //
///////////////////////////////////////////////

// Variable para identificar entre diferentes tablas
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

// Formularios de actualización de datos de compra
document.querySelectorAll('[name="form-editar-compra"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const compraId = this.dataset.id;
    const formData = {
      fecha: this.querySelector('[name="compra-fecha"]').value,
      total: this.querySelector('[name="compra-total"]').value,
      iva: this.querySelector('[name="compra-iva"]').value,
      estado: this.querySelector('[name="compra-estado"]').value,
      establecimiento_id: this.querySelector('[name="compra-establecimiento"]').value,
      vendedor_id: this.querySelector('[name="compra-vendedor"]').value,
    };
    
    actualizarCompraVendedor(compraId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='compra';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(compraId, id_tipo);
        alert('Compra actualizada correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

// Formularios de actualización de datos de vendedor
document.querySelectorAll('[name="form-editar-vendedor"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const vendedorId = this.dataset.id;
    const formData = {
      nombre: this.querySelector('[name="vendedor-nombre"]').value,
      telefono: this.querySelector('[name="vendedor-telefono"]').value,
      email: this.querySelector('[name="vendedor-email"]').value,
      proveedor_id: this.querySelector('[name="vendedor-proveedor"]').value,
    };
    
    actualizarVendedor(vendedorId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='vendedor';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(vendedorId, id_tipo);
        alert('Vendedor actualizado correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

// Formularios de actualización de datos de establecimiento
document.querySelectorAll('[name="form-editar-establecimiento"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const establecimientoId = this.dataset.id;
    const formData = {
      nombre: this.querySelector('[name="establecimiento-nombre"]').value,
      direccion: this.querySelector('[name="establecimiento-direccion"]').value,
      telefono: this.querySelector('[name="establecimiento-telefono"]').value,
      email: this.querySelector('[name="establecimiento-email"]').value,
      horario_apertura: this.querySelector('[name="establecimiento-horario_apertura"]').value,
      horario_cierre: this.querySelector('[name="establecimiento-horario_cierre"]').value,
      proveedor_id: this.querySelector('[name="establecimiento-proveedor"]').value,
    };
    
    actualizarEstablecimiento(establecimientoId, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='establecimiento';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(establecimientoId, id_tipo);
        alert('Establecimiento actualizado correctamente');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar: ' + error.message);
      });
  });
});

// Formularios de actualización de datos de proveedor
document.querySelectorAll('[name="form-editar-proveedor"]').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const proveedorId = this.dataset.id;
    const formData = {
      nombre: this.querySelector('[name="proveedor-nombre"]').value,
      telefono: this.querySelector('[name="proveedor-telefono"]').value,
      email: this.querySelector('[name="proveedor-email"]').value,
    };
    
    actualizarProveedor(proveedor-Id, formData)
      .then(data => {
        if (data.error) throw new Error(data.error);
        id_tipo='proveedor';
        actualizarVista(data, id_tipo);
        ocultarFormularioEdicion(proveedorId, id_tipo);
        alert('Proveedor actualizado correctamente');
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

// Boton editar compra
document.querySelectorAll('[name="btn-editar-compra"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='compra';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

// Boton editar vendedor
document.querySelectorAll('[name="btn-editar-vendedor"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='vendedor';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

// Boton editar establecimiento
document.querySelectorAll('[name="btn-editar-establecimiento"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='establecimiento';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

// Boton editar proveedor
document.querySelectorAll('[name="btn-editar-proveedor"]').forEach(btn => {
  btn.addEventListener('click', function() {
    id_tipo='proveedor';
    mostrarFormularioEdicion(this.getAttribute('data-id'), id_tipo);
  });
});

////////////////////////////
// BOTONES DE ELIMINACIÓN //
////////////////////////////

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

// Boton eliminar compra
document.querySelectorAll('[name="btn-eliminar-compra"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    if (confirm('¿Eliminar esta compra?')) {
      eliminarCompraVendedor(id)
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.querySelector(`tr[data-id="${id}"]`).remove();
          document.querySelector(`#form-editar-compra-${id}`)?.remove();
          window.location.reload();
        })
        .catch(console.error);
    }
  });
});

// Boton eliminar vendedor
document.querySelectorAll('[name="btn-eliminar-vendedor"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    if (confirm('¿Eliminar este vendedor?')) {
      eliminarVendedor(id)
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.querySelector(`tr[data-id="${id}"]`).remove();
          document.querySelector(`#form-editar-vendedor-${id}`)?.remove();
          window.location.reload();
        })
        .catch(console.error);
    }
  });
});

// Boton eliminar establecimiento
document.querySelectorAll('[name="btn-eliminar-establecimiento"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    if (confirm('¿Eliminar este establecimiento?')) {
      eliminarEstablecimiento(id)
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.querySelector(`tr[data-id="${id}"]`).remove();
          document.querySelector(`#form-editar-establecimiento-${id}`)?.remove();
          window.location.reload();
        })
        .catch(console.error);
    }
  });
});

// Boton eliminar proveedor
document.querySelectorAll('[name="btn-eliminar-proveedor"]').forEach(btn => {
  btn.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    if (confirm('¿Eliminar este proveedor?')) {
      eliminarProveedor(id)
        .then(data => {
          if (data.error) throw new Error(data.error);
          document.querySelector(`tr[data-id="${id}"]`).remove();
          document.querySelector(`#form-editar-proveedor-${id}`)?.remove();
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

