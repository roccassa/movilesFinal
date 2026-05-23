// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen    from '../screens/LoginScreen';
import HomeScreen     from '../screens/HomeScreen';
import MenuScreen     from '../screens/MenuScreen';
import OrdersScreen   from '../screens/OrdersScreen';
import ProfileScreen  from '../screens/ProfileScreen';

import AdminScreen      from '../screens/admin/AdminScreen';
import CategoriesScreen from '../screens/admin/CategoriesScreen';
import UsersScreen      from '../screens/admin/UsersScreen';
import AllOrdersScreen  from '../screens/admin/AllOrdersScreen';

const Stack     = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();
const AdminNav  = createNativeStackNavigator();

// ── Stack interno del tab Admin ─────────────────────────────────────────
function AdminStack() {
  return (
    <AdminNav.Navigator screenOptions={{ headerShown: false }}>
      <AdminNav.Screen name="AdminHub"    component={AdminScreen} />
      <AdminNav.Screen name="Categories"  component={CategoriesScreen} />
      <AdminNav.Screen name="Users"       component={UsersScreen} />
      <AdminNav.Screen name="AllOrders"   component={AllOrdersScreen} />
    </AdminNav.Navigator>
  );
}

// ── Tab Navigator ───────────────────────────────────────────────────────
function MainTabs() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const user = JSON.parse(data);
        setIsAdmin(user.role === 'admin');
      }
    };
    loadRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#C8622A',
        tabBarInactiveTintColor: '#AAA',
        tabBarStyle: {
          backgroundColor:  '#fff',
          borderTopColor:   '#F0EAE4',
          borderTopWidth:   1,
          paddingBottom:    8,
          paddingTop:       6,
          height:           64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home:    focused ? '🏠' : '🏡',
            Menu:    focused ? '☕' : '🍵',
            Orders:  focused ? '📋' : '📄',
            Admin:   focused ? '⚙️' : '🔧',
            Profile: focused ? '👤' : '👥',
          };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'Inicio' }} />
      <Tab.Screen name="Menu"    component={MenuScreen}    options={{ title: 'Menú' }} />
      <Tab.Screen name="Orders"  component={OrdersScreen}  options={{ title: 'Pedidos' }} />
      <Tab.Screen
        name="Admin"
        component={AdminStack}
        options={{
          title: 'Admin',
          tabBarButton: isAdmin ? undefined : () => null,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// ── Stack raíz ──────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main"  component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
