const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Café',        slug: 'cafe',        emoji: '☕' },
  { name: 'Té',          slug: 'te',          emoji: '🍵' },
  { name: 'Bebida Fría', slug: 'bebida_fria', emoji: '🧊' },
  { name: 'Postre',      slug: 'postre',      emoji: '🍰' },
  { name: 'Snack',       slug: 'snack',       emoji: '🥐' },
  { name: 'Otro',        slug: 'otro',        emoji: '🍴' },
];

const seed = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log('Categorías iniciales insertadas');
  }
};

const getAll    = () => Category.find().sort({ createdAt: 1 });
const getActive = () => Category.find({ active: true }).sort({ createdAt: 1 });

const create = async (data) => {
  if (!data.slug) {
    data.slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }
  return Category.create(data);
};

const update = (id, data) =>
  Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const remove = async (id) => {
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) {
    const err = new Error('Categoría no encontrada');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Categoría eliminada' };
};

module.exports = { seed, getAll, getActive, create, update, remove };
