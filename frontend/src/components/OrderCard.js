// src/components/OrderCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const STATUS_CONFIG = {
  pendiente:      { label: 'Pendiente',       color: '#F59E0B', bg: '#FEF3C7' },
  en_preparacion: { label: 'En preparación',  color: '#3B82F6', bg: '#DBEAFE' },
  listo:          { label: '¡Listo!',         color: '#10B981', bg: '#D1FAE5' },
  entregado:      { label: 'Entregado',       color: '#6B7280', bg: '#F3F4F6' },
  cancelado:      { label: 'Cancelado',       color: '#EF4444', bg: '#FEE2E2' },
};

export default function OrderCard({ order, onDelete }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pendiente;
  const date   = new Date(order.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Pedido #{order._id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Items */}
      {order.items.map((item, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.itemName}>
            {item.quantity}x {item.product?.name || 'Producto'}
          </Text>
          <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.total}>Total: ${order.total.toFixed(2)}</Text>
      </View>

      {/* Eliminar solo si está entregado o cancelado */}
      {(order.status === 'entregado' || order.status === 'cancelado') && onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(order._id)}>
          <Text style={styles.deleteBtnText}>🗑 Eliminar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    14,
    marginHorizontal: 16,
    marginVertical:  6,
    padding:         16,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       3,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   10,
  },
  orderId:   { fontSize: 14, fontWeight: '700', color: '#2D1B00' },
  badge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  item: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   4,
  },
  itemName:  { fontSize: 14, color: '#555' },
  itemPrice: { fontSize: 14, color: '#555' },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      10,
    paddingTop:     10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  date:      { fontSize: 12, color: '#AAA' },
  total:     { fontSize: 15, fontWeight: '800', color: '#C8622A' },
  deleteBtn: {
    marginTop:       10,
    alignItems:      'center',
    paddingVertical: 8,
    borderRadius:    8,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
});
