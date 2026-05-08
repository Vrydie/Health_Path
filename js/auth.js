async function registrarUsuario() {
    // Captura con los IDs correctos de tu HTML
    const nombre = document.getElementById('login-nombre').value;
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('reg-password').value; // ID corregido
    const meta = document.getElementById('reg-meta').value; // Usamos el ID del select

    // Cambia esa línea por esta (usa la URL de tu Web Service en el dashboard de Render)
const API_URL = "https://health-path-api.onrender.com/registro";

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, meta })
        });

        if (respuesta.ok) {
            alert("¡Guardado en Render exitosamente!");
            window.location.href = "index.html"; // Redirige al login tras éxito
        } else {
            alert("Error al guardar. Revisa los logs de Render.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}