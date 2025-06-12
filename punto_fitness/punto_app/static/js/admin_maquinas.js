const BASE_URL = '/maquinas/';

////////////////////
//// MAQUINAS /////
////////////////////

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Inicializando módulo de máquinas...');
  
  // Verificar que las funciones de validación estén disponibles
  if (typeof validarNombre === 'undefined' || typeof validarFormulario === 'undefined') {
    console.error('❌ ERROR: Las funciones de validación no están disponibles. Verifique que validaciones.js se cargue antes que admin_maquinas.js');
    Swal.fire('Error', 'Error de configuración: Las validaciones no están disponibles. Por favor, recarga la página.', 'error');
    return;
  }
  
  console.log('✅ Funciones de validación disponibles:', {
    validarNombre: typeof validarNombre,
    validarDescripcion: typeof validarDescripcion,
    validarNumeroEntero: typeof validarNumeroEntero,
    validarSeleccion: typeof validarSeleccion,
    validarFormulario: typeof validarFormulario,
    mostrarExitoValidacion: typeof mostrarExitoValidacion,
    mostrarErroresValidacion: typeof mostrarErroresValidacion
  });
  
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
  }
}

// Función para crear maquina
function crearMaquina(formData) {
  console.log('📤 Enviando datos para crear máquina:', formData);
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
  console.log('📤 Actualizando máquina ID:', id, 'con datos:', data);
  return fetch(`${BASE_URL}actualizar_maquina/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(data)
  }).then(response => {
    if (response.ok) {
      return response.json().then(responseData => {
        mostrarExitoValidacion('La máquina ha sido actualizada correctamente.', '¡Actualización Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(errorData => {
        throw new Error(errorData.error || 'Error al actualizar la máquina');
      });
    }
  })
  .catch(error => {
    console.error('Error al actualizar máquina:', error);
    Swal.fire('Error', 'Ocurrió un error al actualizar la máquina: ' + error.message, 'error');
    throw error; // Re-lanzar el error para que el event listener lo pueda manejar
  });
}

// Función para eliminar maquina
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
      return response.json().then(responseData => {
        mostrarExitoValidacion('La máquina ha sido eliminada correctamente.', '¡Eliminación Exitosa!');
        return responseData;
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error || 'Error al eliminar la máquina');
      });
    }
  })
  .catch(error => {
    console.error('Error al eliminar máquina:', error);
    Swal.fire('Error', 'Ocurrió un error al eliminar la máquina: ' + error.message, 'error');
    throw error;
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
      
      console.log('🔍 Campos del formulario:');
      console.log('  - Nombre input:', nombreInput ? 'SÍ' : 'NO', nombreInput?.value);
      console.log('  - Descripción input:', descripcionInput ? 'SÍ' : 'NO', descripcionInput?.value);
      console.log('  - Cantidad input:', cantidadInput ? 'SÍ' : 'NO', cantidadInput?.value);
      console.log('  - Establecimiento select:', establecimientoSelect ? 'SÍ' : 'NO', establecimientoSelect?.value);
      
      // Obtener y limpiar valores
      const nombre = nombreInput?.value.trim() || '';
      const descripcion = descripcionInput?.value.trim() || '';
      const cantidad = cantidadInput?.value.trim() || '';
      const establecimientoId = establecimientoSelect?.value || '';
      
      // Validaciones usando la nueva función validarFormulario
      const validaciones = [
        () => validarNombre(nombre, 'nombre de la máquina', 3, 30, true),
        () => validarDescripcion(descripcion, 'descripción de la máquina', 5, 50),
        () => validarNumeroEntero(cantidad, 'cantidad', 0, 999, true),
        () => validarSeleccion(establecimientoId, 'establecimiento', true)
      ];
      
      // Validar formulario y mostrar errores si existen
      if (!validarFormulario(validaciones, 'Errores en el Formulario de Máquina')) {
        return;
      }
      
      const formData = {
        nombre: nombre,
        descripcion: descripcion,
        cantidad: parseInt(cantidad),
        establecimiento_id: establecimientoId
      };
      
      console.log('📋 Datos del formulario:', formData);
      
      crearMaquina(formData)
        .then(data => {
          console.log('✅ Respuesta del servidor:', data);
          if (data.error) throw new Error(data.error);
          mostrarExitoValidacion('Máquina creada exitosamente', '¡Máquina Creada!');
          cerrarModal('maquina');
        })
        .catch(error => {
          console.error('💥 Error al crear máquina:', error);
          Swal.fire('Error', 'Error al crear máquina: ' + error.message, 'error');
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
        Swal.fire('Error', 'No se pudo obtener el ID de la máquina. Por favor, recarga la página.', 'error');
        return;
      }
      
      // Verificar que todos los campos existen antes de obtener sus valores
      const nombreInput = document.getElementById(`maquina-nombre-editar-${id}`);
      const descripcionInput = document.getElementById(`maquina-descripcion-editar-${id}`);
      const cantidadInput = document.getElementById(`maquina-cantidad-editar-${id}`);
      const establecimientoInput = document.getElementById(`maquina-establecimiento-editar-${id}`);
      
      // Debug: verificar que los campos se encuentran
      console.log('Campos encontrados:', {
        nombre: nombreInput,
        descripcion: descripcionInput,
        cantidad: cantidadInput,
        establecimiento: establecimientoInput
      });
      
      if (!nombreInput || !descripcionInput || !cantidadInput || !establecimientoInput) {
        Swal.fire('Error', 'No se pudieron encontrar todos los campos del formulario. Por favor, recarga la página.', 'error');
        return;
      }
      
      // Obtener y limpiar valores
      const nombre = nombreInput.value.trim();
      const descripcion = descripcionInput.value.trim();
      const cantidad = cantidadInput.value.trim();
      const establecimientoId = establecimientoInput.value;
      
      // Validaciones usando la nueva función validarFormulario
      const validaciones = [
        () => validarNombre(nombre, 'nombre de la máquina', 3, 30, true),
        () => validarDescripcion(descripcion, 'descripción de la máquina', 5, 50),
        () => validarNumeroEntero(cantidad, 'cantidad', 0, 999, true),
        () => validarSeleccion(establecimientoId, 'establecimiento', true)
      ];
      
      // Validar formulario y mostrar errores si existen
      if (!validarFormulario(validaciones, 'Errores en el Formulario de Edición de Máquina')) {
        return;
      }
      
      const formData = {
        nombre: nombre,
        descripcion: descripcion,
        cantidad: parseInt(cantidad),
        establecimiento_id: establecimientoId
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

      Swal.fire({
        title: '¿Eliminar máquina?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarMaquina(id)
            .then(data => {
              if (data.error) throw new Error(data.error);
              document.querySelector(`tr[data-id="${id}"]`).remove();
              document.querySelector(`#modal-fondo-editar-maquina-${id}`)?.remove();
            })
            .catch(error => {
              console.error('Error:', error);
              Swal.fire('Error', 'Error al eliminar máquina: ' + error.message, 'error');
            });
        }
      });
    });
  });

  // Modal Functionality
  inicializarModales();
  
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