# Menor Preço Saqua

Aplicativo híbrido desenvolvido na disciplina de Laboratório de Desenvolvimento de Aplicativos Híbridos.

O projeto vem sendo desenvolvido de forma incremental ao longo das aulas, aplicando conceitos de React Native, gerenciamento de estado, componentes reutilizáveis, listas e integração com APIs REST.

---

## Problema

Em Saquarema existem diversos mercados com preços competitivos e promoções diferentes. Muitas vezes, o consumidor precisa procurar em vários estabelecimentos para descobrir onde determinado produto está mais barato.

---

## Proposta

O Menor Preço Saqua busca facilitar a consulta e o compartilhamento de preços e promoções dos mercados de Saquarema, auxiliando os consumidores na busca por opções mais econômicas.

---

## Objetivo

Desenvolver um aplicativo híbrido que auxilie os consumidores a localizar e compartilhar os menores preços encontrados nos mercados de Saquarema.

---

## Público-alvo

Moradores e consumidores de Saquarema que desejam economizar nas compras realizadas em supermercados da região.

---

# Evolução do Projeto

## Aulas 2 e 3 — Proposta e Primeiro MVP

Nas primeiras etapas foi definida a ideia do aplicativo Menor Preço Saqua, partindo do problema da variação de preços e promoções entre os mercados de Saquarema.

Foi desenvolvido o primeiro MVP com uma tela para cadastro de produtos e preços.

### Funcionalidades

- Campo para informar o nome do produto;
- Campo para informar o preço encontrado;
- Cadastro de produto e preço;
- Cadastro de vários produtos;
- Exibição dos produtos cadastrados;
- Limpeza dos campos após o cadastro;
- Limpeza da lista de produtos;
- Validação dos campos obrigatórios;
- Mensagem de erro quando o usuário tenta cadastrar sem preencher os dados necessários.

### Prints da aplicação — Aulas 2 e 3

#### Tela inicial

![Tela inicial do Menor Preço Saqua](tela-inicial.png)

#### Produtos cadastrados

![Produtos cadastrados no Menor Preço Saqua](produtos-cadastrados.png)

#### Validação dos campos

![Erro de preenchimento](tela-erro.png)

---

## Aula 4 — Componentes, Estado e Listas

Na Aula 4, o projeto foi aprimorado com a aplicação de conceitos importantes do React Native.

O cadastro de produtos passou a utilizar gerenciamento de estado e uma lista dinâmica para apresentar os itens cadastrados.

### Funcionalidades e conceitos aplicados

- Utilização do `useState`;
- Utilização de `TextInput`;
- Botões funcionais;
- Validação de campos vazios;
- Cadastro temporário dos produtos em memória;
- Utilização de `FlatList`;
- Exibição dinâmica dos produtos cadastrados;
- Remoção individual de produtos;
- Criação de componente reutilizável;
- Organização do projeto em componentes, telas e serviços.

### Organização utilizada

```text
src/
├── components/
│   └── ProdutoItem.tsx
├── screens/
│   └── CadastroProdutoScreen.tsx
└── services/
```

O componente `ProdutoItem` ficou responsável pela apresentação de cada produto da lista e pela opção de removê-lo.

### Prints da aplicação — Aula 4

#### Cadastro de vários produtos

![Lista de produtos da Aula 4](lista-produtos.png)

#### Remoção de produtos

![Remoção de produtos da Aula 4](remover-produto.png)

---

## Aula 5 — Integração com API REST

Na Aula 5, o aplicativo passou a consumir uma API REST pública, permitindo utilizar informações externas dentro da aplicação.

A API escolhida foi a ViaCEP, pois a consulta de endereço possui relação direta com a proposta do Menor Preço Saqua.

O usuário informa o CEP do mercado onde encontrou determinado preço e o aplicativo realiza uma consulta para localizar automaticamente o endereço.

### API utilizada

ViaCEP

A API é utilizada para consultar informações de endereço a partir do CEP informado pelo usuário.

### Funcionalidades implementadas

- Campo para informar o CEP do mercado;
- Consulta de CEP;
- Requisição HTTP utilizando o método `GET`;
- Consumo de API REST pública;
- Utilização de `fetch`;
- Processamento da resposta em formato JSON;
- Exibição do endereço retornado pela API;
- Validação do CEP informado;
- Indicador de carregamento durante a consulta;
- Tratamento de erros durante a consulta;
- Mensagens de sucesso e erro para o usuário;
- Associação do endereço do mercado ao produto cadastrado;
- Exibição da localização junto ao produto na lista.

### Prints da aplicação — Aula 5

#### Consulta de CEP

![Consulta de CEP](consulta-cep.png)

#### Endereço encontrado pela ViaCEP

![Endereço encontrado pela ViaCEP](endereco-encontrado.png)

#### Produto cadastrado com localização

![Produto com preço e localização](produto-localizacao.png)

---

## Aula 6 — Persistência de Dados, Edição e Tratamento de Erros

Na Aula 6, o projeto Menor Preço Saqua foi aprimorado com persistência local dos produtos cadastrados na versão Web da aplicação.

Os dados passaram a ser armazenados utilizando `localStorage`, permitindo que os produtos permaneçam cadastrados mesmo após a atualização da página.

Também foi implementada a edição dos produtos cadastrados, mantendo a funcionalidade de remoção e adicionando novos tratamentos e mensagens de retorno ao usuário.

### Funcionalidades implementadas

- Persistência dos produtos utilizando `localStorage`;
- Conversão dos dados utilizando `JSON.stringify`;
- Recuperação dos dados utilizando `JSON.parse`;
- Recuperação automática dos produtos ao iniciar a aplicação;
- Manutenção dos produtos após atualizar a página;
- Edição do nome e do preço dos produtos cadastrados;
- Remoção dos produtos cadastrados;
- Atualização dos dados persistidos após edição ou remoção;
- Validação dos campos obrigatórios;
- Tratamento de erros utilizando `try`, `catch` e `finally`;
- Mensagens de sucesso e erro para o usuário;
- Indicador de carregamento durante a consulta de CEP;
- Tratamento de falhas durante a consulta a API ViaCEP.

### Testes realizados

Durante os testes da Aula 6 foram verificados:

- Cadastro de produto com localização;
- Persistência do produto após atualizar a página;
- Edição do produto cadastrado;
- Persistência das alterações após atualizar a página;
- Remoção do produto;
- Persistência da remoção após atualizar a página;
- Validação dos campos obrigatórios;
- Consulta de endereço utilizando a API ViaCEP;
- Exibição das mensagens de sucesso e erro.

A persistência com `localStorage` é utilizada na versão Web do aplicativo. Na próxima etapa, para a entrega da P1, será implementada a persistência utilizando banco de dados em nuvem.

---
### Prints da aplicação — Aula 6

#### Persistência dos dados após recarregar a página

![Persistência dos produtos](persistencia-aula6.png)

#### Produto cadastrado com opções de edição e remoção

![Produto cadastrado com botões](produto-cadastrado-botoes.png)

#### Edição de produto

![Tela de edição](tela-editar.png)

#### Produto atualizado

![Produto atualizado](produto-atualizado.png)

#### Validação dos campos obrigatórios

![Validação de campos](erro-campo-vazio.png)

#### Remoção de produto

![Produto removido](produto-removido.png)

---

# Funcionalidades atuais

Até a Aula 6, o Menor Preço Saqua possui:

- Cadastro do nome do produto;
- Cadastro do preço encontrado;
- Cadastro de vários produtos;
- Exibição dos produtos em lista;
- Contador de produtos cadastrados;
- Edição de produtos cadastrados;
- Remoção individual de produtos;
- Validação dos campos obrigatórios;
- Consulta de CEP;
- Busca automática do endereço do mercado;
- Integração com API REST;
- Processamento de dados JSON;
- Indicador de carregamento;
- Tratamento de erros;
- Mensagens de sucesso e erro;
- Exibição da localização associada ao produto;
- Persistência dos produtos utilizando `localStorage` na versão Web;
- Recuperação automática dos produtos após atualizar a página;
- Atualização dos dados persistidos após edição ou remoção.

Na versão Web, os produtos cadastrados são armazenados no `localStorage`, permitindo que os dados permaneçam disponíveis mesmo após a atualização da página.

---

# Tecnologias utilizadas

- React Native;
- TypeScript;
- Expo;
- Expo Router;
- `fetch`;
- API REST;
- ViaCEP;
- Git;
- GitHub.

---

# Estrutura principal do projeto

```text
Gerenciador-de-mercado-final/
├── app/
│   └── (tabs)/
│       └── index.tsx
│
├── src/
│   ├── components/
│   │   └── ProdutoItem.tsx
│   │
│   ├── screens/
│   │   └── CadastroProdutoScreen.tsx
│   │
│   └── services/
│       └── viacep.ts
│
├── assets/
├── package.json
└── README.md
```

---

# Integrantes

- Heloísa Alice
- Rafael Farias
- Paulo Sérgio
- Leonardo Velloso

---

# Status

Projeto em desenvolvimento.

O aplicativo está sendo evoluído de acordo com as atividades propostas durante as aulas da disciplina.

---

# Histórico de desenvolvimento

Etapa e Desenvolvimento

Aulas 2 e 3 - Definição do problema, proposta e desenvolvimento do primeiro MVP
Aula 4 - `useState`, `TextInput`, validações, `FlatList`, remoção e componente reutilizável
Aula 5 - Integração com API REST ViaCEP, requisição `GET`, JSON, loading e tratamento de erros
Aula 6 - Persistência com `localStorage`, recuperação automática dos dados, edição, remoção e tratamento de erros

---

# Próximas etapas

A próxima etapa do projeto será a preparação para a entrega da P1, incluindo a hospedagem da aplicação, disponibilização por meio de uma URL pública e implementação da persistência de dados utilizando banco de dados em nuvem.

