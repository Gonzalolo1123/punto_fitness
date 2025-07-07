const BASE_URL = '/maquinas/';

////////////////////
//// MAQUINAS /////
////////////////////

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Inicializando máquinas...');
  
  // Verificar datos del backend
  const maquinasRows = document.querySelectorAll('tr[data-id]');
  console.log('📊 Filas de máquinas encontradas en el DOM:', maquinasRows.length);
  
  // Verificar establecimientos disponibles
  const establecimientosSelect = document.querySelector('.select-establecimiento');
  if (establecimientosSelect) {
    const opciones = establecimientosSelect.querySelectorAll('option');
    console.log('🏢 Establecimientos disponibles:', opciones.length - 1); // -1 por la opción por defecto
    opciones.forEach((opcion, index) => {
      if (opcion.value) { // Solo las opciones con valor (no la opción por defecto)
        console.log(`  - Establecimiento ${index}: ID=${opcion.value}, Nombre="${opcion.textContent}"`);
      }
    });
  } else {
    console.warn('⚠️ Select de establecimientos no encontrado');
  }
  
  // Verificar si hay mensaje de tabla vacía
  const noHayMaquinas = document.querySelector('td[colspan="5"]');
  if (noHayMaquinas && noHayMaquinas.textContent.includes('No hay máquinas')) {
    console.log('📭 Tabla vacía: No hay máquinas en la base de datos');
  }
  
  maquinasRows.forEach((row, index) => {
    const maquinaId = row.getAttribute('data-id');
    const nombre = row.cells[0]?.textContent;
    const descripcion = row.cells[1]?.textContent;
    const cantidad = row.cells[2]?.textContent;
    console.log(`📋 Máquina ${index + 1}: ID=${maquinaId}, Nombre="${nombre}", Descripción="${descripcion}", Cantidad="${cantidad}"`);
  });
  
  inicializarEventListeners();
});

// Función para obtener csrf token
function getCSRFToken() {
  const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
  console.log('🔑 CSRF Token encontrado:', csrfInput ? 'SÍ' : 'NO');
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

// Función para actualizar vista de datos de maquina
function actualizarVista(maquina) {
  console.log('🔄 Actualizando vista para máquina:', maquina);
  const row = document.querySelector(`tr[data-id="${maquina.id}"]`);
  console.log('📊 Fila encontrada:', row ? 'SÍ' : 'NO');
  if (row) {
    const cells = row.cells;
    cells[0].textContent = maquina.nombre;
    cells[1].textContent = maquina.descripcion;
    cells[2].textContent = maquina.cantidad;
    
    // Actualizar la vista previa de la imagen
    const vistaPrevia = document.getElementById(`vista-previa-imagen-editar-${maquina.id}`);
    if (vistaPrevia) {
      const imgPrevia = vistaPrevia.querySelector('img');
      if (imgPrevia && maquina.imagen) {
        imgPrevia.src = `/static/${maquina.imagen}`;
        vistaPrevia.style.display = 'block';
      } else {
        vistaPrevia.style.display = 'none';
      }
    }
  }
}

// Función para crear máquina
function crearMaquina() {
  const form = document.getElementById('form-crear-maquina');
  const formData = new FormData(form);
  fetch('/maquinas/crear_maquina/', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    // Manejar respuesta
  });
}

// Función para actualizar máquina
function actualizarMaquina(id) {
  const form = document.querySelector(`form[name='form-editar-maquina'][data-id='${id}']`);
  const formData = new FormData(form);
  fetch(`/maquinas/actualizar_maquina/${id}/`, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    // Manejar respuesta
  });
}

// Función para eliminar máquina
function eliminarMaquina(id) {
  console.log('🗑️ Eliminando máquina ID:', id);
  return fetch(`${BASE_URL}borrar_maquina/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    }
  }).then(response => {
    if (response.ok) {
      Swal.fire({
        title: 'Eliminación Exitosa!',
        html: `<p style="color: #555;">La maquina ha sido eliminado correctamente.</p>`,
        icon: 'success',
        confirmButtonColor: '#28a745'
      }).then(() => {
        // Recarga la página cuando se cierra el SweetAlert
        location.reload();
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar la maquina');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar proveedor:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar la maquina: ' + error.message, 'error');
  });
}

function inicializarEventListeners() {
  console.log('🔧 Inicializando event listeners de máquinas...');
  
  const formCrearMaquina = document.getElementById('form-crear-maquina');
  console.log('📝 Formulario crear máquina encontrado:', formCrearMaquina ? 'SÍ' : 'NO');
  
  if (formCrearMaquina) {
    formCrearMaquina.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('🎯 Evento submit del formulario crear máquina');
      
      const nombreInput = document.getElementById('maquina-nombre');
      const descripcionInput = document.getElementById('maquina-descripcion');
      const cantidadInput = document.getElementById('maquina-cantidad');
      const establecimientoSelect = document.getElementById('maquina-establecimiento');
      const imagenInput = document.getElementById('maquina-imagen');
      
      console.log('🔍 Campos del formulario:');
      console.log('  - Nombre input:', nombreInput ? 'SÍ' : 'NO', nombreInput?.value);
      console.log('  - Descripción input:', descripcionInput ? 'SÍ' : 'NO', descripcionInput?.value);
      console.log('  - Cantidad input:', cantidadInput ? 'SÍ' : 'NO', cantidadInput?.value);
      console.log('  - Establecimiento select:', establecimientoSelect ? 'SÍ' : 'NO', establecimientoSelect?.value);
      console.log('  - Imagen input:', imagenInput ? 'SÍ' : 'NO', imagenInput?.value);
      
      // Obtener y limpiar valores
      const nombre = nombreInput?.value.trim() || '';
      const descripcion = descripcionInput?.value.trim() || '';
      const cantidad = cantidadInput?.value.trim() || '';
      const establecimientoId = establecimientoSelect?.value || '';
      const imagen = imagenInput?.value || '';
      
      // Validaciones
      const errores = [];
      errores.push(...validarNombre(nombre, 'nombre', 3, 30, false));
      errores.push(...validarDescripcion(descripcion, 'descripción', 5, 50, false));
      errores.push(...validarNumeroEntero(cantidad, 'cantidad', 0, 999, true, false));
      if (!establecimientoId) errores.push('Debe seleccionar un establecimiento');
      if (!imagen) {
        errores.push('Debe seleccionar una imagen');
      } else if (!imagen.startsWith('images/maquinas/')) {
        errores.push('La imagen debe estar en la carpeta images/maquinas/');
      }
      if (errores.length > 0) {
        mostrarErroresValidacion(errores, 'Errores en el formulario de máquina');
        return;
      }
      
      const formData = {
        nombre: nombre,
        descripcion: descripcion,
        cantidad: parseInt(cantidad),
        establecimiento_id: establecimientoId,
        imagen: imagen
      };
      
      console.log('📋 Datos del formulario:', formData);
      
      crearMaquina(formData)
        .then(data => {
          console.log('✅ Respuesta del servidor:', data);
          if (data.error) throw new Error(data.error);
          alert('Máquina creada exitosamente');
          cerrarModal('maquina');
          window.location.reload();
        })
        .catch(error => {
          console.error('💥 Error al crear máquina:', error);
          alert('Error al crear máquina: ' + error.message);
        });
    });
  }

  // Event listeners para formularios de edición
  document.querySelectorAll('[name="form-editar-maquina"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = this.dataset.id;
      
      // Debug: verificar que el ID se obtiene correctamente
      console.log('Máquina ID obtenido:', id);
      console.log('Tipo de id:', typeof id);
      
      if (!id || id === '') {
        alert('Error: No se pudo obtener el ID de la máquina. Por favor, recarga la página.');
        return;
      }
      
      // Verificar que todos los campos existen antes de obtener sus valores
      const nombreInput = document.getElementById(`maquina-nombre-editar-${id}`);
      const descripcionInput = document.getElementById(`maquina-descripcion-editar-${id}`);
      const cantidadInput = document.getElementById(`maquina-cantidad-editar-${id}`);
      const establecimientoInput = document.getElementById(`maquina-establecimiento-editar-${id}`);
      const imagenInput = document.getElementById(`maquina-imagen-editar-${id}`);
      
      // Debug: verificar que los campos se encuentran
      console.log('Campos encontrados:', {
        nombre: nombreInput,
        descripcion: descripcionInput,
        cantidad: cantidadInput,
        establecimiento: establecimientoInput,
        imagen: imagenInput
      });
      
      if (!nombreInput || !descripcionInput || !cantidadInput || !establecimientoInput || !imagenInput) {
        alert('Error: No se pudieron encontrar todos los campos del formulario. Por favor, recarga la página.');
        return;
      }
      
      // Obtener y limpiar valores
      const nombre = nombreInput.value.trim();
      const descripcion = descripcionInput.value.trim();
      const cantidad = cantidadInput.value.trim();
      const establecimientoId = establecimientoInput.value;
      const imagen = imagenInput.value;
      
      // Validaciones
      const errores = [];
      errores.push(...validarNombre(nombre, 'nombre', 3, 30, false));
      errores.push(...validarDescripcion(descripcion, 'descripción', 5, 50, false));
      errores.push(...validarNumeroEntero(cantidad, 'cantidad', 0, 999, true, false));
      if (!establecimientoId) errores.push('Debe seleccionar un establecimiento');
      if (!imagen) {
        errores.push('Debe seleccionar una imagen');
      } else if (!imagen.startsWith('images/maquinas/')) {
        errores.push('La imagen debe estar en la carpeta images/maquinas/');
      }
      if (errores.length > 0) {
        mostrarErroresValidacion(errores, 'Errores en el formulario de máquina');
        return;
      }
      
      const formData = {
        nombre: nombre,
        descripcion: descripcion,
        cantidad: parseInt(cantidad),
        establecimiento_id: establecimientoId,
        imagen: imagen
      };
      
      // Debug: verificar los datos del formulario
      console.log('Datos del formulario de máquina:', formData);
      
      actualizarMaquina(id, formData)
        .then(data => {
          console.log('✅ Máquina actualizada exitosamente:', data);
          actualizarVista(data);
          cerrarModalEdicion('maquina', id);
        })
        .catch(error => {
          console.error('Error al actualizar máquina:', error);
        });
    });
  });

  // Event listeners para botones de edición
  document.querySelectorAll('[name="btn-editar-maquina"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      mostrarFormularioEdicion(id, 'maquina');
    });
  });

  // Event listeners para botones de eliminación
  document.querySelectorAll('[name="btn-eliminar-maquina"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');

      if (confirm('¿Eliminar esta máquina?')) {
        eliminarMaquina(id)
          .then(data => {
            if (data.error) throw new Error(data.error);
            document.querySelector(`tr[data-id="${id}"]`).remove();
            document.querySelector(`#modal-fondo-editar-maquina-${id}`)?.remove();
            window.location.reload();
          })
          .catch(console.error);
      }
    });
  });

  // Modal Functionality
  inicializarModales();
  inicializarSelectorImagenes();
  
  console.log('✅ Event listeners de máquinas inicializados correctamente');
}

///////////////////////////
// FUNCIONALIDAD MODALES //
///////////////////////////

function inicializarModales() {
  console.log('🎭 Inicializando modales de máquinas...');

  // Botón para abrir modal
  const botonAbrirModal = document.getElementById('abrir-form-maquina');
  
  if (botonAbrirModal) {
    botonAbrirModal.addEventListener('click', function() {
      console.log('🎯 Botón abrir modal máquina clickeado');
      const estado = this.getAttribute('data-estado');
      
      if (estado === 'cerrado') {
        abrirModal('maquina', this);
      } else {
        cerrarModal('maquina', this);
      }
    });
  }

  // Event listener para cerrar modal con click en fondo
  const modalFondo = document.getElementById('modal-fondo-maquina');
  if (modalFondo) {
    modalFondo.addEventListener('click', function(event) {
      if (event.target === modalFondo) {
        console.log('🖱️ Click en fondo del modal máquina, cerrando...');
        cerrarModal('maquina');
      }
    });
  }

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

  console.log('✅ Modales de máquinas inicializados correctamente');
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
  const inputImagen = document.getElementById('maquina-imagen');
  const vistaPrevia = document.getElementById('vista-previa-imagen');
  const cerrarModal = document.querySelector('.cerrar-modal-imagenes');

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

  // Event listeners para los botones de seleccionar imagen (edición)
  document.querySelectorAll('[id^="btn-seleccionar-imagen-editar-"]').forEach(btn => {
    const id = btn.id.split('-').pop();
    const inputImagen = document.getElementById(`maquina-imagen-editar-${id}`);
    const vistaPrevia = document.getElementById(`vista-previa-imagen-editar-${id}`);
    
    btn.addEventListener('click', () => {
      modalImagenes.style.display = 'block';
      modalImagenes.dataset.target = `edicion-${id}`;
    });
  });

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

        fetch('/subir_imagen_maquina/', {
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
            } else if (target.startsWith('edicion-')) {
              const id = target.split('-')[1];
              const inputImagenEditar = document.getElementById(`maquina-imagen-editar-${id}`);
              const vistaPreviaEditar = document.getElementById(`vista-previa-imagen-editar-${id}`);
              if (inputImagenEditar && vistaPreviaEditar) {
                inputImagenEditar.value = data.ruta;
                const imgPrevia = vistaPreviaEditar.querySelector('img');
                if (imgPrevia) {
                  imgPrevia.src = `/static/${data.ruta}`;
                  vistaPreviaEditar.style.display = 'block';
                }
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
  fetch('/obtener_imagenes_maquinas/')
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
            const inputImagen = document.getElementById('maquina-imagen');
            const vistaPrevia = document.getElementById('vista-previa-imagen');
            if (inputImagen && vistaPrevia) {
              inputImagen.value = imagen;
              const imgPrevia = vistaPrevia.querySelector('img');
              if (imgPrevia) {
                imgPrevia.src = `/static/${imagen}`;
                vistaPrevia.style.display = 'block';
              }
            }
          } else if (target.startsWith('edicion-')) {
            const id = target.split('-')[1];
            const inputImagenEditar = document.getElementById(`maquina-imagen-editar-${id}`);
            const vistaPreviaEditar = document.getElementById(`vista-previa-imagen-editar-${id}`);
            if (inputImagenEditar && vistaPreviaEditar) {
              inputImagenEditar.value = imagen;
              const imgPrevia = vistaPreviaEditar.querySelector('img');
              if (imgPrevia) {
                imgPrevia.src = `/static/${imagen}`;
                vistaPreviaEditar.style.display = 'block';
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
  const inputImagen = document.getElementById('maquina-imagen');
  const vistaPrevia = document.getElementById('vista-previa-imagen');
  const imgPrevia = vistaPrevia.querySelector('img');
  
  if (inputImagen.value) {
    imgPrevia.src = `/static/${inputImagen.value}`;
    vistaPrevia.style.display = 'block';
  } else {
    vistaPrevia.style.display = 'none';
  }
}

