// js/app.js - Health Path

(function cargarDatosIniciales() {
    const session = localStorage.getItem('user_session');

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const datosUsuario = JSON.parse(session);

    const tituloObjetivo = document.getElementById('txt-objetivo');
    const tituloNombre   = document.getElementById('txt-nombre');
    const tituloPeso     = document.getElementById('txt-peso');
    const tituloEstatura = document.getElementById('txt-estatura');

    if (tituloObjetivo || tituloNombre || tituloPeso || tituloEstatura) {
        let metaBaseDatos    = datosUsuario.user.meta;
        let nombreBaseDatos  = datosUsuario.user.nombre;
        let pesoBaseDatos    = (parseFloat(datosUsuario.user.peso_actual) || 0) + ' kg';
        let estaturaBaseDatos = (datosUsuario.user.estatura || 0) + ' cm';

        if (metaBaseDatos) {
            metaBaseDatos = metaBaseDatos.replace(/_/g, ' ').toUpperCase();
            if (tituloObjetivo) tituloObjetivo.innerText = metaBaseDatos;
            if (tituloNombre)   tituloNombre.innerText   = nombreBaseDatos;
            if (tituloPeso)     tituloPeso.innerText      = pesoBaseDatos;
            if (tituloEstatura) tituloEstatura.innerText  = estaturaBaseDatos;
        } else {
            if (tituloObjetivo) tituloObjetivo.innerText = 'META NO DEFINIDA';
            if (tituloNombre)   tituloNombre.innerText   = 'NOMBRE NO DEFINIDO';
            if (tituloPeso)     tituloPeso.innerText      = 'PESO NO DEFINIDO';
            if (tituloEstatura) tituloEstatura.innerText  = 'ESTATURA NO DEFINIDA';
        }
    }

    // Pestaña de Perfil
    const perfilNombre    = document.getElementById('perfil-nombre');
    const perfilMeta      = document.getElementById('perfil-meta');
    const perfilEstatura  = document.getElementById('perfil-estatura');
    const perfilPeso      = document.getElementById('perfil-peso');
    const perfilFrecuencia = document.getElementById('perfil-frecuencia');

    if (perfilNombre && perfilMeta) {
        perfilNombre.innerText = datosUsuario.user.nombre;
        const metaTexto = datosUsuario.user.meta
            ? datosUsuario.user.meta.replace(/_/g, ' ')
            : 'No definido';
        perfilMeta.innerText = 'Objetivo: ' + metaTexto;
        if (perfilEstatura)  perfilEstatura.innerText  = 'Estatura: ' + (datosUsuario.user.estatura || 0) + ' cm';
        if (perfilPeso)      perfilPeso.innerText       = 'Peso: ' + (parseFloat(datosUsuario.user.peso_actual) || 0) + ' kg';
        if (perfilFrecuencia) perfilFrecuencia.innerText = 'Frecuencia: ' + (datosUsuario.user.frecuencia_semanal || 0) + ' dias/semana';
    }
})();

let todosLosEjercicios = [];
let mapaEjercicios = {};

async function iniciarEntrenamiento() {
    if (!localStorage.getItem('entrenamiento_fecha_inicio')) {
        localStorage.setItem('entrenamiento_fecha_inicio', new Date().toISOString());
    }

    const contenedorVacio     = document.getElementById('entrenamiento-vacio');
    const listaEjercicios     = document.getElementById('lista-ejercicios');
    const opcionesEntrenamiento = document.getElementById('opciones-entrenamiento');

    contenedorVacio.innerHTML = `
        <ion-spinner name="crescent" style="margin-top: 20px;"></ion-spinner>
        <p>Cargando rutinas desde ExerciseDB...</p>
    `;

    const apiKey = '414ced77e0msh178ded55b284266p132ff8jsn265c24e3f732';
    const url = 'https://exercisedb.p.rapidapi.com/exercises?limit=1300';

    try {
        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
            }
        });

        if (!respuesta.ok) throw new Error('Error al conectar con la API de ExerciseDB');

        todosLosEjercicios = await respuesta.json();

        contenedorVacio.style.display = 'none';
        opcionesEntrenamiento.style.display = 'block';
        listaEjercicios.style.display = 'block';

        const filtro = document.getElementById('filtro-musculo');
        if (filtro) {
            filtro.removeEventListener('ionChange', filtrarEjercicios);
            filtro.addEventListener('ionChange', filtrarEjercicios);
        }

        renderizarEjercicios(todosLosEjercicios);
        actualizarVistaListaPersonal();

    } catch (error) {
        console.error('Error:', error);
        contenedorVacio.innerHTML = `
            <ion-icon name="alert-circle-outline" style="font-size: 64px; color: var(--ion-color-danger);"></ion-icon>
            <h3>Hubo un problema</h3>
            <p>Verifica tu conexion y tu API Key de RapidAPI.</p>
            <ion-button expand="block" onclick="iniciarEntrenamiento()">Reintentar</ion-button>
        `;
    }
}

async function filtrarEjercicios(event) {
    const musculo = event.detail.value;
    const apiKey = '414ced77e0msh178ded55b284266p132ff8jsn265c24e3f732';
    let url = 'https://exercisedb.p.rapidapi.com/exercises?limit=10';

    if (musculo !== 'todos') {
        url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${musculo}?limit=10`;
    }

    const listaEjercicios = document.getElementById('lista-ejercicios');
    listaEjercicios.innerHTML = '<ion-spinner name="crescent" style="display:block; margin:20px auto;"></ion-spinner><p style="text-align:center;">Cargando rutinas...</p>';

    try {
        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
            }
        });

        if (!respuesta.ok) throw new Error('Error al conectar con la API');

        const ejercicios = await respuesta.json();
        renderizarEjercicios(ejercicios);
    } catch (error) {
        console.error(error);
        listaEjercicios.innerHTML = '<p style="text-align:center; color:red;">No se pudieron cargar los ejercicios.</p>';
    }
}

function renderizarEjercicios(ejerciciosArray) {
    const listaEjercicios = document.getElementById('lista-ejercicios');
    listaEjercicios.innerHTML = '';
    const apiKey = '414ced77e0msh178ded55b284266p132ff8jsn265c24e3f732';

    ejerciciosArray.forEach(ejercicio => {
        mapaEjercicios[ejercicio.id] = ejercicio;

        const card = document.createElement('ion-card');
        const instruccionesTexto = ejercicio.instructions ? ejercicio.instructions.join(' ') : 'Sin instrucciones.';
        const gifUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${ejercicio.id}&rapidapi-key=${apiKey}&resolution=360`;

        card.innerHTML = `
            <img src="${gifUrl}" alt="${ejercicio.name}" style="width: 100%; height: 300px; object-fit: contain; background: white;" />
            <ion-card-header>
                <ion-card-subtitle style="text-transform: uppercase;">Musculo: ${ejercicio.bodyPart}</ion-card-subtitle>
                <ion-card-title style="text-transform: capitalize;">${ejercicio.name}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <p><strong>Objetivo:</strong> <span style="text-transform: capitalize;">${ejercicio.target}</span></p>
                <p><strong>Equipamiento:</strong> <span style="text-transform: capitalize;">${ejercicio.equipment}</span></p>
                <p style="margin-top: 10px; margin-bottom: 15px;">${instruccionesTexto}</p>

                <div style="display: flex; gap: 10px; margin-top: 15px; align-items: center;">
                    <ion-item style="--background: rgba(255,255,255,0.05); border-radius: 8px; flex: 1; --padding-start: 10px;">
                        <ion-input type="number" id="peso-${ejercicio.id}" placeholder="Peso (kg)" style="text-align: center; color: white;"></ion-input>
                    </ion-item>
                    <ion-item style="--background: rgba(255,255,255,0.05); border-radius: 8px; flex: 1; --padding-start: 10px;">
                        <ion-input type="number" id="reps-${ejercicio.id}" placeholder="Reps" style="text-align: center; color: white;"></ion-input>
                    </ion-item>
                </div>
                <ion-button expand="block" color="success" style="margin-top: 15px; font-weight: bold;" onclick="agregarALaLista('${ejercicio.id}')">
                    <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                    Agregar a mi Lista
                </ion-button>
            </ion-card-content>
        `;
        listaEjercicios.appendChild(card);
    });

    if (ejerciciosArray.length === 0) {
        listaEjercicios.innerHTML = '<p style="text-align:center; margin-top:20px; color:#aaa;">No hay ejercicios para este musculo.</p>';
    }
}

async function cerrarEntrenamiento() {
    const miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');

    if (miLista.length > 0) {
        const confirmar = confirm(`Tienes ${miLista.length} ejercicio(s) en tu lista. Deseas guardar este entrenamiento en tu historial antes de finalizar?`);

        if (confirmar) {
            await finalizarYGuardarEntrenamiento();
            return;
        } else {
            const descartar = confirm('Estas seguro de que quieres finalizar sin guardar? Se borrara tu rutina actual.');
            if (!descartar) {
                return;
            }
        }
    }

    localStorage.removeItem('mi_entrenamiento_actual');
    localStorage.removeItem('entrenamiento_fecha_inicio');
    actualizarVistaListaPersonal();
    todosLosEjercicios = [];
    mapaEjercicios = {};

    const contenedorVacio      = document.getElementById('entrenamiento-vacio');
    const listaEjercicios      = document.getElementById('lista-ejercicios');
    const opcionesEntrenamiento = document.getElementById('opciones-entrenamiento');

    opcionesEntrenamiento.style.display = 'none';
    listaEjercicios.style.display = 'none';

    contenedorVacio.style.display = 'block';
    contenedorVacio.innerHTML = `
        <ion-icon name="barbell-outline" style="font-size: 64px; color: #ccc;"></ion-icon>
        <h3>No hay entrenamiento iniciado</h3>
        <ion-button expand="block" onclick="iniciarEntrenamiento()">Empezar a entrenar</ion-button>
    `;
}

function agregarALaLista(id) {
    const ejercicio = mapaEjercicios[id];
    if (!ejercicio) return;

    const pesoInput = document.getElementById(`peso-${id}`);
    const repsInput = document.getElementById(`reps-${id}`);

    if (!pesoInput || !repsInput) return;

    const peso = parseFloat(pesoInput.value);
    const reps = parseInt(repsInput.value, 10);

    if (isNaN(peso) || peso <= 0) {
        alert('Por favor, ingresa un peso valido (mayor a 0).');
        return;
    }
    if (isNaN(reps) || reps <= 0) {
        alert('Por favor, ingresa un numero de repeticiones valido (mayor a 0).');
        return;
    }

    let miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');

    const nuevoItem = {
        id: ejercicio.id,
        nombre: ejercicio.name,
        grupo_muscular: ejercicio.bodyPart,
        peso_levantado: peso,
        repeticiones: reps
    };

    miLista.push(nuevoItem);
    localStorage.setItem('mi_entrenamiento_actual', JSON.stringify(miLista));

    pesoInput.value = '';
    repsInput.value = '';

    actualizarVistaListaPersonal();
    alert(`${ejercicio.name} agregado a tu lista!`);
}

function actualizarVistaListaPersonal() {
    const contenedor = document.getElementById('mi-lista-entrenamiento-contenedor');
    const lista      = document.getElementById('mi-lista-ejercicios');

    if (!lista || !contenedor) return;

    const miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');

    if (miLista.length === 0) {
        contenedor.style.display = 'none';
        lista.innerHTML = '';
        return;
    }

    contenedor.style.display = 'block';
    lista.innerHTML = '';

    const apiKey = '414ced77e0msh178ded55b284266p132ff8jsn265c24e3f732';

    miLista.forEach((item, index) => {
        const ionItem = document.createElement('ion-item');
        ionItem.style.setProperty('--background', 'transparent');
        ionItem.style.setProperty('--border-color', 'rgba(255,255,255,0.08)');

        const gifUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${item.id}&rapidapi-key=${apiKey}&resolution=360`;

        ionItem.innerHTML = `
            <ion-thumbnail slot="start" style="--border-radius: 8px; background: white; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 10px;">
                <img src="${gifUrl}" alt="${item.nombre}" style="object-fit: contain; width: 100%; height: 100%;" />
            </ion-thumbnail>
            <ion-label style="margin-left: 5px;">
                <h2 style="text-transform: capitalize; font-weight: bold; color: white;">${item.nombre}</h2>
                <p style="color: #aaa; margin: 4px 0;">Musculo: <span style="text-transform: uppercase;">${item.grupo_muscular}</span></p>
                <div style="margin-top: 5px;">
                    <ion-badge color="success" style="margin-right: 5px; font-size: 0.8rem; padding: 4px 8px;">${item.peso_levantado} kg</ion-badge>
                    <ion-badge color="tertiary" style="font-size: 0.8rem; padding: 4px 8px;">${item.repeticiones} reps</ion-badge>
                </div>
            </ion-label>
            <ion-button slot="end" fill="clear" color="danger" onclick="eliminarDeLaLista(${index})">
                <ion-icon name="trash-outline" style="font-size: 1.2rem;"></ion-icon>
            </ion-button>
        `;
        lista.appendChild(ionItem);
    });
}

function eliminarDeLaLista(index) {
    let miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');
    miLista.splice(index, 1);
    localStorage.setItem('mi_entrenamiento_actual', JSON.stringify(miLista));
    actualizarVistaListaPersonal();
}

async function finalizarYGuardarEntrenamiento() {
    const session = localStorage.getItem('user_session');
    if (!session) {
        alert('Sesion no valida. Por favor inicia sesion de nuevo.');
        window.location.href = 'index.html';
        return;
    }

    const datosUsuario = JSON.parse(session);
    const usuario_id   = datosUsuario.user.id;
    const miLista      = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');

    if (miLista.length === 0) {
        alert('No tienes ejercicios agregados a tu lista.');
        return;
    }

    const fecha_inicio = localStorage.getItem('entrenamiento_fecha_inicio') || new Date().toISOString();
    const fecha_fin    = new Date().toISOString();

    try {
        const respuesta = await fetch('/guardar-entrenamiento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, fecha_inicio, fecha_fin, ejercicios: miLista })
        });

        if (respuesta.ok) {
            alert('Entrenamiento guardado y subido a tu historial con exito!');
            localStorage.removeItem('mi_entrenamiento_actual');
            localStorage.removeItem('entrenamiento_fecha_inicio');
            actualizarVistaListaPersonal();

            todosLosEjercicios = [];
            mapaEjercicios = {};
            const contenedorVacio      = document.getElementById('entrenamiento-vacio');
            const listaEjercicios      = document.getElementById('lista-ejercicios');
            const opcionesEntrenamiento = document.getElementById('opciones-entrenamiento');

            opcionesEntrenamiento.style.display = 'none';
            listaEjercicios.style.display = 'none';

            contenedorVacio.style.display = 'block';
            contenedorVacio.innerHTML = `
                <ion-icon name="barbell-outline" style="font-size: 64px; color: #ccc;"></ion-icon>
                <h3>No hay entrenamiento iniciado</h3>
                <ion-button expand="block" onclick="iniciarEntrenamiento()">Empezar a entrenar</ion-button>
            `;

            cargarHistorialEstadisticas();
            cargarYCalcularProgresoSemanal();
        } else {
            const data = await respuesta.json();
            alert('Error al guardar el entrenamiento: ' + (data.message || 'Error del servidor.'));
        }
    } catch (error) {
        console.error('Error al guardar entrenamiento:', error);
        alert('No se pudo conectar al servidor para guardar tu entrenamiento.');
    }
}

function cerrarSesion() {
    localStorage.removeItem('user_session');
    window.location.href = 'index.html';
}

function AbrirEditarPerfil() {
    const modal = document.getElementById('modal-editar-perfil');
    if (!modal) return;

    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    const user    = session.user || {};

    document.getElementById('edit-nombre').value    = user.nombre || '';
    document.getElementById('edit-meta').value      = user.meta || '';
    document.getElementById('edit-estatura').value  = user.estatura || '';
    document.getElementById('edit-peso').value      = user.peso_actual || '';
    document.getElementById('edit-frecuencia').value = user.frecuencia_semanal || '';

    modal.classList.add('active');
}

function CerrarModal() {
    const modal = document.getElementById('modal-editar-perfil');
    if (modal) modal.classList.remove('active');
}

async function GuardarEdicion() {
    const nombre    = document.getElementById('edit-nombre').value;
    const meta      = document.getElementById('edit-meta').value;
    const estatura  = document.getElementById('edit-estatura').value;
    const peso      = document.getElementById('edit-peso').value;
    const frecuencia = document.getElementById('edit-frecuencia').value;

    const session = JSON.parse(localStorage.getItem('user_session'));
    if (!session || !session.user) return;
    const id = session.user.id;

    try {
        const respuesta = await fetch('/actualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nombre, meta, peso, estatura, frecuencia })
        });

        if (respuesta.ok) {
            const data = await respuesta.json();
            alert('Perfil actualizado con exito!');
            localStorage.setItem('user_session', JSON.stringify({ success: true, user: data.user }));
            window.location.reload();
        } else {
            alert('Error al actualizar');
        }
    } catch (error) {
        console.error(error);
        alert('No se pudo conectar al servidor');
    }
    CerrarModal();
}

// === HISTORIAL Y LINEA DE TIEMPO EN ESTADISTICAS ===
async function cargarHistorialEstadisticas() {
    const contenedor = document.getElementById('contenedor-historial');
    if (!contenedor) return;

    const session = localStorage.getItem('user_session');
    if (!session) return;

    const datosUsuario = JSON.parse(session);
    const usuario_id   = datosUsuario.user.id;

    contenedor.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <ion-spinner name="crescent" style="color: var(--ion-color-tertiary);"></ion-spinner>
            <p style="color: #aaa; margin-top: 10px; font-size: 0.9rem;">Cargando historial...</p>
        </div>
    `;

    try {
        const respuesta = await fetch(`/historial/${usuario_id}`);
        if (!respuesta.ok) throw new Error('Error al cargar historial');

        const data    = await respuesta.json();
        const sesiones = data.sesiones || [];

        if (sesiones.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; border: 2px dashed rgba(255,255,255,0.08); border-radius: 12px; background: rgba(255,255,255,0.01); margin-top: 15px;">
                    <ion-icon name="calendar-outline" style="font-size: 48px; color: #555; margin-bottom: 10px;"></ion-icon>
                    <h4 style="color: #ccc; margin: 0; font-weight: bold; font-size: 1.1rem;">Sin entrenamientos registrados</h4>
                    <p style="color: #777; font-size: 0.85rem; margin-top: 5px; line-height: 1.4;">Comienza una rutina y finalizala para que tus sesiones aparezcan en esta linea de tiempo.</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = '';

        const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
        const opcionesHora  = { hour: '2-digit', minute: '2-digit', hour12: false };

        sesiones.forEach(sesion => {
            const inicio = new Date(sesion.fecha_inicio);
            const fin    = new Date(sesion.fecha_fin);

            const duracionMs      = fin - inicio;
            const duracionMinutos = Math.max(1, Math.round(duracionMs / 60000));

            const fechaTexto      = inicio.toLocaleDateString('es-ES', opcionesFecha);
            const horaInicioTexto = inicio.toLocaleTimeString('es-ES', opcionesHora);
            const horaFinTexto    = fin.toLocaleTimeString('es-ES', opcionesHora);

            const tarjetaSesion = document.createElement('div');
            tarjetaSesion.className = 'timeline-card';
            tarjetaSesion.style.cssText = `
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
            `;

            let ejerciciosHTML = '';
            if (sesion.ejercicios && sesion.ejercicios.length > 0) {
                sesion.ejercicios.forEach(ej => {
                    ejerciciosHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,0.06);">
                            <div style="flex: 1; padding-right: 10px;">
                                <div style="font-weight: bold; text-transform: capitalize; color: #fff; font-size: 0.9rem; line-height: 1.2;">${ej.nombre}</div>
                                <div style="font-size: 0.7rem; text-transform: uppercase; color: #777; margin-top: 2px;">Musculo: ${ej.grupo_muscular}</div>
                            </div>
                            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                                <span style="background: rgba(45, 211, 111, 0.12); color: #2dd36f; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${ej.peso_levantado} kg</span>
                                <span style="background: rgba(112, 68, 255, 0.12); color: #7044ff; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${ej.repeticiones} reps</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                ejerciciosHTML = '<p style="color: #555; font-size: 0.8rem; font-style: italic; margin: 5px 0 0 0;">Sin ejercicios registrados.</p>';
            }

            const maxMinutos      = 120;
            const porcentajeBarra = Math.min(100, (duracionMinutos / maxMinutos) * 100);

            tarjetaSesion.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--ion-color-tertiary); font-weight: bold;">Sesion Completada</span>
                        <h4 style="margin: 2px 0 0 0; font-weight: bold; color: #fff; font-size: 1.1rem;">${fechaTexto}</h4>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                        <span style="font-size: 0.8rem; color: #aaa; font-weight: 500; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px;">${horaInicioTexto} - ${horaFinTexto}</span>
                    </div>
                </div>

                <div style="margin-bottom: 16px; background: rgba(255,255,255,0.01); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.8rem;">
                        <span style="color: #888;">Tiempo transcurrido:</span>
                        <span style="color: var(--ion-color-tertiary); font-weight: bold;">${duracionMinutos} min</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${porcentajeBarra}%; height: 100%; background: linear-gradient(90deg, var(--ion-color-tertiary), #3880ff); border-radius: 3px;"></div>
                    </div>
                </div>

                <div>
                    <h5 style="margin: 0 0 6px 0; font-size: 0.75rem; text-transform: uppercase; color: #666; font-weight: bold; letter-spacing: 0.5px;">Desglose de Ejercicios</h5>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        ${ejerciciosHTML}
                    </div>
                </div>
            `;
            contenedor.appendChild(tarjetaSesion);
        });

    } catch (error) {
        console.error('Error al cargar historial:', error);
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--ion-color-danger);">
                <ion-icon name="alert-circle-outline" style="font-size: 48px; margin-bottom: 10px;"></ion-icon>
                <p>No se pudo conectar con el servidor.</p>
                <ion-button size="small" fill="outline" color="danger" onclick="cargarHistorialEstadisticas()">Reintentar</ion-button>
            </div>
        `;
    }
}

// === RESTAURACION AUTOMATICA AL INICIAR LA PAGINA ===
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('entrenamiento_fecha_inicio')) {
        iniciarEntrenamiento();
    }

    const ionTabs = document.querySelector('ion-tabs');
    if (ionTabs) {
        ionTabs.addEventListener('ionTabsDidChange', (event) => {
            if (event.detail.tab === 'stats') {
                cargarHistorialEstadisticas();
            }
        });
    }
});

function actualizarProgresoSemanal(datosProgreso) {
    const musculos = ['pecho', 'piernas', 'abdomen', 'brazos', 'espalda', 'hombros'];

    musculos.forEach(musculo => {
        let porcentaje = datosProgreso[musculo] !== undefined ? datosProgreso[musculo] : 0;
        if (porcentaje > 100) porcentaje = 100;
        if (porcentaje < 0)   porcentaje = 0;
        porcentaje = Math.round(porcentaje);

        const elementoTexto = document.getElementById(`txt-${musculo}`);
        if (elementoTexto) {
            elementoTexto.innerText = `${porcentaje}%`;
            const elementoBarra = document.getElementById(`bar-${musculo}`);
            if (elementoBarra) {
                elementoTexto.style.color = `var(--ion-color-${elementoBarra.color})`;
            }
        }

        const elementoBarra = document.getElementById(`bar-${musculo}`);
        if (elementoBarra) {
            elementoBarra.value = porcentaje / 100;
        }
    });
}

async function cargarYCalcularProgresoSemanal() {
    const session = localStorage.getItem('user_session');
    if (!session) return;

    const datosUsuario = JSON.parse(session);
    const usuario_id   = datosUsuario.user.id;

    try {
        const respuesta = await fetch(`/historial/${usuario_id}`);
        if (!respuesta.ok) return;

        const data    = await respuesta.json();
        const sesiones = data.sesiones || [];

        const metasSemanales  = { pecho: 12, piernas: 12, abdomen: 8, brazos: 10, espalda: 12, hombros: 10 };
        const conteoSemanales = { pecho: 0,  piernas: 0,  abdomen: 0, brazos: 0,  espalda: 0,  hombros: 0  };

        const mapeoMusculos = {
            'chest':       'pecho',
            'upper legs':  'piernas',
            'lower legs':  'piernas',
            'waist':       'abdomen',
            'upper arms':  'brazos',
            'lower arms':  'brazos',
            'back':        'espalda',
            'shoulders':   'hombros'
        };

        const hoy       = new Date();
        const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
        const lunes     = new Date(hoy);
        lunes.setDate(hoy.getDate() - diaSemana);
        lunes.setHours(0, 0, 0, 0);

        sesiones.forEach(sesion => {
            const fechaSesion = new Date(sesion.fecha_inicio);
            if (fechaSesion >= lunes) {
                if (sesion.ejercicios && Array.isArray(sesion.ejercicios)) {
                    sesion.ejercicios.forEach(ej => {
                        const grupoIngles  = ej.grupo_muscular ? ej.grupo_muscular.toLowerCase() : '';
                        const grupoEspanol = mapeoMusculos[grupoIngles];
                        if (grupoEspanol && conteoSemanales[grupoEspanol] !== undefined) {
                            conteoSemanales[grupoEspanol]++;
                        }
                    });
                }
            }
        });

        const progreso = {};
        for (const musculo in metasSemanales) {
            progreso[musculo] = (conteoSemanales[musculo] / metasSemanales[musculo]) * 100;
        }

        actualizarProgresoSemanal(progreso);

    } catch (error) {
        console.error('Error al calcular el progreso semanal:', error);
    }
}

// Inicializar progreso al cargar
document.addEventListener('DOMContentLoaded', () => {
    cargarYCalcularProgresoSemanal();
});
