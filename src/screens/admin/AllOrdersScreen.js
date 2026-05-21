// src/screens/admin/AllOrdersScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Share, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../services/api';
import { ORDER_STATUS, STATUS_FLOW } from '../../constants';

const STATUS_FILTERS = [
  { key: 'todos',         label: 'Todos' },
  { key: 'pendiente',     label: '🕐 Pendiente' },
  { key: 'en_preparacion',label: '🔥 En prep.' },
  { key: 'listo',         label: '✅ Listo' },
  { key: 'entregado',     label: '📦 Entregado' },
  { key: 'cancelado',     label: '❌ Cancelado' },
];

function formatTicket(order) {
  const date = new Date(order.createdAt).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const sep  = '─'.repeat(28);
  const lines = [
    `☕ CAFÉAPP — TICKET DE PEDIDO`,
    sep,
    `Pedido:  #${order._id.slice(-6).toUpperCase()}`,
    `Fecha:   ${date}`,
    `Cliente: ${order.user?.name || 'Desconocido'}`,
    sep,
    'PRODUCTOS:',
    ...order.items.map((i) => {
      const name  = i.product?.name || 'Producto';
      const sub   = `$${(i.price * i.quantity).toFixed(2)}`;
      return `  ${i.quantity}x ${name.padEnd(16)} ${sub}`;
    }),
    sep,
    `TOTAL:   $${order.total.toFixed(2)}`,
    sep,
    `Estado:  ${ORDER_STATUS[order.status]?.label || order.status}`,
    order.notes ? `Notas:   ${order.notes}` : '',
    sep,
  ].filter(Boolean);

  return lines.join('\n');
}

export default function AllOrdersScreen({ navigation }) {
  const [orders,    setOrders]    = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ticketOrder,  setTicketOrder]  = useState(null);

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      const data = res.data.data;
      setOrders(data);
      setFiltered(statusFilter === 'todos' ? data : data.filter((o) => o.status === statusFilter));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (key) => {
    setStatusFilter(key);
    setFiltered(key === 'todos' ? orders : orders.filter((o) => o.status === key));
  };

  const handleStatusChange = (order) => {
    const current = STATUS_FLOW.indexOf(order.status);
    const options = STATUS_FLOW.map((s) => ({
      text:  ORDER_STATUS[s]?.label || s,
      style: s === 'cancelado' ? 'destructive' : 'default',
      onPress: async () => {
        try {
          await updateOrderStatus(order._id, s);
          fetchAll();
        } catch {
          Alert.alert('Error', 'No se pudo actualizar el estado');
        }
      },
    }));
    Alert.alert(
      `Pedido #${order._id.slice(-6).toUpperCase()}`,
      'Selecciona el nuevo estado:',
      [...options, { text: 'Cancelar', style: 'cancel' }]
    );
  };

  const handleShare = async (order) => {
    const text = formatTicket(order);
    try {
      await Share.share({ message: text });
    } catch (err) {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  const handleDelete = (order) => {
    Alert.alert(
      'Eliminar pedido',
      `¿Eliminar el pedido #${order._id.slice(-6).toUpperCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder(order._id);
              fetchAll();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const status = ORDER_STATUS[item.status] || ORDER_STATUS.pendiente;
    const date   = new Date(item.createdAt).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        {/* Cabecera */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.clientName}>{item.user?.name || 'Sin usuario'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Items */}
        {item.items.map((i, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{i.quantity}x {i.product?.name || 'Producto'}</Text>
            <Text style={styles.itemPrice}>${(i.price * i.quantity).toFixed(2)}</Text>
          </View>
        ))}

        {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.statusBtn} onPress={() => handleStatusChange(item)}>
            <Text style={styles.statusBtnText}>↕ Estado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.printBtn} onPress={() => setTicketOrder(item)}>
            <Text style={styles.printBtnText}>🖨 Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(item)}>
            <Text style={styles.shareBtnText}>↗ Enviar</Text>
          </TouchableOpacity>
          {(item.status === 'entregado' || item.status === 'cancelado') && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pedidos 📋</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, statusFilter === f.key && styles.chipActive]}
            onPress={() => applyFilter(f.key)}
          >
            <Text style={[styles.chipText, statusFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#047857" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay pedidos con este estado</Text>}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        />
      )}

      {/* Modal ticket de impresión */}
      <Modal visible={!!ticketOrder} animationType="fade" transparent>
        <View style={styles.ticketOverlay}>
          <View style={styles.ticketCard}>
            <Text style={styles.ticketHeader}>☕ CAFÉAPP</Text>
            <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>

            {ticketOrder && <>
              <Text style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Pedido: </Text>
                <Text style={styles.ticketVal}>#{ticketOrder._id.slice(-6).toUpperCase()}</Text>
              </Text>
              <Text style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Fecha: </Text>
                <Text style={styles.ticketVal}>
                  {new Date(ticketOrder.createdAt).toLocaleString('es-MX', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </Text>
              <Text style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Cliente: </Text>
                <Text style={styles.ticketVal}>{ticketOrder.user?.name || '—'}</Text>
              </Text>
              <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
              <Text style={styles.ticketSection}>PRODUCTOS:</Text>
              {ticketOrder.items.map((i, idx) => (
                <View key={idx} style={styles.ticketItem}>
                  <Text style={styles.ticketItemName}>{i.quantity}x {i.product?.name}</Text>
                  <Text style={styles.ticketItemPrice}>${(i.price * i.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
              <View style={styles.ticketItem}>
                <Text style={styles.ticketTotal}>TOTAL</Text>
                <Text style={styles.ticketTotal}>${ticketOrder.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.ticketSep}>{'─'.repeat(24)}</Text>
              <Text style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Estado: </Text>
                <Text style={styles.ticketVal}>{ORDER_STATUS[ticketOrder.status]?.label}</Text>
              </Text>
              {ticketOrder.notes ? (
                <Text style={styles.ticketNotes}>📝 {ticketOrder.notes}</Text>
              ) : null}
            </>}

            <View style={styles.ticketBtns}>
              <TouchableOpacity style={styles.ticketShare} onPress={() => { handleShare(ticketOrder); setTicketOrder(null); }}>
                <Text style={styles.ticketShareText}>↗ Enviar / Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ticketClose} onPress={() => setTicketOrder(null)}>
                <Text style={styles.ticketCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingTop:       56,
    paddingBottom:    14,
    backgroundColor:  '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  backBtn:    { padding: 4 },
  backText:   { color: '#047857', fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 20, fontWeight: '900', color: '#2D1B00' },
  countBadge: { backgroundColor: '#047857', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText:  { color: '#fff', fontWeight: '800', fontSize: 13 },

  filters:   { maxHeight: 52, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  chip:      { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#F3F4F6', marginRight: 8, marginVertical: 8 },
  chipActive:{ backgroundColor: '#047857' },
  chipText:  { fontSize: 13, color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  card: {
    backgroundColor:  '#fff',
    marginHorizontal: 16,
    marginVertical:   6,
    borderRadius:     14,
    padding:          14,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.07,
    shadowRadius:     5,
    elevation:        3,
  },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId:      { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  clientName:   { fontSize: 13, color: '#6B7280', marginTop: 2 },
  badge:        { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:    { fontSize: 12, fontWeight: '700' },

  itemRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  itemName:   { fontSize: 14, color: '#374151' },
  itemPrice:  { fontSize: 14, color: '#374151' },
  notes:      { fontSize: 13, color: '#92400E', marginTop: 6, fontStyle: 'italic' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  date:       { fontSize: 12, color: '#9CA3AF' },
  total:      { fontSize: 15, fontWeight: '800', color: '#047857' },

  actionRow:     { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  statusBtn:     { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#FEF3C7' },
  statusBtnText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  printBtn:      { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#D1FAE5' },
  printBtnText:  { fontSize: 12, fontWeight: '700', color: '#047857' },
  shareBtn:      { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#DBEAFE' },
  shareBtnText:  { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  deleteBtn:     { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#FEE2E2' },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },

  empty: { textAlign: 'center', color: '#AAA', marginTop: 60, fontSize: 15 },

  // Ticket modal
  ticketOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  ticketCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 },
  ticketHeader:  { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  ticketSep:     { fontFamily: 'monospace', color: '#AAA', marginVertical: 8 },
  ticketSection: { fontFamily: 'monospace', fontWeight: '700', marginBottom: 4 },
  ticketRow:     { fontFamily: 'monospace', fontSize: 13, marginBottom: 3 },
  ticketLabel:   { fontWeight: '700' },
  ticketVal:     { fontWeight: '400' },
  ticketItem:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  ticketItemName:{ fontFamily: 'monospace', fontSize: 13, color: '#374151' },
  ticketItemPrice:{ fontFamily: 'monospace', fontSize: 13, color: '#374151' },
  ticketTotal:   { fontFamily: 'monospace', fontSize: 15, fontWeight: '900', color: '#047857' },
  ticketNotes:   { fontFamily: 'monospace', fontSize: 13, color: '#92400E', marginTop: 4 },
  ticketBtns:    { marginTop: 16, gap: 8 },
  ticketShare:   { backgroundColor: '#047857', borderRadius: 12, padding: 14, alignItems: 'center' },
  ticketShareText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  ticketClose:   { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, alignItems: 'center' },
  ticketCloseText:{ color: '#666', fontWeight: '600' },
});
