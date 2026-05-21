// src/routes/orders.routes.js
const express       = require('express');
const router        = express.Router();
const ordersService = require('../services/orders.service');
const auth          = require('../middlewares/auth');


router.use(auth);

// Crear pedido
router.post('/', async (req, res, next) => {
  try {
 
    const order = await ordersService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

//  Obtener todos los pedidos
router.get('/', async (req, res, next) => {
  try {
    const orders = await ordersService.getAll();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

//  Pedidos del usuario autenticado
router.get('/my', async (req, res, next) => {
  try {
    const orders = await ordersService.getByUser(req.user.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// Obtener pedido por ID
router.get('/:id', async (req, res, next) => {
  try {
    const order = await ordersService.getById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// Actualizar estado del pedido
router.patch('/:id/status', async (req, res, next) => {
  try {
    const order = await ordersService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

//  pedido
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await ordersService.remove(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
