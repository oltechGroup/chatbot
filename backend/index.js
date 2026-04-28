//backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- DEFINICIÓN DE RUTAS ---
const visitanteRoutes = require('./routes/visitanteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const interaccionRoutes = require('./routes/interaccionRoutes');

app.use('/api/visitantes', visitanteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/interacciones', interaccionRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor de OMMA Chatbot funcionando 🚀');
});

// Middleware para manejar rutas que no existen (Siempre al final de las rutas)
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de error global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Algo salió mal en el servidor" });
});

// --- ESTO ES LO QUE FALTABA PARA QUE NO SE APAGUE ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});