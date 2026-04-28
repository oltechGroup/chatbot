//backend/controllers/visitanteController.js
const pool = require('../config/db');

const registrarNombre = async (req, res) => {
    const { nombre } = req.body;

    try {
        // Insertamos el nombre y nos devuelve el ID generado
        const nuevoVisitante = await pool.query(
            "INSERT INTO visitantes (nombre) VALUES ($1) RETURNING *",
            [nombre]
        );

        res.status(201).json({
            mensaje: "Nombre registrado con éxito",
            visitante: nuevoVisitante.rows[0]
        });
    } catch (error) {
        console.error("Error al registrar nombre:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Función para ir llenando los datos restantes (País, CP, Ciudad, Teléfono, Email, Comentarios)
const actualizarVisitante = async (req, res) => {
    const { id } = req.params; // El ID que obtuvimos al registrar el nombre
    // Agregamos los nuevos campos aquí abajo 👇
    const { pais, codigo_postal, ciudad, telefono, email, comentario } = req.body;

    try {
        const visitanteActualizado = await pool.query(
            `UPDATE visitantes 
             SET pais = COALESCE($1, pais), 
                 codigo_postal = COALESCE($2, codigo_postal), 
                 ciudad = COALESCE($3, ciudad),
                 telefono = COALESCE($4, telefono),
                 email = COALESCE($5, email),
                 comentario = COALESCE($6, comentario)
             WHERE id = $7 RETURNING *`,
            [pais, codigo_postal, ciudad, telefono, email, comentario, id]
        );

        if (visitanteActualizado.rows.length === 0) {
            return res.status(404).json({ error: "Visitante no encontrado" });
        }

        res.json({
            mensaje: "Datos actualizados correctamente",
            visitante: visitanteActualizado.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar visitante:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// No olvides exportarla al final del archivo
module.exports = {
    registrarNombre,
    actualizarVisitante
};