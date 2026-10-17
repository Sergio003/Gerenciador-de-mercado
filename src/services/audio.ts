
import { createAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

const somEvento = require('../../assets/evento.wav');

export async function reproduzirSomCadastro(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const player = createAudioPlayer(somEvento);

  try {
    player.seekTo(0);
    player.play();
  } catch (error) {
    player.remove();
    throw error;
  }

  // Libera o player após o áudio curto de confirmação.
  setTimeout(() => {
    player.remove();
  }, 3000);
}
