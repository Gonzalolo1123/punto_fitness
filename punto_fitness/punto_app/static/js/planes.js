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
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO + 'T00:00:00'); // hora local
  const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
  return fecha.toLocaleDateString('es-ES', opciones);
}
document.getElementById('btnMostrarCursos').addEventListener('click', () => {
    const cursos = JSON.parse(document.getElementById('cursos-json').textContent);

    let tablaHTML = `
      <style>
        .swal2-popup .swal-table-container {
          max-height: 60vh;
          overflow-y: auto;
          padding: 5px;
          margin: -10px -20px -15px;
        }
        
        table.swal-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        
        .swal-table thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .swal-table th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.85rem;
        }
        
        .swal-table th:first-child {
          border-top-left-radius: 12px;
        }
        
        .swal-table th:last-child {
          border-top-right-radius: 12px;
        }
        
        .swal-table td {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          color: #555;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .swal-table tr:not(:last-child) td {
          border-bottom: 1px solid #f0f0f0;
        }
        
        .swal-table tr:hover td {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(4px);
        }
        
        .swal-table tr:hover td:first-child {
          border-left: 3px solid #667eea;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .badge-disponible {
          background: rgba(40, 167, 69, 0.15);
          color: #28a745;
        }
        
        .badge-completo {
          background: rgba(220, 53, 69, 0.15);
          color: #dc3545;
        }
        
        .btn-inscribir {
          padding: 8px 16px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 242, 254, 0.3);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn-inscribir:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 242, 254, 0.4);
        }
        
        .btn-inscribir i {
          font-size: 0.9rem;
        }
        
        /* Scrollbar personalizada */
        .swal-table-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .swal-table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .swal-table-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
      </style>

      <div class="swal-table-container">
        <table class="swal-table">
          <thead>
            <tr>
              <th>Nombre del Curso</th>
              <th>Cupos Disponibles</th>
              <th>Fecha Inicio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    cursos.forEach(curso => {

        
        const cuposDisponibles = curso.cupos - curso.inscritos;
        const porcentajeDisponible = (cuposDisponibles / curso.cupos) * 100;
        
        tablaHTML += `
            <tr>
              <td>${curso.nombre}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="flex-grow: 1; height: 6px; background: #f0f0f0; border-radius: 3px;">
                    <div style="width: ${porcentajeDisponible}%; height: 100%; background: ${porcentajeDisponible > 20 ? '#28a745' : '#ffc107'}; border-radius: 3px;"></div>
                  </div>
                  <span>${cuposDisponibles}/${curso.cupos}</span>
                </div>
              </td>
              <td>${formatearFecha(curso.fecha_realizacion)}</td>
              <td>
                <span class="badge ${curso.estado === 'Activo' ? 'badge-disponible' : 'badge-completo'}">
                  ${curso.estado === 'Activo' ? 'Disponible' : 'Completo'}
                </span>
              </td>
              <td>
                ${curso.estado === 'Activo' ? 
                  `<button class="btn-inscribir" onclick="inscribirCurso(${curso.id})">
                    <i class="fas fa-user-plus"></i> Inscribir
                  </button>` : 
                  '<span class="badge badge-completo">Lleno</span>'}
              </td>
            </tr>
        `;
    });

    tablaHTML += `
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
        title: '<strong style="color: #333; font-size: 1.5rem;">Cursos Disponibles</strong>',
        html: tablaHTML,
        width: '900px',
        showCloseButton: true,
        showConfirmButton: false,
        padding: '0',
        background: '#f9f9f9',
        backdrop: `
            rgba(0,0,0,0.4)
            url("https://i.gifer.com/ZZ5H.gif")
            center top
            no-repeat
        `,
        customClass: {
            container: 'swal2-container-custom',
            popup: 'swal2-popup-custom'
        }
    });
});

function inscribirCurso(id) {
    Swal.fire({
        title: 'Confirmar Inscripción',
        html: `<p style="color: #555;">¿Deseas inscribirte a este curso?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#dc3545',
        confirmButtonText: '<i class="fas fa-check"></i> Confirmar',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
        buttonsStyling: true,
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/inscribir_curso/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ curso_id: id })
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire({
                        title: '¡Inscripción Exitosa!',
                        html: `<p style="color: #555;">Tu inscripción ha sido registrada correctamente.</p>`,
                        icon: 'success',
                        confirmButtonColor: '#28a745'
                    });
                } else {
                    Swal.fire('Error', 'Hubo un problema al inscribirse.', 'error');
                }
            })
            .catch(error => {
                console.error(error);
                Swal.fire('Error', 'Ocurrió un error de red.', 'error');
            });
        }
    });
}