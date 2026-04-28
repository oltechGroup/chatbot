//backend/routes/interaccionRoutes.js
const express = require('express');
const router = express.Router();
const interaccionController = require('../controllers/interaccionController');

router.post('/registrar', interaccionController.registrarInteraccion);

module.exports = router;