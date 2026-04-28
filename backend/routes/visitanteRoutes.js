//backend/routes/visitanteRoutes.js
const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitanteController');

router.post('/registrar-nombre', visitanteController.registrarNombre);

// Nueva ruta para actualizar datos por ID
router.put('/actualizar/:id', visitanteController.actualizarVisitante);

module.exports = router;