
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibility } from '@/src/contexts/AccessibilityProvider';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const { tema, tamanhoFonte } = useAccessibility();

  const escuro = tema === 'escuro';

  const corAtiva = escuro ? '#62D99B' : '#16834A';
  const corInativa = escuro ? '#CCCCCC' : '#666666';
  const corFundo = escuro ? '#171717' : '#FFFFFF';

  // Mantém a barra acima da navegação do Android.
  const paddingInferior =
    Platform.OS === 'web'
      ? 10
      : Math.max(insets.bottom, 12);

  // Limita a fonte dos rótulos para evitar sobreposição.
  const tamanhoRotulo = Math.min(
    14,
    Math.max(12, tamanhoFonte * 0.55)
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: true,

        tabBarActiveTintColor: corAtiva,
        tabBarInactiveTintColor: corInativa,

        tabBarIconStyle: {
          marginTop: 2,
        },

        tabBarLabelStyle: {
          fontSize: tamanhoRotulo,
          fontWeight: '600',
          marginTop: 3,
        },

        tabBarStyle: {
          backgroundColor: corFundo,
          borderTopColor: escuro
            ? '#444444'
            : '#DDDDDD',

          height: 66 + paddingInferior,
          paddingTop: 8,
          paddingBottom: paddingInferior,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Produtos',
          tabBarAccessibilityLabel: 'Aba de produtos',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="cart-outline"
              size={24}
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
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="accessibility-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Meu Perfil',
          tabBarAccessibilityLabel: 'Aba meu perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
