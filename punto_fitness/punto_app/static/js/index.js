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






