// src/routes/users.routes.js
const express      = require('express');
const router       = express.Router();
const usersService = require('../services/users.service');
const auth         = require('../middlewares/auth');

// Crear cuenta
router.post('/register', async (req, res, next) => {
  try {
    const result = await usersService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

//  Iniciar sesión
router.post('/login', async (req, res, next) => {
  try {
    const result = await usersService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Obtener todos (protegida)
router.get('/', auth, async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// Obtener por ID (protegida)
router.get('/:id', auth, async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// Actualizar usuario (protegida)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const user = await usersService.update(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// Eliminar usuario (protegida)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await usersService.remove(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
