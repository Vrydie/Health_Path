const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

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
    const { usuario_id, ejercicios } = req.body;

    if (!usuario_id || !ejercicios || !Array.isArray(ejercicios)) {
        return res.status(400).json({ success: false, message: "Datos incompletos o inválidos." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const ej of ejercicios) {
            // El ID de exerciseDB viene como cadena (ej. "0001"), lo convertimos a entero
            const ejercicioIdInt = parseInt(ej.id, 10);
            
            // Insertar el ejercicio si no existe
            await client.query(`
                INSERT INTO ejercicios (id, nombre, grupo_muscular)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO NOTHING
            `, [ejercicioIdInt, ej.nombre, ej.grupo_muscular]);

            // Registrar el log del ejercicio realizado
            await client.query(`
                INSERT INTO logs_entrenamiento (usuario_id, ejercicio_id, peso_levantado, repeticiones)
                VALUES ($1, $2, $3, $4)
            `, [usuario_id, ejercicioIdInt, ej.peso_levantado, ej.repeticiones]);
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

app.listen(PORT, () => {
    console.log(`Servidor Health Path corriendo en puerto ${PORT}`);
});