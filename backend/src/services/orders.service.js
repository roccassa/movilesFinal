// src/services/orders.service.js
const Order   = require('../models/Order');
const Product = require('../models/Product');

// ── Crear pedido ───────────────────────────────────────────────────────
const create = async (userId, { items, notes }) => {
  if (!items || items.length === 0) {
    const err = new Error('El pedido debe contener al menos un producto');
    err.statusCode = 400;
    throw err;
  }

  // Validar productos y calcular total
  let total = 0;
  const resolvedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const err = new Error(`Producto ${item.productId} no encontrado`);
      err.statusCode = 404;
      throw err;
    }
    if (!product.available) {
      const err = new Error(`El producto "${product.name}" no está disponible`);
      err.statusCode = 400;
      throw err;
    }

    const quantity = item.quantity || 1;
    total += product.price * quantity;

    resolvedItems.push({ product: product._id, quantity, price: product.price });
  }

  const order = await Order.create({ user: userId, items: resolvedItems, total, notes });
  return order.populate('items.product');
};

// ── Obtener todos los pedidos (admin) ──────────────────────────────────
const getAll = async () => {
  return Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name price')
    .sort({ createdAt: -1 });
};

// ── Obtener pedidos de un usuario ──────────────────────────────────────
const getByUser = async (userId) => {
  return Order.find({ user: userId })
    .populate('items.product', 'name price imageUrl')
    .sort({ createdAt: -1 });
};

// ── Obtener pedido por ID ──────────────────────────────────────────────
const getById = async (id) => {
  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'name price imageUrl');

  if (!order) {
    const err = new Error('Pedido no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return order;
};

// ── Actualizar estado del pedido ───────────────────────────────────────
const updateStatus = async (id, status) => {
  const validStatuses = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
  if (!validStatuses.includes(status)) {
    const err = new Error('Estado inválido');
    err.statusCode = 400;
    throw err;
  }

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
    .populate('items.product', 'name price');

  if (!order) {
    const err = new Error('Pedido no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return order;
};

// ── Eliminar pedido ────────────────────────────────────────────────────
const remove = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    const err = new Error('Pedido no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Pedido eliminado correctamente' };
};

module.exports = { create, getAll, getByUser, getById, updateStatus, remove };
