document.getElementById('cuentaBtn')?.addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('userModal').classList.remove('hidden');
});

// Cerrar modal de cuenta
document.getElementById('closeUserModal')?.addEventListener('click', function() {
  document.getElementById('userModal').classList.add('hidden');
});

document.getElementById("cerrarSesionBtn").addEventListener("click", function () {
  localStorage.removeItem('cliente_nombre');
  // También puedes eliminar otros datos si es necesario:
  localStorage.removeItem('cliente_correo');
  localStorage.removeItem('cliente_telefono');

  // Recarga o redirige según necesites
   window.location.href = "index.html";
});