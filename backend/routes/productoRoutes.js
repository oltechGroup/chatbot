//backend/routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/categorias', productoController.getCategorias);
router.get('/subcategorias/:categoria_id', productoController.getSubcategorias);

module.exports = router;