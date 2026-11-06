
import { useSession } from '@/src/contexts/SessionProvider';
import { supabase } from '@/src/services/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

type Mensagem = {
  id: string;
  room_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

function adicionarSemDuplicar(
  anteriores: Mensagem[],
  nova: Mensagem
): Mensagem[] {
  if (anteriores.some((mensagem) => mensagem.id === nova.id)) {
    return anteriores;
  }

  return [...anteriores, nova].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );
}

export default function ConversaScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user, touch } = useSession();

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [acessoAutorizado, setAcessoAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);

  // Verifica se o usuário pode acessar a conversa.
  useEffect(() => {
    let ativo = true;

    async function verificarPermissao() {
      setVerificandoAcesso(true);
      setAcessoAutorizado(false);

      if (!user || !roomId) {
        if (ativo) {
          setVerificandoAcesso(false);
        }
        return;
      }

      touch();

      const { data, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', roomId)
        .maybeSingle();

      if (!ativo) return;

      if (error) {
        setErro(
          'Não foi possível verificar o acesso à conversa: ' +
            error.message
        );
        setAcessoAutorizado(false);
      } else {
        setAcessoAutorizado(!!data);
      }

      setVerificandoAcesso(false);
    }

    void verificarPermissao();

    return () => {
      ativo = false;
    };
  }, [roomId, user?.id, touch]);

  // Carrega o histórico de mensagens.
  useEffect(() => {
    let ativo = true;

    async function carregarMensagens() {
      if (
        !user ||
        !roomId ||
        verificandoAcesso ||
        !acessoAutorizado
      ) {
        return;
      }

      touch();

      const { data, error } = await supabase
        .from('messages')
        .select('id, room_id, author_id, body, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!ativo) return;

      if (error) {
        setErro(
          'Não foi possível carregar as mensagens: ' +
            error.message
        );
      } else {
        setMensagens(data ?? []);
        setErro('');
      }

      setCarregando(false);
    }

    void carregarMensagens();

    return () => {
      ativo = false;
    };
  }, [
    roomId,
    user?.id,
    touch,
    verificandoAcesso,
    acessoAutorizado,
  ]);

  // Recebe novas mensagens em tempo real.
  useEffect(() => {
    if (
      !roomId ||
      !user ||
      verificandoAcesso ||
      !acessoAutorizado
    ) {
      return;
    }

    const canal = supabase
      .channel(`chat-${roomId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const novaMensagem = payload.new as Mensagem;

          setMensagens((anteriores) =>
            adicionarSemDuplicar(anteriores, novaMensagem)
          );
        }
      )
      .subscribe((status) => {
        if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT'
        ) {
          setErroEnvio(
            'Conexão em tempo real interrompida. ' +
              'As novas mensagens podem não aparecer automaticamente.'
          );
        }

        if (status === 'SUBSCRIBED') {
          setErroEnvio('');

          void (async () => {
            const { data, error } = await supabase
              .from('messages')
              .select(
                'id, room_id, author_id, body, created_at'
              )
              .eq('room_id', roomId)
              .order('created_at', { ascending: false })
              .limit(100);

            if (error) {
              setErro(
                'Não foi possível sincronizar o histórico: ' +
                  error.message
              );
              return;
            }

            setMensagens((anteriores) => {
              let atualizadas = anteriores;

              for (const mensagem of data ?? []) {
                atualizadas = adicionarSemDuplicar(
                  atualizadas,
                  mensagem
                );
              }

              return atualizadas;
            });

            setErro('');
          })();
        }
      });

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [
    roomId,
    user?.id,
    verificandoAcesso,
    acessoAutorizado,
  ]);

  // Envia mensagens para o Supabase.
  async function enviarMensagem() {
    const conteudo = texto.trim();

    if (
      !conteudo ||
      !user ||
      !roomId ||
      enviando ||
      verificandoAcesso ||
      !acessoAutorizado
    ) {
      return;
    }

    if (conteudo.length > 2000) {
      setErroEnvio(
        'A mensagem deve ter no máximo 2000 caracteres.'
      );
      return;
    }

    touch();
    setEnviando(true);
    setErroEnvio('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          author_id: user.id,
          body: conteudo,
        })
        .select('id, room_id, author_id, body, created_at')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          'O servidor não confirmou o envio.'
        );
      }

      setMensagens((anteriores) => {
        if (
          anteriores.some(
            (mensagem) => mensagem.id === data.id
          )
        ) {
          return anteriores;
        }

        return [...anteriores, data].sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
      });

      setTexto('');
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido';

      setErroEnvio(
        'Não foi possível confirmar o envio: ' +
          mensagem
      );
    } finally {
      setEnviando(false);
    }
  }

  // Tela de carregamento.
  if (verificandoAcesso) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#16834A"
        />

        <Text style={styles.aviso}>
          Verificando permissão de acesso...
        </Text>
      </View>
    );
  }

  // Tela de acesso não autorizado.
  if (!acessoAutorizado) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>
          Chat — Menor Preço Saqua
        </Text>

        <Text style={styles.erro}>
          {erro ||
            'Acesso não autorizado a esta conversa.'}
        </Text>

        <Text style={styles.aviso}>
          Você não possui permissão para visualizar
          ou enviar mensagens nesta sala.
        </Text>
      </View>
    );
  }

  // Tela principal do chat.
  // SafeAreaView evita sobreposição com a barra do Android.
  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
    >
      <Text style={styles.titulo}>
        Chat — Menor Preço Saqua
      </Text>

      <Text style={styles.subtitulo}>
        Conversa em tempo real
      </Text>

      <Text style={styles.informacao}>
        Sala: {roomId}
      </Text>

      <Text style={styles.informacao}>
        Usuário: {user?.email ?? 'Não identificado'}
      </Text>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#16834A"
        />
      ) : erro ? (
        <Text style={styles.erro}>
          {erro}
        </Text>
      ) : (
        <FlatList
          data={mensagens}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listaMensagens}
          ListEmptyComponent={
            <Text style={styles.aviso}>
              Nenhuma mensagem nesta conversa.
            </Text>
          }
          renderItem={({ item }) => {
            const minhaMensagem =
              item.author_id === user?.id;

            return (
              <View
                style={[
                  styles.balao,
                  minhaMensagem
                    ? styles.balaoEnviado
                    : styles.balaoRecebido,
                ]}
              >
                <Text style={styles.remetente}>
                  {minhaMensagem
                    ? 'Você'
                    : 'Outro participante'}
                </Text>

                <Text style={styles.textoMensagem}>
                  {item.body}
                </Text>

                <Text style={styles.horario}>
                  {new Date(
                    item.created_at
                  ).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
        />
      )}

      {!carregando && !erro && (
        <>
          <View style={styles.areaEnvio}>
            <TextInput
              style={styles.campoMensagem}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#888888"
              value={texto}
              onChangeText={setTexto}
              maxLength={2000}
              editable={!enviando}
            />

            <Pressable
              style={[
                styles.botaoEnviar,
                enviando && { opacity: 0.5 },
              ]}
              onPress={enviarMensagem}
              disabled={enviando || !texto.trim()}
            >
              <Text style={styles.textoBotao}>
                {enviando
                  ? 'Enviando...'
                  : 'Enviar'}
              </Text>
            </Pressable>
          </View>

          {!!erroEnvio && (
            <Text style={styles.erroEnvio}>
              {erroEnvio}
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
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
    marginBottom: 12,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },

  informacao: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 12,
  },

  aviso: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 30,
  },

  erro: {
    fontSize: 15,
    color: '#B00020',
    marginTop: 20,
  },

  listaMensagens: {
    paddingBottom: 8,
  },

  balao: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '85%',
  },

  balaoEnviado: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },

  balaoRecebido: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEEEEE',
  },

  remetente: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16834A',
    marginBottom: 4,
  },

  textoMensagem: {
    fontSize: 16,
    color: '#222222',
  },

  horario: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'right',
    marginTop: 5,
  },

  areaEnvio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },

  campoMensagem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222222',
  },

  botaoEnviar: {
    backgroundColor: '#16834A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  erroEnvio: {
    color: '#B00020',
    fontSize: 13,
    marginTop: 8,
  },
});
