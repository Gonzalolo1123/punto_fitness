document.addEventListener("DOMContentLoaded", () => {
  cambiarSlide(1); // iniciar en el video central
});

function cambiarSlide(n) {
  const slides = document.querySelectorAll(".video-slide");
  const puntos = document.querySelectorAll(".punto");

  slides.forEach((slide, i) => {
    const video = slide.querySelector("video");

    // Quitar clase central a todos
    slide.classList.remove("central");

    // Detener todos los videos
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("controls");
    video.setAttribute("muted", true);
  });

  // Agregar clase central solo al seleccionado
  slides[n].classList.add("central");

  // Activar video central
  const videoCentral = slides[n].querySelector("video");
  videoCentral.setAttribute("controls", true);
  videoCentral.removeAttribute("muted");

  // Actualizar los puntos indicadores
  puntos.forEach((punto, i) => {
    punto.classList.toggle("activo", i === n);
  });
}

/////////////  CODIGO PARA PLANES ////////////
let indiceActual = 0;

function actualizarCarrusel() {
  const carrusel = document.getElementById("carruselPlanes");
  const planes = carrusel.querySelectorAll(".plan");

  // Asegurarse de que se mueva solo un plan
  const desplazamiento = -(100 * indiceActual); // 100% para cada plan
  carrusel.style.transform = `translateX(${desplazamiento}%)`;
}

function moverCarrusel(direccion) {
  const carrusel = document.getElementById("carruselPlanes");
  const planes = carrusel.querySelectorAll(".plan");

  // Actualizar el índice actual
  indiceActual += direccion;

  // Asegurarse de que el índice se mantenga dentro de los límites
  if (indiceActual < 0) indiceActual = planes.length - 1;
  if (indiceActual >= planes.length) indiceActual = 0;

  // Llamamos a la función para actualizar el carrusel
  actualizarCarrusel();
}

// Iniciar con el primer plan visible
document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrusel();
});

///////////// Codigo para productos ///////////////////

document.addEventListener("DOMContentLoaded", function () {
  const botones = document.querySelectorAll(".filtro-btn");
  const productos = document.querySelectorAll(".producto");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      // Eliminar clase activo de todos los botones
      botones.forEach(btn => btn.classList.remove("activo"));
      boton.classList.add("activo");

      const categoria = boton.getAttribute("data-categoria");

      productos.forEach(producto => {
        if (categoria === "todos" || producto.classList.contains(categoria)) {
          producto.style.display = "block";
        } else {
          producto.style.display = "none";
        }
      });
    });
  });
});

///////////// CODIGO PARA MENÚ HAMBURGUESA ////////////

document.addEventListener("DOMContentLoaded", function() {
  const btnHamburguesa = document.getElementById("btn-hamburguesa");
  const menuMovil = document.getElementById("menu-movil");
  const btnCerrarMenu = document.getElementById("btn-cerrar-menu");
  const openUserModal = document.getElementById("openUserModal");
  const openUserModalMovil = document.getElementById("openUserModalMovil");

  // Abrir menú hamburguesa
  if (btnHamburguesa) {
    btnHamburguesa.addEventListener("click", function() {
      menuMovil.classList.add("activo");
      document.body.style.overflow = "hidden"; // Prevenir scroll
    });
  }

  // Cerrar menú hamburguesa
  if (btnCerrarMenu) {
    btnCerrarMenu.addEventListener("click", function() {
      menuMovil.classList.remove("activo");
      document.body.style.overflow = ""; // Restaurar scroll
    });
  }

  // Cerrar menú al hacer clic en un enlace
  const enlacesMenuMovil = menuMovil.querySelectorAll("a");
  enlacesMenuMovil.forEach(enlace => {
    enlace.addEventListener("click", function() {
      menuMovil.classList.remove("activo");
      document.body.style.overflow = "";
    });
  });

  // Cerrar menú al hacer clic fuera del menú
  menuMovil.addEventListener("click", function(e) {
    if (e.target === menuMovil) {
      menuMovil.classList.remove("activo");
      document.body.style.overflow = "";
    }
  });

  // Sincronizar el modal de usuario entre escritorio y móvil
  if (openUserModal && openUserModalMovil) {
    openUserModalMovil.addEventListener("click", function(e) {
      e.preventDefault();
      openUserModal.click(); // Simular clic en el botón de escritorio
    });
  }
});

///////////// TOGGLE LOGIN/REGISTRO EN MÓVIL ////////////
document.addEventListener("DOMContentLoaded", function() {
  const loginBtn = document.getElementById("mobileShowLogin");
  const registerBtn = document.getElementById("mobileShowRegister");
  const loginForm = document.querySelector(".sign-in-container");
  const registerForm = document.querySelector(".sign-up-container");
  const authModal = document.getElementById("authModal");
  const closeAuthModal = document.getElementById("closeAuthModal");

  function showLogin() {
    loginForm.classList.add("mobile-active");
    registerForm.classList.remove("mobile-active");
    if (loginBtn && registerBtn) {
      loginBtn.classList.add("active");
      registerBtn.classList.remove("active");
    }
  }
  function showRegister() {
    registerForm.classList.add("mobile-active");
    loginForm.classList.remove("mobile-active");
    if (loginBtn && registerBtn) {
      registerBtn.classList.add("active");
      loginBtn.classList.remove("active");
    }
  }

  // Mostrar login por defecto en móvil al abrir el modal
  function onModalOpen() {
    if (window.innerWidth <= 768) {
      showLogin();
    }
  }

  // Limpiar clases al cerrar el modal
  function onModalClose() {
    loginForm.classList.remove("mobile-active");
    registerForm.classList.remove("mobile-active");
    if (loginBtn && registerBtn) {
      loginBtn.classList.remove("active");
      registerBtn.classList.remove("active");
    }
  }

  // Detectar apertura del modal
  if (authModal) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "class") {
          if (!authModal.classList.contains("hidden")) {
            onModalOpen();
          } else {
            onModalClose();
          }
        }
      });
    });
    observer.observe(authModal, { attributes: true });
  }

  if (loginBtn && registerBtn) {
    loginBtn.addEventListener("click", showLogin);
    registerBtn.addEventListener("click", showRegister);
  }

  // Si cambia el tamaño de pantalla, restaurar lógica
  window.addEventListener("resize", function() {
    if (window.innerWidth <= 768) {
      if (!loginForm.classList.contains("mobile-active") && !registerForm.classList.contains("mobile-active")) {
        showLogin();
      }
    } else {
      // Quitar clases en escritorio
      loginForm.classList.remove("mobile-active");
      registerForm.classList.remove("mobile-active");
      if (loginBtn && registerBtn) {
        loginBtn.classList.remove("active");
        registerBtn.classList.remove("active");
      }
    }
  });
});
