// ── Theme ──────────────────────────────────────────────────────────────
export const COLORS = {
  primary:      '#C8622A',
  primaryLight: '#FFE5D0',
  primaryAccent:'#FFF4E6',
  dark:         '#2D1B00',
  background:   '#FFF8F2',
  card:         '#fff',
  border:       '#E8DDD5',
  muted:        '#888',
  tabBorder:    '#F0EAE4',
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  info:         '#3B82F6',
};

// ── Fallback de emojis por slug de categoría ────────────────────────────
// Se usa cuando no hay categoría cargada desde la API (ej. ProductCard)
export const CATEGORY_EMOJI = {
  cafe:        '☕',
  te:          '🍵',
  bebida_fria: '🧊',
  postre:      '🍰',
  snack:       '🥐',
  otro:        '🍴',
};

// Emojis disponibles para elegir al crear/editar una categoría
export const EMOJI_OPTIONS = [
  '☕','🍵','🧊','🍰','🥐','🍴','🧁','🍦','🥤','🫖',
  '🍫','🥗','🍕','🥪','🍩','🧃','🥛','🍺','🥂','🍷',
];

// ── Weather ────────────────────────────────────────────────────────────
export const WEATHER_API_KEY = 'd15f72523aec253fc8878c17604baf40';
export const WEATHER_CITY    = 'Guadalajara';

export const WEATHER_EMOJI = {
  Clear:        '☀️',
  Clouds:       '☁️',
  Rain:         '🌧️',
  Drizzle:      '🌦️',
  Thunderstorm: '⛈️',
  Snow:         '❄️',
  Mist:         '🌫️',
};

// ── Configuración de estados de pedido ─────────────────────────────────
export const ORDER_STATUS = {
  pendiente:      { label: 'Pendiente',      color: '#F59E0B', bg: '#FEF3C7' },
  en_preparacion: { label: 'En preparación', color: '#3B82F6', bg: '#DBEAFE' },
  listo:          { label: '¡Listo!',        color: '#10B981', bg: '#D1FAE5' },
  entregado:      { label: 'Entregado',      color: '#6B7280', bg: '#F3F4F6' },
  cancelado:      { label: 'Cancelado',      color: '#EF4444', bg: '#FEE2E2' },
};

export const STATUS_FLOW = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

// ── API ────────────────────────────────────────────────────────────────
// Cambia esta IP por la IP local de tu máquina (ipconfig en Windows)
export const API_BASE_URL = 'http://10.86.77.126:3000/api';
