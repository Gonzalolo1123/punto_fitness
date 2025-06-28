// Script para las estadísticas de ventas con datos reales de la base de datos
document.addEventListener('DOMContentLoaded', function() {
    // Obtener los datos del contexto de Django
    const etiquetas = JSON.parse(document.getElementById('etiquetas-data').textContent || '[]');
    const totales = JSON.parse(document.getElementById('totales-data').textContent || '[]');
    const productos = JSON.parse(document.getElementById('productos-data').textContent || '[]');
    const cantidades = JSON.parse(document.getElementById('cantidades-data').textContent || '[]');
    
    // Nuevos datos de ventas monetarias
    const ventasDiariasLabels = JSON.parse(document.getElementById('ventas-diarias-labels').textContent || '[]');
    const ventasDiariasData = JSON.parse(document.getElementById('ventas-diarias-data').textContent || '[]');
    const ventasSemanalesLabels = JSON.parse(document.getElementById('ventas-semanales-labels').textContent || '[]');
    const ventasSemanalesData = JSON.parse(document.getElementById('ventas-semanales-data').textContent || '[]');
    const ventasMensualesLabels = JSON.parse(document.getElementById('ventas-mensuales-labels').textContent || '[]');
    const ventasMensualesData = JSON.parse(document.getElementById('ventas-mensuales-data').textContent || '[]');
    const ventasAnualesLabels = JSON.parse(document.getElementById('ventas-anuales-labels').textContent || '[]');
    const ventasAnualesData = JSON.parse(document.getElementById('ventas-anuales-data').textContent || '[]');
    
    // Datos de ventas por producto
    const ventasPorProducto = JSON.parse(document.getElementById('ventas-por-producto').textContent || '{}');
    
    // Datos de membresías
    const membresiasDiariasLabels = JSON.parse(document.getElementById('membresias-diarias-labels').textContent || '[]');
    const membresiasDiariasData = JSON.parse(document.getElementById('membresias-diarias-data').textContent || '[]');
    const membresiasSemanalesLabels = JSON.parse(document.getElementById('membresias-semanales-labels').textContent || '[]');
    const membresiasSemanalesData = JSON.parse(document.getElementById('membresias-semanales-data').textContent || '[]');
    const membresiasMensualesLabels = JSON.parse(document.getElementById('membresias-mensuales-labels').textContent || '[]');
    const membresiasMensualesData = JSON.parse(document.getElementById('membresias-mensuales-data').textContent || '[]');

    // Inicialización de contextos de gráficos
    const moneyChartCtx = document.getElementById('moneyChart').getContext('2d');
    const productChartCtx = document.getElementById('productChart').getContext('2d');
    const membershipChartCtx = document.getElementById('membershipChart').getContext('2d');

    // Variables globales
    let selectedProduct = productos.length > 0 ? productos[0] : 'todos';
    let selectedPeriod = 'daily';

    // Datos de ventas monetarias organizados por período
    const moneyData = {
        daily: {
            labels: ventasDiariasLabels.length > 0 ? ventasDiariasLabels : ['Sin ventas recientes'],
            data: ventasDiariasData.length > 0 ? ventasDiariasData : [0]
        },
        weekly: {
            labels: ventasSemanalesLabels.length > 0 ? ventasSemanalesLabels : ['Sin ventas recientes'],
            data: ventasSemanalesData.length > 0 ? ventasSemanalesData : [0]
        },
        monthly: {
            labels: ventasMensualesLabels.length > 0 ? ventasMensualesLabels : ['Sin ventas registradas'],
            data: ventasMensualesData.length > 0 ? ventasMensualesData : [0]
        },
        yearly: {
            labels: ventasAnualesLabels.length > 0 ? ventasAnualesLabels : ['Sin ventas registradas'],
            data: ventasAnualesData.length > 0 ? ventasAnualesData : [0]
        }
    };

    // Datos de membresías organizados por período
    const membershipData = {
        daily: {
            labels: membresiasDiariasLabels.length > 0 ? membresiasDiariasLabels : ['Sin membresías recientes'],
            data: membresiasDiariasData.length > 0 ? membresiasDiariasData : [0]
        },
        weekly: {
            labels: membresiasSemanalesLabels.length > 0 ? membresiasSemanalesLabels : ['Sin membresías recientes'],
            data: membresiasSemanalesData.length > 0 ? membresiasSemanalesData : [0]
        },
        monthly: {
            labels: membresiasMensualesLabels.length > 0 ? membresiasMensualesLabels : ['Sin membresías registradas'],
            data: membresiasMensualesData.length > 0 ? membresiasMensualesData : [0]
        }
    };

    // Configuración de gráficos
    let moneyChart = new Chart(moneyChartCtx, {
        type: 'line',
        data: {
            labels: moneyData.monthly.labels,
            datasets: [{
                label: 'Ingresos ($)',
                data: moneyData.monthly.data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: '#e10600',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Ingresos: $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    let productChart = new Chart(productChartCtx, {
        type: 'bar',
        data: {
            labels: productos.length > 0 ? productos : ['Sin productos'],
            datasets: [{
                label: 'Cantidad Vendida',
                data: cantidades.length > 0 ? cantidades : [0],
                backgroundColor: '#e10600'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    let membershipChart = new Chart(membershipChartCtx, {
        type: 'bar',
        data: {
            labels: membershipData.monthly.labels,
            datasets: [{
                label: 'Membresías Vendidas',
                data: membershipData.monthly.data,
                backgroundColor: 'rgba(0, 123, 255, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Funciones de actualización
    function updateMoneyChart(period) {
        const data = moneyData[period];
        moneyChart.data.labels = data.labels;
        moneyChart.data.datasets[0].data = data.data;
        moneyChart.update();
    }

    function updateProductChart() {
        // Para el gráfico de productos, mostramos los productos más vendidos
        // No cambiamos los datos por período ya que es un ranking general
        productChart.data.labels = productos.length > 0 ? productos : ['Sin productos'];
        productChart.data.datasets[0].data = cantidades.length > 0 ? cantidades : [0];
        productChart.update();
    }

    function setProduct(product) {
        selectedProduct = product;
        
        // Actualizar estado visual de los botones
        const buttons = document.querySelectorAll('#product-buttons button');
        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent === product || (product === 'todos' && button.textContent === 'Todos los productos')) {
                button.classList.add('active');
            }
        });
        
        updateProductChart();
    }

    function setProductPeriod(period) {
        selectedPeriod = period;
        updateProductChart();
    }

    function updateMembershipChart(period) {
        const data = membershipData[period];
        membershipChart.data.labels = data.labels;
        membershipChart.data.datasets[0].data = data.data;
        membershipChart.update();
    }

    function changeViewMode(mode) {
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            canvas.classList.remove('chart-small', 'chart-medium', 'chart-large');
            canvas.classList.add(`chart-${mode}`);
        });
    }

    // Hacer las funciones globales
    window.updateMoneyChart = updateMoneyChart;
    window.updateProductChart = updateProductChart;
    window.setProduct = setProduct;
    window.setProductPeriod = setProductPeriod;
    window.updateMembershipChart = updateMembershipChart;
    window.changeViewMode = changeViewMode;

    // Generar botones de productos dinámicamente
    function generateProductButtons() {
        const productButtonsContainer = document.getElementById('product-buttons');
        if (!productButtonsContainer) return;

        // Limpiar contenedor
        productButtonsContainer.innerHTML = '';

        // Agregar botón "Todos los productos"
        const allButton = document.createElement('button');
        allButton.textContent = 'Todos los productos';
        allButton.onclick = () => setProduct('todos');
        allButton.classList.add('active');
        productButtonsContainer.appendChild(allButton);

        // Agregar botones para cada producto
        productos.forEach((producto, index) => {
            const button = document.createElement('button');
            button.textContent = producto;
            button.onclick = () => setProduct(producto);
            productButtonsContainer.appendChild(button);
        });
    }

    // Llamar a la función para generar botones
    generateProductButtons();

    // Mostrar información de datos disponibles
    console.log('Datos de ventas cargados:', {
        diarias: ventasDiariasData.length,
        semanales: ventasSemanalesData.length,
        mensuales: ventasMensualesData.length,
        anuales: ventasAnualesData.length
    });
    
    console.log('Productos disponibles:', productos);
    console.log('Membresías cargadas:', {
        diarias: membresiasDiariasData.length,
        semanales: membresiasSemanalesData.length,
        mensuales: membresiasMensualesData.length
    });

    // Mostrar información en la página si no hay datos
    function mostrarInfoDatos() {
        const infoContainer = document.createElement('div');
        infoContainer.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #6c757d;
        `;
        
        let infoHTML = '<h4>Información sobre los datos:</h4><ul>';
        
        if (ventasDiariasData.length === 0 && ventasMensualesData.length === 0) {
            infoHTML += '<li>No hay ventas registradas en la base de datos</li>';
            infoHTML += '<li>Las ventas se registran cuando los clientes compran productos</li>';
        } else {
            infoHTML += `<li>Ventas encontradas: ${ventasMensualesData.length} meses con datos</li>`;
        }
        
        if (membresiasDiariasData.length === 0 && membresiasMensualesData.length === 0) {
            infoHTML += '<li>No hay membresías registradas en la base de datos</li>';
            infoHTML += '<li>Las membresías se registran cuando los clientes adquieren membresías</li>';
        } else {
            infoHTML += `<li>Membresías encontradas: ${membresiasMensualesData.length} meses con datos</li>`;
        }
        
        if (productos.length === 0) {
            infoHTML += '<li>No hay productos registrados en la base de datos</li>';
        } else {
            infoHTML += `<li>Productos disponibles: ${productos.length}</li>`;
        }
        
        infoHTML += '</ul>';
        
        if (ventasDiariasData.length === 0 && membresiasDiariasData.length === 0) {
            infoHTML += '<p><strong>Para ver datos en las estadísticas, necesitas:</strong></p>';
            infoHTML += '<ol>';
            infoHTML += '<li>Crear productos en el inventario</li>';
            infoHTML += '<li>Registrar ventas de productos a clientes</li>';
            infoHTML += '<li>Registrar membresías vendidas a clientes</li>';
            infoHTML += '</ol>';
        }
        
        infoContainer.innerHTML = infoHTML;
        
        // Insertar al inicio del contenido
        const content = document.querySelector('.content');
        if (content) {
            content.insertBefore(infoContainer, content.firstChild);
        }
    }
    
    // Mostrar información si no hay datos suficientes
    if ((ventasDiariasData.length === 0 && ventasMensualesData.length === 0) || 
        (membresiasDiariasData.length === 0 && membresiasMensualesData.length === 0)) {
        mostrarInfoDatos();
    }
});

// Función para exportar datos
function exportData() {
    const ventasMensualesLabels = JSON.parse(document.getElementById('ventas-mensuales-labels').textContent || '[]');
    const ventasMensualesData = JSON.parse(document.getElementById('ventas-mensuales-data').textContent || '[]');
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Mes,Ventas\n"
        + ventasMensualesLabels.map((label, index) => `${label},${ventasMensualesData[index]}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ventas_mensuales.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 