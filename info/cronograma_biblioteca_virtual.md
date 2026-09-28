# Cronograma — Biblioteca Virtual

## Período do projeto

**Início:** 28/09/2026  
**Prazo final:** primeira semana de dezembro de 2026  
**Data-alvo de entrega:** 06/12/2026

---

# Visão geral

O desenvolvimento será dividido em 10 etapas:

1. Planejamento e arquitetura
2. Front-end: Home, busca e acervo
3. Front-end: detalhes e empréstimos
4. Login e cadastro
5. Back-end: banco e API
6. Integração Front-end + Back-end
7. Regras de negócio
8. Painel Admin
9. Testes e acessibilidade
10. Polimento e entrega

> **Regra importante:** não deixar o back-end para o final. A estrutura dos dados e das regras deve ser definida desde a primeira semana.

---

# Semana 1 — 28/09 a 04/10
## Planejamento e arquitetura

### Objetivo
Definir a estrutura completa do sistema antes de avançar para a implementação.

### Tarefas

- [ ] Revisar todos os requisitos do projeto.
- [ ] Listar todas as telas necessárias:
  - [ ] Home / Busca
  - [ ] Resultados
  - [ ] Detalhes do livro
  - [ ] Login
  - [ ] Cadastro
  - [ ] Minha conta
  - [ ] Meus empréstimos
  - [ ] Histórico
  - [ ] Painel Admin
  - [ ] Cadastro de livro
  - [ ] Cadastro de exemplar
- [ ] Definir as entidades do sistema.
- [ ] Definir os relacionamentos entre as entidades.
- [ ] Definir as regras de empréstimo.
- [ ] Definir as regras de reserva.
- [ ] Definir as regras de renovação.
- [ ] Definir as permissões de usuário comum e administrador.
- [ ] Definir a estrutura inicial de pastas do projeto.
- [ ] Definir quais dados serão armazenados no banco.

### Estrutura inicial sugerida

```text
Usuario
├── id
├── nome
├── email
└── senha

Livro
├── id
├── titulo
├── autor
├── isbn
├── ano
├── genero
└── sinopse

Exemplar
├── id
├── livroId
└── status

Emprestimo
├── id
├── usuarioId
├── exemplarId
├── dataInicio
├── dataDevolucao
├── renovacoes
└── multa

Reserva
├── id
├── usuarioId
└── exemplarId
```

### Entrega da semana

Ao final desta semana, deve estar definido:

- quais telas serão criadas;
- quais dados o sistema possui;
- quais são as regras do sistema;
- como as entidades se relacionam.

---

# Semana 2 — 05/10 a 11/10
## Front-end: Home, busca e acervo

### Objetivo
Finalizar a experiência inicial de navegação e busca.

### Tarefas

- [ ] Finalizar a Home.
- [ ] Criar/ajustar o campo de busca central.
- [ ] Criar busca por título.
- [ ] Criar busca por autor.
- [ ] Criar busca por ISBN.
- [ ] Criar filtros.
- [ ] Criar filtro de gênero.
- [ ] Criar filtro de ano.
- [ ] Criar filtro de disponibilidade.
- [ ] Criar opção de busca exata.
- [ ] Criar opção de busca por relevância.
- [ ] Criar botão "Limpar filtros".
- [ ] Criar ordenação dos resultados.
- [ ] Criar cards de livros.
- [ ] Criar estado de carregamento.
- [ ] Criar estado de nenhum resultado.
- [ ] Criar estado de erro.
- [ ] Criar estado de resultados.

### Card de livro

Cada card deve considerar:

- [ ] Capa
- [ ] Título
- [ ] Autor
- [ ] Ano
- [ ] Disponibilidade
- [ ] Indicador de relevância quando fizer sentido

### Entrega da semana

O usuário deve conseguir:

```text
Home
 ↓
Busca
 ↓
Filtros
 ↓
Resultados
 ↓
Visualizar livros
```

Os dados ainda podem ser fictícios nesta etapa.

---

# Semana 3 — 12/10 a 18/10
## Detalhes do livro e empréstimos

### Objetivo
Construir o principal fluxo de utilização da biblioteca.

### Página de detalhes

- [ ] Criar página de detalhes do livro.
- [ ] Mostrar capa.
- [ ] Mostrar título.
- [ ] Mostrar autor.
- [ ] Mostrar ISBN.
- [ ] Mostrar ano.
- [ ] Mostrar gênero.
- [ ] Mostrar sinopse.
- [ ] Mostrar exemplares.
- [ ] Mostrar status de cada exemplar.
- [ ] Criar ação de emprestar.
- [ ] Criar ação de reservar.

### Minha conta

- [ ] Criar área de dados do usuário.
- [ ] Criar resumo da conta.
- [ ] Criar acesso aos empréstimos.
- [ ] Criar acesso ao histórico.

### Meus empréstimos

- [ ] Mostrar livro.
- [ ] Mostrar data de devolução.
- [ ] Mostrar status.
- [ ] Mostrar atraso.
- [ ] Mostrar multa.
- [ ] Mostrar quantidade de renovações.
- [ ] Criar botão de renovar.

### Entrega da semana

O fluxo visual deve estar completo:

```text
Home
 ↓
Busca
 ↓
Resultados
 ↓
Detalhes do livro
 ↓
Emprestar / Reservar
 ↓
Meus empréstimos
```

---

# Semana 4 — 19/10 a 25/10
## Login e cadastro

### Objetivo
Criar o sistema de identificação dos usuários.

### Cadastro

- [ ] Criar formulário de cadastro.
- [ ] Nome.
- [ ] Email.
- [ ] Senha.
- [ ] Confirmação de senha.
- [ ] Validação dos campos.
- [ ] Mensagens de erro.
- [ ] Mensagem de cadastro realizado.

### Login

- [ ] Criar formulário de login.
- [ ] Validar email.
- [ ] Validar senha.
- [ ] Mostrar erro de credenciais.
- [ ] Impedir login de usuário não cadastrado.
- [ ] Criar estado de usuário logado.

### Usuário comum

- [ ] Mostrar navegação normal.
- [ ] Não mostrar área Admin.

### Administrador

- [ ] Identificar administrador.
- [ ] Mostrar área Admin.
- [ ] Manter área Admin escondida para usuários comuns.

### Entrega da semana

O fluxo deve funcionar:

```text
Cadastro
 ↓
Login
 ↓
Identificação do usuário
 ↓
Usuário comum OU Admin
```

---

# Semana 5 — 26/10 a 01/11
## Back-end: banco de dados e API

### Objetivo

Começar o back-end e criar armazenamento real dos dados.

### Banco de dados

Criar as estruturas necessárias para:

- [ ] Usuários.
- [ ] Livros.
- [ ] Exemplares.
- [ ] Empréstimos.
- [ ] Reservas.

### API

Criar as operações necessárias para:

- [ ] Cadastro de usuário.
- [ ] Login.
- [ ] Listagem de livros.
- [ ] Busca de livros.
- [ ] Detalhes de livro.
- [ ] Cadastro de livro.
- [ ] Cadastro de exemplar.
- [ ] Criação de empréstimo.
- [ ] Consulta de empréstimos.
- [ ] Criação de reserva.
- [ ] Renovação de empréstimo.

### Estrutura inicial sugerida

```text
POST   /usuarios
POST   /login

GET    /livros
GET    /livros/:id
POST   /livros

GET    /exemplares
POST   /exemplares

POST   /emprestimos
GET    /emprestimos

POST   /reservas

PUT    /emprestimos/:id/renovar
```

### Entrega da semana

O back-end deve conseguir:

```text
Receber dados
 ↓
Processar dados
 ↓
Salvar no banco
 ↓
Retornar dados
```

---

# Semana 6 — 02/11 a 08/11
## Integração Front-end + Back-end

### Objetivo

Substituir gradualmente os dados fictícios pelos dados reais.

### Ordem de integração

#### 1. Login

- [ ] Front-end envia login.
- [ ] API verifica usuário.
- [ ] API retorna resultado.
- [ ] Front-end identifica usuário.

#### 2. Busca

- [ ] Front-end solicita livros.
- [ ] API retorna livros.
- [ ] Front-end exibe resultados.

#### 3. Detalhes

- [ ] Front-end solicita livro específico.
- [ ] API retorna informações.
- [ ] Front-end exibe detalhes.

#### 4. Empréstimos

- [ ] Front-end solicita empréstimo.
- [ ] API processa.
- [ ] Banco registra.
- [ ] Front-end mostra confirmação.

#### 5. Conta

- [ ] Buscar dados do usuário.
- [ ] Buscar empréstimos.
- [ ] Buscar histórico.

### Entrega da semana

O sistema deverá funcionar com dados reais:

```text
Cadastro
 ↓
Login
 ↓
Buscar livro
 ↓
Visualizar livro
 ↓
Realizar empréstimo
 ↓
Visualizar empréstimo
```

---

# Semana 7 — 09/11 a 15/11
## Regras de negócio

### Objetivo

Implementar as regras reais do sistema.

### Empréstimos

- [ ] Definir/verificar máximo de empréstimos simultâneos.
- [ ] Definir/verificar prazo de devolução.
- [ ] Verificar disponibilidade.
- [ ] Calcular multa por atraso.
- [ ] Impedir empréstimo quando não houver disponibilidade.

### Reservas

- [ ] Verificar disponibilidade.
- [ ] Criar reserva.
- [ ] Atualizar quantidade de exemplares disponíveis.

### Renovação

- [ ] Permitir no máximo 2 renovações.
- [ ] Verificar a regra de renovação definida no projeto.
- [ ] Impedir renovação quando não for permitida.
- [ ] Atualizar nova data de devolução.

### Busca por relevância

Implementar os pesos:

```text
Título   → maior peso
Autor    → peso intermediário
Sinopse  → menor peso
```

### Entrega da semana

O sistema deve deixar de ser apenas uma interface e funcionar como um **sistema de biblioteca**, aplicando as regras do projeto.

### Meta crítica

**Até 15/11, o fluxo principal deve estar funcionando.**

---

# Semana 8 — 16/11 a 22/11
## Painel Admin

### Objetivo

Finalizar as funcionalidades administrativas.

### Painel

- [ ] Criar página Admin.
- [ ] Mostrar resumo do acervo.
- [ ] Criar acesso ao cadastro de livro.
- [ ] Criar acesso ao cadastro de exemplar.

### Cadastro de livro

- [ ] Título.
- [ ] Autor.
- [ ] ISBN.
- [ ] Ano.
- [ ] Gênero.
- [ ] Sinopse.
- [ ] Validações.
- [ ] Feedback de sucesso.
- [ ] Feedback de erro.

### Cadastro de exemplar

- [ ] Selecionar livro.
- [ ] Criar exemplar.
- [ ] Definir status.
- [ ] Atualizar quantidade de exemplares.

### Permissões

- [ ] Admin consegue acessar área administrativa.
- [ ] Usuário comum não consegue acessar área administrativa.
- [ ] Verificar permissões também no back-end.

### Entrega da semana

Fluxo:

```text
Login Admin
 ↓
Painel Admin
 ↓
Cadastrar livro
 ↓
Cadastrar exemplar
 ↓
Livro aparece no acervo
```

---

# Semana 9 — 23/11 a 29/11
## Testes, acessibilidade e correções

### Objetivo

Parar de adicionar funcionalidades e começar a testar o sistema completo.

## Teste de usuário comum

- [ ] Cadastro.
- [ ] Login.
- [ ] Busca.
- [ ] Filtros.
- [ ] Visualização de livro.
- [ ] Empréstimo.
- [ ] Reserva.
- [ ] Visualização dos empréstimos.
- [ ] Renovação.
- [ ] Histórico.
- [ ] Conta.
- [ ] Logout.

## Teste de Admin

- [ ] Login Admin.
- [ ] Acesso ao painel.
- [ ] Cadastro de livro.
- [ ] Cadastro de exemplar.
- [ ] Verificação do acervo.
- [ ] Bloqueio de acesso para usuário comum.

## Testar casos de erro

- [ ] Email inexistente.
- [ ] Senha incorreta.
- [ ] Livro inexistente.
- [ ] Busca sem resultados.
- [ ] Livro indisponível.
- [ ] Empréstimo acima do limite.
- [ ] Terceira tentativa de renovação.
- [ ] Dados inválidos.
- [ ] Erro de comunicação com API.

## Acessibilidade

- [ ] Navegação por teclado.
- [ ] Foco visível.
- [ ] Contraste adequado.
- [ ] Labels nos campos.
- [ ] `aria-label` quando necessário.
- [ ] Textos alternativos para imagens.
- [ ] Estados não dependem somente de cor.
- [ ] Mensagens de erro compreensíveis.
- [ ] Botões com nomes claros.
- [ ] Fechamento de modais acessível.

## Estados da interface

Verificar todas as telas:

- [ ] Loading.
- [ ] Error.
- [ ] Vazio.
- [ ] Sucesso.

### Entrega da semana

Sistema completo testado e com uma lista de bugs restantes.

---

# Semana 10 — 30/11 a 06/12
## Polimento e entrega

### Objetivo

Finalizar o projeto sem adicionar funcionalidades desnecessárias.

### Correções

- [ ] Corrigir bugs restantes.
- [ ] Corrigir problemas de responsividade.
- [ ] Corrigir problemas de acessibilidade.
- [ ] Corrigir erros de API.
- [ ] Corrigir erros de banco.
- [ ] Corrigir textos.
- [ ] Revisar espaçamentos.
- [ ] Revisar tipografia.
- [ ] Revisar botões.
- [ ] Revisar estados.
- [ ] Revisar mensagens de feedback.

### Documentação

- [ ] Criar README.
- [ ] Explicar o projeto.
- [ ] Listar tecnologias utilizadas.
- [ ] Explicar como instalar.
- [ ] Explicar como executar.
- [ ] Explicar como iniciar o back-end.
- [ ] Explicar como configurar o banco.
- [ ] Explicar estrutura do projeto.
- [ ] Adicionar screenshots, se necessário.

### Teste final

Executar o sistema do zero:

```text
Instalação
 ↓
Banco
 ↓
Back-end
 ↓
Front-end
 ↓
Cadastro
 ↓
Login
 ↓
Busca
 ↓
Empréstimo
 ↓
Reserva
 ↓
Renovação
 ↓
Histórico
 ↓
Admin
```

### Entrega

- [ ] Projeto funcionando.
- [ ] Código organizado.
- [ ] README finalizado.
- [ ] Sem funcionalidades críticas pendentes.
- [ ] Projeto publicado.
- [ ] Verificação final do link.
- [ ] Cópia/backup do projeto.

---

# 🚨 Marcos importantes

## 04/10 — Arquitetura pronta

Você precisa saber **o que vai construir**.

## 18/10 — Front-end principal pronto

Você precisa conseguir navegar pelo sistema.

## 25/10 — Login pronto

Usuários já devem conseguir entrar no sistema.

## 01/11 — Back-end base pronto

Banco + API funcionando.

## 08/11 — Integração pronta

Front-end conversando com o back-end.

## 15/11 — Sistema principal funcionando

Busca + login + empréstimo + reserva + renovação.

## 22/11 — Admin pronto

Cadastro de livros e exemplares funcionando.

## 29/11 — Testes concluídos

Sem funcionalidades importantes faltando.

## 06/12 — ENTREGA

Somente correções e documentação.

---

# ⚠️ Regras para não atrasar

### 1. Não adicionar funcionalidades fora dos requisitos antes de terminar o essencial

Evitar começar agora com:

- favoritos;
- avaliações;
- comentários;
- recomendações;
- sistema social;
- funcionalidades extras.

### 2. Não deixar o back-end para novembro inteiro

A arquitetura dos dados começa na semana 1.

### 3. Não esperar o sistema inteiro ficar pronto para testar

Teste cada funcionalidade assim que ela for implementada.

### 4. Não passar a última semana criando funcionalidades

A última semana é para:

**corrigir → testar → documentar → entregar.**

### 5. Fazer commits frequentes

Sugestão:

```text
feat: cria busca de livros
feat: adiciona filtros
feat: cria tela de detalhes
feat: implementa login
feat: cria endpoint de livros
fix: corrige validação de empréstimo
fix: corrige cálculo de multa
```

---

# 🎯 Resultado esperado em 06/12

Ao final do cronograma, o sistema deverá possuir:

- [ ] Home / Busca
- [ ] Busca por título, autor e ISBN
- [ ] Busca exata
- [ ] Busca por relevância
- [ ] Filtros
- [ ] Resultados
- [ ] Detalhes do livro
- [ ] Exemplares
- [ ] Empréstimos
- [ ] Reservas
- [ ] Renovação
- [ ] Multa
- [ ] Histórico
- [ ] Minha conta
- [ ] Cadastro
- [ ] Login
- [ ] Controle de usuário/Admin
- [ ] Painel Admin
- [ ] Cadastro de livros
- [ ] Cadastro de exemplares
- [ ] Loading
- [ ] Error
- [ ] Estado vazio
- [ ] Sucesso
- [ ] Acessibilidade
- [ ] Back-end
- [ ] Banco de dados
- [ ] API
- [ ] Integração Front-end + Back-end
- [ ] Documentação

---

# 🏁 Regra principal do projeto

> **Até 15/11: fazer funcionar.**
>
> **De 16/11 a 22/11: completar.**
>
> **De 23/11 a 29/11: testar.**
>
> **De 30/11 a 06/12: corrigir e entregar.**

