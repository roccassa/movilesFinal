// src/screens/admin/AdminScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const SECTIONS = [
  {
    key:         'Categories',
    emoji:       '🏷️',
    title:       'Categorías',
    description: 'Crea, edita y desactiva categorías de productos',
    color:       '#7C3AED',
    bg:          '#EDE9FE',
  },
  {
    key:         'Users',
    emoji:       '👥',
    title:       'Usuarios',
    description: 'Consulta y administra los usuarios registrados',
    color:       '#0369A1',
    bg:          '#E0F2FE',
  },
  {
    key:         'AllOrders',
    emoji:       '📋',
    title:       'Todos los pedidos',
    description: 'Gestiona el estado e imprime tickets de cualquier pedido',
    color:       '#047857',
    bg:          '#D1FAE5',
  },
];

export default function AdminScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Administración</Text>
        <Text style={styles.subtitle}>Panel de control ⚙️</Text>
      </View>

      {SECTIONS.map((s) => (
        <TouchableOpacity
          key={s.key}
          style={styles.card}
          onPress={() => navigation.navigate(s.key)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
            <Text style={styles.iconEmoji}>{s.emoji}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: s.color }]}>{s.title}</Text>
            <Text style={styles.cardDesc}>{s.description}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    paddingHorizontal: 20,
    paddingTop:        60,
    paddingBottom:     24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE4',
    backgroundColor:   '#fff',
  },
  title:    { fontSize: 28, fontWeight: '900', color: '#2D1B00' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 2 },

  card: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#fff',
    marginHorizontal: 16,
    marginTop:        16,
    borderRadius:     16,
    padding:          16,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.07,
    shadowRadius:     6,
    elevation:        3,
  },
  iconBox:  { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconEmoji:{ fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitle:{ fontSize: 16, fontWeight: '800', marginBottom: 3 },
  cardDesc: { fontSize: 13, color: '#888' },
  arrow:    { fontSize: 26, color: '#CCC', fontWeight: '300' },
});
