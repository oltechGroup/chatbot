//backend/controllers/productoController.js
const pool = require('../config/db');

// Obtener todas las categorías (Hombro, Codo, Cadera, Rodilla)
const getCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categorías" });
    }
};

// Obtener subcategorías según la categoría seleccionada
const getSubcategorias = async (req, res) => {
    const { categoria_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM subcategorias WHERE categoria_id = $1 ORDER BY id ASC',
            [categoria_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener subcategorías" });
    }
};

module.exports = { getCategorias, getSubcategorias };