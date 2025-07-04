let videoStream = null;
let scanning = false;

document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('qr-video');
  const canvas = document.getElementById('qr-canvas');
  const btnIniciar = document.getElementById('btn-iniciar-camara');
  const btnDetener = document.getElementById('btn-detener-camara');
  
  // Cargar estado actual
  cargarEstadoActual();
  
  btnIniciar.addEventListener('click', iniciarCamara);
  btnDetener.addEventListener('click', detenerCamara);
  
  function iniciarCamara() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        videoStream = stream;
        video.srcObject = stream;
        btnIniciar.style.display = 'none';
        btnDetener.style.display = 'inline-block';
        scanning = true;
        escanearQR();
      })
      .catch(function(err) {
        alert('Error al acceder a la cámara: ' + err.message);
      });
  }
  
  function detenerCamara() {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
    btnIniciar.style.display = 'inline-block';
    btnDetener.style.display = 'none';
    scanning = false;
  }
  
  function escanearQR() {
    if (!scanning) return;
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      procesarQR(code.data);
      detenerCamara();
    } else {
      requestAnimationFrame(escanearQR);
    }
  }
  
  function procesarQR(qrData) {
    fetch('/escanear-qr/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
      },
      body: JSON.stringify({ qr_code: qrData })
    })
    .then(response => response.json())
    .then(data => {
      mostrarResultado(data);
      cargarEstadoActual();
    })
    .catch(error => {
      mostrarResultado({ error: 'Error al procesar el QR' });
    });
  }
  
  function mostrarResultado(data) {
    const resultadoSection = document.getElementById('resultado-section');
    const resultadoMensaje = document.getElementById('resultado-mensaje');
    
    resultadoSection.style.display = 'block';
    
    if (data.success) {
      const color = data.tipo === 'entrada' ? '#27ae60' : '#e74c3c';
      resultadoMensaje.innerHTML = `
        <div style="color: ${color}; font-weight: bold; font-size: 1.2rem;">
          ${data.mensaje}
        </div>
        <p>Establecimiento: ${data.establecimiento}</p>
      `;
    } else {
      resultadoMensaje.innerHTML = `
        <div style="color: #e74c3c; font-weight: bold;">
          Error: ${data.error}
        </div>
      `;
    }
    
    setTimeout(() => {
      resultadoSection.style.display = 'none';
    }, 5000);
  }
  
  function cargarEstadoActual() {
    // Aquí podrías hacer una llamada AJAX para obtener el estado actual del usuario
    // Por ahora, mostramos un mensaje genérico
    document.getElementById('estado-actual').innerHTML = `
      <p>Tu estado se actualizará después de escanear el QR.</p>
    `;
  }
});