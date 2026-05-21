// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWeather } from '../services/weather';
import { WEATHER_EMOJI } from '../constants';

export default function HomeScreen({ navigation }) {
  const [user,    setUser]    = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));

      const w = await getWeather();
      setWeather(w);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    navigation.replace('Login');
  };

  const weatherEmoji = weather ? (WEATHER_EMOJI[weather.icon] || '🌤️') : '🌤️';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.name?.split(' ')[0] || 'amigo'}! 👋</Text>
          <Text style={styles.subtitle}>¿Qué vas a pedir hoy?</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Banner clima */}
      {loading ? (
        <ActivityIndicator color="#C8622A" style={{ marginTop: 20 }} />
      ) : weather ? (
        <View style={styles.weatherCard}>
          <View style={styles.weatherTop}>
            <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
            <View>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherDesc}>{weather.description}</Text>
              <Text style={styles.weatherCity}>📍 {weather.city}</Text>
            </View>
          </View>
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationText}>{weather.recommendation}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.weatherCard, { alignItems: 'center' }]}>
          <Text style={{ color: '#888' }}>No se pudo cargar el clima</Text>
        </View>
      )}

      {/* Accesos rápidos */}
      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.actionEmoji}>☕</Text>
          <Text style={styles.actionLabel}>Ver Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.actionEmoji}>📋</Text>
          <Text style={styles.actionLabel}>Mis Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionEmoji}>👤</Text>
          <Text style={styles.actionLabel}>Mi Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Info de la cafetería */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>☕ CaféApp</Text>
        <Text style={styles.infoText}>🕐 Lunes a Viernes: 7:00 – 21:00</Text>
        <Text style={styles.infoText}>🕐 Sábado y Domingo: 8:00 – 20:00</Text>
        <Text style={styles.infoText}>📍 Guadalajara, Jalisco</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: 20,
    paddingTop:      60,
    paddingBottom:   20,
  },
  greeting:   { fontSize: 24, fontWeight: '900', color: '#2D1B00' },
  subtitle:   { fontSize: 14, color: '#888', marginTop: 2 },
  logoutBtn:  { backgroundColor: '#FFE5D0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  logoutText: { color: '#C8622A', fontWeight: '700', fontSize: 13 },

  weatherCard: {
    backgroundColor: '#2D1B00',
    borderRadius:    20,
    marginHorizontal: 20,
    padding:         20,
    marginBottom:    24,
  },
  weatherTop:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  weatherEmoji:  { fontSize: 48, marginRight: 16 },
  weatherTemp:   { fontSize: 36, fontWeight: '900', color: '#fff' },
  weatherDesc:   { fontSize: 14, color: '#CCC', textTransform: 'capitalize' },
  weatherCity:   { fontSize: 13, color: '#AAA', marginTop: 2 },
  recommendationBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    12,
    padding:         12,
  },
  recommendationText: { color: '#FFD9A0', fontSize: 14, fontWeight: '600' },

  sectionTitle: {
    fontSize:        18,
    fontWeight:      '800',
    color:           '#2D1B00',
    marginHorizontal: 20,
    marginBottom:    12,
  },
  quickActions: {
    flexDirection:    'row',
    marginHorizontal: 20,
    gap:              12,
    marginBottom:     24,
  },
  actionCard: {
    flex:            1,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    6,
    elevation:       2,
  },
  actionEmoji: { fontSize: 30, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: '#2D1B00', textAlign: 'center' },

  infoCard: {
    backgroundColor: '#FFF4E6',
    borderRadius:    16,
    marginHorizontal: 20,
    padding:         16,
    marginBottom:    40,
    borderLeftWidth: 4,
    borderLeftColor: '#C8622A',
  },
  infoTitle: { fontSize: 16, fontWeight: '800', color: '#2D1B00', marginBottom: 8 },
  infoText:  { fontSize: 14, color: '#666', marginBottom: 4 },
});
