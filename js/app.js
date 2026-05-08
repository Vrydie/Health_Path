// Simulación de datos que vienen de la DB
const rutinaHoy = [
    { id: 1, nombre: 'Press de Banca', series: '4x10' },
    { id: 2, nombre: 'Sentadillas', series: '4x12' },
    { id: 3, nombre: 'Peso Muerto', series: '3x8' }
];

// js/app.js (Al inicio del archivo)

(function verificarSesion() {
    const session = localStorage.getItem('user_session');
    if (!session) {
        // Si no hay sesión, regresa al login
        window.location.href = 'index.html';
    }
})();

function iniciarEntrenamiento() {
    const vacio = document.getElementById('entrenamiento-vacio');
    const lista = document.getElementById('lista-ejercicios');

    // Esconder el mensaje de vacío y mostrar la lista
    vacio.style.display = 'none';
    lista.style.display = 'block';

    // Limpiar lista por si acaso
    lista.innerHTML = '<h3>Ejercicios de Hoy</h3>';

    // Usamos .map para crear los elementos visuales
    rutinaHoy.map(ejercicio => {
        const item = document.createElement('ion-item');
        item.innerHTML = `
            <ion-label>
                <h2>${ejercicio.nombre}</h2>
                <p>${ejercicio.series}</p>
            </ion-label>
            <ion-checkbox slot="end"></ion-checkbox>
        `;
        lista.appendChild(item);
    });

    // Botón para agregar ejercicio extra (lo que pediste)
    const btnExtra = document.createElement('ion-button');
    btnExtra.innerText = "Agregar Ejercicio Extra";
    btnExtra.expand = "block";
    btnExtra.fill = "outline";
    btnExtra.className = "ion-margin-top";
    btnExtra.onclick = () => alert("Aquí abriríamos un buscador de ejercicios");
    lista.appendChild(btnExtra);
}