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
