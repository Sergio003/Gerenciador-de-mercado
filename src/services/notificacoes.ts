
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
      body: 'Esta é uma notificação de teste da Aula 7.',
      data: {
        tipo: 'teste',
      },
    },
    trigger: null,
  });
}
