
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    // Evita carregar o VLibras mais de uma vez.
    if (document.getElementById('vlibras-script')) {
      return;
    }

    // Adiciona o componente do VLibras à página.
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

    // Carrega o script oficial do VLibras.
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
