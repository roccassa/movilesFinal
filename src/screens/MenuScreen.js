// src/screens/MenuScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['todos', 'cafe', 'te', 'bebida_fria', 'postre', 'snack', 'otro'];

const EMPTY_FORM = { name: '', description: '', price: '', category: 'cafe', available: true };

export default function MenuScreen({ navigation }) {
  const [products,  setProducts]  = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing,   setEditing]   = useState(null); // producto que se edita
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  useFocusEffect(useCallback(() => { fetchProducts(); }, []));

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data.data);
      setFiltered(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por categoría
  useEffect(() => {
    if (catFilter === 'todos') {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === catFilter));
    }
  }, [catFilter, products]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name:        product.name,
      description: product.description,
      price:       String(product.price),
      category:    product.category,
      available:   product.available,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      return Alert.alert('Error', 'Nombre y precio son obligatorios');
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) {
        await updateProduct(editing._id, payload);
      } else {
        await createProduct(payload);
      }
      setModalVisible(false);
      fetchProducts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product._id);
              fetchProducts();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const handleAddToOrder = (product) => {
    navigation.navigate('Orders', { addProduct: product });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Menú ☕</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros por categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, catFilter === cat && styles.filterChipActive]}
            onPress={() => setCatFilter(cat)}
          >
            <Text style={[styles.filterText, catFilter === cat && styles.filterTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color="#C8622A" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View>
              <ProductCard
                product={item}
                onPress={() => openEdit(item)}
                onAddToOrder={handleAddToOrder}
              />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay productos en esta categoría</Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Modal Crear / Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Editar producto' : 'Nuevo producto'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor="#AAA"
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholderTextColor="#AAA"
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Precio (ej: 55.00)"
              value={form.price}
              onChangeText={(v) => setForm({ ...form, price: v })}
              keyboardType="decimal-pad"
              placeholderTextColor="#AAA"
            />

            {/* Selector de categoría */}
            <Text style={styles.label}>Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIES.filter((c) => c !== 'todos').map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, form.category === cat && styles.filterChipActive]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={[styles.filterText, form.category === cat && styles.filterTextActive]}>
                    {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Disponible toggle */}
            <TouchableOpacity
              style={[styles.toggleBtn, form.available && styles.toggleBtnActive]}
              onPress={() => setForm({ ...form, available: !form.available })}
            >
              <Text style={styles.toggleText}>
                {form.available ? '✅ Disponible' : '❌ No disponible'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Guardar</Text>
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
  container:  { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 20,
    paddingTop:       60,
    paddingBottom:    16,
  },
  title:      { fontSize: 28, fontWeight: '900', color: '#2D1B00' },
  addBtn:     { backgroundColor: '#C8622A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  filters:     { paddingHorizontal: 16, marginBottom: 12, maxHeight: 44 },
  filterChip:  { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#EEE', marginRight: 8 },
  filterChipActive: { backgroundColor: '#C8622A' },
  filterText:       { fontSize: 13, color: '#666', fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  deleteBtn:     { alignSelf: 'flex-end', marginRight: 20, marginTop: -8, marginBottom: 4 },
  deleteBtnText: { fontSize: 18 },
  empty:         { textAlign: 'center', color: '#AAA', marginTop: 60, fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:         24,
    paddingBottom:   40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D1B00', marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6 },
  input: {
    borderWidth:   1.5,
    borderColor:   '#E8DDD5',
    borderRadius:  12,
    padding:       13,
    fontSize:      15,
    color:         '#333',
    marginBottom:  12,
    backgroundColor: '#FAFAFA',
  },
  toggleBtn:       { borderRadius: 12, padding: 13, backgroundColor: '#F0F0F0', marginBottom: 16, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#E8F5E9' },
  toggleText:      { fontWeight: '700', fontSize: 14 },

  modalBtns:     { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn:     { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#F0F0F0', alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: '#666' },
  saveBtn:       { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#C8622A', alignItems: 'center' },
  saveBtnText:   { fontWeight: '700', color: '#fff' },
});
