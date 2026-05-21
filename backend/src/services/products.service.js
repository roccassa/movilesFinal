// src/services/products.service.js
const Product = require('../models/Product');

// ── Obtener todos ──────────────────────────────────────────────────────
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.available !== undefined) query.available = filters.available === 'true';

  return Product.find(query).sort({ createdAt: -1 });
};

// ── Obtener por ID ─────────────────────────────────────────────────────
const getById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Producto no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

// ── Crear ──────────────────────────────────────────────────────────────
const create = async (data) => {
  const { name, price } = data;
  if (!name || price === undefined) {
    const err = new Error('Nombre y precio son obligatorios');
    err.statusCode = 400;
    throw err;
  }
  return Product.create(data);
};

// ── Actualizar ─────────────────────────────────────────────────────────
const update = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    const err = new Error('Producto no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

// ── Eliminar ───────────────────────────────────────────────────────────
const remove = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    const err = new Error('Producto no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Producto eliminado correctamente' };
};

module.exports = { getAll, getById, create, update, remove };
