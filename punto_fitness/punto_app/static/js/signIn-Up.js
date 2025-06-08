document.addEventListener("DOMContentLoaded", function () {
  const signUpButton = document.getElementById("signUp");
  const signInButton = document.getElementById("signIn");
  const container = document.getElementById("container");

  const usuarioBtn = document.getElementById("usuarioBtn");
  const authModal = document.getElementById("authModal");
  const closeModal = document.getElementById("closeModal");

  signUpButton.addEventListener("click", function () {
    container.classList.add("right-panel-active");
  });

  signInButton.addEventListener("click", function () {
    container.classList.remove("right-panel-active");
  });

  usuarioBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => {
    authModal.classList.add("hidden");
  });

  window.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.add("hidden");
    }
  });
});

//Registro 
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signUpForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const contrasena = document.getElementById("contrasena").value;
    const confirmContrasena = document.getElementById("Confirmcontrasena").value; // Asegúrate que este ID existe en tu HTML
    const estado = "Activo";

    //###################Validaciones######################
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showCustomAlert("Por favor ingrese un correo electrónico válido");
      document.getElementById("correo").focus();
      return;
    }

    if (telefono && !/^\d{9,11}$/.test(telefono)) {
      showCustomAlert("Por favor, ingrese un número de teléfono válido (9 a 11 dígitos)");
      document.getElementById("telefono").focus();
      return;
    }

    if (contrasena !== confirmContrasena) {
      showCustomAlert("Las contraseñas no coinciden");
      document.getElementById("contrasena").value = "";
      document.getElementById("Confirmcontrasena").value = "";
      document.getElementById("contrasena").focus();
      return;
    }

    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Verificar si el correo ya existe
    try {
      const verificarResponse = await fetch("/verificar-correo/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({ correo: correo })
      });

      const verificarData = await verificarResponse.json();

      if (verificarData.existe) {
        showCustomAlert("El correo ya está registrado. Por favor, utiliza otro correo");
        return;
      }

      // Si el correo no existe, proceder con el registro
      const datos = {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        telefono: telefono,
        contrasena: contrasena,
        estado: estado,
        nivel_acceso: "cliente" // Asignar nivel de acceso por defecto
      };

      const registroResponse = await fetch("/registro/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify(datos)
      });

      const registroData = await registroResponse.json();

      if (!registroResponse.ok) {
        throw new Error(registroData.message || "Error en el registro");
      }

      showCustomAlert(registroData.message || "Cuenta creada correctamente");
      form.reset();

      // Cambia a la vista de inicio de sesión tras registro exitoso
      const container = document.getElementById("container");
      if (container) {
        container.classList.remove("right-panel-active");
      }

      // Opcional: limpia también el formulario de inicio de sesión
      const signInForm = document.getElementById("signInForm");
      if (signInForm) signInForm.reset();

      // Reinicia la barra de fortaleza de contraseña
      const strengthFill = document.getElementById("password-strength-fill");
      if (strengthFill) strengthFill.style.width = "0%";

    } catch (error) {
      console.error("Error:", error);
      showCustomAlert("Ocurrió un error: " + error.message);
    }
  });
});
//Inicio de Sesion
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signInForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("correoi").value;
    const contrasena = document.getElementById("contrasenai").value;

    if (!correo || !contrasena) {
      showCustomAlert("Por favor, complete todos los campos");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showCustomAlert("Por favor ingrese un correo electrónico válido");
      return;
    }

    try {
      // Obtener el token CSRF
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      if (!csrfToken) {
        console.error("No se pudo obtener el token CSRF");
        showCustomAlert("Error de seguridad. Por favor, recargue la página e intente nuevamente.");
        return;
      }

      const datos = {
        correo: correo,
        contrasena: contrasena,
      };

      const response = await fetch("/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify(datos)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error en el inicio de sesión");
      }

      if (data.success) {
        showCustomAlert(data.message || "Inicio de sesión exitoso");
        // Limpiar el formulario
        form.reset();
        // Cerrar el modal
        const authModal = document.getElementById("authModal");
        if (authModal) {
          authModal.classList.add("hidden");
        }
        
        // Esperar un momento para asegurar que la sesión se haya establecido
        setTimeout(() => {
          // Redirigir según el nivel de acceso usando fetch para mantener las cookies
          if (data.is_admin) {
            if (data.nivel_acceso === "superadmin") {
              window.location.replace('/super_admin/');
            } else if (data.nivel_acceso === "admin") {
              window.location.replace('/admin-dashboard/');
            }
          } else {
            window.location.reload();
          }
        }, 500);
      } else {
        showCustomAlert(data.detail || "Error en el inicio de sesión");
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      showCustomAlert(error.message || "Error al intentar iniciar sesión. Por favor, intente nuevamente.");
    }
  });
});

function showCustomAlert(message) {
  // Verificar si ya existe un div de alerta
  let alertDiv = document.querySelector('.custom-alert');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    document.body.appendChild(alertDiv);
  }
  
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 3000);
}

// Agregar estilos para la alerta personalizada
const style = document.createElement('style');
style.textContent = `
  .custom-alert {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 15px 25px;
    border-radius: 5px;
    z-index: 9999;
    display: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("contrasena");
  const strengthFill = document.getElementById("password-strength-fill");
  const strengthText = document.getElementById("password-strength-text");

  if (passwordInput && strengthFill && strengthText) {
    passwordInput.addEventListener("input", function () {
      const value = passwordInput.value;
      let score = 0;

      // Validaciones
      if (value.length >= 8) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[a-z]/.test(value)) score++;
      if (/\d/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;

      // Actualiza barra y texto
      const percent = (score / 5) * 100;
      strengthFill.style.width = percent + "%";

      let text = "Muy débil";
      if (score === 2);
      if (score === 3);
      if (score === 4);
      if (score === 5);
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Elementos de los formularios
  const signInContainer = document.querySelector('.sign-in-container');
  const signUpContainer = document.querySelector('.sign-up-container');
  const forgotContainer = document.querySelector('.forgot-password-container');
  const forgotLink = document.querySelector('#signInForm a[href="#"]');
  const volverLogin = document.getElementById("volverLogin");
  const authModal = document.getElementById("authModal");

  // Mostrar formulario de recuperación
  if (forgotLink && forgotContainer && signInContainer) {
    forgotLink.addEventListener("click", function(e) {
      e.preventDefault();
      signInContainer.style.display = "none";
      forgotContainer.style.display = "block";
      if (authModal) authModal.classList.add("center-forgot");
    });
  }

  // Volver al login
  if (volverLogin && forgotContainer && signInContainer && signUpContainer) {
    volverLogin.addEventListener("click", function(e) {
      e.preventDefault();
      forgotContainer.style.display = "none";
      signInContainer.style.display = "block";

    });
  }
});

document.getElementById('usuarioBtn')?.addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('authModal').classList.remove('hidden');
});

// Cerrar modal de login/registro
document.getElementById('closeAuthModal')?.addEventListener('click', function() {
  document.getElementById('authModal').classList.add('hidden');
});
