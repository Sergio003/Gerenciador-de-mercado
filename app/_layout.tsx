
import {
  AccessibilityProvider,
  useAccessibility,
} from '@/src/contexts/AccessibilityProvider';

import {
  SessionProvider,
  useSession,
} from '@/src/contexts/SessionProvider';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Controla o acesso às telas conforme o login.
function AppNavigator() {
  const { user } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="modal"
          options={{
            headerShown: true,
            presentation: 'modal',
            title: 'Modal',
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

// Utiliza o tema selecionado nas configurações de acessibilidade.
function AppComTema() {
  const { tema } = useAccessibility();

  const escuro = tema === 'escuro';

  return (
    <ThemeProvider value={escuro ? DarkTheme : DefaultTheme}>
      <AppNavigator />
      <StatusBar style={escuro ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      typeof document === 'undefined'
    ) {
      return;
    }

    // Impede que o VLibras seja carregado mais de uma vez.
    if (document.getElementById('vlibras-script')) {
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('vw', '');
    container.className = 'enabled';
    container.id = 'vlibras-container';

    const botao = document.createElement('div');
    botao.setAttribute('vw-access-button', '');
    botao.className = 'active';

    const wrapper = document.createElement('div');
    wrapper.setAttribute('vw-plugin-wrapper', '');

    const topWrapper = document.createElement('div');
    topWrapper.className = 'vw-plugin-top-wrapper';

    wrapper.appendChild(topWrapper);
    container.appendChild(botao);
    container.appendChild(wrapper);

    document.body.appendChild(container);

    // Carrega o VLibras na versão web.
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;

    script.onload = () => {
      const janela = window as typeof window & {
        VLibras?: {
          Widget: new (url: string) => unknown;
        };
      };

      if (janela.VLibras?.Widget) {
        new janela.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };

    script.onerror = () => {
      console.error('Não foi possível carregar o VLibras.');
    };

    document.body.appendChild(script);
  }, []);

  return (
    <SessionProvider>
      <AccessibilityProvider>
        <AppComTema />
      </AccessibilityProvider>
    </SessionProvider>
  );
}
