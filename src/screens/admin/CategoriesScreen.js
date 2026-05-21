// src/screens/admin/CategoriesScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView, Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import { EMOJI_OPTIONS } from '../../constants';

const EMPTY_FORM = { name: '', slug: '', emoji: '☕', active: true };

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getAllCategories();
      setCategories(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, emoji: cat.emoji, active: cat.active });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'El nombre es obligatorio');
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing._id, form);
      } else {
        await createCategory(form);
      }
      setModal(false);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Deseas eliminar "${cat.name}"?\nLos productos con esta categoría seguirán existiendo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat._id);
              fetchAll();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={[styles.emojiBox, !item.active && styles.emojiBoxInactive]}>
        <Text style={styles.rowEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, !item.active && styles.textInactive]}>{item.name}</Text>
        <Text style={styles.rowSlug}>slug: {item.slug}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.active ? '#D1FAE5' : '#F3F4F6' }]}>
        <Text style={[styles.statusText, { color: item.active ? '#047857' : '#6B7280' }]}>
          {item.active ? 'Activa' : 'Inactiva'}
        </Text>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
        <Text style={styles.editBtnText}>✏️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item)}>
        <Text style={styles.delBtnText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Categorías 🏷️</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay categorías. ¡Crea la primera!</Text>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        />
      )}

      {/* Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Editar categoría' : 'Nueva categoría'}</Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. Café de especialidad"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor="#AAA"
            />

            <Text style={styles.label}>Slug (identificador)</Text>
            <TextInput
              style={[styles.input, { color: '#888' }]}
              placeholder="se genera automáticamente"
              value={form.slug}
              onChangeText={(v) => setForm({ ...form, slug: v.toLowerCase().replace(/\s+/g, '_') })}
              autoCapitalize="none"
              placeholderTextColor="#BBB"
            />

            <Text style={styles.label}>Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {EMOJI_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiOption, form.emoji === e && styles.emojiOptionSelected]}
                  onPress={() => setForm({ ...form, emoji: e })}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Activa</Text>
              <Switch
                value={form.active}
                onValueChange={(v) => setForm({ ...form, active: v })}
                trackColor={{ true: '#7C3AED', false: '#CCC' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveText}>Guardar</Text>
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
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingTop:       56,
    paddingBottom:    16,
    backgroundColor:  '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  backBtn:    { padding: 4 },
  backText:   { color: '#7C3AED', fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 20, fontWeight: '900', color: '#2D1B00' },
  addBtn:     { backgroundColor: '#7C3AED', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  row: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#fff',
    marginHorizontal: 16,
    marginVertical:   5,
    borderRadius:     12,
    padding:          12,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.05,
    shadowRadius:     4,
    elevation:        2,
  },
  emojiBox:         { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emojiBoxInactive: { backgroundColor: '#F3F4F6' },
  rowEmoji:         { fontSize: 22 },
  rowInfo:          { flex: 1 },
  rowName:          { fontSize: 15, fontWeight: '700', color: '#2D1B00' },
  textInactive:     { color: '#9CA3AF' },
  rowSlug:          { fontSize: 12, color: '#AAA', marginTop: 2 },
  statusBadge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 },
  statusText:       { fontSize: 11, fontWeight: '600' },
  editBtn:          { padding: 6 },
  editBtnText:      { fontSize: 18 },
  delBtn:           { padding: 6 },
  delBtnText:       { fontSize: 18 },
  empty:            { textAlign: 'center', color: '#AAA', marginTop: 60, fontSize: 15 },

  // Modal
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:{ fontSize: 20, fontWeight: '800', color: '#2D1B00', marginBottom: 16 },
  label:     { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6 },
  input:     { borderWidth: 1.5, borderColor: '#E8DDD5', borderRadius: 12, padding: 13, fontSize: 15, color: '#333', marginBottom: 14, backgroundColor: '#FAFAFA' },
  emojiOption:         { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  emojiOptionSelected: { backgroundColor: '#EDE9FE', borderWidth: 2, borderColor: '#7C3AED' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#F0F0F0', alignItems: 'center' },
  cancelText:{ fontWeight: '700', color: '#666' },
  saveBtn:   { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#7C3AED', alignItems: 'center' },
  saveText:  { fontWeight: '700', color: '#fff' },
});
