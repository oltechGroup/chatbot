//backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const statsController = require('../controllers/statsController');

// Ruta pública para loguearse
router.post('/login', authController.login);

// Ruta para las gráficas (Resumen General)
router.get('/stats', statsController.getDashboardStats);

// NUEVA RUTA: Para la tabla detallada de doctores e interacciones
router.get('/leads', statsController.getLeadsDetails);

module.exports = router;