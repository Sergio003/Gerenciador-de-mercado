import { useSession } from '@/src/contexts/SessionProvider';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const FormScroll = Platform.OS === 'web' ? ScrollView : KeyboardAwareScrollView;

export default function LoginScreen() {
  const { user, busy, reason, login } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  async function handleLogin() {
    if (!email.trim() || !password) {
      const message = 'Informe seu e-mail e sua senha.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Atenção', message);
      }

      return;
    }

    await login(email, password);
  }

  return (
    <View style={styles.container}>
      <FormScroll
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        {...(Platform.OS !== 'web' ? { bottomOffset: 24 } : {})}
        showsVerticalScrollIndicator
      >
      <View style={styles.card}>
        <Text style={styles.title}>Menor Preço Saqua</Text>

        <Text style={styles.subtitle}>
          Entre com sua conta para acessar o aplicativo
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#777"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Campo de e-mail"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Campo de senha"
        />

        {reason ? (
          <Text style={styles.error} accessibilityRole="alert">
            {reason}
          </Text>
        ) : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Entrar na conta"
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>
      </View>
      </FormScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f5f1',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16834a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff',
  },
  error: {
    color: '#b00020',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#16834a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
