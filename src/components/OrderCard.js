// src/components/OrderCard.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Modal, Alert } from 'react-native';
import { ORDER_STATUS } from '../constants';

function formatTicket(order) {
  const date = new Date(order.createdAt).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const sep = '─'.repeat(26);
  const lines = [
    '☕ CAFÉAPP — TICKET DE PEDIDO',
    sep,
    `Pedido:  #${order._id.slice(-6).toUpperCase()}`,
    `Fecha:   ${date}`,
    sep,
    'PRODUCTOS:',
    ...order.items.map((i) => {
      const name = i.product?.name || 'Producto';
      return `  ${i.quantity}x ${name}   $${(i.price * i.quantity).toFixed(2)}`;
    }),
    sep,
    `TOTAL:   $${order.total.toFixed(2)}`,
    sep,
    `Estado:  ${ORDER_STATUS[order.status]?.label || order.status}`,
    order.notes ? `Notas:   ${order.notes}` : null,
    sep,
  ].filter(Boolean);
  return lines.join('\n');
}

export default function OrderCard({ order, onDelete }) {
  const [ticket, setTicket] = useState(false);
  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pendiente;
  const date   = new Date(order.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const handleShare = async () => {
    try {
      await Share.share({ message: formatTicket(order) });
    } catch {
      Alert.alert('Error', 'No se pudo compartir el ticket');
    }
  };

  return (
    <>
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

        {order.notes ? <Text style={styles.notes}>📝 {order.notes}</Text> : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.total}>Total: ${order.total.toFixed(2)}</Text>
        </View>

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.ticketBtn} onPress={() => setTicket(true)}>
            <Text style={styles.ticketBtnText}>🖨 Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>↗ Compartir</Text>
          </TouchableOpacity>
          {(order.status === 'entregado' || order.status === 'cancelado') && onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(order._id)}>
              <Text style={styles.deleteBtnText}>🗑 Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal ticket */}
      <Modal visible={ticket} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.ticketCard}>
            <Text style={styles.ticketHeader}>☕ CAFÉAPP</Text>
            <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
            <Text style={styles.ticketRow}><Text style={styles.ticketLabel}>Pedido: </Text>#{order._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.ticketRow}><Text style={styles.ticketLabel}>Fecha:  </Text>
              {new Date(order.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
            <Text style={styles.ticketSection}>PRODUCTOS:</Text>
            {order.items.map((i, idx) => (
              <View key={idx} style={styles.ticketItem}>
                <Text style={styles.ticketItemName}>{i.quantity}x {i.product?.name}</Text>
                <Text style={styles.ticketItemPrice}>${(i.price * i.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
            <View style={styles.ticketItem}>
              <Text style={styles.ticketTotal}>TOTAL</Text>
              <Text style={styles.ticketTotal}>${order.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
            <Text style={styles.ticketRow}><Text style={styles.ticketLabel}>Estado: </Text>{status.label}</Text>
            {order.notes ? <Text style={styles.ticketNotes}>📝 {order.notes}</Text> : null}

            <View style={styles.ticketBtns}>
              <TouchableOpacity style={styles.ticketShare} onPress={() => { handleShare(); setTicket(false); }}>
                <Text style={styles.ticketShareText}>↗ Enviar / Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ticketClose} onPress={() => setTicket(false)}>
                <Text style={styles.ticketCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:  '#fff',
    borderRadius:     14,
    marginHorizontal: 16,
    marginVertical:   6,
    padding:          16,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.08,
    shadowRadius:     6,
    elevation:        3,
  },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId:   { fontSize: 14, fontWeight: '700', color: '#2D1B00' },
  badge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  item:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName:  { fontSize: 14, color: '#555' },
  itemPrice: { fontSize: 14, color: '#555' },
  notes:     { fontSize: 13, color: '#92400E', marginTop: 4, fontStyle: 'italic' },

  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  date:  { fontSize: 12, color: '#AAA' },
  total: { fontSize: 15, fontWeight: '800', color: '#C8622A' },

  actions:       { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  ticketBtn:     { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#D1FAE5' },
  ticketBtnText: { fontSize: 12, fontWeight: '700', color: '#047857' },
  shareBtn:      { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#DBEAFE' },
  shareBtnText:  { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  deleteBtn:     { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FEE2E2' },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },

  // Ticket modal
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  ticketCard:     { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340 },
  ticketHeader:   { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  ticketSep:      { fontFamily: 'monospace', color: '#CCC', marginVertical: 6 },
  ticketSection:  { fontFamily: 'monospace', fontWeight: '700', marginBottom: 4 },
  ticketRow:      { fontFamily: 'monospace', fontSize: 13, marginBottom: 3 },
  ticketLabel:    { fontWeight: '700' },
  ticketItem:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  ticketItemName: { fontFamily: 'monospace', fontSize: 13, color: '#374151', flex: 1 },
  ticketItemPrice:{ fontFamily: 'monospace', fontSize: 13, color: '#374151' },
  ticketTotal:    { fontFamily: 'monospace', fontSize: 15, fontWeight: '900', color: '#047857' },
  ticketNotes:    { fontFamily: 'monospace', fontSize: 12, color: '#92400E', marginTop: 4 },
  ticketBtns:     { marginTop: 16, gap: 8 },
  ticketShare:    { backgroundColor: '#047857', borderRadius: 12, padding: 14, alignItems: 'center' },
  ticketShareText:{ color: '#fff', fontWeight: '700' },
  ticketClose:    { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, alignItems: 'center' },
  ticketCloseText:{ color: '#666', fontWeight: '600' },
});
