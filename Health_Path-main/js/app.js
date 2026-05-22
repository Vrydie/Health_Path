// Simulación de datos que vienen de la DB
const rutinaHoy = [
    { id: 1, nombre: 'Press de Banca', series: '4x10' },
    { id: 2, nombre: 'Sentadillas', series: '4x12' },
    { id: 3, nombre: 'Peso Muerto', series: '3x8' }
];

// js/app.js (Al inicio del archivo)

(function cargarDatosIniciales() {
    const session = localStorage.getItem('user_session');
    
    if (!session) {
        // Si no hay sesión, regresa al login
        window.location.href = 'index.html';
        return; // Detiene la función aquí
    }

    // 1. Transformar el texto guardado a un Objeto real
    const datosUsuario = JSON.parse(session); 
    // Ahora datosUsuario tiene algo como: { user: { nombre: "Sam", meta: "perder_peso" } }

    // 2. Buscar el elemento HTML donde queremos poner la meta
    const tituloObjetivo = document.getElementById('txt-objetivo');
    const tituloNombre = document.getElementById('txt-nombre');
    const tituloPeso = document.getElementById('txt-peso');
    const tituloEstatura = document.getElementById('txt-estatura');
    
    // 3. Cambiar el texto del elemento si existe en la pantalla
    if (tituloObjetivo || tituloNombre || tituloPeso || tituloEstatura) {
        // Obtenemos la meta de la base de datos (ej: "perder_peso")
        let metaBaseDatos = datosUsuario.user.meta; 
        let nombreBaseDatos = datosUsuario.user.nombre; 
        let pesoBaseDatos = datosUsuario.user.peso_actual; 
        let estaturaBaseDatos = datosUsuario.user.estatura; 
        estaturaBaseDatos = estaturaBaseDatos + " cm";
        pesoBaseDatos = pesoBaseDatos + " kg";
        // Podemos "limpiarla" un poco quitando guiones bajos y poniéndola en mayúsculas
        if(metaBaseDatos) {
            metaBaseDatos = metaBaseDatos.replace('_', ' ').toUpperCase(); 
            tituloObjetivo.innerText = metaBaseDatos;
            tituloNombre.innerText = nombreBaseDatos;
            tituloPeso.innerText = pesoBaseDatos;
            tituloEstatura.innerText = estaturaBaseDatos;
            tituloNombre.innerText = nombreBaseDatos;
            tituloPeso.innerText = pesoBaseDatos;
            tituloEstatura.innerText = estaturaBaseDatos;
            
        } else {
            tituloObjetivo.innerText = "META NO DEFINIDA";
            tituloNombre.innerText = "NOMBRE NO DEFINIDO";
            tituloPeso.innerText = "PESO NO DEFINIDO";
            tituloEstatura.innerText = "ESTATURA NO DEFINIDA";
        }
    }

    // EXTRA: Aprovechamos para llenar tu pestaña de "Perfil" también
    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilMeta = document.getElementById('perfil-meta');
    const perfilEstatura = document.getElementById('perfil-estatura');
    const perfilPeso = document.getElementById('perfil-peso');
    const perfilFrecuencia = document.getElementById('perfil-frecuencia');
    if (perfilNombre && perfilMeta) {
        perfilNombre.innerText = datosUsuario.user.nombre;
        
        // Limpiamos la meta para quitar guiones bajos y ponerla en mayúsculas
        const metaTexto = datosUsuario.user.meta ? datosUsuario.user.meta.replace(/_/g, ' ') : "NO DEFINIDO";
        perfilMeta.innerText = "Objetivo: " + metaTexto;
        
        if (perfilEstatura) perfilEstatura.innerText = "Estatura: " + (datosUsuario.user.estatura || 0) + " cm";
        if (perfilPeso) perfilPeso.innerText = "Peso: " + (datosUsuario.user.peso_actual || 0) + " kg";
        if (perfilFrecuencia) perfilFrecuencia.innerText = "Frecuencia: " + (datosUsuario.user.frecuencia_semanal || 0) + " días/semana";
    }
})();

let todosLosEjercicios = [];
let mapaEjercicios = {};

async function iniciarEntrenamiento() {
    const contenedorVacio = document.getElementById('entrenamiento-vacio');
    const listaEjercicios = document.getElementById('lista-ejercicios');
    const opcionesEntrenamiento = document.getElementById('opciones-entrenamiento');

    // Cambiar vista a estado de carga
    contenedorVacio.innerHTML = `
        <ion-spinner name="crescent" style="margin-top: 20px;"></ion-spinner>
        <p>Cargando rutinas desde ExerciseDB...</p>
    `;
    
    const apiKey = '414ced77e0msh178ded55b284266p132ff8jsn265c24e3f732'; 
    // Pedimos 1300 para descargar toda la base de datos de ejercicios de golpe
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

        // Ocultar cargando, mostrar opciones y lista
        contenedorVacio.style.display = 'none';
        opcionesEntrenamiento.style.display = 'block';
        listaEjercicios.style.display = 'block';
        
        // Agregar evento de filtro
        const filtro = document.getElementById('filtro-musculo');
        if(filtro) {
            // Elimina evento previo para no duplicar si presionan 2 veces
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
            <p>Verifica tu conexión y tu API Key de RapidAPI.</p>
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
        // Almacenar en caché para poder agregarlo por ID
        mapaEjercicios[ejercicio.id] = ejercicio;

        const card = document.createElement('ion-card');
        const instruccionesTexto = ejercicio.instructions ? ejercicio.instructions.join(' ') : 'Sin instrucciones.';
        const gifUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${ejercicio.id}&rapidapi-key=${apiKey}&resolution=360`;

        card.innerHTML = `
            <img src="${gifUrl}" alt="${ejercicio.name}" style="width: 100%; height: 300px; object-fit: contain; background: white;" />
            <ion-card-header>
                <ion-card-subtitle style="text-transform: uppercase;">Músculo: ${ejercicio.bodyPart}</ion-card-subtitle>
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
        listaEjercicios.innerHTML = '<p style="text-align:center; margin-top:20px; color:#aaa;">No hay ejercicios para este músculo.</p>';
    }
}

async function cerrarEntrenamiento() {
    const miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');
    
    if (miLista.length > 0) {
        const confirmar = confirm(`Tienes ${miLista.length} ejercicio(s) en tu lista. ¿Deseas guardar este entrenamiento en tu historial antes de finalizar?`);
        
        if (confirmar) {
            await finalizarYGuardarEntrenamiento();
            return;
        } else {
            const descartar = confirm("¿Estás seguro de que quieres finalizar sin guardar? Se borrará tu rutina actual.");
            if (!descartar) {
                return;
            }
        }
    }

    // Limpiar localStorage y memoria
    localStorage.removeItem('mi_entrenamiento_actual');
    actualizarVistaListaPersonal();
    todosLosEjercicios = [];
    mapaEjercicios = {};

    const contenedorVacio = document.getElementById('entrenamiento-vacio');
    const listaEjercicios = document.getElementById('lista-ejercicios');
    const opcionesEntrenamiento = document.getElementById('opciones-entrenamiento');

    // Ocultar opciones y lista
    opcionesEntrenamiento.style.display = 'none';
    listaEjercicios.style.display = 'none';
    
    // Restaurar contenedor vacío
    contenedorVacio.style.display = 'block';
    contenedorVacio.innerHTML = `
        <ion-icon name="barbell-outline" style="font-size: 64px; color: #ccc;"></ion-icon>
        <h3>No hay entrenamiento iniciado</h3>
        <ion-button expand="block" onclick="iniciarEntrenamiento()">Empezar a entrenar</ion-button>
    `;
}

// --- NUEVAS FUNCIONES PARA LA GESTIÓN DE LA RUTINA PERSONAL ---

function agregarALaLista(id) {
    const ejercicio = mapaEjercicios[id];
    if (!ejercicio) return;

    const pesoInput = document.getElementById(`peso-${id}`);
    const repsInput = document.getElementById(`reps-${id}`);

    if (!pesoInput || !repsInput) return;

    const peso = parseFloat(pesoInput.value);
    const reps = parseInt(repsInput.value, 10);

    if (isNaN(peso) || peso <= 0) {
        alert("Por favor, ingresa un peso válido (mayor a 0).");
        return;
    }
    if (isNaN(reps) || reps <= 0) {
        alert("Por favor, ingresa un número de repeticiones válido (mayor a 0).");
        return;
    }

    // Obtener la lista actual de localStorage
    let miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');

    // Crear el nuevo item
    const nuevoItem = {
        id: ejercicio.id,
        nombre: ejercicio.name,
        grupo_muscular: ejercicio.bodyPart,
        peso_levantado: peso,
        repeticiones: reps
    };

    // Agregar a la lista
    miLista.push(nuevoItem);

    // Guardar en localStorage
    localStorage.setItem('mi_entrenamiento_actual', JSON.stringify(miLista));

    // Limpiar inputs
    pesoInput.value = '';
    repsInput.value = '';

    // Renderizar la lista personal en pantalla
    actualizarVistaListaPersonal();

    // Mostrar feedback
    alert(`¡${ejercicio.name} agregado a tu lista!`);
}

function actualizarVistaListaPersonal() {
    const contenedor = document.getElementById('mi-lista-entrenamiento-contenedor');
    const lista = document.getElementById('mi-lista-ejercicios');

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
                <p style="color: #aaa; margin: 4px 0;">Músculo: <span style="text-transform: uppercase;">${item.grupo_muscular}</span></p>
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
        alert("Sesión no válida. Por favor inicia sesión de nuevo.");
        window.location.href = 'index.html';
        return;
    }

    const datosUsuario = JSON.parse(session);
    const usuario_id = datosUsuario.user.id;
    const miLista = JSON.parse(localStorage.getItem('mi_entrenamiento_actual') || '[]');

    if (miLista.length === 0) {
        alert("No tienes ejercicios agregados a tu lista.");
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/guardar-entrenamiento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id,
                ejercicios: miLista
            })
        });

        if (respuesta.ok) {
            alert("¡Entrenamiento guardado y subido a tu historial con éxito!");
            // Limpiar lista
            localStorage.removeItem('mi_entrenamiento_actual');
            actualizarVistaListaPersonal();
            
            // Cerrar el entrenamiento (limpiar UI)
            todosLosEjercicios = [];
            mapaEjercicios = {};
            const contenedorVacio = document.getElementById('entrenamiento-vacio');
            const listaEjercicios = document.getElementById('lista-ejercicios');
            const opcionesEntrenamiento = document.getElementById('opciones-entrenamiento');

            opcionesEntrenamiento.style.display = 'none';
            listaEjercicios.style.display = 'none';
            
            contenedorVacio.style.display = 'block';
            contenedorVacio.innerHTML = `
                <ion-icon name="barbell-outline" style="font-size: 64px; color: #ccc;"></ion-icon>
                <h3>No hay entrenamiento iniciado</h3>
                <ion-button expand="block" onclick="iniciarEntrenamiento()">Empezar a entrenar</ion-button>
            `;
        } else {
            const data = await respuesta.json();
            alert("Error al guardar el entrenamiento: " + (data.message || "Error del servidor."));
        }
    } catch (error) {
        console.error("Error al guardar entrenamiento:", error);
        alert("No se pudo conectar al servidor para guardar tu entrenamiento.");
    }
}

// Lógica para el botón de "Cerrar Sesión"
function cerrarSesion() {
    // Borrar el "pase de abordar"
    localStorage.removeItem('user_session');
    // Redirigir de vuelta al login
    window.location.href = 'index.html';
}

// Función para abrir el modal de edición
function AbrirEditarPerfil() {
    const modal = document.getElementById('modal-editar-perfil');
    if (!modal) return;

    // 1. Cargar datos actuales en los inputs del modal
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    const user = session.user || {};

    document.getElementById('edit-nombre').value = user.nombre || '';
    document.getElementById('edit-meta').value = user.meta || '';
    document.getElementById('edit-estatura').value = user.estatura || '';
    document.getElementById('edit-peso').value = user.peso_actual || '';
    document.getElementById('edit-frecuencia').value = user.frecuencia_semanal || '';

    // 2. Mostrar el modal
    modal.classList.add('active');
}

// Función para cerrar el modal
function CerrarModal() {
    const modal = document.getElementById('modal-editar-perfil');
    if (modal) modal.classList.remove('active');
}

// Función para guardar los datos editados
async function GuardarEdicion() {
    const nombre = document.getElementById('edit-nombre').value;
    const meta = document.getElementById('edit-meta').value;
    const estatura = document.getElementById('edit-estatura').value;
    const peso = document.getElementById('edit-peso').value;
    const frecuencia = document.getElementById('edit-frecuencia').value;

    const session = JSON.parse(localStorage.getItem('user_session'));
    if (!session || !session.user) return;
    const id = session.user.id;

    try {
        const respuesta = await fetch('http://localhost:3000/actualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nombre, meta, peso, estatura, frecuencia })
        });

        if (respuesta.ok) {
            const data = await respuesta.json();
            alert("¡Perfil actualizado con éxito!");
            localStorage.setItem('user_session', JSON.stringify({ success: true, user: data.user }));
            window.location.reload();
        } else {
            alert("Error al actualizar");
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar al servidor");
    }
    CerrarModal();
}