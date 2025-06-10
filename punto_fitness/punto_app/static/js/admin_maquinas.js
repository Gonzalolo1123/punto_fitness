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

// Función para mostrar formulario de edición
function mostrarFormularioEdicion(maquinaId) {
  console.log('📝 Mostrando formulario para máquina ID:', maquinaId);
  document.querySelectorAll('.form-edicion-maquina').forEach(form => {
    form.style.display = 'none';
  });
  const formEditar = document.getElementById(`form-editar-maquina-${maquinaId}`);
  console.log('📋 Formulario de edición encontrado:', formEditar ? 'SÍ' : 'NO');
  if (formEditar) {
    formEditar.style.display = 'table-row';
  }
}

// Función para ocultar formulario de edición
function ocultarFormularioEdicion(maquinaId) {
  console.log('🙈 Ocultando formulario para máquina ID:', maquinaId);
  const formEditar = document.getElementById(`form-editar-maquina-${maquinaId}`);
  console.log('📋 Formulario de edición encontrado:', formEditar ? 'SÍ' : 'NO');
  if (formEditar) {
    formEditar.style.display = 'none';
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
      
      const nombreInput = document.getElementById('maquina-nombre');
      const descripcionInput = document.getElementById('maquina-descripcion');
      const cantidadInput = document.getElementById('maquina-cantidad');
      const establecimientoSelect = document.querySelector('.select-establecimiento');
      
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
          window.location.reload();
        })
        .catch(error => {
          console.error('💥 Error al crear máquina:', error);
          alert('Error al crear máquina: ' + error.message);
        });
    });
  }

  // Formularios de actualización de datos
  const formsEditar = document.querySelectorAll('[name="form-editar-maquina"]');
  console.log('📝 Formularios de edición encontrados:', formsEditar.length);
  
  formsEditar.forEach(form => {
    const maquinaId = form.dataset.id;
    console.log('🔧 Agregando event listener al formulario de edición ID:', maquinaId);
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('🎯 Evento submit del formulario de edición para máquina ID:', maquinaId);
      
      const nombreInput = this.querySelector('[name="maquina-nombre"]');
      const descripcionInput = this.querySelector('[name="maquina-descripcion"]');
      const cantidadInput = this.querySelector('[name="maquina-cantidad"]');
      
      console.log('🔍 Campos del formulario de edición:');
      console.log('  - Nombre input:', nombreInput ? 'SÍ' : 'NO', nombreInput?.value);
      console.log('  - Descripción input:', descripcionInput ? 'SÍ' : 'NO', descripcionInput?.value);
      console.log('  - Cantidad input:', cantidadInput ? 'SÍ' : 'NO', cantidadInput?.value);
      
      const formData = {
        nombre: nombreInput?.value || '',
        descripcion: descripcionInput?.value || '',
        cantidad: cantidadInput?.value || '',
      };
      
      console.log('📋 Datos del formulario de edición:', formData);
      
      actualizarMaquina(maquinaId, formData)
        .then(data => {
          console.log('✅ Respuesta del servidor:', data);
          if (data.error) throw new Error(data.error);
          actualizarVista(data);
          ocultarFormularioEdicion(maquinaId);
          alert('Máquina actualizada correctamente');
          window.location.reload();
        })
        .catch(error => {
          console.error('💥 Error al actualizar máquina:', error);
          alert('Error al actualizar: ' + error.message);
        });
    });
  });

  // Boton editar
  const btnsEditar = document.querySelectorAll('[name="btn-editar-maquina"]');
  console.log('🔘 Botones editar encontrados:', btnsEditar.length);
  
  btnsEditar.forEach(btn => {
    const maquinaId = btn.getAttribute('data-id');
    console.log('🔧 Agregando event listener al botón editar ID:', maquinaId);
    
    btn.addEventListener('click', function() {
      console.log('🎯 Botón editar clickeado para máquina ID:', maquinaId);
      mostrarFormularioEdicion(maquinaId);
    });
  });

  // Boton eliminar
  const btnsEliminar = document.querySelectorAll('[name="btn-eliminar-maquina"]');
  console.log('🔘 Botones eliminar encontrados:', btnsEliminar.length);
  
  btnsEliminar.forEach(btn => {
    const maquinaId = btn.getAttribute('data-id');
    console.log('🔧 Agregando event listener al botón eliminar ID:', maquinaId);
    
    btn.addEventListener('click', function() {
      console.log('🎯 Botón eliminar clickeado para máquina ID:', maquinaId);
      if (confirm('¿Eliminar esta máquina?')) {
        eliminarMaquina(maquinaId)
          .then(data => {
            console.log('✅ Respuesta del servidor:', data);
            if (data.error) throw new Error(data.error);
            const row = document.querySelector(`tr[data-id="${maquinaId}"]`);
            const formRow = document.querySelector(`#form-editar-maquina-${maquinaId}`);
            if (row) {
              row.remove();
              console.log('✅ Fila eliminada del DOM');
            }
            if (formRow) {
              formRow.remove();
              console.log('✅ Formulario de edición eliminado del DOM');
            }
            window.location.reload();
          })
          .catch(error => {
            console.error('💥 Error al eliminar máquina:', error);
          });
      } else {
        console.log('❌ Eliminación cancelada por el usuario');
      }
    });
  });

  // Boton cancelar
  const btnsCancelar = document.querySelectorAll('.btn-cancelar');
  console.log('🔘 Botones cancelar encontrados:', btnsCancelar.length);
  
  btnsCancelar.forEach(btn => {
    const maquinaId = btn.getAttribute('data-id');
    console.log('🔧 Agregando event listener al botón cancelar ID:', maquinaId);
    
    btn.addEventListener('click', function() {
      console.log('🎯 Botón cancelar clickeado para máquina ID:', maquinaId);
      ocultarFormularioEdicion(maquinaId);
    });
  });

  console.log('✅ Event listeners de máquinas inicializados correctamente');
}

