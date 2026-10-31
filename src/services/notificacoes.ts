
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepararNotificacoes() {
  if (Platform.OS === 'web') {
    return false;
  }

  const permissaoAtual = await Notifications.getPermissionsAsync();

  let status = permissaoAtual.status;

  if (status !== 'granted') {
    const resultado = await Notifications.requestPermissionsAsync();
    status = resultado.status;
  }

  if (status !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('geral', {
      name: 'Notificações gerais',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function enviarNotificacaoTeste() {
  if (Platform.OS === 'web') {
    throw new Error('Teste disponível apenas no aplicativo nativo');
  }

  const autorizado = await prepararNotificacoes();

  if (!autorizado) {
    throw new Error('Permissão de notificações não concedida');
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Menor Preço Saqua',
      body: 'Esta é uma notificação de teste da Aula 11.',
      data: {
        tipo: 'teste',
      },
    },
    trigger: null,
  });
}

export async function obterExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const autorizado = await prepararNotificacoes();

  if (!autorizado) {
    return null;
  }

  try {
    const Constants = (await import('expo-constants')).default;

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      throw new Error('Project ID do EAS não encontrado.');
    }

    const resultado = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return resultado.data;
  } catch (erro) {
    console.error('Erro ao obter Expo Push Token:', erro);
    return null;
  }
}


export async function registrarTokenPush(): Promise<boolean> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return false;
  }

  const token = await obterExpoPushToken();

  if (!token) {
    return false;
  }

  const { supabase } = await import('./supabase');

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    console.warn('Não há sessão autenticada para registrar o token Push.');
    return false;
  }

  try {
    const resposta = await fetch(
      'https://menor-preco-saqua-api-8b8q.onrender.com/notificacoes/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          token,
          plataforma: Platform.OS,
        }),
      }
    );

    if (!resposta.ok) {
      console.error('Erro HTTP ao registrar token Push:', resposta.status);
      return false;
    }

    return true;
  } catch (erro) {
    console.error('Erro de conexão ao registrar token Push:', erro);
    return false;
  }
}
