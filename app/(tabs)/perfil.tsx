
import { useSession } from '@/src/contexts/SessionProvider';
import { supabase } from '@/src/services/supabase';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Profile = {
  id: string;
  name: string;
  role: string;
};

export default function PerfilScreen() {
  const { user, logout, touch } = useSession();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .single();

    if (error) {
      setMessage('Não foi possível carregar o perfil: ' + error.message);
      setProfile(null);
    } else {
      setProfile(data);
      setName(data.name);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function saveName() {
    if (!user || !profile || saving) return;

    const newName = name.trim();

    if (!newName) {
      setMessage('O nome não pode ficar vazio.');
      return;
    }

    setSaving(true);
    setMessage('');
    touch();

    const { data, error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', user.id)
      .select('id, name, role')
      .single();

    if (error) {
      setMessage('Erro ao salvar: ' + error.message);
    } else {
      setProfile(data);
      setName(data.name);
      setMessage('Nome atualizado com sucesso!');
    }

    setSaving(false);
  }

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>Meu Perfil</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#16834a" />
        ) : (
          <>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(value) => {
                setName(value);
                touch();
              }}
              placeholder="Seu nome"
              accessibilityLabel="Nome do usuário"
            />

            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.readOnly}>
              {user.email ?? 'Não informado'}
            </Text>

            <Text style={styles.label}>Papel</Text>
            <Text style={styles.readOnly}>
              {profile?.role ?? 'Não disponível'}
            </Text>

            {message ? (
              <Text
                style={[
                  styles.message,
                  message.startsWith('Nome atualizado') && styles.success,
                ]}
                accessibilityRole="alert"
              >
                {message}
              </Text>
            ) : null}

            <Pressable
              style={[styles.saveButton, (saving || !profile) && styles.disabled]}
              onPress={() => void saveName()}
              disabled={saving || !profile}
              accessibilityRole="button"
              accessibilityLabel="Salvar nome"
            >
              <Text style={styles.buttonText}>
                {saving ? 'Salvando...' : 'Salvar nome'}
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          style={styles.logoutButton}
          onPress={() => void logout('Você saiu da sua conta')}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f5f1',
  },
  content: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16834a',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 18,
  },
  readOnly: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#555',
    marginBottom: 18,
  },
  message: {
    color: '#b00020',
    textAlign: 'center',
    marginBottom: 15,
  },
  success: {
    color: '#16834a',
  },
  saveButton: {
    backgroundColor: '#16834a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#b00020',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#b00020',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
