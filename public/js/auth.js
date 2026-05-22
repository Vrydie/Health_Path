function irAFase2() {
    const nombre = document.getElementById('login-nombre').value;
    const peso = document.getElementById('reg-peso').value;
    const estatura = document.getElementById('reg-estatura').value;
    const meta = document.getElementById('reg-meta').value;
    const frecuencia = document.getElementById('reg-frecuencia').value;

    if (!nombre || !peso || !estatura || !meta || !frecuencia) {
        alert("Por favor, completa todos los datos de esta secciÃ³n.");
        return;
    }

    document.getElementById('fase-1').style.display = 'none';
    document.getElementById('fase-2').style.display = 'block';
}

function volverAFase1() {
    document.getElementById('fase-2').style.display = 'none';
    document.getElementById('fase-1').style.display = 'block';
}

async function registrarUsuario() {
    // Captura con los IDs correctos de tu HTML
    const nombre = document.getElementById('login-nombre').value;
    const peso = document.getElementById('reg-peso').value;
    const estatura = document.getElementById('reg-estatura').value;
    const meta = document.getElementById('reg-meta').value;
    const frecuencia = document.getElementById('reg-frecuencia').value;
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value;

    if (!email || !password || !confirmPassword) {
        alert("Por favor, completa los campos de cuenta.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseÃ±as no coinciden.");
        return;
    }

    // Cambia esa lÃ­nea por esta para probar en local
    const API_URL = "/registro";

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, meta, peso, estatura, frecuencia })
        });

        if (respuesta.ok) {
            alert("Â¡Guardado exitosamente!");
            window.location.href = "index.html"; // Redirige al login tras Ã©xito
        } else {
            const data = await respuesta.json();
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error de conexiÃ³n:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

async function iniciarSesion() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    //este if sirve para validar que el correo y la contraseÃ±a no esten vacios
    if (!email || !password) {
        alert("Por favor, ingresa tu correo y contraseÃ±a.");
        return;
    }

    const API_URL = "/login";

    try {

        //este const es para guardar la respuesta del fetch
        //fetch es para hacer peticiones http

        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (respuesta.ok) {
            const data = await respuesta.json();
            alert("Â¡Inicio de sesiÃ³n exitoso!");

            // Guardar datos de sesiÃ³n para que app.js sepa que ya entraste
            localStorage.setItem('user_session', JSON.stringify(data));

            // Redirige al panel principal (app.html)
            window.location.href = "app.html"; 
        } else {
            // Manejar errores como credenciales incorrectas
            const data = await respuesta.json();
            alert("Error: " + (data.message || "Credenciales incorrectas"));
        }
    } catch (error) {
        console.error("Error de conexiÃ³n:", error);
        alert("No se pudo conectar con el servidor.");
    }
}
