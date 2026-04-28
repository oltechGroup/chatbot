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

// NUEVA FUNCIÓN: Obtener detalles específicos de cada lead (La tabla maestra)
const getLeadsDetails = async (req, res) => {
    try {
        // Hacemos un JOIN para unir al visitante con la interacción y el nombre del catálogo
        const result = await pool.query(`
            SELECT 
                v.id as visitante_id,
                v.nombre as visitante_nombre,
                v.pais,
                v.ciudad,
                v.telefono,
                v.email,
                v.comentario,
                v.fecha_registro,
                s.nombre as producto_descargado,
                i.fecha_interaccion,
                i.tipo_accion
            FROM visitantes v
            LEFT JOIN interacciones i ON v.id = i.visitante_id
            LEFT JOIN subcategorias s ON i.subcategoria_id = s.id
            ORDER BY v.fecha_registro DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener detalle de leads:", error);
        res.status(500).json({ error: "Error al obtener detalles" });
    }
};

// Exportamos AMBAS funciones para que el router deje de dar error
module.exports = { getDashboardStats, getLeadsDetails };