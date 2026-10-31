
const PushToken = require('../models/PushToken');

async function notificarNovoProduto(produto, usuarioId) {
  try {
    // Não notifica o usuário que cadastrou o produto.
    const dispositivos = await PushToken.find({
      usuarioId: { $ne: usuarioId },
    }).select('token plataforma somAtivado');

    if (dispositivos.length === 0) {
      return;
    }

    const mensagens = dispositivos.map((dispositivo) => {
      const somAtivado = dispositivo.somAtivado !== false;

      const mensagem = {
        to: dispositivo.token,
        title: 'Novo produto no Menor Preço Saqua!',
        body: `${produto.nome} foi cadastrado por R$ ${produto.preco}.`,
        data: {
          tipo: 'novo_produto',
          produtoId: String(produto._id),
        },
      };

      if (dispositivo.plataforma === 'android') {
        mensagem.channelId = somAtivado
          ? 'geral-com-som'
          : 'geral-silencioso';
      } else {
        mensagem.sound = somAtivado ? 'default' : null;
      }

      return mensagem;
    });

    // A API do Expo aceita até 100 notificações por requisição.
    for (let i = 0; i < mensagens.length; i += 100) {
      const lote = mensagens.slice(i, i + 100);

      const resposta = await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lote),
        }
      );

      if (!resposta.ok) {
        console.error(
          'Erro HTTP ao enviar notificações:',
          resposta.status
        );
        continue;
      }

      const resultado = await resposta.json();

      if (resultado.errors) {
        console.error('Erros no envio Push:', resultado.errors);
      }

      for (const ticket of resultado.data ?? []) {
        if (ticket.status === 'error') {
          console.error('Falha no ticket Push:', ticket);
        }
      }
    }
  } catch (erro) {
    console.error('Erro ao notificar novo produto:', erro);
  }
}

module.exports = { notificarNovoProduto };
