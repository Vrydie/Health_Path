const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// 1. ENDPOINT DE REGISTRO (Actualizado con 'meta')
app.post('/registro', async (req, res) => {
    const { nombre, email, password, meta, peso, estatura, frecuencia } = req.body;

    try {
        const query = 'INSERT INTO usuarios (nombre, email, password, meta, peso_actual, estatura, frecuencia_semanal) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre';
        const values = [nombre, email, password, meta, peso, estatura, frecuencia];
        
        const result = await pool.query(query, values);
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "El correo ya existe o hubo un error en la DB." });
    }
});

// 2. ENDPOINT DE LOGIN (Mantenlo para que puedan entrar)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT id, nombre, meta, peso_actual, estatura, frecuencia_semanal FROM usuarios WHERE email = $1 AND password = $2', 
            [email, password]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});
// 3. ENDPOINT PARA ACTUALIZAR PERFIL
app.put('/actualizar', async (req, res) => {
    const { id, nombre, meta, peso, estatura, frecuencia } = req.body;
    try {
        const query = 'UPDATE usuarios SET nombre=$1, meta=$2, peso_actual=$3, estatura=$4, frecuencia_semanal=$5 WHERE id=$6 RETURNING id, nombre, meta, peso_actual, estatura, frecuencia_semanal';
        const values = [nombre, meta, peso, estatura, frecuencia, id];
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error al actualizar la DB." });
    }
});

// 4. ENDPOINT PARA GUARDAR ENTRENAMIENTO
app.post('/guardar-entrenamiento', async (req, res) => {
    const { usuario_id, fecha_inicio, fecha_fin, ejercicios } = req.body;

    if (!usuario_id || !fecha_inicio || !fecha_fin || !ejercicios || !Array.isArray(ejercicios)) {
        return res.status(400).json({ success: false, message: "Datos incompletos o inválidos." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insertar en sesiones_entrenamiento
        const sesionRes = await client.query(`
            INSERT INTO sesiones_entrenamiento (usuario_id, fecha_inicio, fecha_fin)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [usuario_id, fecha_inicio, fecha_fin]);

        const sesionId = sesionRes.rows[0].id;

        for (const ej of ejercicios) {
            // El ID de exerciseDB viene como cadena (ej. "0001"), lo convertimos a entero
            const ejercicioIdInt = parseInt(ej.id, 10);
            
            // Insertar el ejercicio si no existe
            await client.query(`
                INSERT INTO ejercicios (id, nombre, grupo_muscular)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO NOTHING
            `, [ejercicioIdInt, ej.nombre || 'Ejercicio', ej.grupo_muscular || '']);

            // Registrar el log del ejercicio realizado vinculado al sesionId
            await client.query(`
                INSERT INTO logs_entrenamiento (sesion_id, ejercicio_id, peso_levantado, repeticiones)
                VALUES ($1, $2, $3, $4)
            `, [sesionId, ejercicioIdInt, parseFloat(ej.peso_levantado) || 0, parseInt(ej.repeticiones, 10) || 0]);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: "Entrenamiento registrado con éxito." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al guardar entrenamiento:", err);
        res.status(500).json({ success: false, message: "Error interno al guardar los entrenamientos." });
    } finally {
        client.release();
    }
});

// 5. ENDPOINT PARA OBTENER EL HISTORIAL DE ENTRENAMIENTOS
app.get('/historial/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ success: false, message: "ID de usuario inválido." });
    }

    try {
        const query = `
            SELECT 
                s.id AS sesion_id,
                s.fecha_inicio,
                s.fecha_fin,
                l.id AS log_id,
                l.peso_levantado,
                l.repeticiones,
                e.id AS ejercicio_id,
                e.nombre AS ejercicio_nombre,
                e.grupo_muscular
            FROM sesiones_entrenamiento s
            LEFT JOIN logs_entrenamiento l ON s.id = l.sesion_id
            LEFT JOIN ejercicios e ON l.ejercicio_id = e.id
            WHERE s.usuario_id = $1
            ORDER BY s.fecha_inicio DESC, l.id ASC
        `;

        const result = await pool.query(query, [usuario_id]);
        
        const sesiones = [];
        const mapaSesiones = {};

        for (const row of result.rows) {
            if (!mapaSesiones[row.sesion_id]) {
                mapaSesiones[row.sesion_id] = {
                    id: row.sesion_id,
                    fecha_inicio: row.fecha_inicio,
                    fecha_fin: row.fecha_fin,
                    ejercicios: []
                };
                sesiones.push(mapaSesiones[row.sesion_id]);
            }

            if (row.ejercicio_id) {
                mapaSesiones[row.sesion_id].ejercicios.push({
                    id: row.ejercicio_id,
                    nombre: row.ejercicio_nombre,
                    grupo_muscular: row.grupo_muscular,
                    peso_levantado: parseFloat(row.peso_levantado),
                    repeticiones: row.repeticiones
                });
            }
        }

        res.json({ success: true, sesiones });
    } catch (err) {
        console.error("Error al obtener historial:", err);
        res.status(500).json({ success: false, message: "Error interno al obtener el historial." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Health Path corriendo en puerto ${PORT}`);
});