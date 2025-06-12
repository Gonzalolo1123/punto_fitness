const BASE_URL = '/inventario/';

////////////////////////////////
//// PRODUCTOS Y CATEGORIAS ////
////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Inicializando módulo de inventario...');
  
  // Verificar que las funciones de validación estén disponibles
  if (typeof validarNombre === 'undefined' || typeof validarFormulario === 'undefined') {
    console.error('❌ ERROR: Las funciones de validación no están disponibles. Verifique que validaciones.js se cargue antes que inventario.js');
    Swal.fire('Error', 'Error de configuración: Las validaciones no están disponibles. Por favor, recarga la página.', 'error');
    return;
  }
  
  console.log('✅ Funciones de validación disponibles:', {
    validarNombre: typeof validarNombre,
    validarDescripcion: typeof validarDescripcion,
    validarPrecioChileno: typeof validarPrecioChileno,
    validarNumeroEntero: typeof validarNumeroEntero,
    validarEmail: typeof validarEmail,
    validarTelefonoChileno: typeof validarTelefonoChileno,
    validarFormulario: typeof validarFormulario,
    mostrarExitoValidacion: typeof mostrarExitoValidacion
  });
  
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
  if (!row) {
    console.warn(`No se encontró la fila con data-id="${objeto.id}"`);
    return;
  }
  
  const cells = row.cells;
  
  if (id_tipo=='producto') {
    if (cells.length >= 8) {
      cells[0].textContent = objeto.nombre || '';
      cells[1].textContent = objeto.descripcion || '';
      cells[2].textContent = objeto.precio || '';
      cells[3].textContent = objeto.stock_actual || '';
      cells[4].textContent = objeto.stock_minimo || '';
      cells[5].textContent = `${objeto.compra__fecha} - $${objeto.compra__total}` || '';
      cells[6].textContent = objeto.categoria__nombre || '';
      cells[7].textContent = objeto.establecimiento__nombre || '';
      // cells[8] es la columna de acciones, no se actualiza
    }
  }
  if (id_tipo=='categoria') {
    if (cells.length >= 2) {
      cells[0].textContent = objeto.nombre || '';
      cells[1].textContent = objeto.descripcion || '';
      // cells[2] es la columna de acciones, no se actualiza
    }
  }
  if (id_tipo=='compra') {
    if (cells.length >= 6) {
      cells[0].textContent = objeto.fecha || '';
      cells[1].textContent = objeto.total || '';
      cells[2].textContent = objeto.iva || '';
      cells[3].textContent = objeto.estado || '';
      cells[4].textContent = objeto.establecimiento__nombre || '';
      cells[5].textContent = objeto.vendedor__nombre || '';
      // cells[6] es la columna de acciones, no se actualiza
    }
  }
  if (id_tipo=='vendedor') {
    if (cells.length >= 4) {
      cells[0].textContent = objeto.nombre || '';
      cells[1].textContent = objeto.telefono || '';
      cells[2].textContent = objeto.email || '';
      cells[3].textContent = objeto.proveedor__nombre || '';
      // cells[4] es la columna de acciones, no se actualiza
    }
  }
  if (id_tipo=='establecimiento') {
    if (cells.length >= 7) {
      cells[0].textContent = objeto.nombre || '';
      cells[1].textContent = objeto.direccion || '';
      cells[2].textContent = objeto.telefono || '';
      cells[3].textContent = objeto.email || '';
      cells[4].textContent = objeto.horario_apertura || '';
      cells[5].textContent = objeto.horario_cierre || '';
      cells[6].textContent = objeto.proveedor__nombre || '';
      // cells[7] es la columna de acciones, no se actualiza
    }
  }
  if (id_tipo=='proveedor') {
    if (cells.length >= 3) {
      cells[0].textContent = objeto.nombre || '';
      cells[1].textContent = objeto.telefono || '';
      cells[2].textContent = objeto.email || '';
      // cells[3] es la columna de acciones, no se actualiza
    }
  }
}

////////////////////////////////
// FUNCIONES DE VALIDACIÓN //
////////////////////////////////

// IMPORTAR FUNCIONES DE VALIDACIÓN
// Si usas módulos ES6, descomenta la siguiente línea y asegúrate de servir los JS como type="module":
// import { validarNombre, validarDescripcion, validarPrecioChileno, validarNumeroDecimal, validarNumeroEntero, validarEmail, validarTelefonoChileno, validarTelefonoNumericoChileno, validarFecha, validarHorario, validarSeleccion, validarDireccionChilena, validarPorcentaje } from './validaciones.js';
// Si no usas módulos, simplemente incluye <script src="/static/js/validaciones.js"></script> antes de este archivo en tu HTML.

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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El producto ha sido actualizado correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar el producto');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar producto:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar el producto: ' + error.message, 'error');
    throw error;
  });
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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('La categoría ha sido actualizada correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar la categoría');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar categoría:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar la categoría: ' + error.message, 'error');
    throw error;
  });
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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('La compra ha sido actualizada correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar la compra');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar compra:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar la compra: ' + error.message, 'error');
    throw error;
  });
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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El vendedor ha sido actualizado correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar el vendedor');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar vendedor:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar el vendedor: ' + error.message, 'error');
    throw error;
  });
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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El establecimiento ha sido actualizado correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar el establecimiento');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar establecimiento:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar el establecimiento: ' + error.message, 'error');
    throw error;
  });
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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El proveedor ha sido actualizado correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar el proveedor');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar el proveedor: ' + error.message, 'error');
    throw error;
  });
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
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El producto ha sido eliminado correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar el producto');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar producto:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el producto: ' + error.message, 'error');
    throw error;
  });
}

// Función para eliminar categoria
function eliminarCategoria(id) {
  return fetch(`${BASE_URL}borrar_categoria/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('La categoría ha sido eliminada correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar la categoría');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar categoría:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar la categoría: ' + error.message, 'error');
    throw error;
  });
}

// Función para eliminar compra
function eliminarCompraVendedor(id) {
  return fetch(`${BASE_URL}borrar_compra_vendedor/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('La compra ha sido eliminada correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar la compra');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar compra:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar la compra: ' + error.message, 'error');
    throw error;
  });
}

// Función para eliminar vendedor
function eliminarVendedor(id) {
  return fetch(`${BASE_URL}borrar_vendedor/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El vendedor ha sido eliminado correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar el vendedor');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar vendedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el vendedor: ' + error.message, 'error');
    throw error;
  });
}

// Función para eliminar establecimiento
function eliminarEstablecimiento(id) {
  return fetch(`${BASE_URL}borrar_establecimiento/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El establecimiento ha sido eliminado correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al eliminar el establecimiento');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar establecimiento:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el establecimiento: ' + error.message, 'error');
    throw error;
  });
}

// Función para eliminar proveedor
function eliminarProveedor(id) {
  return fetch(`${BASE_URL}borrar_proveedor/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('El proveedor ha sido eliminado correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar el proveedor');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el proveedor: ' + error.message, 'error');
    throw error;
  });
}

////////////////////////////////////////////
// FUNCIONES DE MANEJO DE EVENT LISTENERS //
////////////////////////////////////////////

// Creación de productos de event listeners
function manejoCrearProducto(e) {
  e.preventDefault();

  // Obtener y limpiar valores
  const nombre = document.getElementById('producto-nombre').value.trim();
  const descripcion = document.getElementById('producto-descripcion').value.trim();
  const precio = document.getElementById('producto-precio').value.trim();
  const stockActual = document.getElementById('producto-stock-actual').value.trim();
  const stockMinimo = document.getElementById('producto-stock-minimo').value.trim();
  const compraId = document.getElementById('producto-compra').value;
  const categoriaId = document.getElementById('producto-categoria').value;
  const establecimientoId = document.getElementById('producto-establecimiento').value;

  // Validaciones usando la nueva función validarFormulario
  const validaciones = [
    () => validarNombre(nombre, 'nombre del producto', 3, 30, true),
    () => validarDescripcion(descripcion, 'descripción del producto', 5, 50),
    () => validarPrecioChileno(precio, 'precio', 1, 999999999, true),
    () => validarNumeroEntero(stockActual, 'stock actual', 0, 99999, true),
    () => validarNumeroEntero(stockMinimo, 'stock mínimo', 0, 99999, true),
    () => validarSeleccion(categoriaId, 'categoría', true),
    () => validarSeleccion(establecimientoId, 'establecimiento', true)
  ];

  // Validación adicional: stock mínimo no puede ser mayor que stock actual
  if (stockActual && stockMinimo && parseInt(stockMinimo) > parseInt(stockActual)) {
    validaciones.push(() => ['El stock mínimo no puede ser mayor que el stock actual']);
  }

  // Validar formulario y mostrar errores si existen
  if (!validarFormulario(validaciones, 'Errores en el Formulario de Producto')) {
    return;
  }

  const formData = {
    nombre: nombre,
    descripcion: descripcion,
    precio: parseInt(precio), // Cambiar a entero para Chile
    stock_actual: parseInt(stockActual),
    stock_minimo: parseInt(stockMinimo),
    compra_id: compraId || null,
    categoria_id: categoriaId,
    establecimiento_id: establecimientoId
  };

  console.log('🚀 Enviando datos para crear producto...');
  crearProducto(formData)
    .then(data => {
      console.log('✅ Respuesta del servidor:', data);
      if (data.error) throw new Error(data.error);
      mostrarExitoValidacion('Producto creado exitosamente', '¡Producto Creado!');
    })
    .catch(error => {
      console.error('💥 Error al crear producto:', error);
      Swal.fire('Error', 'Error al crear producto: ' + error.message, 'error');
    });
};

// Creación de categorías de event listeners
function manejoCrearCategoria(e) {
  e.preventDefault();
  
  // Obtener y limpiar valores
  const nombre = document.getElementById('categoria-nombre').value.trim();
  const descripcion = document.getElementById('categoria-descripcion').value.trim();
  
  // Validaciones usando la nueva función validarFormulario
  const validaciones = [
    () => validarNombre(nombre, 'nombre de la categoría', 3, 30, false),
    () => validarDescripcion(descripcion, 'descripción de la categoría', 5, 50)
  ];
  
  // Validar formulario y mostrar errores si existen
  if (!validarFormulario(validaciones, 'Errores en el Formulario de Producto')) {
    return;
  }

  const formData = {
    nombre: nombre,
    descripcion: descripcion,
  };
  
  crearCategoria(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      mostrarExitoValidacion('Categoría creada exitosamente', '¡Categoría Creada!');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al crear categoría: ' + error.message, 'error');
    });
};

// Creación de compra de event listeners
function manejoCrearCompraVendedor(e) {
  e.preventDefault();
  
  // Obtener y limpiar valores
  const fecha = document.getElementById('compra-fecha').value;
  const total = document.getElementById('compra-total').value.trim();
  const iva = document.getElementById('compra-iva').value.trim();
  const estado = document.getElementById('compra-estado').value;
  const establecimientoId = document.getElementById('compra-establecimiento').value;
  const vendedorId = document.getElementById('compra-vendedor').value;
  
  // Validaciones usando la nueva función validarFormulario
  const validaciones = [
    () => validarFecha(fecha, 'fecha', true),
    () => validarPrecioChileno(total, 'total', 1, 999999999, true),
    () => validarPorcentaje(iva, 'IVA', 0, 100, true),
    () => validarSeleccion(estado, 'estado', true),
    () => validarSeleccion(establecimientoId, 'establecimiento', true),
    () => validarSeleccion(vendedorId, 'vendedor', true)
  ];
  
  // Validar formulario y mostrar errores si existen
  if (!validarFormulario(validaciones, 'Errores en el Formulario de Compra')) {
    return;
  }
  
  const formData = {
    fecha: fecha,
    total: parseInt(total), // Cambiar a entero para Chile
    iva: parseFloat(iva),
    estado: estado === 'True',
    establecimiento_id: establecimientoId,
    vendedor_id: vendedorId,
  };
  
  crearCompraVendedor(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      mostrarExitoValidacion('Compra creada exitosamente', '¡Compra Creada!');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al crear compra: ' + error.message, 'error');
    });
};

// Creación de vendedor de event listeners
function manejoCrearVendedor(e) {
  e.preventDefault();
  
  // Obtener y limpiar valores
  const nombre = document.getElementById('vendedor-nombre').value.trim();
  const telefono = document.getElementById('vendedor-telefono').value.trim();
  const email = document.getElementById('vendedor-email').value.trim();
  const proveedorId = document.getElementById('vendedor-proveedor').value;
  
  // Validaciones usando la nueva función validarFormulario
  const validaciones = [
    () => validarNombre(nombre, 'nombre del vendedor', 3, 30, false),
    () => validarTelefonoChileno(telefono, 'teléfono del vendedor', true),
    () => validarEmail(email, 'email del vendedor', 50, true),
    () => validarSeleccion(proveedorId, 'proveedor', true)
  ];
  
  // Validar formulario y mostrar errores si existen
  if (!validarFormulario(validaciones, 'Errores en el Formulario de Vendedor')) {
    return;
  }
  
  const formData = {
    nombre: nombre,
    telefono: telefono,
    email: email,
    proveedor_id: proveedorId,
  };
  
  crearVendedor(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      mostrarExitoValidacion('Vendedor creado exitosamente', '¡Vendedor Creado!');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al crear vendedor: ' + error.message, 'error');
    });
};

function manejoCrearEstablecimiento(e) {
  e.preventDefault();
  
  // Obtener y limpiar valores
  const nombre = document.getElementById('establecimiento-nombre').value.trim();
  const direccion = document.getElementById('establecimiento-direccion').value.trim();
  const telefono = document.getElementById('establecimiento-telefono').value.trim();
  const email = document.getElementById('establecimiento-email').value.trim();
  const apertura = document.getElementById('establecimiento-horario_apertura').value;
  const cierre = document.getElementById('establecimiento-horario_cierre').value;
  const proveedorId = document.getElementById('establecimiento-proveedor').value;

  // Validaciones usando la nueva función validarFormulario
  const validaciones = [
    () => validarNombre(nombre, 'nombre del establecimiento', 3, 100, true),
    () => validarDireccionChilena(direccion, 'dirección del establecimiento', 5, 200),
    () => validarTelefonoChileno(telefono, 'teléfono del establecimiento', false),
    () => validarEmail(email, 'email del establecimiento', 100, false),
    () => validarHorario(apertura, 'horario de apertura', 6, 12, true),
    () => validarHorario(cierre, 'horario de cierre', 12, 23, true),
    () => validarSeleccion(proveedorId, 'proveedor', true)
  ];

  // Validación adicional: horario de apertura debe ser anterior al de cierre
  if (apertura && cierre && apertura >= cierre) {
    validaciones.push(() => ['El horario de apertura debe ser anterior al de cierre']);
  }

  // Validar formulario y mostrar errores si existen
  if (!validarFormulario(validaciones, 'Errores en el Formulario de Establecimiento')) {
    return;
  }

  // Preparar datos para enviar
  const formData = {
    nombre: nombre,
    direccion: direccion,
    telefono: telefono || '',
    email: email || '',
    horario_apertura: apertura,
    horario_cierre: cierre,
    proveedor_id: proveedorId
  };

  // Enviar datos
  crearEstablecimiento(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      mostrarExitoValidacion('Establecimiento creado exitosamente', '¡Establecimiento Creado!');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al crear establecimiento: ' + error.message, 'error');
    });
}

function manejoCrearProveedor(e) {
  e.preventDefault();
  
  // Obtener valores del formulario
  const nombre = document.getElementById('proveedor-nombre').value.trim();
  const telefono = document.getElementById('proveedor-telefono').value.trim();
  const email = document.getElementById('proveedor-email').value.trim();
  
  // Validaciones usando la nueva función validarFormulario
  const validaciones = [
    () => validarNombre(nombre, 'nombre del proveedor', 3, 100, false),
    () => validarTelefonoNumericoChileno(telefono, 'teléfono del proveedor', true),
    () => validarEmail(email, 'email del proveedor', 100, true)
  ];
  
  // Validar formulario y mostrar errores si existen
  if (!validarFormulario(validaciones, 'Errores en el Formulario de Proveedor')) {
    return;
  }
  
  // Preparar datos para enviar
  const formData = {
    nombre: nombre,
    telefono: telefono,
    email: email
  };
  
  // Enviar datos
  crearProveedor(formData)
    .then(data => {
      if (data.error) throw new Error(data.error);
      mostrarExitoValidacion('Proveedor creado exitosamente', '¡Proveedor Creado!');
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al crear proveedor: ' + error.message, 'error');
    });
}

////////////////////////////////////
// INICIALIZACIÓN EVENT LISTENERS //
////////////////////////////////////

function inicializarEventListeners() {
  console.log('🎯 Inicializando event listeners...');

  // Event listeners para formularios de creación
  document.getElementById('form-crear-producto').addEventListener('submit', manejoCrearProducto);
  document.getElementById('form-crear-categoria').addEventListener('submit', manejoCrearCategoria);
  document.getElementById('form-crear-compra').addEventListener('submit', manejoCrearCompraVendedor);
  document.getElementById('form-crear-vendedor').addEventListener('submit', manejoCrearVendedor);
  document.getElementById('form-crear-establecimiento').addEventListener('submit', manejoCrearEstablecimiento);
  document.getElementById('form-crear-proveedor').addEventListener('submit', manejoCrearProveedor);

  // Event listeners para botones de eliminación
  document.querySelectorAll('[name="btn-eliminar-producto"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      Swal.fire({
        title: '¿Está seguro?',
        text: '¿Está seguro de que desea eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarProducto(id);
        }
      });
    });
  });

  document.querySelectorAll('[name="btn-eliminar-categoria"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      Swal.fire({
        title: '¿Está seguro?',
        text: '¿Está seguro de que desea eliminar esta categoría?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarCategoria(id);
        }
      });
    });
  });

  document.querySelectorAll('[name="btn-eliminar-compra"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      Swal.fire({
        title: '¿Está seguro?',
        text: '¿Está seguro de que desea eliminar esta compra?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarCompraVendedor(id);
        }
      });
    });
  });

  document.querySelectorAll('[name="btn-eliminar-vendedor"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      Swal.fire({
        title: '¿Está seguro?',
        text: '¿Está seguro de que desea eliminar este vendedor?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarVendedor(id);
        }
      });
    });
  });

  document.querySelectorAll('[name="btn-eliminar-establecimiento"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      Swal.fire({
        title: '¿Está seguro?',
        text: '¿Está seguro de que desea eliminar este establecimiento?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarEstablecimiento(id);
        }
      });
    });
  });

  document.querySelectorAll('[name="btn-eliminar-proveedor"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      console.log('Intentando eliminar proveedor con ID:', id);
      Swal.fire({
        title: '¿Está seguro?',
        text: '¿Está seguro de que desea eliminar este proveedor?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarProveedor(id);
        }
      });
    });
  });

  // Event listeners para botones de edición (modales)
  inicializarBotonesEdicion();

  // Modal Functionality
  inicializarModales();
  
  console.log('✅ Event listeners inicializados correctamente');
}

///////////////////////////
// FUNCIONALIDAD MODALES //
///////////////////////////

function inicializarModales() {
  console.log('🎭 Inicializando modales...');

  // Botones para abrir modales
  const botonesModales = {
    'producto': document.getElementById('abrir-form-producto'),
    'categoria': document.getElementById('abrir-form-categoria'),
    'compra': document.getElementById('abrir-form-compra'),
    'vendedor': document.getElementById('abrir-form-vendedor'),
    'establecimiento': document.getElementById('abrir-form-establecimiento'),
    'proveedor': document.getElementById('abrir-form-proveedor')
  };

  // Event listeners para botones de abrir modal
  Object.entries(botonesModales).forEach(([tipo, boton]) => {
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

  // Event listeners para cerrar modales con click en fondo (modales de creación)
  Object.keys(botonesModales).forEach(tipo => {
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
  const tiposEdicion = ['producto', 'categoria', 'compra', 'vendedor', 'establecimiento', 'proveedor'];
  tiposEdicion.forEach(tipo => {
    const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
    if (modalFondo) {
      modalFondo.addEventListener('click', function(event) {
        if (event.target === modalFondo) {
          console.log(`🖱️ Click en fondo del modal de edición ${tipo}, cerrando...`);
          cerrarModalEdicion(tipo);
        }
      });
    }
  });

  // Event listener para cerrar modales con ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const modalAbierto = document.querySelector('.modal-fondo[style*="flex"]');
      if (modalAbierto) {
        const tipo = modalAbierto.id.replace('modal-fondo-', '');
        if (tipo.includes('editar-')) {
          const tipoEdicion = tipo.replace('editar-', '');
          console.log(`⌨️ Tecla ESC presionada, cerrando modal de edición ${tipoEdicion}...`);
          cerrarModalEdicion(tipoEdicion);
        } else {
          console.log(`⌨️ Tecla ESC presionada, cerrando modal ${tipo}...`);
          cerrarModal(tipo);
        }
      }
    }
  });

  console.log('✅ Modales inicializados correctamente');
}

// Función para abrir modal
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

// Función para cerrar modal
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

///////////////////////////////
// FUNCIONALIDAD MODALES EDICIÓN //
///////////////////////////////

// Función para abrir modal de edición
function abrirModalEdicion(tipo, id, datos) {
  console.log(`🔓 Abriendo modal de edición ${tipo} para ID ${id}...`);
  
  const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
  
  if (modalFondo) {
    // Llenar el formulario con los datos actuales
    llenarFormularioEdicion(tipo, datos);
    
    // Mostrar el modal
    modalFondo.style.display = 'flex';
    
    // Enfocar el primer input
    setTimeout(() => {
      const primerInput = modalFondo.querySelector('input, select');
      if (primerInput) {
        primerInput.focus();
      }
    }, 100);
    
    console.log(`✅ Modal de edición ${tipo} abierto correctamente`);
  } else {
    console.error(`❌ No se encontró el modal de edición para ${tipo}`);
  }
}

// Función para cerrar modal de edición
function cerrarModalEdicion(tipo) {
  console.log(`🔒 Cerrando modal de edición ${tipo}...`);
  
  const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
  
  if (modalFondo) {
    modalFondo.style.display = 'none';
    
    // Limpiar el formulario
    const form = modalFondo.querySelector('form');
    if (form) {
      form.reset();
    }
    
    console.log(`✅ Modal de edición ${tipo} cerrado correctamente`);
  } else {
    console.error(`❌ No se encontró el modal de edición para ${tipo}`);
  }
}

// Función para llenar el formulario de edición con datos
function llenarFormularioEdicion(tipo, datos) {
  const modalFondo = document.getElementById(`modal-fondo-editar-${tipo}`);
  if (!modalFondo) return;
  
  const form = modalFondo.querySelector('form');
  if (!form) return;
  
  // Llenar el campo ID oculto
  const idInput = form.querySelector(`input[name="${tipo}-id"]`);
  if (idInput) {
    idInput.value = datos.id;
  }
  
  // Llenar los campos según el tipo
  switch (tipo) {
    case 'producto':
      form.querySelector('#producto-nombre-editar').value = datos.nombre || '';
      form.querySelector('#producto-descripcion-editar').value = datos.descripcion || '';
      form.querySelector('#producto-precio-editar').value = datos.precio || '';
      form.querySelector('#producto-stock-actual-editar').value = datos.stock_actual || '';
      form.querySelector('#producto-stock-minimo-editar').value = datos.stock_minimo || '';
      form.querySelector('#producto-compra-editar').value = datos.compra_id || '';
      form.querySelector('#producto-categoria-editar').value = datos.categoria_id || '';
      form.querySelector('#producto-establecimiento-editar').value = datos.establecimiento_id || '';
      break;
      
    case 'categoria':
      form.querySelector('#categoria-nombre-editar').value = datos.nombre || '';
      form.querySelector('#categoria-descripcion-editar').value = datos.descripcion || '';
      break;
      
    case 'compra':
      form.querySelector('#compra-fecha-editar').value = datos.fecha || '';
      form.querySelector('#compra-total-editar').value = datos.total || '';
      form.querySelector('#compra-iva-editar').value = datos.iva || '';
      form.querySelector('#compra-estado-editar').value = datos.estado ? 'True' : 'False';
      form.querySelector('#compra-establecimiento-editar').value = datos.establecimiento_id || '';
      form.querySelector('#compra-vendedor-editar').value = datos.vendedor_id || '';
      break;
      
    case 'vendedor':
      form.querySelector('#vendedor-nombre-editar').value = datos.nombre || '';
      form.querySelector('#vendedor-telefono-editar').value = datos.telefono || '';
      form.querySelector('#vendedor-email-editar').value = datos.email || '';
      form.querySelector('#vendedor-proveedor-editar').value = datos.proveedor_id || '';
      break;
      
    case 'establecimiento':
      form.querySelector('#establecimiento-nombre-editar').value = datos.nombre || '';
      form.querySelector('#establecimiento-direccion-editar').value = datos.direccion || '';
      form.querySelector('#establecimiento-telefono-editar').value = datos.telefono || '';
      form.querySelector('#establecimiento-email-editar').value = datos.email || '';
      form.querySelector('#establecimiento-horario_apertura-editar').value = datos.horario_apertura || '';
      form.querySelector('#establecimiento-horario_cierre-editar').value = datos.horario_cierre || '';
      form.querySelector('#establecimiento-proveedor-editar').value = datos.proveedor_id || '';
      break;
      
    case 'proveedor':
      form.querySelector('#proveedor-nombre-editar').value = datos.nombre || '';
      form.querySelector('#proveedor-telefono-editar').value = datos.telefono || '';
      form.querySelector('#proveedor-email-editar').value = datos.email || '';
      break;
  }
}

// Función para manejar el envío de formularios de edición
function manejarFormularioEdicion(tipo, formData) {
  const id = formData[`${tipo}-id`];
  
  // Eliminar el campo ID del formData
  delete formData[`${tipo}-id`];
  
  // Mapear los nombres de campos según el tipo
  let dataToSend = {};
  
  switch (tipo) {
    case 'producto':
      dataToSend = {
        nombre: formData['producto-nombre'],
        descripcion: formData['producto-descripcion'],
        precio: formData['producto-precio'],
        stock_actual: formData['producto-stock-actual'],
        stock_minimo: formData['producto-stock-minimo'],
        compra: formData['producto-compra'],
        categoria: formData['producto-categoria'],
        establecimiento: formData['producto-establecimiento']
      };
      break;
      
    case 'categoria':
      dataToSend = {
        nombre: formData['categoria-nombre'],
        descripcion: formData['categoria-descripcion']
      };
      break;
      
    case 'compra':
      dataToSend = {
        fecha: formData['compra-fecha'],
        total: formData['compra-total'],
        iva: formData['compra-iva'],
        estado: formData['compra-estado'],
        establecimiento: formData['compra-establecimiento'],
        vendedor: formData['compra-vendedor']
      };
      break;
      
    case 'vendedor':
      dataToSend = {
        nombre: formData['vendedor-nombre'],
        telefono: formData['vendedor-telefono'],
        email: formData['vendedor-email'],
        proveedor: formData['vendedor-proveedor']
      };
      break;
      
    case 'establecimiento':
      dataToSend = {
        nombre: formData['establecimiento-nombre'],
        direccion: formData['establecimiento-direccion'],
        telefono: formData['establecimiento-telefono'],
        email: formData['establecimiento-email'],
        horario_apertura: formData['establecimiento-horario_apertura'],
        horario_cierre: formData['establecimiento-horario_cierre'],
        proveedor: formData['establecimiento-proveedor']
      };
      break;
      
    case 'proveedor':
      dataToSend = {
        nombre: formData['proveedor-nombre'],
        telefono: formData['proveedor-telefono'],
        email: formData['proveedor-email']
      };
      break;
  }
  
  // Llamar a la función de actualización correspondiente
  const funcionesActualizacion = {
    'producto': actualizarProducto,
    'categoria': actualizarCategoria,
    'compra': actualizarCompraVendedor,
    'vendedor': actualizarVendedor,
    'establecimiento': actualizarEstablecimiento,
    'proveedor': actualizarProveedor
  };
  
  const funcionActualizacion = funcionesActualizacion[tipo];
  if (funcionActualizacion) {
    funcionActualizacion(id, dataToSend)
      .then(response => {
        if (response.success) {
          console.log(`✅ ${tipo} actualizado correctamente`);
          actualizarVista(response.data, tipo);
          cerrarModalEdicion(tipo);
        } else {
          console.error(`❌ Error al actualizar ${tipo}:`, response.error);
        }
      })
      .catch(error => {
        console.error(`❌ Error en la petición de actualización de ${tipo}:`, error);
      });
  }
}

// Función para obtener datos de una fila de la tabla
function obtenerDatosFila(tipo, id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return null;
  
  const cells = row.cells;
  let datos = { id: id };
  
  switch (tipo) {
    case 'producto':
      if (cells.length >= 8) {
        datos = {
          id: id,
          nombre: cells[0].textContent,
          descripcion: cells[1].textContent,
          precio: cells[2].textContent,
          stock_actual: cells[3].textContent,
          stock_minimo: cells[4].textContent,
          // Los IDs se obtendrán del backend
        };
      }
      break;
      
    case 'categoria':
      if (cells.length >= 2) {
        datos = {
          id: id,
          nombre: cells[0].textContent,
          descripcion: cells[1].textContent
        };
      }
      break;
      
    case 'compra':
      if (cells.length >= 6) {
        datos = {
          id: id,
          fecha: cells[0].textContent,
          total: cells[1].textContent,
          iva: cells[2].textContent,
          estado: cells[3].textContent === 'True',
          // Los IDs se obtendrán del backend
        };
      }
      break;
      
    case 'vendedor':
      if (cells.length >= 4) {
        datos = {
          id: id,
          nombre: cells[0].textContent,
          telefono: cells[1].textContent,
          email: cells[2].textContent,
          // Los IDs se obtendrán del backend
        };
      }
      break;
      
    case 'establecimiento':
      if (cells.length >= 7) {
        datos = {
          id: id,
          nombre: cells[0].textContent,
          direccion: cells[1].textContent,
          telefono: cells[2].textContent,
          email: cells[3].textContent,
          horario_apertura: cells[4].textContent,
          horario_cierre: cells[5].textContent,
          // Los IDs se obtendrán del backend
        };
      }
      break;
      
    case 'proveedor':
      if (cells.length >= 3) {
        datos = {
          id: id,
          nombre: cells[0].textContent,
          telefono: cells[1].textContent,
          email: cells[2].textContent
        };
      }
      break;
  }
  
  return datos;
}

// Función para inicializar los event listeners de los botones de edición
function inicializarBotonesEdicion() {
  console.log('🎯 Inicializando botones de edición...');
  
  // Botones de edición para cada tipo
  const tipos = ['producto', 'categoria', 'compra', 'vendedor', 'establecimiento', 'proveedor'];
  
  tipos.forEach(tipo => {
    const botones = document.querySelectorAll(`[name="btn-editar-${tipo}"]`);
    botones.forEach(boton => {
      boton.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        console.log(`🖱️ Botón editar ${tipo} clickeado para ID ${id}`);
        
        // Obtener datos básicos de la fila
        const datos = obtenerDatosFila(tipo, id);
        if (datos) {
          abrirModalEdicion(tipo, id, datos);
        } else {
          console.error(`❌ No se pudieron obtener los datos para ${tipo} con ID ${id}`);
        }
      });
    });
  });
  
  // Event listeners para formularios de edición
  tipos.forEach(tipo => {
    const form = document.getElementById(`form-editar-${tipo}`);
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log(`📝 Formulario de edición ${tipo} enviado`);
        
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        
        manejarFormularioEdicion(tipo, data);
      });
    }
  });
  
  console.log('✅ Botones de edición inicializados correctamente');
}
