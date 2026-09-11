export type Endereco = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export async function buscarCep(
  cep: string
): Promise<Endereco> {

  const cepLimpo = cep.replace(/\D/g, '');

  const resposta = await fetch(
    `https://viacep.com.br/ws/${cepLimpo}/json/`
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o CEP.');
  }

  const dados = await resposta.json();

  if (dados.erro) {
    throw new Error('CEP não encontrado.');
  }

  return dados;
}