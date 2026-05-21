// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import LoginScreen   from '../screens/LoginScreen';
import HomeScreen    from '../screens/HomeScreen';
import MenuScreen    from '../screens/MenuScreen';
import OrdersScreen  from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab Navigator (pantallas principales) ─────────────────────────────
function MainTabs() {
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
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home:    focused ? '🏠' : '🏡',
            Menu:    focused ? '☕' : '🍵',
            Orders:  focused ? '📋' : '📄',
            Profile: focused ? '👤' : '👥',
          };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'Inicio' }} />
      <Tab.Screen name="Menu"    component={MenuScreen}    options={{ title: 'Menú' }} />
      <Tab.Screen name="Orders"  component={OrdersScreen}  options={{ title: 'Pedidos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// ── Stack Navigator raíz ───────────────────────────────────────────────
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
