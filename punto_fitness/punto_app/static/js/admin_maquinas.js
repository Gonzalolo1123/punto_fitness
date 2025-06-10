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
  }).then(response => response.json());
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
  }).then(response => response.json());
}

function inicializarEventListeners() {
  console.log('🔧 Inicializando event listeners de máquinas...');
  
  const formCrearMaquina = document.getElementById('form-crear-maquina');
  console.log('📝 Formulario crear máquina encontrado:', formCrearMaquina ? 'SÍ' : 'NO');
  
  if (formCrearMaquina) {
    formCrearMaquina.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('🎯 Evento submit del formulario crear máquina');
      
      const nombreInput = document.getElementById('maquina-nombre-modal');
      const descripcionInput = document.getElementById('maquina-descripcion-modal');
      const cantidadInput = document.getElementById('maquina-cantidad-modal');
      const establecimientoSelect = document.getElementById('maquina-establecimiento-modal');
      
      console.log('🔍 Campos del formulario:');
      console.log('  - Nombre input:', nombreInput ? 'SÍ' : 'NO', nombreInput?.value);
      console.log('  - Descripción input:', descripcionInput ? 'SÍ' : 'NO', descripcionInput?.value);
      console.log('  - Cantidad input:', cantidadInput ? 'SÍ' : 'NO', cantidadInput?.value);
      console.log('  - Establecimiento select:', establecimientoSelect ? 'SÍ' : 'NO', establecimientoSelect?.value);
      
      const formData = {
        nombre: nombreInput?.value || '',
        descripcion: descripcionInput?.value || '',
        cantidad: cantidadInput?.value || '',
        establecimiento_id: establecimientoSelect?.value || 1
      };
      
      console.log('📋 Datos del formulario:', formData);
      
      // Validar que todos los campos tengan datos
      const camposVacios = Object.entries(formData).filter(([key, value]) => !value || value === '');
      if (camposVacios.length > 0) {
        console.warn('⚠️ Campos vacíos detectados:', camposVacios.map(([key]) => key));
        alert('Por favor, complete todos los campos incluyendo el establecimiento');
        return;
      }
      
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
      const id = this.getAttribute('data-id');
      const formData = {
        nombre: this.querySelector('[name="maquina-nombre"]').value,
        descripcion: this.querySelector('[name="maquina-descripcion"]').value,
        cantidad: this.querySelector('[name="maquina-cantidad"]').value,
        establecimiento_id: this.querySelector('[name="maquina-establecimiento"]').value
      };
      
      actualizarMaquina(id, formData)
        .then(data => {
          if (data.error) throw new Error(data.error);
          actualizarVista(data);
          cerrarModalEdicion('maquina', id);
          alert('Máquina actualizada correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar: ' + error.message);
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

