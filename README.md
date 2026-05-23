# 🏋️ Health Path

> Tu camino hacia una vida más saludable y activa. Registra, analiza y mejora tus entrenamientos desde cualquier dispositivo.

![Health Path Banner](public/assets/logo.png)

---

## 📱 Demo en Vivo

🔗 **[health-path-app.onrender.com](https://health-path-app.onrender.com)**

> Disponible como **Progressive Web App (PWA)** — instálala en tu celular directamente desde el navegador.

---

## ✨ Funcionalidades

- **🔐 Autenticación** — Registro e inicio de sesión con email y contraseña
- **🏋️ Entrenamiento en Vivo** — Más de 1,300 ejercicios desde la API de ExerciseDB, con filtro por grupo muscular
- **📋 Lista Personal** — Agrega ejercicios con peso y repeticiones a tu rutina del día
- **📊 Progreso Semanal** — Barras de progreso por grupo muscular (Pecho, Piernas, Abdomen, Brazos, Espalda, Hombros) basadas en series completadas vs. metas semanales
- **🗂️ Historial** — Línea de tiempo detallada de todas tus sesiones anteriores con desglose de ejercicios, duración y horarios
- **👤 Perfil** — Edita tu nombre, objetivo, peso, estatura y frecuencia semanal
- **📲 Instalable (PWA)** — Añade la app a la pantalla de inicio de tu celular como si fuera una app nativa

---

## 🎯 Metas Semanales de Series

| Grupo Muscular | Series / Semana |
|---|:---:|
| 💪 Pecho | 12 |
| 🦵 Piernas | 12 |
| 🔥 Abdomen | 8 |
| 💪 Brazos | 10 |
| 🏔️ Espalda | 12 |
| 🏋️ Hombros | 10 |

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica de las páginas |
| **CSS3 Vanilla** | Diseño "Liquid Glass" con glassmorphism, animaciones y diseño responsivo |
| **JavaScript (ES6+)** | Lógica de la aplicación, fetch API, localStorage |
| **Ionic Framework v7** | Componentes de UI mobile-first (tabs, cards, inputs, progress bars) |
| **Google Fonts** — Sora & DM Sans | Tipografía premium |
| **PWA** (manifest.json + Service Worker) | Instalación en dispositivos móviles y caching inteligente |

### Backend
| Tecnología | Uso |
|---|---|
| **Node.js** | Runtime del servidor |
| **Express.js** | Framework HTTP para las rutas de la API REST |
| **PostgreSQL** | Base de datos relacional para usuarios, sesiones y ejercicios |
| **pg (node-postgres)** | Driver para conectar Node.js con PostgreSQL |

### Infraestructura & Deploy
| Servicio | Uso |
|---|---|
| **Render.com** | Hosting del servidor Node.js (Web Service) |
| **Neon.tech** | Base de datos PostgreSQL en la nube (serverless) |
| **GitHub** | Control de versiones y CI/CD con Render |
| **ExerciseDB (RapidAPI)** | API externa con más de 1,300 ejercicios con GIFs animados |

---

## 🗄️ Esquema de Base de Datos

```sql
usuarios              -- Datos de perfil del usuario
sesiones_entrenamiento -- Cada vez que el usuario finaliza una rutina
ejercicios            -- Catálogo de ejercicios (sincronizado desde ExerciseDB)
logs_entrenamiento    -- Ejercicios realizados en cada sesión (peso + reps)
```

---

## 🚀 Ejecutar Localmente

### Requisitos previos
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) instalado y corriendo

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/Health_Path.git
cd Health_Path

# 2. Instala las dependencias
npm install

# 3. Crea las tablas en tu base de datos local
# Abre tu cliente de PostgreSQL (pgAdmin o psql) y ejecuta:
# database_schema.sql

# 4. Configura la conexión a la base de datos
# Edita db.js con tu string de conexión local

# 5. Inicia el servidor
node server.js

# 6. Abre la aplicación
# Navega a http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
HEALTH-PATH/
├── public/                  # Frontend (servido por Express como archivos estáticos)
│   ├── index.html           # Pantalla de inicio de sesión
│   ├── register.html        # Pantalla de registro
│   ├── app.html             # Aplicación principal (tabs)
│   ├── css/
│   │   ├── style.css        # Estilos globales
│   │   └── inicio.css       # Estilos de las barras de progreso
│   ├── js/
│   │   ├── app.js           # Lógica principal (entrenamiento, historial, progreso)
│   │   └── auth.js          # Lógica de login y registro
│   ├── assets/
│   │   └── logo.png         # Logo de la aplicación
│   ├── manifest.json        # Configuración PWA
│   └── sw.js                # Service Worker (caching inteligente)
├── server.js                # Servidor Express + API REST
├── db.js                    # Configuración de conexión a PostgreSQL
├── database_schema.sql      # Script para crear las tablas
├── package.json
└── README.md
```

---

## 🌐 Variables de Entorno (Producción)

En Render, configura esta variable de entorno:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL (de Neon.tech) |

---

## 👨‍💻 Autor
SAMUEL VARGAS AVECEDO - https://github.com/Vrydie
Desarrollado con ❤️ como proyecto personal de fitness tracking.

---

## 📄 Licencia

MIT License — libre para usar y modificar.
