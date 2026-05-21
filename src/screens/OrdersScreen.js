// src/screens/OrdersScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyOrders, createOrder, deleteOrder, getProducts } from '../services/api';
import OrderCard from '../components/OrderCard';

export default function OrdersScreen({ route }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [products, setProducts] = useState([]);
  const [cart,     setCart]     = useState([]);   // [{ product, quantity }]
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  useFocusEffect(useCallback(() => {
    fetchOrders();

    // Si viene un producto desde MenuScreen, abrimos el modal con él
    if (route.params?.addProduct) {
      openNewOrder(route.params.addProduct);
    }
  }, [route.params]));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      setOrders(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const openNewOrder = async (preloadProduct = null) => {
    try {
      const res = await getProducts();
      setProducts(res.data.data.filter((p) => p.available));
      if (preloadProduct) {
        setCart([{ product: preloadProduct, quantity: 1 }]);
      } else {
        setCart([]);
      }
      setNotes('');
      setModal(true);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el menú');
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product._id === product._id);
      if (exists) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product._id === productId);
      if (exists?.quantity === 1) return prev.filter((i) => i.product._id !== productId);
      return prev.map((i) =>
        i.product._id === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCreateOrder = async () => {
    if (cart.length === 0) return Alert.alert('Error', 'Agrega al menos un producto');
    setSaving(true);
    try {
      const items = cart.map((i) => ({ productId: i.product._id, quantity: i.quantity }));
      await createOrder({ items, notes });
      setModal(false);
      fetchOrders();
      Alert.alert('¡Pedido creado!', 'Tu pedido está en camino ☕');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear el pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      fetchOrders();
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el pedido');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos 📋</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => openNewOrder()}>
          <Text style={styles.newBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#C8622A" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <OrderCard order={item} onDelete={handleDelete} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>Aún no tienes pedidos</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => openNewOrder()}>
                <Text style={styles.emptyBtnText}>Hacer mi primer pedido</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Modal nuevo pedido */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo Pedido ☕</Text>

            {/* Productos disponibles */}
            <Text style={styles.label}>Selecciona productos:</Text>
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              {products.map((p) => {
                const cartItem = cart.find((i) => i.product._id === p._id);
                return (
                  <View key={p._id} style={styles.productRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productPrice}>${p.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(p._id)}>
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qty}>{cartItem?.quantity || 0}</Text>
                      <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => addToCart(p)}>
                        <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Carrito resumen */}
            {cart.length > 0 && (
              <View style={styles.cartSummary}>
                <Text style={styles.cartLabel}>🛒 {cart.length} producto(s)</Text>
                <Text style={styles.cartTotal}>Total: ${cartTotal.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleCreateOrder}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Pedir</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 20,
    paddingTop:       60,
    paddingBottom:    16,
  },
  title:      { fontSize: 28, fontWeight: '900', color: '#2D1B00' },
  newBtn:     { backgroundColor: '#C8622A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji:     { fontSize: 60, marginBottom: 12 },
  emptyText:      { fontSize: 16, color: '#AAA', marginBottom: 20 },
  emptyBtn:       { backgroundColor: '#C8622A', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:   { color: '#fff', fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor:     '#fff',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:             24,
    paddingBottom:       40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D1B00', marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },

  productRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productName:  { fontSize: 14, fontWeight: '600', color: '#333' },
  productPrice: { fontSize: 13, color: '#C8622A', fontWeight: '700' },
  qtyControls:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn:       { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd:    { backgroundColor: '#C8622A' },
  qtyBtnText:   { fontSize: 18, fontWeight: '700', color: '#555', lineHeight: 22 },
  qty:          { fontSize: 15, fontWeight: '700', color: '#333', minWidth: 20, textAlign: 'center' },

  cartSummary: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    backgroundColor: '#FFF4E6',
    borderRadius:    12,
    padding:         12,
    marginVertical:  12,
  },
  cartLabel: { fontSize: 14, color: '#666' },
  cartTotal: { fontSize: 15, fontWeight: '800', color: '#C8622A' },

  modalBtns:     { flexDirection: 'row', gap: 12 },
  cancelBtn:     { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#F0F0F0', alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: '#666' },
  saveBtn:       { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#C8622A', alignItems: 'center' },
  saveBtnText:   { fontWeight: '700', color: '#fff' },
});
