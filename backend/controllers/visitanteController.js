//backend/controllers/visitanteController.js
const pool = require('../config/db');
const nodemailer = require('nodemailer');
const path = require('path'); // NUEVO: Herramienta nativa para buscar rutas de archivos

// --- CONFIGURACIÓN DEL SERVIDOR DE CORREOS ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Usaremos Gmail por defecto
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const registrarNombre = async (req, res) => {
    const { nombre } = req.body;

    try {
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

const actualizarVisitante = async (req, res) => {
    const { id } = req.params;
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

        const visitante = visitanteActualizado.rows[0];

        // --- LÓGICA DE NOTIFICACIÓN POR CORREO ---
        if (telefono || email) {
            try {
                // 1. Calculamos la ruta exacta desde el backend hasta tu carpeta public del frontend
                const logoPath = path.join(__dirname, '../../frontend/public/images/logo_omma.png');

                const mailOptions = {
                    from: `"OMMA Assist VIP" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_DESTINO || process.env.EMAIL_USER, 
                    subject: '🚨 Nuevo Prospecto Registrado - OMMA Group',
                    
                    // 2. Adjuntamos la imagen de forma interna con un ID único 'logo_omma'
                    attachments: [{
                        filename: 'logo_omma.png',
                        path: logoPath,
                        cid: 'logo_omma' // Este es el puente entre el archivo y el HTML
                    }],

                    // 3. En el HTML cambiamos el <h1> por una etiqueta <img> apuntando a ese 'cid'
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            
                            <div style="background-color: #0B162C; padding: 30px 25px; text-align: center; border-bottom: 4px solid #22c55e;">
                                <img src="cid:logo_omma" alt="OMMA Group" style="max-width: 220px; height: auto; display: block; margin: 0 auto;">
                                <p style="color: #94a3b8; margin: 15px 0 0 0; font-size: 14px; letter-spacing: 0.5px;">Asistente Virtual Automático</p>
                            </div>

                            <div style="padding: 30px; background-color: #ffffff;">
                                <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">¡Nuevo Lead Captado! 🎉</h2>
                                <p style="font-size: 15px; color: #475569; margin-bottom: 25px; line-height: 1.6;">
                                    Un visitante ha completado su registro y ha dejado sus datos de contacto. Aquí tienes el resumen:
                                </p>
                                
                                <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0B162C; width: 35%;">Nombre:</td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; color: #334155;">${visitante.nombre || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0B162C;">Ubicación:</td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; color: #334155;">${ciudad || visitante.ciudad || 'N/A'}, ${pais || visitante.pais || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0B162C;">Correo:</td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: 500;">${email || visitante.email || 'No proporcionado'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; font-weight: bold; color: #0B162C;">Teléfono:</td>
                                        <td style="padding: 15px; color: #22c55e; font-weight: bold;">${telefono || visitante.telefono || 'No proporcionado'}</td>
                                    </tr>
                                </table>

                                <div style="margin-top: 35px; text-align: center;">
                                    <a href="http://localhost:3000/admin/leads" style="background-color: #0B162C; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                                        Ver Registro Completo
                                    </a>
                                </div>
                            </div>

                            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="font-size: 12px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                                    Este es un correo generado automáticamente. No respondas a este mensaje.
                                </p>
                            </div>
                        </div>
                    `
                };

                transporter.sendMail(mailOptions).catch(err => console.error('Aviso: No se pudo enviar el correo de notificación', err));
                
            } catch (mailError) {
                console.error("Error crítico configurando el correo:", mailError);
            }
        }

        res.json({
            mensaje: "Datos actualizados correctamente",
            visitante: visitante
        });
    } catch (error) {
        console.error("Error al actualizar visitante:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = {
    registrarNombre,
    actualizarVisitante
};