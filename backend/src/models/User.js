const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    role: {
      type: String,
      enum: ['cliente', 'admin'],
      default: 'cliente',
    },
  },
  { timestamps: true }
);

// Hash automático al guardar si la contraseña fue modificada
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparar contraseña al hacer login
userSchema.methods.comparePassword = async function (candidatePassword) {
  const storedPassword = this.password;

  // Detectar si la contraseña almacenada ya es un hash bcrypt
  const isBcrypt = storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$');

  if (isBcrypt) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }

  // ── Migración automática de contraseña en texto plano ──────────────────
  // Esto ocurre cuando un usuario fue creado directamente en la base de datos
  // sin pasar por el endpoint de registro (que aplica bcrypt).
  if (candidatePassword !== storedPassword) return false;

  // La contraseña coincide en texto plano → rehash y guardar sin pasar por el hook pre-save
  console.log(`⚠️  Migrando contraseña de "${this.email}" a bcrypt...`);
  const hashed = await bcrypt.hash(candidatePassword, 10);
  await this.constructor.updateOne({ _id: this._id }, { password: hashed });
  return true;
};

// Ocultar password al serializar
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
