//backend/controllers/statsController.js
const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Total de leads (visitantes)
        const totalLeads = await pool.query('SELECT COUNT(*) FROM visitantes');
        
        // 2. Descargas por subcategoría (para la gráfica de barras)
        const descargasPorProducto = await pool.query(`
            SELECT s.nombre, COUNT(i.id) as total 
            FROM subcategorias s
            LEFT JOIN interacciones i ON s.id = i.subcategoria_id
            WHERE i.tipo_accion = 'DESCARGA_CATALOGO'
            GROUP BY s.nombre
            ORDER BY total DESC
        `);

        // 3. Leads por país (para ver de dónde vienen)
        const leadsPorPais = await pool.query(`
            SELECT pais, COUNT(*) as total FROM visitantes GROUP BY pais
        `);

        res.json({
            totalLeads: totalLeads.rows[0].count,
            productosMasBuscados: descargasPorProducto.rows,
            ubicacionGeografica: leadsPorPais.rows
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
};

module.exports = { getDashboardStats };