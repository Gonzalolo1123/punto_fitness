// ===== Carrusel de Planes =====
const planes = [
  {
    img: '/static/images/planes/1.png',
    precio: '$50',
    descripcion: 'Plan básico de entrenamiento'
  },
  {
    img: '/static/images/planes/2.png',
    precio: '$75',
    descripcion: 'Plan intermedio con asesoría'
  },
  {
    img: '/static/images/planes/3.png',
    precio: '$100',
    descripcion: 'Plan premium personalizado'
  }
];

let planIndex = 0;
const planImg = document.querySelector('.img-plan');
const planPrecio = document.querySelector('.precio');
const planDescripcion = document.querySelector('.descripcion');

function mostrarPlan(index) {
  const plan = planes[index];
  if (planImg && planPrecio && planDescripcion) {
    planImg.src = plan.img;
    planPrecio.textContent = 'Precio: ' + plan.precio;
    planDescripcion.textContent = 'Descripción: ' + plan.descripcion;
  }
}

document.querySelector('.flecha-izquierda')?.addEventListener('click', () => {
  planIndex = (planIndex - 1 + planes.length) % planes.length;
  mostrarPlan(planIndex);
});

document.querySelector('.flecha-derecha')?.addEventListener('click', () => {
  planIndex = (planIndex + 1) % planes.length;
  mostrarPlan(planIndex);
});

mostrarPlan(planIndex);

// ===== Carrusel de Productos en Tienda =====
const productos = document.querySelectorAll('.producto');
const productosContainer = document.querySelector('.carrusel-productos');
let productoIndex = 0;
const productosPorVista = 3;

function actualizarCarrusel() {
  productos.forEach((producto, i) => {
    producto.style.display = (i >= productoIndex && i < productoIndex + productosPorVista) ? 'block' : 'none';
  });
}

document.querySelector('.productos-tienda .flecha-izquierda')?.addEventListener('click', () => {
  if (productoIndex > 0) {
    productoIndex--;
    actualizarCarrusel();
  }
});

document.querySelector('.productos-tienda .flecha-derecha')?.addEventListener('click', () => {
  if (productoIndex < productos.length - productosPorVista) {
    productoIndex++;
    actualizarCarrusel();
  }
});

actualizarCarrusel();

// ===== Filtros de Productos =====
const botonesFiltro = document.querySelectorAll('.filtro');

botonesFiltro.forEach(boton => {
  boton.addEventListener('click', () => {
    botonesFiltro.forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');

    const filtro = boton.textContent.trim();
    productos.forEach(prod => {
      const nombre = prod.querySelector('img').alt.toLowerCase();
      if (filtro === 'Todos' || nombre.includes(filtro.toLowerCase())) {
        prod.style.display = 'block';
      } else {
        prod.style.display = 'none';
      }
    });
  });
});
