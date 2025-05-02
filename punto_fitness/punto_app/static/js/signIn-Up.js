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

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const contrasena = document.getElementById("contrasena").value;
    const estado= "Activo";

    // Obtener el token CSRF desde el DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const datos = {
      nombre: nombre,
      apellido: apellido,
      correo: correo,
      telefono: telefono,
      contrasena: contrasena,
      estado:estado
    };

    console.log(datos); // Verifica los datos que se están enviando

    // Hacer la solicitud fetch con el token CSRF
    fetch("registro/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken // Añadir el token CSRF
      },
      body: JSON.stringify(datos)
    })
    .then(response => {
      if (!response.ok) {
        // Si hay un error, mostrar el mensaje del servidor
        return response.json().then(errorData => {
          throw new Error(errorData.detail || "Error en la respuesta del servidor");
        });
      }
      return response.json(); // Parsear la respuesta si está bien
    })
    .then(data => {
      console.log("Respuesta del servidor:", data);
      alert("Cuenta creada correctamente");
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Ocurrió un error: " + error.message); // Muestra el mensaje de error detallado
    });
  });
});


//Inicio de Sesion
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signInForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const correo = document.getElementById("correoi").value;
    const contrasena = document.getElementById("contrasenai").value;

    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const datos = {
      correo: correo,
      contrasena: contrasena
    };

    console.log(datos); // Verifica los datos que se están enviando

    // Hacer la solicitud fetch para iniciar sesión
    fetch("login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken // Añadir el token CSRF
      },
      body: JSON.stringify(datos)
    })
    .then(response => {
      if (!response.ok) {
        // Si hay un error, mostrar el mensaje del servidor
        return response.json().then(errorData => {
          throw new Error(errorData.detail || "Error en la respuesta del servidor");
        });
      }
      return response.json(); // Parsear la respuesta si está bien
    })
    .then(data => {
      console.log("Respuesta del servidor:", data);
      if (data.success) {
        // Si la respuesta del servidor indica que el inicio de sesión fue exitoso
        alert("Inicio de sesión exitoso");
        // Redirigir a una página de inicio o dashboard
        window.location.href = '/principal/';
      } else {
        // Si hubo un problema con las credenciales
        alert("Credenciales incorrectas");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Ocurrió un error: " + error.message); // Muestra el mensaje de error detallado
    });
  });
});
