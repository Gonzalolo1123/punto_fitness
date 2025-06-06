document.addEventListener('DOMContentLoaded', function() {
  const cuentaBtn = document.getElementById('cuentaBtn');
  const userModal = document.getElementById('userModal');
  const modalContent = userModal ? userModal.querySelector('.modal-content') : null;
  const closeUserModal = document.getElementById('closeUserModal');

  if (cuentaBtn && userModal) {
    cuentaBtn.addEventListener('click', function(e) {
      e.preventDefault();
      userModal.classList.remove('hidden');
    });
  }

  // Cerrar modal al hacer click fuera del contenido
  if (userModal && modalContent) {
    userModal.addEventListener('click', function(e) {
      if (!modalContent.contains(e.target)) {
        userModal.classList.add('hidden');
      }
    });
  }

  // Si quieres también cerrar con el botón (si lo dejas en el HTML)
  if (closeUserModal && userModal) {
    closeUserModal.addEventListener('click', function() {
      userModal.classList.add('hidden');
    });
  }

  // Cerrar sesión
  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", function () {
      localStorage.removeItem('cliente_nombre');
      localStorage.removeItem('cliente_correo');
      localStorage.removeItem('cliente_telefono');
    });
  }

  const adminPanelBtn = document.getElementById('adminPanelBtn');
  
  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', function() {
      const nivelAcceso = '{{ request.user.nivel_acceso }}';  // Obtiene el nivel de acceso del usuario
      
      if (nivelAcceso === 'superadmin') {
        window.location.href = '/super_admin/';
      } else if (nivelAcceso === 'admin') {
        window.location.href = '/admin-dashboard/';
      }
    });
  }
});