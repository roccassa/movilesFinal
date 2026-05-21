const express = require('express');
const router  = express.Router();
const svc     = require('../services/categories.service');
const auth    = require('../middlewares/auth');

// GET /api/categories — activas (público, para que MenuScreen las cargue)
router.get('/', async (req, res, next) => {
  try {
    const cats = await svc.getActive();
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

// GET /api/categories/all — todas incluyendo inactivas (admin)
router.get('/all', auth, async (req, res, next) => {
  try {
    const cats = await svc.getAll();
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

// POST /api/categories
router.post('/', auth, async (req, res, next) => {
  try {
    const cat = await svc.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
});

// PUT /api/categories/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const cat = await svc.update(req.params.id, req.body);
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
});

// DELETE /api/categories/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await svc.remove(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
