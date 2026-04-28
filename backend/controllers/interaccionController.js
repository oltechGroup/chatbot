//backend/controllers/interaccionController.js
const pool = require('../config/db');

const registrarInteraccion = async (req, res) => {
    const { visitante_id, subcategoria_id, tipo_accion } = req.body;

    try {
        const nuevaInteraccion = await pool.query(
            `INSERT INTO interacciones (visitante_id, subcategoria_id, tipo_accion) 
             VALUES ($1, $2, $3) RETURNING *`,
            [visitante_id, subcategoria_id, tipo_accion]
        );

        res.status(201).json({
            mensaje: "Interacción registrada",
            interaccion: nuevaInteraccion.rows[0]
        });
    } catch (error) {
        console.error("Error al registrar interacción:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = { registrarInteraccion };