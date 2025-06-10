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
  
  console.log('🔧 Iniciando creación de producto...');
  
  const nombreElement = document.getElementById('producto-nombre');
  const descripcionElement = document.getElementById('producto-descripcion');
  const precioElement = document.getElementById('producto-precio');
  const stockActualElement = document.getElementById('producto-stock-actual');
  const stockMinimoElement = document.getElementById('producto-stock-minimo');
  const compraElement = document.getElementById('producto-compra');
  const categoriaElement = document.getElementById('producto-categoria');
  const establecimientoElement = document.getElementById('producto-establecimiento');
  
  console.log('🔍 Elementos encontrados:', {
    nombre: nombreElement ? 'SÍ' : 'NO',
    descripcion: descripcionElement ? 'SÍ' : 'NO',
    precio: precioElement ? 'SÍ' : 'NO',
    stockActual: stockActualElement ? 'SÍ' : 'NO',
    stockMinimo: stockMinimoElement ? 'SÍ' : 'NO',
    compra: compraElement ? 'SÍ' : 'NO',
    categoria: categoriaElement ? 'SÍ' : 'NO',
    establecimiento: establecimientoElement ? 'SÍ' : 'NO'
  });

  const formData = {
    nombre: nombreElement ? nombreElement.value : '',
    descripcion: descripcionElement ? descripcionElement.value : '',
    precio: precioElement ? precioElement.value : '',
    stock_actual: stockActualElement ? stockActualElement.value : '',
    stock_minimo: stockMinimoElement ? stockMinimoElement.value : '',
    compra_id: compraElement ? compraElement.value : '',
    categoria_id: categoriaElement ? categoriaElement.value : '',
    establecimiento_id: establecimientoElement ? establecimientoElement.value : ''
  };

  console.log('📋 Datos del formulario:', formData);
  
  // Verificar opciones disponibles en los selects
  if (categoriaElement) {
    const opcionesCategoria = categoriaElement.querySelectorAll('option');
    console.log('🏷️ Opciones de categoría disponibles:', opcionesCategoria.length - 1); // -1 por la opción por defecto
    opcionesCategoria.forEach((opcion, index) => {
      if (opcion.value) { // Solo las opciones con valor (no la opción por defecto)
        console.log(`  - Categoría ${index}: ID=${opcion.value}, Nombre="${opcion.textContent}"`);
      }
    });
  }
  
  if (compraElement) {
    const opcionesCompra = compraElement.querySelectorAll('option');
    console.log('🛒 Opciones de compra disponibles:', opcionesCompra.length - 1);
    opcionesCompra.forEach((opcion, index) => {
      if (opcion.value) {
        console.log(`  - Compra ${index}: ID=${opcion.value}, Fecha="${opcion.textContent}"`);
      }
    });
  }
  
  if (establecimientoElement) {
    const opcionesEstablecimiento = establecimientoElement.querySelectorAll('option');
    console.log('🏢 Opciones de establecimiento disponibles:', opcionesEstablecimiento.length - 1);
    opcionesEstablecimiento.forEach((opcion, index) => {
      if (opcion.value) {
        console.log(`  - Establecimiento ${index}: ID=${opcion.value}, Nombre="${opcion.textContent}"`);
      }
    });
  }
  
  // Validar campos requeridos
  const camposVacios = Object.entries(formData).filter(([key, value]) => !value || value === '');
  if (camposVacios.length > 0) {
    console.warn('⚠️ Campos vacíos detectados:', camposVacios.map(([key]) => key));
    console.warn('⚠️ Valores actuales:', formData);
    alert('Por favor, complete todos los campos incluyendo categoría, compra y establecimiento');
    return;
  }

  console.log('🚀 Enviando datos para crear producto...');
  crearProducto(formData)
    .then(data => {
      console.log('✅ Respuesta del servidor:', data);
      if (data.error) throw new Error(data.error);
      alert('Producto creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('💥 Error al crear producto:', error);
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
      if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        eliminarProducto(id);
      }
    });
  });

  document.querySelectorAll('[name="btn-eliminar-categoria"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
        eliminarCategoria(id);
      }
    });
  });

  document.querySelectorAll('[name="btn-eliminar-compra"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Está seguro de que desea eliminar esta compra?')) {
        eliminarCompraVendedor(id);
      }
    });
  });

  document.querySelectorAll('[name="btn-eliminar-vendedor"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Está seguro de que desea eliminar este vendedor?')) {
        eliminarVendedor(id);
      }
    });
  });

  document.querySelectorAll('[name="btn-eliminar-establecimiento"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Está seguro de que desea eliminar este establecimiento?')) {
        eliminarEstablecimiento(id);
      }
    });
  });

  document.querySelectorAll('[name="btn-eliminar-proveedor"]').forEach(boton => {
    boton.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
        eliminarProveedor(id);
      }
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