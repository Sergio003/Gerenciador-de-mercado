# Menor Preço Saqua

Aplicativo híbrido desenvolvido na disciplina de Laboratório de Desenvolvimento de Aplicativos Híbridos.

O projeto vem sendo desenvolvido de forma incremental ao longo das aulas, aplicando conceitos de React Native, gerenciamento de estado, componentes reutilizáveis, listas e integração com APIs REST.

---

## Problema

Em Saquarema existem diversos mercados com preços competitivos e promoções diferentes. Muitas vezes, o consumidor precisa procurar em vários estabelecimentos para descobrir onde determinado produto está mais barato.

---

## Proposta

O **Menor Preço Saqua** busca facilitar a consulta e o compartilhamento de preços e promoções dos mercados de Saquarema, auxiliando os consumidores na busca por opções mais econômicas.

---

## Objetivo

Desenvolver um aplicativo híbrido que auxilie os consumidores a localizar e compartilhar os menores preços encontrados nos mercados de Saquarema.

---

## Público-alvo

Moradores e consumidores de Saquarema que desejam economizar nas compras realizadas em supermercados da região.

---

# Evolução do Projeto

## Aulas 2 e 3 — Proposta e Primeiro MVP

Nas primeiras etapas foi definida a ideia do aplicativo **Menor Preço Saqua**, partindo do problema da variação de preços e promoções entre os mercados de Saquarema.

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

![Produtos cadastrados](produtos-cadastrados.png)

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

```

src/

├── components/

│   └── ProdutoItem.tsx

├── screens/

│   └── CadastroProdutoScreen.tsx

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

A API escolhida foi a **ViaCEP**, pois a consulta de endereço possui relação direta com a proposta do Menor Preço Saqua.

O usuário informa o CEP do mercado onde encontrou determinado preço e o aplicativo realiza uma consulta para localizar automaticamente o endereço.

### API utilizada

**ViaCEP**

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

Na Aula 6, o projeto **Menor Preço Saqua**  foi aprimorado com persistência local dos produtos cadastrados na versão Web da aplicação.

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

A persistência com `localStorage` é utilizada na versão Web do aplicativo. Posteriormente, para a entrega da P1, o projeto foi integrado a um backend próprio e a um banco de dados em nuvem.

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

# P1 — Hospedagem do Projeto e Banco de Dados em Nuvem

Para a entrega da P1, o **Menor Preço Saqua** foi evoluído para uma arquitetura com frontend, backend e banco de dados em nuvem.

O frontend da aplicação foi publicado no **Vercel**, o backend desenvolvido com **Node.js e Express** foi hospedado no **Render** e a persistência dos produtos passou a ser realizada no **MongoDB Atlas**.

A aplicação também mantém a integração com a API **ViaCEP** para consulta do endereço do mercado a partir do CEP informado pelo usuário.

## Arquitetura da P1

```text

Usuário

Frontend — Expo / React Native Web

Vercel

API REST — Node.js / Express

Render

MongoDB Atlas

Banco de dados em nuvem

Frontend - ViaCEP

Consulta de endereço

```

## Backend e API REST

Para a P1 foi desenvolvido um backend utilizando Node.js, Express, Mongoose, CORS e Dotenv.

O backend recebe as requisições do frontend e realiza as operações de cadastro, consulta, edição e exclusão dos produtos no MongoDB Atlas.

### Operações CRUD

Operação - Método HTTP - Funcionalidade

Create - `POST` - Cadastrar um produto

Read - `GET` - Listar os produtos cadastrados

Update - `PUT` - Editar um produto

  Delete - `DELETE` - Excluir um produto

### Endpoints

```text

GET    /produtos

POST   /produtos

PUT    /produtos/:id

DELETE /produtos/:id

```

## Banco de dados em nuvem

O **MongoDB Atlas** é utilizado para armazenar os produtos cadastrados. As operações realizadas pela interface são refletidas no banco de dados e os dados permanecem disponíveis mesmo após atualizar ou fechar a aplicação.

## Segurança das credenciais

A conexão utiliza a variável de ambiente `MONGODB_URI`. O arquivo `.env` não é enviado ao repositório público e as credenciais são configuradas por meio de variáveis de ambiente.

## Aplicação publicada

### Frontend — Vercel

https://gerenciador-de-mercado.vercel.app

### Backend — Render

https://menor-preco-saqua-api-8b8q.onrender.com

### Endpoint público de produtos

https://menor-preco-saqua-api-8b8q.onrender.com/produtos

## Testes realizados — P1

- Acesso pela URL pública;

- Comunicação entre frontend e backend;

- Comunicação entre backend e MongoDB Atlas;

- Consulta de endereço utilizando ViaCEP;

- Cadastro e recuperação de produtos;

- Persistência após atualizar a página;

- Edição e persistência da edição;

- Exclusão e persistência da exclusão;

- Sincronização das alterações com o MongoDB Atlas;

- Tratamento de erros e mensagens de retorno ao usuário.

Os testes de cadastro, consulta, edição e exclusão foram realizados com sucesso na aplicação publicada e as alterações foram confirmadas no MongoDB Atlas.

## Prints da aplicação — P1

#### Aplicação publicada no Vercel

![Aplicação publicada no Vercel](p1-vercel.png)

#### Backend publicado no Render

![Backend funcionando no Render](p1-render.png)

#### Produtos armazenados no MongoDB Atlas

![Produtos armazenados no MongoDB Atlas](p1-mongodb.png)

---

# Funcionalidades atuais

Atualmente, o Menor Preço Saqua possui:

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

- Atualização dos dados persistidos após edição ou remoção;

- Backend próprio desenvolvido com Node.js e Express;

- API REST para gerenciamento dos produtos;

- Operações CRUD de cadastro, consulta, edição e exclusão;

- Persistência dos produtos no MongoDB Atlas;

- Backend hospedado no Render;

- Frontend publicado no Vercel;

- Aplicação disponível por URL pública.

Na Aula 6, o `localStorage` foi utilizado para demonstrar a persistência local na versão Web. Na P1, a aplicação passou a utilizar o MongoDB Atlas para persistência dos produtos em nuvem.

---

# Tecnologias utilizadas

- React Native;

- TypeScript;

- Expo;

- Expo Router;

- `fetch`;

- API REST;

- ViaCEP;

- Node.js;

- Express;

- Mongoose;

- MongoDB Atlas;

- CORS;

- Dotenv;

- Render;

- Vercel;

- Git;

- GitHub.

---

# Estrutura principal do projeto

```text
Gerenciador-de-mercado-final/
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       └── acessibilidade.tsx
├── backend/
│   ├── models/
│   │   └── Produto.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── src/
│   ├── components/
│   │   └── ProdutoItem.tsx
│   ├── screens/
│   │   └── CadastroProdutoScreen.tsx
│   └── services/
│       ├── produtosApi.ts
│       ├── viacep.ts
│       └── acessibilidade.ts
├── assets/
├── .gitignore
├── package.json
└── README.md
```

> O arquivo `backend/.env` existe apenas no ambiente local e não é enviado ao repositório público.

---

# Integrantes

- Heloísa Alice

- Rafael Farias

- Paulo Sérgio

- Leonardo Velloso

---

# P2 — Aula 1: Acessibilidade

A primeira atividade da P2 acrescentou recursos de acessibilidade à versão web do **Menor Preço Saqua**, preservando as operações de cadastro, consulta, edição e exclusão de produtos.


## Evidências da P2 — Aula 1: Acessibilidade

As imagens abaixo demonstram os recursos de acessibilidade
implementados no Menor Preço Saqua.

### 1. Tela de produtos — Modo claro

![Tela de produtos no modo claro](p2-modo-claro.png)

### 2. Tela de produtos — Modo escuro

![Tela de produtos no modo escuro](p2-modo-escuro.png)

### 3. Aumento do tamanho da fonte

![Aumento do tamanho da fonte](p2-aumentar-fonte.png)

### 4. Redução do tamanho da fonte

![Redução do tamanho da fonte](p2-diminuir-fonte.png)

### 5. Persistência das preferências

![Persistência das configurações](p2-persistencia.png)

### 6. Integração com VLibras

![VLibras funcionando](p2-vlibras.png)

### 7. Evidência visual do recurso de Libras

![Recurso de Libras em funcionamento](p2-leitor-tela.png)

**Observação:** o leitor de tela do Windows foi testado
e aprovado, mas sua execução não é demonstrada
diretamente pela captura de tela.

## Funcionalidades implementadas

- **Tamanho de fonte ajustável:** controles na aba **Acessibilidade** permitem selecionar tamanhos de 14 a 26, aplicados à interface de produtos.
- **Tema claro e escuro:** opção para alternar a aparência do aplicativo.
- **Persistência das preferências:** o tema e o tamanho da fonte permanecem após atualizar a página, utilizando `localStorage` no navegador (chaves `menorpreco-tema` e `menorpreco-tamanho-fonte`).
- **Rótulos de acessibilidade:** identificação dos principais campos e botões para tecnologias assistivas.
- **VLibras:** integração do widget de tradução automática para Libras na versão web, disponível nas abas do aplicativo.
- **Navegação por teclado:** os controles principais foram testados com `Tab` e `Enter`.

### Arquivos envolvidos

- `app/_layout.tsx` — integração web do VLibras.
- `app/(tabs)/_layout.tsx` — navegação entre as abas.
- `app/(tabs)/acessibilidade.tsx` — configurações de tema e fonte.
- `src/services/acessibilidade.ts` — leitura das preferências salvas.
- `src/screens/CadastroProdutoScreen.tsx` — aplicação das preferências na tela de produtos.
- `src/components/ProdutoItem.tsx` — aparência acessível dos cartões de produtos.

## Validação da P2 — Aula 1

Foram realizados e aprovados **10 testes na versão web**, conforme execução e confirmação da equipe:

| Nº | Teste | Resultado |
|---|---|---|
| 1 | Alternar o tema claro/escuro nas duas abas | Aprovado |
| 2 | Aumentar a fonte até 26 sem cortes | Aprovado |
| 3 | Diminuir a fonte até 14 e verificar a legibilidade | Aprovado |
| 4 | Atualizar a página com F5 e manter as preferências | Aprovado |
| 5 | Cadastrar produto e consultar CEP | Aprovado |
| 6 | Editar produto cadastrado | Aprovado |
| 7 | Remover produto de teste | Aprovado |
| 8 | Navegar pelo teclado usando Tab e Enter | Aprovado |
| 9 | Abrir e utilizar o VLibras nas duas abas sem bloquear controles | Aprovado |
| 10 | Identificar os controles com o leitor de tela do Windows | Aprovado |

### Evidências visuais

Foram registradas sete capturas de tela para o relatório acadêmico, incluindo: tela de produtos no modo claro, modo escuro, controles de aumento e diminuição de fonte, persistência das preferências e VLibras em funcionamento. As capturas fazem parte do **relatório da P2 — Aula 1**; para exibi-las diretamente no GitHub, os arquivos de imagem precisam ser adicionados ao repositório e os caminhos referenciados aqui.

### Limitações conhecidas

- O VLibras realiza tradução automática e pode recorrer à **datilologia** (soletração manual) em algumas palavras; isso não garante tradução perfeita em todos os contextos.
- A persistência por `localStorage` e a integração do VLibras foram validadas na **versão web**. Não foram registrados testes equivalentes em Android ou iOS.
- A presença de rótulos e a aprovação dos testes realizados não substituem uma auditoria completa de acessibilidade.

---

# P2 — Aula 9: Perfis e Sessão

## Objetivo

Implementar autenticação de usuários, gerenciamento de perfis e controle de sessões no aplicativo Menor Preço Saqua, utilizando Supabase Auth e políticas de segurança no banco de dados.

## Tecnologias utilizadas

- React Native e Expo Router
- TypeScript
- Supabase Authentication
- PostgreSQL e Row Level Security (RLS)
- AsyncStorage para armazenamento de preferências locais

## Funcionalidades implementadas

- Login de usuários cadastrados no Supabase.
- Identificação do usuário autenticado.
- Visualização dos dados do próprio perfil.
- Edição do nome do usuário.
- Separação dos dados de perfil entre diferentes contas.
- Encerramento manual da sessão (logout).
- Expiração automática por inatividade.
- Restrição de acesso aos perfis por meio de políticas RLS.

## Segurança e controle de sessão

A autenticação é realizada pelo Supabase Auth.

A tabela `profiles` armazena os dados dos perfis, enquanto a tabela `session_leases` auxilia no controle de sessões ativas.

As políticas RLS restringem a consulta e a atualização dos perfis ao usuário autenticado com sessão válida.

O controle de inatividade foi testado com um intervalo de aproximadamente 2 minutos.

## Testes realizados

| Nº | Teste | Resultado |
|---|---|---|
| 1 | Login do Aluno A | Aprovado |
| 2 | Visualização do perfil do Aluno A | Aprovado |
| 3 | Alteração do nome do usuário | Aprovado |
| 4 | Logout e retorno à tela de login | Aprovado |
| 5 | Login do Aluno B e separação dos perfis | Aprovado |
| 6 | Expiração da sessão por inatividade | Aprovado |
| 7 | Bloqueio de leitura sem sessão ativa via RLS | Aprovado |
| 8 | Bloqueio de atualização sem sessão ativa via RLS | Aprovado |

## Evidências visuais — Aula 9

### 1. Tela de login

![Tela de login](docs/imagens/aula9/aula9-login.png)

### 2. Perfil do Aluno A

![Perfil do Aluno A](docs/imagens/aula9/aula9-perfil-aluno-a.png)

### 3. Edição do perfil

![Edição do perfil](docs/imagens/aula9/aula9-edicao-perfil.png)

### 4. Perfil do Aluno B

![Perfil do Aluno B](docs/imagens/aula9/aula9-perfil-aluno-b.png)

### 5. Logout

![Encerramento da sessão](docs/imagens/aula9/aula9-logout.png)

### 6. Expiração automática da sessão

![Sessão expirada por inatividade](docs/imagens/aula9/aula9-sessao-expirada.png)

### 7. Segurança com RLS

![Teste de segurança RLS](docs/imagens/aula9/aula9-seguranca-rls.png)

O teste de atualização sem sessão válida retornou `perfis_atualizados = 0`, demonstrando o bloqueio da operação no cenário avaliado.


## Evidências de testes no Android — Aula 9

Os testes foram realizados em um dispositivo Android utilizando o Expo Go compatível com o SDK 54.

### 1. Login no Android

O aplicativo permitiu a autenticação e exibiu a tela principal com os produtos cadastrados.

![Login realizado no Android](docs/imagens/aula9/aula9-android-login.jpeg)

### 2. Expiração por inatividade

Após aproximadamente 2 minutos sem interação, a sessão foi encerrada automaticamente e o aplicativo retornou à tela de login.

![Expiração da sessão no Android](docs/imagens/aula9/aula9-android-inatividade.jpeg)

### 3. Encerramento ao sair do primeiro plano

Ao sair do aplicativo para utilizar outro e retornar, foi exigida uma nova autenticação.

![Sessão encerrada ao sair do aplicativo](docs/imagens/aula9/aula9-android-segundo-plano.jpeg)

### 4. Fechamento e reabertura

Após fechar o Expo Go e reabrir o projeto, a sessão anterior não foi restaurada automaticamente no cenário testado.

![Reabertura do aplicativo no Android](docs/imagens/aula9/aula9-android-reabertura.jpeg)

### 5. Perfil do Aluno A

O aplicativo exibiu os dados associados à conta do Aluno A.

![Perfil do Aluno A no Android](docs/imagens/aula9/aula9-android-perfil-aluno-a.jpeg)

### 6. Logout

O encerramento manual da sessão retornou o aplicativo à tela de autenticação.

![Logout no Android](docs/imagens/aula9/aula9-android-logout.jpeg)

### 7. Perfil do Aluno B

Após o logout do Aluno A e o login do Aluno B, foram exibidos os dados da segunda conta, sem apresentar os dados pessoais do usuário anterior.

![Perfil do Aluno B no Android](docs/imagens/aula9/aula9-android-perfil-aluno-b.jpeg)

### Resultado dos testes no Android

| Teste | Resultado |
|---|---|
| Login e acesso à tela principal | Aprovado |
| Expiração após aproximadamente 2 minutos | Aprovado |
| Encerramento ao sair do primeiro plano | Aprovado |
| Fechamento e reabertura do Expo Go | Aprovado |
| Visualização do perfil do Aluno A | Aprovado |
| Logout do Aluno A | Aprovado |
| Login do Aluno B e separação dos perfis | Aprovado |

**Observação:** os testes foram executados no Expo Go em Android. O comportamento de um aplicativo instalado como versão independente ainda deverá ser validado separadamente.

## Arquivos principais

- `app/login.tsx` — tela de autenticação.
- `app/(tabs)/perfil.tsx` — visualização e edição do perfil.
- `src/contexts/SessionProvider.tsx` — gerenciamento da sessão.
- `src/services/supabase.ts` — configuração do cliente Supabase.
- `app/_layout.tsx` — integração do contexto de sessão.
- `app/(tabs)/_layout.tsx` — navegação entre as abas.


## Limitações e observações

- Os testes funcionais da Aula 9 foram realizados na versão web e em um dispositivo Android utilizando o Expo Go compatível com o SDK 54.
- No Android, foram validados login, visualização de perfis, logout, expiração por inatividade, encerramento ao sair do primeiro plano e reabertura sem restauração automática da sessão.
- O comportamento de uma versão independente do aplicativo Android ainda não foi validado.
- Ainda não foram realizados testes equivalentes em dispositivos iOS.
- A configuração `persistSession: false` impede a persistência automática da sessão de autenticação pelo cliente Supabase.
- O AsyncStorage é utilizado para armazenar preferências locais, como a configuração de autenticação biométrica.
- As credenciais de configuração são mantidas fora do repositório por meio do arquivo `.env`.
- As políticas RLS restringem o acesso aos dados e devem continuar sendo verificadas em futuras alterações.

---


# Status

**P1 concluída. P2 — Aula 1: Acessibilidade e Aula 9: Perfis e Sessão implementadas, com testes funcionais realizados na web e no Android.**

O Menor Preço Saqua possui uma versão web publicada, integrada a uma API REST própria e ao MongoDB Atlas para persistência dos produtos em nuvem.

Na P2, foram acrescentados recursos de acessibilidade, autenticação com Supabase, gerenciamento de perfis e controle de sessões.

A Aula 9 foi validada por testes funcionais de login, visualização e edição de perfil, logout, expiração por inatividade e verificações de segurança RLS.

No Android, utilizando o Expo Go compatível com o SDK 54, também foram realizados testes de login, visualização dos perfis dos Alunos A e B, logout, expiração após aproximadamente 2 minutos, encerramento da sessão ao sair do primeiro plano e reabertura sem restauração automática da sessão.

As evidências dos testes estão disponíveis na seção **P2 — Aula 9: Perfis e Sessão** deste README.

**Pendências de validação:** testes equivalentes em dispositivos iOS e em uma versão Android instalada de forma independente do Expo Go.


---

# Histórico de desenvolvimento

Etapa - Desenvolvimento

Aulas 2 e 3 - Definição do problema, proposta e desenvolvimento do primeiro MVP

Aula 4 - `useState`, `TextInput`, validações, `FlatList`, remoção e componente reutilizável

Aula 5 - Integração com API REST ViaCEP, requisição `GET`, JSON, loading e tratamento de erros

Aula 6 - Persistência com `localStorage`, recuperação automática dos dados, edição, remoção e tratamento de erros

P1 - Backend Node.js/Express, CRUD, MongoDB Atlas, hospedagem no Render e publicação do frontend no Vercel


P2 — Aula 1: Implementação de recursos de acessibilidade, incluindo tema claro e escuro, ajuste do tamanho da fonte, persistência das preferências, navegação por teclado, suporte a leitor de tela e integração com VLibras.

P2 — Aula 2: Implementação de autenticação com Supabase Auth, gerenciamento de perfis, edição de dados, logout, expiração de sessão por inatividade e políticas de segurança RLS.


---

# Próximas etapas


# Próximas etapas

Após a conclusão da P1 e a implementação das Aulas 1 e 2 da P2, o projeto Menor Preço Saqua continuará evoluindo conforme as atividades propostas na disciplina.

As próximas atividades incluem:

- Conferir os requisitos oficiais da Aula 9 e identificar possíveis pendências.
- Validar as funcionalidades em dispositivos Android ou iOS, quando aplicável.
- Realizar testes adicionais de autenticação e controle de sessão.
- Manter a documentação e as evidências atualizadas no GitHub.
- Preservar as funcionalidades de cadastro, consulta, edição e exclusão de produtos.
