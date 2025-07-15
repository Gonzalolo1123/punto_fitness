document.addEventListener('DOMContentLoaded', function() {
  const btnHamburguesa = document.getElementById('btn-hamburguesa');
  const menuMovil = document.getElementById('menu-movil');
  const btnCerrarMenu = document.getElementById('btn-cerrar-menu');
  btnHamburguesa.addEventListener('click', function() {
    menuMovil.classList.add('activo');
    document.body.style.overflow = 'hidden';
  });
  btnCerrarMenu.addEventListener('click', function() {
    menuMovil.classList.remove('activo');
    document.body.style.overflow = '';
  });
  // Cerrar menú al hacer click fuera
  menuMovil.addEventListener('click', function(e) {
    if (e.target === menuMovil) {
      menuMovil.classList.remove('activo');
      document.body.style.overflow = '';
    }
  });
}); 