//backend/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios_admin WHERE username = $1', [username]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

        // Generar el Token (dura 24 horas)
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'firma_secreta', { expiresIn: '24h' });

        res.json({ mensaje: "Bienvenido", token });
    } catch (error) {
        res.status(500).json({ error: "Error en el login" });
    }
};

module.exports = { login };