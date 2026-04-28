const pool = require('../config/db');

const corregirNombres = async () => {
    console.log("Iniciando corrección de acentos...");

    try {
        // Corregimos las subcategorías que insertamos desde la terminal
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis de hombro reversa' WHERE id = 1`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis de hombro anatómica' WHERE id = 2`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Hemiprótesis de hombro' WHERE id = 3`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis total de codo' WHERE id = 4`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis primaria de cadera' WHERE id = 5`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis de revisión de cadera' WHERE id = 6`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis de rodilla primaria' WHERE id = 7`);
        await pool.query(`UPDATE subcategorias SET nombre = 'Prótesis de revisión de rodilla' WHERE id = 8`);

        // Las ID 9 y 10 (Doble Movilidad y XN) no tienen acentos, pero las reescribimos por si acaso
        await pool.query(`UPDATE subcategorias SET nombre = 'Modular de Doble Movilidad' WHERE id = 9`);
        await pool.query(`UPDATE subcategorias SET nombre = 'XN Sistema de Rodilla' WHERE id = 10`);

        console.log("✅ ¡Todos los nombres han sido corregidos con formato UTF-8 puro!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error al corregir los nombres:", error);
        process.exit(1);
    }
};

corregirNombres();