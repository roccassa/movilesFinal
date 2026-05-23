// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', password: '' });

  const handleSubmit = async () => {
    const { name, email, password } = form;

    if (!email || !password) {
      return Alert.alert('Error', 'Email y contraseña son obligatorios');
    }
    if (!isLogin && !name) {
      return Alert.alert('Error', 'El nombre es obligatorio');
    }

    setLoading(true);
    try {
      const res = isLogin
        ? await loginUser({ email, password })
        : await registerUser({ name, email, password });

      const { token, user } = res.data.data;

      // Guardar token y datos del usuario
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      navigation.replace('Main');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error de conexión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>☕</Text>
          <Text style={styles.logoTitle}>CaféApp</Text>
          <Text style={styles.logoSubtitle}>Tu café favorito, en un toque</Text>
        </View>

        {/* Tarjeta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor="#AAA"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#AAA"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry
            placeholderTextColor="#AAA"
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{isLogin ? 'Entrar' : 'Registrarme'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <Text style={styles.switchLink}>{isLogin ? 'Regístrate' : 'Inicia sesión'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoEmoji:     { fontSize: 64 },
  logoTitle:     { fontSize: 36, fontWeight: '900', color: '#2D1B00', marginTop: 8 },
  logoSubtitle:  { fontSize: 15, color: '#888', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius:    20,
    padding:         24,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.1,
    shadowRadius:    12,
    elevation:       5,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#2D1B00', marginBottom: 20 },
  input: {
    borderWidth:     1.5,
    borderColor:     '#E8DDD5',
    borderRadius:    12,
    padding:         14,
    fontSize:        15,
    color:           '#333',
    marginBottom:    14,
    backgroundColor: '#FAFAFA',
  },
  btn: {
    backgroundColor: '#C8622A',
    borderRadius:    12,
    padding:         16,
    alignItems:      'center',
    marginTop:       4,
  },
  btnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchBtn:  { marginTop: 18, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#888' },
  switchLink: { color: '#C8622A', fontWeight: '700' },
});
