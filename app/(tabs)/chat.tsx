
import { useSession } from '@/src/contexts/SessionProvider';
import { supabase } from '@/src/services/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Sala = {
  id: string;
  title: string;
  created_at: string;
};

export default function ChatScreen() {
  const { user, touch } = useSession();

  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarSalas() {
      if (!user) {
        setCarregando(false);
        return;
      }

      touch();

      const { data, error } = await supabase
        .from('rooms')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      if (!ativo) return;

      if (error) {
        setErro('Não foi possível carregar as conversas: ' + error.message);
      } else {
        setSalas(data ?? []);
        setErro('');
      }

      setCarregando(false);
    }

    void carregarSalas();

    return () => {
      ativo = false;
    };
  }, [user?.id, touch]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Chat — Menor Preço Saqua</Text>
      <Text style={styles.subtitulo}>Minhas conversas</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#16834A" />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <FlatList
          data={salas}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              Nenhuma conversa disponível para esta conta.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
                style={styles.sala}
                onPress={() => {
                    touch();

                    router.push({
                        pathname: '/chat/[roomId]',
                        params: { roomId: item.id },
                    });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Abrir conversa ${item.title}`}
            >
                <Text style={styles.nomeSala}>
                    {item.title}
                </Text>

                <Text style={styles.descricao}>
                    Toque para abrir a conversa
                </Text>
            </Pressable>
        )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16834A',
    marginBottom: 16,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  sala: {
    padding: 18,
    backgroundColor: '#F1F8F3',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4E8D9',
  },
  nomeSala: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#16834A',
  },
  descricao: {
    fontSize: 13,
    color: '#666666',
    marginTop: 6,
  },
  erro: {
    fontSize: 15,
    color: '#B00020',
  },
  vazio: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 30,
  },
});
