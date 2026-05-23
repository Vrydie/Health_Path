// js/auth.js - Health Path

function irAFase2() {
    const nombre    = document.getElementById('login-nombre').value;
    const peso      = document.getElementById('reg-peso').value;
    const estatura  = document.getElementById('reg-estatura').value;
    const meta      = document.getElementById('reg-meta').value;
    const frecuencia = document.getElementById('reg-frecuencia').value;

    if (!nombre || !peso || !estatura || !meta || !frecuencia) {
        alert('Por favor, completa todos los datos de esta seccion.');
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
    const nombre     = document.getElementById('login-nombre').value;
    const peso       = document.getElementById('reg-peso').value;
    const estatura   = document.getElementById('reg-estatura').value;
    const meta       = document.getElementById('reg-meta').value;
    const frecuencia = document.getElementById('reg-frecuencia').value;

    const email           = document.getElementById('login-email').value;
    const password        = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value;

    if (!email || !password || !confirmPassword) {
        alert('Por favor, completa los campos de cuenta.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contrasenas no coinciden.');
        return;
    }

    try {
        const respuesta = await fetch('/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, meta, peso, estatura, frecuencia })
        });

        if (respuesta.ok) {
            alert('Cuenta creada exitosamente! Ahora puedes iniciar sesion.');
            window.location.href = 'index.html';
        } else {
            const data = await respuesta.json();
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error de conexion:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function iniciarSesion() {
    const email    = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Por favor, ingresa tu correo y contrasena.');
        return;
    }

    try {
        const respuesta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (respuesta.ok) {
            const data = await respuesta.json();
            localStorage.setItem('user_session', JSON.stringify(data));
            window.location.href = 'app.html';
        } else {
            const data = await respuesta.json();
            alert('Error: ' + (data.message || 'Credenciales incorrectas'));
        }
    } catch (error) {
        console.error('Error de conexion:', error);
        alert('No se pudo conectar con el servidor.');
    }
}
