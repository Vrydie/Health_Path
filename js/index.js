const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

// 1. ENDPOINT DE REGISTRO (Actualizado con 'meta')
app.post('/registro', async (req, res) => {
    const { nombre, email, password, meta } = req.body;

    try {
        const query = 'INSERT INTO usuarios (nombre, email, password, meta) VALUES ($1, $2, $3, $4) RETURNING id, nombre';
        const values = [nombre, email, password, meta];
        
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
            'SELECT id, nombre, meta FROM usuarios WHERE email = $1 AND password = $2', 
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

app.listen(PORT, () => {
    console.log(`Servidor Health Path corriendo en puerto ${PORT}`);
});