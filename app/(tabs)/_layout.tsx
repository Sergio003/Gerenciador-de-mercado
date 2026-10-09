
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16834a',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Produtos',
          tabBarAccessibilityLabel: 'Aba de produtos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="acessibilidade"
        options={{
          title: 'Acessibilidade',
          tabBarAccessibilityLabel: 'Aba de acessibilidade',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="accessibility-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
