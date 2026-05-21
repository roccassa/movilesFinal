// src/services/users.service.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cafeapp_secret_2024';

// ── Registro ───────────────────────────────────────────────────────────
const register = async ({ name, email, password }) => {
  // Validaciones básicas
  if (!name || !email || !password) {
    const err = new Error('Nombre, email y contraseña son obligatorios');
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Ya existe una cuenta con ese email');
    err.statusCode = 409;
    throw err;
  }

  const user  = await User.create({ name, email, password });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { user, token };
};

// ── Login ──────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error('Email y contraseña son obligatorios');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Credenciales incorrectas');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Credenciales incorrectas');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { user, token };
};

// ── Obtener todos los usuarios (solo admin) ────────────────────────────
const getAll = async () => {
  return User.find().select('-password');
};

// ── Obtener perfil por ID ──────────────────────────────────────────────
const getById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// ── Actualizar usuario ─────────────────────────────────────────────────
const update = async (id, data) => {
  // No permitir actualizar password por esta ruta
  delete data.password;

  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// ── Eliminar usuario ───────────────────────────────────────────────────
const remove = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Usuario eliminado correctamente' };
};

module.exports = { register, login, getAll, getById, update, remove };
