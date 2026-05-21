// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user,    setUser]    = useState(null);
  const [form,    setForm]    = useState({ name: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const u = JSON.parse(data);
      setUser(u);
      setForm({ name: u.name, email: u.email });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      return Alert.alert('Error', 'Nombre y email son obligatorios');
    }
    setSaving(true);
    try {
      const res = await updateUser(user._id, form);
      const updated = res.data.data;

      // Actualizar en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setEditing(false);
      Alert.alert('✅ Perfil actualizado');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (!user) return <ActivityIndicator color="#C8622A" style={{ marginTop: 100 }} />;

  const initials = user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil 👤</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role === 'admin' ? '👑 Admin' : '☕ Cliente'}</Text>
        </View>
      </View>

      {/* Formulario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información personal</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          editable={editing}
          placeholderTextColor="#AAA"
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          editable={editing}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#AAA"
        />

        {!editing ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>✏️ Editar perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); loadUser(); }}>
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
        )}
      </View>

      {/* Miembro desde */}
      <View style={styles.infoBox}>
        <Text style={styles.infoItem}>
          📅 Miembro desde: {new Date(user.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     16,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#2D1B00' },

  avatarContainer: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width:           90,
    height:          90,
    borderRadius:    45,
    backgroundColor: '#C8622A',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName:   { fontSize: 22, fontWeight: '800', color: '#2D1B00' },
  roleBadge:  { marginTop: 6, backgroundColor: '#FFF4E6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  roleText:   { fontSize: 13, fontWeight: '700', color: '#C8622A' },

  card: {
    backgroundColor:  '#fff',
    borderRadius:     20,
    marginHorizontal: 20,
    padding:          20,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.08,
    shadowRadius:     8,
    elevation:        3,
    marginBottom:     16,
  },
  cardTitle:     { fontSize: 16, fontWeight: '800', color: '#2D1B00', marginBottom: 16 },
  label:         { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 6 },
  input: {
    borderWidth:     1.5,
    borderColor:     '#E8DDD5',
    borderRadius:    12,
    padding:         13,
    fontSize:        15,
    color:           '#333',
    marginBottom:    14,
    backgroundColor: '#FAFAFA',
  },
  inputDisabled: { backgroundColor: '#F5F5F5', color: '#999' },

  editBtn:       { borderRadius: 12, padding: 14, backgroundColor: '#FFF4E6', alignItems: 'center' },
  editBtnText:   { fontWeight: '700', color: '#C8622A', fontSize: 15 },
  row:           { flexDirection: 'row', gap: 12 },
  cancelBtn:     { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#F0F0F0', alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: '#666' },
  saveBtn:       { flex: 1, borderRadius: 12, padding: 14, backgroundColor: '#C8622A', alignItems: 'center' },
  saveBtnText:   { fontWeight: '700', color: '#fff' },

  infoBox: {
    backgroundColor:  '#fff',
    borderRadius:     16,
    marginHorizontal: 20,
    padding:          16,
    marginBottom:     16,
  },
  infoItem: { fontSize: 14, color: '#555', marginBottom: 4 },

  logoutBtn: {
    marginHorizontal: 20,
    borderRadius:     14,
    padding:          16,
    backgroundColor:  '#FEE2E2',
    alignItems:       'center',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});
