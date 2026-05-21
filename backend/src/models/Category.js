const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name:   { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    slug:   { type: String, required: [true, 'El slug es obligatorio'], unique: true, lowercase: true, trim: true },
    emoji:  { type: String, default: '🍴' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
