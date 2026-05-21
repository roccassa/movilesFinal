// src/screens/admin/UsersScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsers, updateUser, deleteUser } from '../../services/api';

const ROLE_CONFIG = {
  admin:   { label: '👑 Admin',   color: '#92400E', bg: '#FEF3C7' },
  cliente: { label: '☕ Cliente', color: '#1E40AF', bg: '#DBEAFE' },
};

export default function UsersScreen({ navigation }) {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [currentId, setCurrentId] = useState(null);

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('user');
      if (stored) setCurrentId(JSON.parse(stored)._id);
      const res = await getAllUsers();
      setUsers(res.data.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = (user) => {
    const newRole = user.role === 'admin' ? 'cliente' : 'admin';
    Alert.alert(
      'Cambiar rol',
      `¿Cambiar "${user.name}" a ${newRole}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateUser(user._id, { role: newRole });
              fetchUsers();
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el rol');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (user) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Deseas eliminar la cuenta de "${user.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user._id);
              fetchUsers();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const role    = ROLE_CONFIG[item.role] || ROLE_CONFIG.cliente;
    const initials = item.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const isSelf  = item._id === currentId;
    const joined  = new Date(item.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <View style={[styles.card, isSelf && styles.cardSelf]}>
        {/* Avatar + info */}
        <View style={[styles.avatar, { backgroundColor: isSelf ? '#C8622A' : '#0369A1' }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {isSelf && <Text style={styles.youBadge}> (tú)</Text>}
          </View>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.date}>Desde {joined}</Text>
        </View>

        {/* Role badge + actions */}
        <View style={styles.actions}>
          <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
            <Text style={[styles.roleText, { color: role.color }]}>{role.label}</Text>
          </View>
          {!isSelf && (
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.roleBtn} onPress={() => handleToggleRole(item)}>
                <Text style={styles.roleBtnText}>↕ Rol</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Usuarios 👥</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{users.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#0369A1" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay usuarios registrados</Text>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F6FF' },
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingTop:       56,
    paddingBottom:    16,
    backgroundColor:  '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  backBtn:    { padding: 4 },
  backText:   { color: '#0369A1', fontSize: 16, fontWeight: '600' },
  title:      { fontSize: 20, fontWeight: '900', color: '#2D1B00' },
  countBadge: { backgroundColor: '#0369A1', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText:  { color: '#fff', fontWeight: '800', fontSize: 13 },

  card: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#fff',
    marginHorizontal: 16,
    marginVertical:   5,
    borderRadius:     14,
    padding:          14,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.06,
    shadowRadius:     4,
    elevation:        2,
  },
  cardSelf: { borderWidth: 1.5, borderColor: '#C8622A' },

  avatar:     { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  info:     { flex: 1 },
  nameRow:  { flexDirection: 'row', alignItems: 'center' },
  name:     { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  youBadge: { fontSize: 12, color: '#C8622A', fontWeight: '600' },
  email:    { fontSize: 13, color: '#64748B', marginTop: 2 },
  date:     { fontSize: 11, color: '#AAA', marginTop: 2 },

  actions:    { alignItems: 'flex-end', gap: 6 },
  roleBadge:  { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  roleText:   { fontSize: 11, fontWeight: '700' },
  btnRow:     { flexDirection: 'row', gap: 6 },
  roleBtn:    { backgroundColor: '#E0F2FE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  roleBtnText:{ fontSize: 12, fontWeight: '700', color: '#0369A1' },
  deleteBtn:  { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  deleteBtnText:{ fontSize: 14 },

  empty: { textAlign: 'center', color: '#AAA', marginTop: 60, fontSize: 15 },
});
