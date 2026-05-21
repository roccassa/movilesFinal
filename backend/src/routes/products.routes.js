
const express         = require('express');
const router          = express.Router();
const productsService = require('../services/products.service');
const auth            = require('../middlewares/auth');


router.get('/', async (req, res, next) => {
  try {
    const products = await productsService.getAll(req.query);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// Obtener por ID (público)
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productsService.getById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

//  Crear producto (protegida)
router.post('/', auth, async (req, res, next) => {
  try {
    const product = await productsService.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Actualizar producto (protegida)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const product = await productsService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Cambiar disponibilidad (protegida)
router.patch('/:id/availability', auth, async (req, res, next) => {
  try {
    const product = await productsService.update(req.params.id, {
      available: req.body.available,
    });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Eliminar producto (protegida)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await productsService.remove(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
