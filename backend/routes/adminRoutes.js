//backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const statsController = require('../controllers/statsController');

// Ruta pública para loguearse
router.post('/login', authController.login);

// Ruta para las gráficas (Aquí podrías añadir un middleware de seguridad después)
router.get('/stats', statsController.getDashboardStats);

module.exports = router;