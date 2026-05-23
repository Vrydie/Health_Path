-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    meta VARCHAR(100),
    peso_actual DECIMAL(5,2),
    estatura DECIMAL(5,2),
    frecuencia_semanal INTEGER
);

-- Tabla de Ejercicios (Catálogo)
CREATE TABLE ejercicios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    grupo_muscular VARCHAR(100)
);

-- Tabla de Sesiones de Entrenamiento
CREATE TABLE sesiones_entrenamiento (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL
);

-- Tabla de Logs (Ejercicios realizados en cada sesión)
CREATE TABLE logs_entrenamiento (
    id SERIAL PRIMARY KEY,
    sesion_id INTEGER REFERENCES sesiones_entrenamiento(id) ON DELETE CASCADE,
    ejercicio_id VARCHAR(50) REFERENCES ejercicios(id),
    peso_levantado DECIMAL(5,2) NOT NULL,
    repeticiones INTEGER NOT NULL
);
