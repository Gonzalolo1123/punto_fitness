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
  console.log("🚀 DOM cargado, configurando formulario de registro...");
  
  const form = document.getElementById("signUpForm");
  console.log("📝 Formulario encontrado:", form);
  
  let userDataForVerification = null; // Variable para almacenar datos del usuario

  form.addEventListener("submit", async function (e) {
    console.log("📤 Formulario de registro enviado");
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const contrasena = document.getElementById("contrasena").value;
    const confirmContrasena = document.getElementById("Confirmcontrasena").value;
    const estado = "Activo";

    console.log("📋 Datos del formulario:", { nombre, apellido, correo, telefono, estado });

    //###################Validaciones######################
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      console.log("❌ Email inválido:", correo);
      showCustomAlert("Por favor, ingrese un correo electrónico válido");
      document.getElementById("correo").focus();
      return;
    }

    if (telefono && !/^\d{9,11}$/.test(telefono)) {
      console.log("❌ Teléfono inválido:", telefono);
      showCustomAlert("Por favor, ingrese un número de teléfono válido (9 a 11 dígitos)");
      document.getElementById("telefono").focus();
      return;
    }

    if (contrasena.length < 8) {
      console.log("❌ Contraseña muy corta");
      showCustomAlert("Por favor, ingrese una contraseña válida (al menos 8 caracteres)");
      document.getElementById("contrasena").focus();
      return;
    }

    if (!/[A-Z]/.test(contrasena)) {
      console.log("❌ Contraseña sin mayúscula");
      showCustomAlert("Por favor, ingrese una contraseña válida (al menos una letra mayúscula)");
      document.getElementById("contrasena").focus();
      return;
    }

    if (!/[a-z]/.test(contrasena)) {
      console.log("❌ Contraseña sin minúscula");
      showCustomAlert("Por favor, ingrese una contraseña válida (al menos una letra minúscula)");
      document.getElementById("contrasena").focus();
      return;
    }

    if (!/\d/.test(contrasena)) {
      console.log("❌ Contraseña sin número");
      showCustomAlert("Por favor, ingrese una contraseña válida (al menos un número)");
      document.getElementById("contrasena").focus();
      return;
    }

    if (contrasena !== confirmContrasena) {
      console.log("❌ Contraseñas no coinciden");
      showCustomAlert("Las contraseñas no coinciden");
      document.getElementById("contrasena").value = "";
      document.getElementById("Confirmcontrasena").value = "";
      document.getElementById("contrasena").focus();
      return;
    }

    console.log("✅ Todas las validaciones pasaron");

    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    console.log("🔐 Token CSRF obtenido:", csrfToken ? "Sí" : "No");

    // Verificar si el correo ya existe
    try {
      console.log("🔍 Verificando si el correo existe...");
      const verificarResponse = await fetch("/verificar-correo/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({ correo: correo })
      });

      const verificarData = await verificarResponse.json();
      console.log("📧 Respuesta de verificación:", verificarData);

      if (verificarData.existe) {
        console.log("❌ Correo ya existe");
        showCustomAlert("El correo ya está registrado. Por favor, utiliza otro correo");
        return;
      }

      console.log("✅ Correo disponible, procediendo con verificación");

      // Si el correo no existe, proceder con la verificación
      userDataForVerification = {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        telefono: telefono,
        contrasena: contrasena,
        estado: estado,
        nivel_acceso: "cliente"
      };

      console.log("📋 Datos guardados para verificación:", userDataForVerification);

      // Mostrar modal de verificación
      console.log("🔄 Mostrando modal de verificación...");
      mostrarModalVerificacion(correo);

    } catch (error) {
      console.error("💥 Error en el proceso:", error);
      showCustomAlert("Ocurrió un error: " + error.message);
    }
  });

  // Función para depurar el modal
  function debugModal(modal, action) {
    console.log(`🔍 Debug Modal - ${action}:`);
    console.log("  - Element:", modal);
    console.log("  - Classes:", modal.className);
    console.log("  - Hidden class:", modal.classList.contains("hidden"));
    console.log("  - Display:", window.getComputedStyle(modal).display);
    console.log("  - Visibility:", window.getComputedStyle(modal).visibility);
    console.log("  - Z-index:", window.getComputedStyle(modal).zIndex);
    console.log("  - Position:", window.getComputedStyle(modal).position);
    console.log("  - Top:", window.getComputedStyle(modal).top);
    console.log("  - Left:", window.getComputedStyle(modal).left);
    console.log("  - Width:", window.getComputedStyle(modal).width);
    console.log("  - Height:", window.getComputedStyle(modal).height);
  }

  // Función para mostrar modal de verificación
  function mostrarModalVerificacion(correo) {
    console.log("🔄 Iniciando mostrarModalVerificacion para:", correo);
    
    const authModal = document.getElementById("authModal");
    const emailVerificationModal = document.getElementById("emailVerificationModal");
    const verificationEmail = document.getElementById("verificationEmail");
    
    console.log("🔍 Elementos encontrados:");
    console.log("  - authModal:", authModal);
    console.log("  - emailVerificationModal:", emailVerificationModal);
    console.log("  - verificationEmail:", verificationEmail);
    
    if (!authModal || !emailVerificationModal || !verificationEmail) {
      console.error("❌ No se encontraron todos los elementos necesarios");
      showCustomAlert("Error: No se pudo mostrar el modal de verificación");
      return;
    }
    
    // Ocultar modal de autenticación
    console.log("👁️ Ocultando modal de autenticación...");
    authModal.classList.add("hidden");
    authModal.style.display = "none";
    
    // Configurar email en el modal
    console.log("📧 Configurando email en el modal:", correo);
    verificationEmail.textContent = correo;
    
    // Mostrar modal de verificación - FORZAR VISUALIZACIÓN
    console.log("👁️ Mostrando modal de verificación...");
    emailVerificationModal.classList.remove("hidden");
    emailVerificationModal.classList.add("show");
    emailVerificationModal.style.display = "block";
    emailVerificationModal.style.visibility = "visible";
    emailVerificationModal.style.opacity = "1";
    emailVerificationModal.style.zIndex = "9999";
    
    // Verificar que se mostró
    setTimeout(() => {
      const isVisible = window.getComputedStyle(emailVerificationModal).display !== "none";
      console.log("✅ Modal visible:", isVisible);
      console.log("📊 Estado final del modal:");
      console.log("  - Display:", window.getComputedStyle(emailVerificationModal).display);
      console.log("  - Visibility:", window.getComputedStyle(emailVerificationModal).visibility);
      console.log("  - Z-index:", window.getComputedStyle(emailVerificationModal).zIndex);
      console.log("  - Opacity:", window.getComputedStyle(emailVerificationModal).opacity);
      
      if (!isVisible) {
        console.error("❌ Modal aún no visible, forzando nuevamente...");
        emailVerificationModal.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 9999 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background-color: rgba(0, 0, 0, 0.5) !important;
        `;
      }
    }, 100);
    
    console.log("📤 Enviando código de verificación...");
    // Enviar código de verificación
    enviarCodigoVerificacion(correo);
  }

  // Función para enviar código de verificación
  async function enviarCodigoVerificacion(correo) {
    console.log("📤 Iniciando enviarCodigoVerificacion para:", correo);
    
    try {
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      console.log("🔐 Token CSRF para envío:", csrfToken ? "Sí" : "No");
      
      console.log("🌐 Enviando petición a /enviar-codigo-verificacion/");
      const response = await fetch("/enviar-codigo-verificacion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({ correo: correo })
      });

      console.log("📨 Respuesta recibida:", response.status, response.statusText);
      const data = await response.json();
      console.log("📋 Datos de respuesta:", data);

      if (response.ok) {
        console.log("✅ Código de verificación enviado exitosamente");
        showCustomAlert("Código de verificación enviado a tu correo");
      } else {
        console.error("❌ Error en la respuesta:", data);
        throw new Error(data.error || "Error al enviar código de verificación");
      }
    } catch (error) {
      console.error("💥 Error al enviar código:", error);
      showCustomAlert("Error al enviar código de verificación: " + error.message);
    }
  }

  // Event listeners para el modal de verificación
  const closeEmailVerificationModal = document.getElementById("closeEmailVerificationModal");
  const emailVerificationForm = document.getElementById("emailVerificationForm");
  const resendCode = document.getElementById("resendCode");
  const backToSignUp = document.getElementById("backToSignUp");

  // Cerrar modal de verificación
  if (closeEmailVerificationModal) {
    closeEmailVerificationModal.addEventListener("click", function() {
      const emailVerificationModal = document.getElementById("emailVerificationModal");
      emailVerificationModal.classList.add("hidden");
      // Volver al modal de autenticación
      const authModal = document.getElementById("authModal");
      authModal.classList.remove("hidden");
    });
  }

  // Manejar envío del formulario de verificación
  if (emailVerificationForm) {
    console.log("📝 Formulario de verificación configurado");
    emailVerificationForm.addEventListener("submit", async function(e) {
      console.log("📤 Formulario de verificación enviado");
      e.preventDefault();
      
      const codigo = document.getElementById("verificationCode").value;
      console.log("🔢 Código ingresado:", codigo);
      
      if (!codigo) {
        console.log("❌ Código vacío");
        showCustomAlert("Por favor, ingrese el código de verificación");
        return;
      }

      try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        console.log("🔐 Token CSRF para verificación:", csrfToken ? "Sí" : "No");
        
        console.log("🔍 Verificando código...");
        // Verificar código
        const response = await fetch("/verificar-codigo/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          },
          body: JSON.stringify({ 
            correo: userDataForVerification.correo,
            codigo: codigo 
          })
        });

        console.log("📨 Respuesta de verificación:", response.status, response.statusText);
        const data = await response.json();
        console.log("📋 Datos de verificación:", data);

        if (response.ok && data.verificado) {
          console.log("✅ Código verificado, procediendo con registro");
          // Código verificado, proceder con el registro usando crearUsuarioConValidacion
          try {
            console.log("📤 Creando usuario...");
            await crearUsuarioConValidacion(userDataForVerification);
            
            console.log("✅ Usuario creado exitosamente");
            showCustomAlert("Cuenta creada correctamente");
            emailVerificationForm.reset();
            
            // Cerrar modal de verificación
            const emailVerificationModal = document.getElementById("emailVerificationModal");
            emailVerificationModal.classList.add("hidden");
            
            // Cambiar a la vista de inicio de sesión
            const container = document.getElementById("container");
            if (container) {
              container.classList.remove("right-panel-active");
            }
            
            // Limpiar formulario de registro
            const signUpForm = document.getElementById("signUpForm");
            if (signUpForm) signUpForm.reset();
            
            // Limpiar formulario de inicio de sesión
            const signInForm = document.getElementById("signInForm");
            if (signInForm) signInForm.reset();
            
            // Reiniciar barra de fortaleza de contraseña
            const strengthFill = document.getElementById("password-strength-fill");
            if (strengthFill) strengthFill.style.width = "0%";
            
            userDataForVerification = null; // Limpiar datos temporales
            console.log("🧹 Datos temporales limpiados");
            
          } catch (error) {
            console.error("💥 Error al crear usuario:", error);
            showCustomAlert("Error al crear la cuenta: " + error.message);
          }
        } else {
          console.error("❌ Código no verificado:", data);
          throw new Error(data.error || "Código de verificación incorrecto");
        }
      } catch (error) {
        console.error("💥 Error en verificación:", error);
        showCustomAlert(error.message);
      }
    });
  } else {
    console.error("❌ No se encontró el formulario de verificación");
  }

  // Reenviar código
  if (resendCode) {
    resendCode.addEventListener("click", function(e) {
      e.preventDefault();
      if (userDataForVerification) {
        enviarCodigoVerificacion(userDataForVerification.correo);
        showCustomAlert("Código reenviado");
      }
    });
  }

  // Volver al registro
  if (backToSignUp) {
    backToSignUp.addEventListener("click", function(e) {
      e.preventDefault();
      const emailVerificationModal = document.getElementById("emailVerificationModal");
      const authModal = document.getElementById("authModal");
      
      emailVerificationModal.classList.add("hidden");
      authModal.classList.remove("hidden");
      
      // Limpiar datos temporales
      userDataForVerification = null;
    });
  }

  // Cerrar modal con click en fondo
  window.addEventListener("click", (e) => {
    const emailVerificationModal = document.getElementById("emailVerificationModal");
    if (e.target === emailVerificationModal) {
      emailVerificationModal.classList.add("hidden");
      // Volver al modal de autenticación
      const authModal = document.getElementById("authModal");
      authModal.classList.remove("hidden");
    }
  });
});

// 🔒 Validación de formato de correo electrónico
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 🆕 Función alternativa para crear usuario con validación de email y SweetAlert
function crearUsuarioConValidacion(formData) {
  console.log('📤 Enviando datos para crear usuario (con validación):', formData);

  // Validar email antes de continuar
  if (!validarEmail(formData.correo)) {
      console.warn('⚠️ Email inválido:', formData.correo);
      Swal.fire({
          title: 'Email Inválido',
          html: '<p style="color: #555;">Por favor, ingrese un correo electrónico válido.</p>',
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido'
      });
      return Promise.reject(new Error('Correo electrónico no válido'));
  }

  // Obtener el token CSRF
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  return fetch("/registro/", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
      },
      body: JSON.stringify(formData)
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(errorData => {
              throw new Error(errorData.error || errorData.message || `Error HTTP: ${response.status}`);
          }).catch(() => {
              throw new Error(`Error HTTP: ${response.status}`);
          });
      }
      return response.json();
  })
  .then(data => {
      console.log('✅ Usuario creado correctamente:', data);
      return data;
  })
  .catch(error => {
      console.error('💥 Error al crear usuario:', error);
      throw error;
  });
}

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
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const volverLogin = document.getElementById("volverLogin");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const authModal = document.getElementById("authModal");

  // Mostrar formulario de recuperación
  if (forgotPasswordLink && forgotContainer && signInContainer) {
    forgotPasswordLink.addEventListener("click", function(e) {
      e.preventDefault();
      signInContainer.style.display = "none";
      forgotContainer.style.display = "block";
    });
  }

  // Volver al login
  if (volverLogin && forgotContainer && signInContainer) {
    volverLogin.addEventListener("click", function(e) {
      e.preventDefault();
      forgotContainer.style.display = "none";
      signInContainer.style.display = "block";
    });
  }

  // Manejar envío del formulario de recuperación de contraseña
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const correo = document.getElementById("forgotCorreo").value;
      
      if (!correo) {
        showCustomAlert("Por favor, ingrese su correo electrónico");
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
        
        const response = await fetch("/recuperar-contrasena/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          },
          body: JSON.stringify({ correo: correo })
        });

        const data = await response.json();

        if (response.ok) {
          showCustomAlert(data.message || "Se ha enviado un enlace de recuperación a su correo electrónico");
          forgotPasswordForm.reset();
          // Volver al formulario de login
          forgotContainer.style.display = "none";
          signInContainer.style.display = "block";
        } else {
          throw new Error(data.error || "Error al procesar la solicitud");
        }
      } catch (error) {
        console.error("Error:", error);
        showCustomAlert(error.message || "Error al enviar la solicitud de recuperación");
      }
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

// Función global para probar el modal (ejecutar desde consola)
window.testModal = function() {
  console.log("🧪 Probando modal de verificación...");
  const modal = document.getElementById("emailVerificationModal");
  const email = document.getElementById("verificationEmail");
  
  if (!modal) {
    console.error("❌ Modal no encontrado");
    return;
  }
  
  if (email) {
    email.textContent = "test@example.com";
  }
  
  // Forzar mostrar
  modal.classList.remove("hidden");
  modal.classList.add("show");
  modal.style.cssText = `
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 9999 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
  `;
  
  console.log("✅ Modal forzado a mostrar");
  console.log("📊 Estado:", {
    display: window.getComputedStyle(modal).display,
    visibility: window.getComputedStyle(modal).visibility,
    zIndex: window.getComputedStyle(modal).zIndex,
    classes: modal.className
  });
};

// Función global para ocultar el modal
window.hideModal = function() {
  const modal = document.getElementById("emailVerificationModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("show");
    modal.style.display = "none";
    console.log("✅ Modal ocultado");
  }
};