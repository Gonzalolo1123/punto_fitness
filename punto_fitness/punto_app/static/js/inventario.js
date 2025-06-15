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

// Función para actualizar vista de datos
function actualizarVista(objeto, id_tipo) {
  const row = document.querySelector(`tr[data-id="${objeto.id}"]`);
  if (!row) {
    console.warn(`No se encontró la fila con data-id="${objeto.id}"`);
    return;
  }
  
  const cells = row.cells;
  
  if (id_tipo=='producto') {
    if (cells.length >= 9) {
      cells[0].textContent = objeto.nombre || '';
      cells[1].textContent = objeto.descripcion || '';
      cells[2].textContent = objeto.precio || '';
      cells[3].textContent = objeto.stock_actual || '';
      cells[4].textContent = objeto.stock_minimo || '';
      cells[5].textContent = objeto.categoria__nombre || '';
      cells[6].textContent = objeto.establecimiento__nombre || '';
      // Actualizar la imagen
      const imgElement = cells[7].querySelector('img');
      if (imgElement && objeto.imagen) {
        imgElement.src = `/static/${objeto.imagen}`;
        imgElement.alt = objeto.nombre;
      }
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
  }).then(response => {
    if (response.ok) {
      Swal.fire({
        title: '¡Actualizacion Exitosa!',
        html: `<p style="color: #555;">Tu Actualizacion ha sido registrada correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
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
      Swal.fire({
        title: '¡Actualizacion Exitosa!',
        html: `<p style="color: #555;">Tu Actualizacion ha sido registrada correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
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
      Swal.fire({
        title: '¡Actualizacion Exitosa!',
        html: `<p style="color: #555;">Tu Actualizacion ha sido registrada correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
  });}

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
      Swal.fire({
        title: '¡Actualizacion Exitosa!',
        html: `<p style="color: #555;">Tu Actualizacion ha sido registrada correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
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
      Swal.fire({
        title: '¡Actualizacion Exitosa!',
        html: `<p style="color: #555;">Tu Actualizacion ha sido registrada correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
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
      return response.json().then(data => {
        if (data.success) {
          Swal.fire({
            title: '¡Actualizacion Exitosa!',
            html: `<p style="color: #555;">Tu Actualizacion ha sido registrada correctamente.</p>`,
            icon: 'success',
            confirmButtonColor: '#28a745'
          }).then(() => {
            // Recarga la página cuando se cierra el SweetAlert
            location.reload();
          });
          return data.data; // Retornamos los datos del proveedor
        } else {
          throw new Error(data.error || 'Error al actualizar proveedor');
        }
      });
    } else {
      throw new Error('Error en la respuesta del servidor');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
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
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">El producto ha sido eliminado correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar el producto');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el procduto: ' + error.message, 'error');
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
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">La categoria ha sido eliminado correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar categoria');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el proveedor: ' + error.message, 'error');
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
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">La compra ha sido eliminado correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar la compra');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar la compra: ' + error.message, 'error');
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
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">El vendedor ha sido eliminado correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar el vendedor');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el vendedor: ' + error.message, 'error');
  });}

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
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">Tu Eliminación ha sido registrada correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
    }
  })
  .catch(error => {
    console.error(error);
    Swal.fire('Error', 'Ocurrió un error de red.', 'error');
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
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">El proveedor ha sido eliminado correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar proveedor');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar el proveedor: ' + error.message, 'error');
  });
}

////////////////////////////////////////////
// FUNCIONES DE MANEJO DE EVENT LISTENERS //
////////////////////////////////////////////

// Función para manejar la creación de producto
function manejoCrearProducto(e) {
  e.preventDefault();
  
  // Verificar si hay categorías disponibles
  const selectCategoria = document.getElementById('producto-categoria');
  if (selectCategoria.options.length <= 1) { // Solo tiene la opción "Seleccione"
    Swal.fire({
      title: 'No hay categorías disponibles',
      text: '¿Deseas crear una nueva categoría?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear categoría',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        // Marcar que venimos del flujo de producto
        sessionStorage.setItem('creandoCategoriaDesdeProducto', 'true');
        // Cerrar el modal de producto
        cerrarModal('producto');
        // Abrir el modal de categoría
        abrirModal('categoria');
      }
    });
    return;
  }

  const formData = {
    nombre: document.getElementById('producto-nombre').value,
    descripcion: document.getElementById('producto-descripcion').value,
    precio: document.getElementById('producto-precio').value,
    stock_actual: document.getElementById('producto-stock-actual').value,
    stock_minimo: document.getElementById('producto-stock-minimo').value,
    compra_id: document.getElementById('producto-compra').value || null,
    categoria_id: document.getElementById('producto-categoria').value,
    establecimiento_id: document.getElementById('producto-establecimiento').value,
    imagen: document.getElementById('producto-imagen').value
  };

  // Mostrar un indicador de carga
  Swal.fire({
    title: 'Creando producto...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  crearProducto(formData)
    .then(response => {
      if (!response.error) {
        Swal.fire({
          title: '¡Producto Creado!',
          html: `<p style="color: #555;">El producto ha sido creado correctamente.</p>`,
          icon: 'success',
          confirmButtonColor: '#28a745'
        }).then(() => {
          // Asegurarnos de que la petición se haya completado antes de recargar
          setTimeout(() => {
            location.reload();
          }, 100);
        });
      } else {
        Swal.fire('Error', response.error || 'Hubo un problema al crear el producto.', 'error');
      }
    })
    .catch(error => {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error de red.', 'error');
    });
}

// Función para manejar la creación de categoría
function manejoCrearCategoria(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = {
    nombre: formData.get('categoria-nombre'),
    descripcion: formData.get('categoria-descripcion')
  };

  crearCategoria(data)
    .then(response => {
      // Si la respuesta es exitosa (no hay error)
      if (!response.error) {
        Swal.fire({
          title: '¡Categoría Creada!',
          html: `<p style="color: #555;">La categoría ha sido creada correctamente.</p>`,
          icon: 'success',
          confirmButtonColor: '#28a745'
        }).then(() => {
          // Cerrar el modal de categoría
          cerrarModal('categoria');
          
          // Verificar de dónde venimos
          const desdeProducto = sessionStorage.getItem('creandoCategoriaDesdeProducto');
          const desdeProductoEditar = sessionStorage.getItem('creandoCategoriaDesdeProductoEditar');
          
          if (desdeProducto === 'true') {
            // Limpiar el sessionStorage
            sessionStorage.removeItem('creandoCategoriaDesdeProducto');
            
            // Abrir el modal de producto
            setTimeout(() => {
              const modalProducto = document.getElementById('modal-fondo-producto');
              const botonProducto = document.getElementById('abrir-form-producto');
              if (modalProducto && botonProducto) {
                modalProducto.style.display = 'flex';
                botonProducto.setAttribute('data-estado', 'abierto');
                botonProducto.textContent = '-';
                
                // Preseleccionar la categoría recién creada
                const selectCategoria = document.getElementById('producto-categoria');
                if (selectCategoria) {
                  // Agregar la nueva categoría al select
                  const option = document.createElement('option');
                  option.value = response.id;
                  option.text = response.nombre;
                  selectCategoria.appendChild(option);
                  // Seleccionar la nueva categoría
                  selectCategoria.value = response.id;
                }
              }
            }, 100);
          } else if (desdeProductoEditar === 'true') {
            // Limpiar el sessionStorage
            sessionStorage.removeItem('creandoCategoriaDesdeProductoEditar');
            
            // Recuperar los datos del producto
            const datosProducto = JSON.parse(sessionStorage.getItem('datosProductoEdicion'));
            sessionStorage.removeItem('datosProductoEdicion');
            
            // Abrir el modal de edición de producto
            setTimeout(() => {
              const modalProductoEditar = document.getElementById('modal-fondo-editar-producto');
              if (modalProductoEditar) {
                modalProductoEditar.style.display = 'flex';
                
                // Restaurar los datos del producto
                const formProducto = document.getElementById('form-editar-producto');
                if (formProducto && datosProducto) {
                  formProducto.querySelector('#producto-nombre-editar').value = datosProducto.nombre;
                  formProducto.querySelector('#producto-descripcion-editar').value = datosProducto.descripcion;
                  formProducto.querySelector('#producto-precio-editar').value = datosProducto.precio;
                  formProducto.querySelector('#producto-stock-actual-editar').value = datosProducto.stock_actual;
                  formProducto.querySelector('#producto-stock-minimo-editar').value = datosProducto.stock_minimo;
                  formProducto.querySelector('#producto-compra-editar').value = datosProducto.compra;
                  formProducto.querySelector('#producto-establecimiento-editar').value = datosProducto.establecimiento;
                  formProducto.querySelector('#producto-imagen-editar').value = datosProducto.imagen;
                  
                  // Actualizar la vista previa de la imagen si existe
                  const vistaPrevia = document.getElementById('vista-previa-imagen-editar');
                  const imgPrevia = vistaPrevia.querySelector('img');
                  if (imgPrevia && datosProducto.imagen) {
                    imgPrevia.src = `/static/${datosProducto.imagen}`;
                    vistaPrevia.style.display = 'block';
                  }
                }
                
                // Preseleccionar la categoría recién creada
                const selectCategoria = document.getElementById('producto-categoria-editar');
                if (selectCategoria) {
                  // Agregar la nueva categoría al select
                  const option = document.createElement('option');
                  option.value = response.id;
                  option.text = response.nombre;
                  selectCategoria.appendChild(option);
                  // Seleccionar la nueva categoría
                  selectCategoria.value = response.id;
                }
              }
            }, 100);
          } else {
            // Si no venimos de ningún formulario, recargar la página
            location.reload();
          }
        });
      } else {
        Swal.fire('Error', response.error, 'error');
      }
    })
    .catch(error => {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al crear la categoría.', 'error');
    });
}

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
  
  // Validaciones
  const errores = [];
  
  // 1. Validar fecha (obligatoria, formato)
  if (!fecha) {
    errores.push('La fecha es obligatoria');
  } else {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    if (fechaObj > hoy) {
      errores.push('La fecha no puede ser futura');
    }
  }
  
  // 2. Validar total (obligatorio, numérico, positivo)
  if (!total) {
    errores.push('El total es obligatorio');
  } else if (isNaN(total) || parseFloat(total) <= 0) {
    errores.push('El total debe ser un número positivo');
  } else if (parseFloat(total) > 999999999) {
    errores.push('El total no puede exceder 999,999,999');
  }
  
  // 3. Validar IVA (obligatorio, numérico, no negativo)
  if (!iva) {
    errores.push('El IVA es obligatorio');
  } else if (isNaN(iva) || parseFloat(iva) < 0) {
    errores.push('El IVA debe ser un número no negativo');
  } else if (parseFloat(iva) > 100) {
    errores.push('El IVA no puede exceder el 100%');
  }
  
  // 4. Validar estado (obligatorio)
  if (!estado) {
    errores.push('Debe seleccionar un estado');
  }
  
  // 5. Validar establecimiento (obligatorio)
  if (!establecimientoId || establecimientoId === "") {
    errores.push('Debe seleccionar un establecimiento');
  }
  
  // 6. Validar vendedor (obligatorio)
  if (!vendedorId || vendedorId === "") {
    errores.push('Debe seleccionar un vendedor');
  }
  
  // Mostrar errores si existen
  if (errores.length > 0) {
    alert('Errores en el formulario:\n\n' + errores.join('\n'));
    return;
  }
  
  const formData = {
    fecha: fecha,
    total: parseFloat(total),
    iva: parseFloat(iva),
    estado: estado === 'True',
    establecimiento_id: establecimientoId,
    vendedor_id: vendedorId,
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
  
  // Obtener y limpiar valores
  const nombre = document.getElementById('vendedor-nombre').value.trim();
  const telefono = document.getElementById('vendedor-telefono').value.trim();
  const email = document.getElementById('vendedor-email').value.trim();
  const proveedorId = document.getElementById('vendedor-proveedor').value;
  
  // Validaciones
  const errores = [];
  
  // 1. Validar nombre (obligatorio, longitud, caracteres)
  if (!nombre) {
    errores.push('El nombre es obligatorio');
  } else if (nombre.length > 30) {
    errores.push('El nombre no puede exceder los 30 caracteres');
  } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]/.test(nombre)) {
    errores.push('El nombre solo puede contener letras, espacios y guiones');
  }
  
  // 2. Validar teléfono (obligatorio, formato)
  if (!telefono) {
    errores.push('El teléfono es obligatorio');
  } else if (!/^[\d\s\+\-\(\)]{7,20}$/.test(telefono)) {
    errores.push('El teléfono debe tener entre 7 y 20 dígitos y puede incluir +, -, (, )');
  }
  
  // 3. Validar email (obligatorio, formato)
  if (!email) {
    errores.push('El email es obligatorio');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errores.push('El email no tiene un formato válido');
    } else if (email.length > 30) {
      errores.push('El email no puede exceder los 30 caracteres');
    }
  }
  
  // 4. Validar proveedor (obligatorio)
  if (!proveedorId || proveedorId === "") {
    errores.push('Debe seleccionar un proveedor');
  }
  
  // Mostrar errores si existen
  if (errores.length > 0) {
    alert('Errores en el formulario:\n\n' + errores.join('\n'));
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
      alert('Vendedor creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear vendedor: ' + error.message);
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

  // Validaciones
  const errores = [];
  
  // 1. Validar nombre (obligatorio, longitud, caracteres)
  if (!nombre) {
    errores.push('El nombre es obligatorio');
  } else if (nombre.length > 100) {
    errores.push('El nombre no puede exceder los 100 caracteres');
  } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.,]/.test(nombre)) {
    errores.push('El nombre contiene caracteres no permitidos');
  }

  // 2. Validar dirección (obligatoria, longitud)
  if (!direccion) {
    errores.push('La dirección es obligatoria');
  } else if (direccion.length > 200) {
    errores.push('La dirección no puede exceder los 200 caracteres');
  }

  // 3. Validar teléfono (formato opcional)
  if (telefono && !/^[\d\s\+\-\(\)]{7,20}$/.test(telefono)) {
    errores.push('El teléfono debe tener entre 7 y 20 dígitos y puede incluir +, -, (, )');
  }

  // 4. Validar email (formato)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errores.push('El email no tiene un formato válido');
    } else if (email.length > 100) {
      errores.push('El email no puede exceder los 100 caracteres');
    }
  }

  // 5. Validar horarios
  if (!apertura) {
    errores.push('El horario de apertura es obligatorio');
  }
  if (!cierre) {
    errores.push('El horario de cierre es obligatorio');
  }
  if (apertura && cierre && apertura >= cierre) {
    errores.push('El horario de apertura debe ser anterior al de cierre');
  }

  // 6. Validar proveedor (obligatorio)
  if (!proveedorId || proveedorId === "0") {
    errores.push('Debe seleccionar un proveedor válido');
  }

  // Mostrar errores si existen
  if (errores.length > 0) {
    alert('Errores en el formulario:\n\n' + errores.join('\n'));
    return;
  }

  // Preparar datos para enviar
  const formData = {
    nombre: nombre,
    direccion: direccion,
    telefono: telefono,
    email: email,
    horario_apertura: apertura,
    horario_cierre: cierre,
    proveedor_id: proveedorId
  };

  // Enviar datos
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
}

function manejoCrearProveedor(e) {
  e.preventDefault();
  
  // Obtener valores del formulario
  const nombre = document.getElementById('proveedor-nombre').value.trim();
  const telefono = document.getElementById('proveedor-telefono').value.trim();
  const email = document.getElementById('proveedor-email').value.trim();
  
  // Validaciones
  const errores = [];
  
  // 1. Validar nombre
  if (!nombre) {
    errores.push('El nombre es obligatorio');
  } else if (nombre.length > 100) {
    errores.push('El nombre no puede exceder los 100 caracteres');
  } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]/.test(nombre)) {
    errores.push('El nombre solo puede contener letras, espacios y guiones');
  }
  
  // 2. Validar teléfono
  if (telefono) {
    if (!/^[\d\s\+\-\(\)]{7,20}$/.test(telefono)) {
      errores.push('El teléfono debe tener entre 7 y 20 dígitos y puede incluir +, -, (, )');
    }
  }
  
  // 3. Validar email
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errores.push('El email no tiene un formato válido');
    } else if (email.length > 100) {
      errores.push('El email no puede exceder los 100 caracteres');
    }
  } else {
    errores.push('El email es obligatorio');
  }
  
  // Mostrar errores si existen
  if (errores.length > 0) {
    alert('Errores en el formulario:\n\n' + errores.join('\n'));
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
      alert('Proveedor creado exitosamente');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear proveedor: ' + error.message);
    });
}
////////////////////////////////////
// INICIALIZACIÓN EVENT LISTENERS //
////////////////////////////////////

function inicializarEventListeners() {
  console.log('🎯 Inicializando event listeners...');

  // Verificar si hay una categoría recién creada y si venimos del flujo de producto
  const categoriaRecienCreada = sessionStorage.getItem('categoriaRecienCreada');
  const creandoDesdeProducto = sessionStorage.getItem('creandoCategoriaDesdeProducto');
  
  if (categoriaRecienCreada && creandoDesdeProducto === 'true') {
    // Limpiar el sessionStorage
    sessionStorage.removeItem('categoriaRecienCreada');
    sessionStorage.removeItem('creandoCategoriaDesdeProducto');
    
    // Abrir el modal de producto
    setTimeout(() => {
      const modalProducto = document.getElementById('modal-fondo-producto');
      const botonProducto = document.getElementById('abrir-form-producto');
      if (modalProducto && botonProducto) {
        modalProducto.style.display = 'flex';
        botonProducto.setAttribute('data-estado', 'abierto');
        botonProducto.textContent = '-';
        
        // Preseleccionar la categoría recién creada
        const selectCategoria = document.getElementById('producto-categoria');
        if (selectCategoria) {
          selectCategoria.value = categoriaRecienCreada;
        }
      }
    }, 100);
  }

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
      console.log('Intentando eliminar proveedor con ID:', id);
      if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
        eliminarProveedor(id);
      }
    });
  });
  
  // Inicializar selector de imágenes
  inicializarSelectorImagenes();

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
          cerrarModal(tipo);
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
    // Si es el modal de producto, verificar si hay categorías
    if (tipo === 'producto') {
      const selectCategoria = document.getElementById('producto-categoria');
      if (selectCategoria && selectCategoria.options.length <= 1) { // Solo tiene la opción "Seleccione"
        Swal.fire({
          title: 'No hay categorías disponibles',
          text: '¿Deseas crear una nueva categoría?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, crear categoría',
          cancelButtonText: 'No, cancelar',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#dc3545'
        }).then((result) => {
          if (result.isConfirmed) {
            // Marcar que venimos del flujo de producto
            sessionStorage.setItem('creandoCategoriaDesdeProducto', 'true');
            // Cerrar el modal de producto
            cerrarModal('producto');
            // Abrir el modal de categoría
            abrirModal('categoria');
          }
        });
        return;
      }
    }

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
    
    // Si es el modal de producto, recargar la página solo si no estamos creando una categoría
    if (tipo === 'producto') {
      const creandoCategoria = sessionStorage.getItem('creandoCategoriaDesdeProducto');
      if (!creandoCategoria) {
        location.reload();
      }
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
    
    // Si es el modal de edición de producto, recargar la página solo si no estamos creando una categoría
    if (tipo === 'producto') {
      const creandoCategoria = sessionStorage.getItem('creandoCategoriaDesdeProductoEditar');
      if (!creandoCategoria) {
        location.reload();
      }
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
      // Actualizar la imagen
      const inputImagen = form.querySelector('#producto-imagen-editar');
      const vistaPrevia = form.querySelector('#vista-previa-imagen-editar');
      const imgPrevia = vistaPrevia.querySelector('img');
      if (inputImagen && datos.imagen) {
        inputImagen.value = datos.imagen;
        if (imgPrevia) {
          imgPrevia.src = `/static/${datos.imagen}`;
          vistaPrevia.style.display = 'block';
        }
      }
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
      if (form.querySelector('#proveedor-nombre-editar')) {
          form.querySelector('#proveedor-nombre-editar').value = datos.nombre || '';
      }
      if (form.querySelector('#proveedor-telefono-editar')) {
          form.querySelector('#proveedor-telefono-editar').value = datos.telefono || '';
      }
      if (form.querySelector('#proveedor-email-editar')) {
          form.querySelector('#proveedor-email-editar').value = datos.email || '';
      }
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
        categoria_id: formData['producto-categoria'],
        establecimiento_id: formData['producto-establecimiento'],
        imagen: formData['producto-imagen']
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
        establecimiento_id: formData['compra-establecimiento'],
        vendedor_id: formData['compra-vendedor']
      };
      break;
      
    case 'vendedor':
      dataToSend = {
        nombre: formData['vendedor-nombre'],
        telefono: formData['vendedor-telefono'],
        email: formData['vendedor-email'],
        proveedor_id: formData['vendedor-proveedor']
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
        proveedor_id: formData['establecimiento-proveedor']
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
        if (!response.error) {
          console.log(`✅ ${tipo} actualizado correctamente`);
          actualizarVista(response, tipo);
          cerrarModalEdicion(tipo);
        } else {
          console.error(`❌ Error al actualizar ${tipo}:`, response.error);
          Swal.fire('Error', response.error || `Hubo un problema al actualizar el ${tipo}.`, 'error');
        }
      })
      .catch(error => {
        console.error(`❌ Error en la petición de actualización de ${tipo}:`, error);
        Swal.fire('Error', 'Ocurrió un error de red.', 'error');
      });
  }
}

// Función para obtener datos de una fila de la tabla
function obtenerDatosFila(tipo, id) {
  console.log('Obteniendo datos para:', tipo, 'con ID:', id);
  
  // Mapeo de tipos a nombres de sección
  const secciones = {
    'producto': 'productos',
    'categoria': 'categorias',
    'compra': 'compras',
    'vendedor': 'vendedores',
    'establecimiento': 'establecimientos',
    'proveedor': 'proveedores'
  };
  
  // Verificar que estamos en la sección correcta
  const nombreSeccion = secciones[tipo];
  if (!nombreSeccion) {
    console.error(`Tipo de sección no válido: ${tipo}`);
    return null;
  }
  
  const seccion = document.querySelector(`section[name="seccion-${nombreSeccion}"]`);
  if (!seccion) {
    console.error(`No se encontró la sección de ${nombreSeccion}`);
    return null;
  }
  
  // Buscar la fila dentro de la sección correcta
  const row = seccion.querySelector(`tr[data-id="${id}"]`);
  if (!row) {
    console.error(`No se encontró la fila con ID ${id} en la sección de ${nombreSeccion}`);
    return null;
  }
  
  console.log('Fila encontrada:', row);
  const cells = row.cells;
  console.log('Celdas encontradas:', cells.length);
  
  let datos = null;
  
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
          proveedor_id: row.getAttribute('data-proveedor-id') || ''
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
          proveedor_id: row.getAttribute('data-proveedor-id') || ''
        };
      }
      break;
      
    case 'proveedor':
      if (cells.length >= 3) {
        datos = {
          id: id,
          nombre: cells[0].textContent.trim(),
          telefono: cells[1].textContent.trim(),
          email: cells[2].textContent.trim()
        };
        console.log('Datos del proveedor obtenidos:', datos);
        
        // Validación adicional
        if (!datos.nombre || !datos.telefono || !datos.email) {
          console.error('Datos incompletos del proveedor:', datos);
          return null;
        }
        
        // Validación de formato
        if (!/^\d{9,11}$/.test(datos.telefono)) {
          console.error('Formato de teléfono inválido:', datos.telefono);
          return null;
        }
        
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(datos.email)) {
          console.error('Formato de email inválido:', datos.email);
          return null;
        }
      } else {
        console.error('Número insuficiente de celdas para proveedor:', cells.length);
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

///////////////////////////
// SELECCIÓN DE IMÁGENES //
///////////////////////////

// Función para inicializar el selector de imágenes
function inicializarSelectorImagenes() {
  // Elementos del formulario de creación
  const btnSeleccionarImagen = document.getElementById('btn-seleccionar-imagen');
  const btnSubirImagen = document.getElementById('btn-subir-imagen');
  const inputSubirImagen = document.getElementById('input-subir-imagen');
  const modalImagenes = document.getElementById('modal-imagenes');
  const galeriaImagenes = document.getElementById('galeria-imagenes');
  const inputImagen = document.getElementById('producto-imagen');
  const vistaPrevia = document.getElementById('vista-previa-imagen');
  const cerrarModal = document.querySelector('.cerrar-modal-imagenes');

  // Elementos del formulario de edición
  const btnSeleccionarImagenEditar = document.getElementById('btn-seleccionar-imagen-editar');
  const inputImagenEditar = document.getElementById('producto-imagen-editar');
  const vistaPreviaEditar = document.getElementById('vista-previa-imagen-editar');

  // Cargar las imágenes disponibles
  cargarImagenesDisponibles();

  // Función para manejar la selección de imagen
  function manejarSeleccionImagen(input, vistaPrevia) {
    return (imagen) => {
      input.value = imagen;
      const imgPrevia = vistaPrevia.querySelector('img');
      if (imgPrevia) {
        imgPrevia.src = `/static/${imagen}`;
        vistaPrevia.style.display = 'block';
      }
      modalImagenes.style.display = 'none';
    };
  }

  // Event listener para el botón de seleccionar imagen (creación)
  if (btnSeleccionarImagen) {
    btnSeleccionarImagen.addEventListener('click', () => {
      modalImagenes.style.display = 'block';
      modalImagenes.dataset.target = 'creacion';
    });
  }

  // Event listener para el botón de seleccionar imagen (edición)
  if (btnSeleccionarImagenEditar) {
    btnSeleccionarImagenEditar.addEventListener('click', () => {
      modalImagenes.style.display = 'block';
      modalImagenes.dataset.target = 'edicion';
    });
  }

  // Event listener para el botón de subir imagen
  if (btnSubirImagen) {
    btnSubirImagen.addEventListener('click', () => {
      inputSubirImagen.click();
    });
  }

  // Event listener para cuando se selecciona un archivo
  if (inputSubirImagen) {
    inputSubirImagen.addEventListener('change', (e) => {
      const archivo = e.target.files[0];
      if (archivo) {
        const formData = new FormData();
        formData.append('imagen', archivo);

        fetch('/subir_imagen_producto/', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Actualizar el input y la vista previa según el formulario activo
            const target = modalImagenes.dataset.target;
            if (target === 'creacion' && inputImagen) {
              inputImagen.value = data.ruta;
              actualizarVistaPrevia();
            } else if (target === 'edicion' && inputImagenEditar) {
              inputImagenEditar.value = data.ruta;
              const imgPrevia = vistaPreviaEditar.querySelector('img');
              if (imgPrevia) {
                imgPrevia.src = `/static/${data.ruta}`;
                vistaPreviaEditar.style.display = 'block';
              }
            }
            
            // Recargar la galería de imágenes
            cargarImagenesDisponibles();
            
            // Cerrar el modal
            modalImagenes.style.display = 'none';
          } else {
            alert('Error al subir la imagen: ' + data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al subir la imagen');
        });
      }
    });
  }

  // Event listener para cerrar el modal
  if (cerrarModal) {
    cerrarModal.addEventListener('click', () => {
      modalImagenes.style.display = 'none';
    });
  }

  // Cerrar modal al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modalImagenes) {
      modalImagenes.style.display = 'none';
    }
  });

  // Event listeners para los inputs de imagen
  if (inputImagen) {
    inputImagen.addEventListener('change', actualizarVistaPrevia);
  }
  if (inputImagenEditar) {
    inputImagenEditar.addEventListener('change', () => {
      const imgPrevia = vistaPreviaEditar.querySelector('img');
      if (imgPrevia && inputImagenEditar.value) {
        imgPrevia.src = `/static/${inputImagenEditar.value}`;
        vistaPreviaEditar.style.display = 'block';
      } else {
        vistaPreviaEditar.style.display = 'none';
      }
    });
  }
}

// Función para cargar las imágenes disponibles
function cargarImagenesDisponibles() {
  const galeriaImagenes = document.getElementById('galeria-imagenes');
  const modalImagenes = document.getElementById('modal-imagenes');

  if (!galeriaImagenes) return;

  // Hacer una petición al servidor para obtener la lista de imágenes
  fetch('/obtener_imagenes_productos/')
    .then(response => response.json())
    .then(data => {
      galeriaImagenes.innerHTML = '';
      data.imagenes.forEach(imagen => {
        const div = document.createElement('div');
        div.className = 'imagen-item';
        div.innerHTML = `
          <img src="/static/${imagen}" alt="${imagen.split('/').pop()}" data-ruta="${imagen}">
        `;
        
        // Event listener para seleccionar imagen
        div.addEventListener('click', () => {
          const target = modalImagenes.dataset.target;
          if (target === 'creacion') {
            const inputImagen = document.getElementById('producto-imagen');
            const vistaPrevia = document.getElementById('vista-previa-imagen');
            if (inputImagen && vistaPrevia) {
              inputImagen.value = imagen;
              const imgPrevia = vistaPrevia.querySelector('img');
              if (imgPrevia) {
                imgPrevia.src = `/static/${imagen}`;
                vistaPrevia.style.display = 'block';
              }
            }
          } else if (target === 'edicion') {
            const inputImagen = document.getElementById('producto-imagen-editar');
            const vistaPrevia = document.getElementById('vista-previa-imagen-editar');
            if (inputImagen && vistaPrevia) {
              inputImagen.value = imagen;
              const imgPrevia = vistaPrevia.querySelector('img');
              if (imgPrevia) {
                imgPrevia.src = `/static/${imagen}`;
                vistaPrevia.style.display = 'block';
              }
            }
          }
          modalImagenes.style.display = 'none';
        });
        
        galeriaImagenes.appendChild(div);
      });
    })
    .catch(error => console.error('Error al cargar imágenes:', error));
}

// Función para actualizar la vista previa de la imagen
function actualizarVistaPrevia() {
  const inputImagen = document.getElementById('producto-imagen');
  const vistaPrevia = document.getElementById('vista-previa-imagen');
  const imgPrevia = vistaPrevia.querySelector('img');
  
  if (inputImagen.value) {
    imgPrevia.src = `/static/${inputImagen.value}`;
    vistaPrevia.style.display = 'block';
  } else {
    vistaPrevia.style.display = 'none';
  }
}

// Función para abrir modal de categoría desde el formulario de producto
function abrirModalCategoriaDesdeProducto() {
  // Marcar que venimos del flujo de producto
  sessionStorage.setItem('creandoCategoriaDesdeProducto', 'true');
  // Abrir el modal de categoría
  cerrarModal('producto');
  abrirModal('categoria');
}

function abrirModalCategoriaDesdeProductoEditar() {
  // Obtener los datos actuales del formulario de producto
  const formProducto = document.getElementById('form-editar-producto');
  const datosProducto = {
    nombre: formProducto.querySelector('#producto-nombre-editar').value,
    descripcion: formProducto.querySelector('#producto-descripcion-editar').value,
    precio: formProducto.querySelector('#producto-precio-editar').value,
    stock_actual: formProducto.querySelector('#producto-stock-actual-editar').value,
    stock_minimo: formProducto.querySelector('#producto-stock-minimo-editar').value,
    compra: formProducto.querySelector('#producto-compra-editar').value,
    establecimiento: formProducto.querySelector('#producto-establecimiento-editar').value,
    imagen: formProducto.querySelector('#producto-imagen-editar').value
  };
  
  // Guardar los datos en sessionStorage
  sessionStorage.setItem('datosProductoEdicion', JSON.stringify(datosProducto));
  sessionStorage.setItem('creandoCategoriaDesdeProductoEditar', 'true');
  
  // Cerrar el modal de edición de producto
  cerrarModalEdicion('producto');
  // Abrir el modal de categoría
  abrirModal('categoria');
}