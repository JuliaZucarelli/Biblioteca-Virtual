# Cronograma — Biblioteca Virtual (v5)

**Período:** 07/10/2026 a 06/12/2026
**Data final de entrega e apresentação:** 06/12/2026 (não muda)

**Stack:** TypeScript em tudo · Front-end com Vite · Back-end com Node + Express · Banco SQLite · API REST (convenções da aula do professor) · Testes com Vitest

**Estratégia:** as semanas de 26/10 a 22/11 são só de **construir** (banco + API + tela). O **estudo do código** foi concentrado em dois blocos nas duas últimas semanas, antes da apresentação.

**O que mudou em relação à v4:**
- Os estudos dos códigos já feitos saíram das semanas de construção e foram para os blocos **Estudo A (23/11)** e **Estudo B (30/11)**.
- A semana de 26/10 começa hoje (quinta, 29/10): as 4 tarefas de segunda a quarta continuam desmarcadas e foram refeitas para caber de quinta a domingo.
- A busca por relevância e os filtros com `Specification` foram para a semana de 23/11 (a busca simples por título, autor e ISBN já funciona no front).

---

## Como manter o estudo viável (custo baixo, durante a construção)

Estudar tudo só no fim é arriscado, porque você terá muito código novo para entender de uma vez. Para reduzir esse risco, faça só estas duas coisas pequenas nas semanas de construção:

1. **Lista de dúvidas** (`info/duvidas.md`): sempre que usar um código que você não entendeu, anote em uma linha o arquivo e a dúvida. Leva 30 segundos e deixa o Estudo A e B muito mais rápido.
2. **Nota semanal (opcional, 10 minutos):** no `info/caderno-de-apresentacao.md`, escreva 3 frases sobre o que foi construído na semana.

Todo o resto do estudo (ler, rastrear, mexer, explicar) fica nos blocos Estudo A e B.

---

## 07/10 a 11/10 — Recuperação e base do Front-end

- [X] Revisar HTML das páginas existentes.
- [X] Organizar e estabilizar o CSS.
- [X] Padronizar componentes visuais.
- [X] Revisar navbar/sidebar, botões, cards, badges e formulários.
- [X] Corrigir problemas visuais existentes.
- [X] Garantir que as páginas principais estejam navegáveis.

**Marco: 11/10 — Base do front-end estabilizada.**

---

## 12/10 a 18/10 — Migração para TypeScript e infraestrutura

- [X] Separar o projeto em `web/` e `server/`.
- [X] Criar `.gitignore` e reinstalar as dependências.
- [X] Criar `tsconfig.json` com `strict: true` em `server/` e `web/`.
- [X] Corrigir o import quebrado; `tsc --noEmit` sem erros e testes verdes.
- [X] Configurar o Vite com múltiplas páginas HTML.
- [X] Migrar `script.js` e `catalogo.js` para TypeScript.
- [X] Trocar as tags de script por `<script type="module" src="/src/main.ts">`.
- [X] Decidir e registrar as regras (multa e regra de renovação/fila de reserva).
- [X] Confirmar com o professor: banco, framework, Deno e documentação da API.

*Os itens de banco e API que estavam previstos para 18/10 foram movidos para a semana de 26/10.*

---

## 19/10 a 25/10 — Semana de recuperação (doença)

- [X] Mandar a mensagem ao professor com as dúvidas.
- [X] Decidir o valor da multa e a regra de renovação, e anotar em `info/`.
- [X] Criar o `info/caderno-de-apresentacao.md`.
- [X] Ler `Livro`, `Exemplar` e `Acervo`.
- [ ] ~~Responder no caderno as perguntas sobre `Exemplar` e `RepositorioAcervo`~~ → **movido para o Estudo A (23/11)**.

---

## 26/10 a 01/11 — Banco e API (banco + API + tela)

*Restam quinta (29/10), sexta, sábado e domingo.*

**Quinta e sexta: aplicar a API que já está pronta**
- [ ] Instalar as dependências do `server/` (`express`, `better-sqlite3`, `cors`, `supertest` e os tipos).
- [ ] Copiar os arquivos da API, rodar `npm run typecheck` e `npm test` (todos devem passar).
- [ ] Configurar os scripts `dev` e `db:reset`; subir a API (porta 3000) e o front (proxy do Vite).
- [ ] Banco SQLite criado e populado com os 9 livros e as capas (o servidor faz isso na primeira execução).
- [ ] CRUD de livros e exemplares funcionando: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, com status 200, 201, 204, 400, 404, 405 e 409.

**Sábado e domingo: ligar ao front**
- [ ] Front-end listando os livros que vêm da API (`api.ts`, `livros.ts`, `main.ts`, `vite.config.ts`).
- [ ] Ids `destaqueGrid` e `loginForm` nos HTML; regra de CSS do ponto vermelho (indisponível).
- [ ] Estados de loading, vazio e erro (API desligada mostra a mensagem de erro).
- [ ] Busca consumindo os cards da API (título, autor e ISBN exato).
- [ ] Anotar as dúvidas em `info/duvidas.md`.

**Marco: 01/11 — API no ar e ligada ao front.**

---

## 02/11 a 08/11 — Autenticação e usuários (API + telas)

- [ ] Hierarquia `Usuario` → `AdminUser` / `RegularUser`.
- [ ] `POST /api/usuarios` — cadastro (e-mail único, senha com hash/bcrypt); responde 201 com `Location`.
- [ ] `POST /api/sessoes` — login, devolve token JWT. A API é sem estado: o cliente envia `Authorization: Bearer <token>` em toda requisição.
- [ ] Papel de administrador definido por e-mail `nome@admin.com`, salvo no banco.
- [ ] Middlewares de autenticação (401) e de papel de administrador (403).
- [ ] **Proteger as rotas de escrita de `/api/livros...` (`POST`, `PUT`, `PATCH`, `DELETE`) com o middleware de administrador.** Hoje elas estão abertas.
- [ ] Telas de cadastro e login conectadas à API; conta, empréstimos e histórico só após o login; menu admin só para administradores.
- [ ] Testes de cadastro, login e permissões.

**Marco: 08/11 — Cadastro, login e controle de acesso funcionando.**

---

## 09/11 a 15/11 — Empréstimos, devolução e renovação (API + telas)

- [ ] `POST /api/emprestimos` (limite de 3, prazo de 14 dias, exemplar passa a emprestado).
- [ ] `POST /api/emprestimos/:id/devolucao` (recurso singleton; disponibilidade atualizada).
- [ ] `POST /api/emprestimos/:id/renovacoes` (máximo de 2 renovações, bloqueio se atrasado).
- [ ] `GET /api/usuarios/:id/emprestimos` com situação, multa acumulada e indicador de atraso.
- [ ] Ligar o `ServicoEmprestimos` (que já existe no domínio) ao repositório SQLite.
- [ ] Botão **Emprestar**; telas de empréstimos, histórico (Devolvido/Atrasado) e conta conectadas à API.
- [ ] Modal de renovação ("Você possui 1 de 2 renovações disponíveis") e mensagem de renovação indisponível.
- [ ] Testes de integração (supertest) do fluxo emprestar → renovar → devolver.

**Marco: 15/11 — Fluxo completo do usuário: buscar, emprestar, renovar e devolver.**

---

## 16/11 a 22/11 — Reservas, multas e área administrativa

- [ ] `POST /api/livros/:id/reservas` (só quando não houver exemplar disponível) e fila de reservas.
- [ ] Botão **Reservar** quando o livro está indisponível; reserva ativa bloqueia renovação.
- [ ] Cálculo e exibição de multas por atraso.
- [ ] Página `admin.html` com controle de acesso (a API de livros e exemplares já existe; falta a tela).
- [ ] Tela de cadastro e edição de livro; botão de adicionar exemplar; exclusão de exemplar com modal de confirmação.

**Marco: 22/11 — Reservas, multas e área administrativa funcionais.**

---

## 23/11 a 29/11 — Busca avançada, testes e Estudo A

### Construir
- [ ] `SearchStrategy` (interface) com `ExactMatchStrategy` e `RankedTextStrategy`; pesos título > autor > sinopse.
- [ ] `Specification<Livro>` com `AndSpecification` / `OrSpecification` para gênero e disponibilidade.
- [ ] Query parameters em `GET /api/livros?q=&modo=&genero=&disponivel=`; filtros laterais e "Limpar filtros".
- [ ] Testes unitários das estratégias e das specifications.
- [ ] Testar o fluxo inteiro e corrigir bugs.
- [ ] `:focus-visible` e navegação por teclado (o essencial de acessibilidade).

*Se faltar tempo: manter só `ExactMatchStrategy` e uma `Specification` (disponibilidade).*

### Estudo A — domínio e API (1 hora por dia)

Use sempre os 4 passos: **ler** o arquivo, **rastrear** uma requisição, **mexer** de propósito e **explicar** em voz alta, em 2 minutos.

- [ ] **Domínio:** `Livro`, `Exemplar`, `Acervo`, `RepositorioAcervo` e `RepositorioMemoria`.
  - Responder no caderno: *Por que o `status` do `Exemplar` é privado e só muda por `emprestar()` e `devolver()`? O que é encapsulamento, com este exemplo? O que `disponivel` calcula e por que não é uma variável guardada? Por que `RepositorioAcervo` devolve `Promise`? Para que serve a latência e a falha simuladas?*
- [ ] **API:** `app.ts`, `routes/livros.routes.ts`, `controllers/livros.controller.ts`, `services/servico-acervo.ts`, `repositories/repositorio-sqlite.ts`, `middlewares/tratar-erros.ts` e `info/api-rest.md`.
  - Rastrear: `GET /api/livros/L01` até o SQL; `POST /api/livros` com corpo inválido (onde nasce o `400`); `DELETE /api/livros/L01` (onde nasce o `409`).
  - Mexer: trocar `RepositorioSQLite` por `RepositorioMemoria` em `server.ts`; adicionar um campo novo ao livro e segui-lo pela pilha.
  - Responder no caderno: *O que é API REST e "sem estado"? Diferença entre `PUT` e `PATCH`? Por que `201`, `204` e `409`? O que o serviço ganha por não conhecer HTTP? O que `criarApp(repositorio)` ganha recebendo o repositório de fora? O que é polimorfismo aqui? O que é o padrão Strategy e o Specification?*
- [ ] **Teste de explicação:** explique em 3 minutos o caminho de `GET /api/livros/L01`, e desenhe as camadas.
- [ ] Revisar `info/duvidas.md` e tirar as dúvidas.

**Marco: 29/11 — Sistema completo e testado; domínio e API estudados.**

---

## 30/11 a 06/12 — Estudo B, documentação, ensaios e entrega

### Estudo B — autenticação, empréstimos e reservas (segunda a quarta, 1 a 2 horas por dia)
- [ ] **Autenticação:** `Usuario`, `AdminUser`, `RegularUser`, os middlewares e o fluxo de login.
  - Responder no caderno: *O que é herança e polimorfismo na hierarquia de usuários? Por que não guardar senha em texto puro, e o que é hash? O que é um JWT e por que a API continua "sem estado"? Qual a diferença entre `401` e `403`?*
- [ ] **Empréstimos:** `Emprestimo` e `ServicoEmprestimos`, e os testes (eles descrevem as regras).
  - Mexer: mudar o limite de 3 para 2 e prever quais testes quebram; simular um atraso com o relógio injetado.
  - Responder no caderno: *Quais são as regras e onde está cada uma? O que é o relógio injetado e por que facilita testar prazos? Como a multa é calculada? Por que `renovacoes` e `devolucao` são substantivos no caminho?*
- [ ] **Reservas:** a fila (quem é atendido primeiro) e a regra que bloqueia a renovação.
- [ ] **Mapa do projeto:** uma página com as pastas, as camadas, as classes principais e as setas. Será seu apoio na apresentação.

### Documentação e entrega
- [ ] Corrigir bugs restantes; revisar responsividade.
- [ ] README: como rodar do zero (instalar, criar banco, iniciar API e front).
- [ ] Atualizar `info/api-rest.md` com os endpoints finais e `justificativa-poo.md` com os nomes reais das classes.
- [ ] Executar o projeto do zero em uma máquina limpa (sábado).

### Apresentação
- [ ] **Roteiro (segunda):** problema → arquitetura em camadas (o mapa) → demonstração do fluxo principal → o código por dentro (5 arquivos-chave) → decisões de POO → testes → o que ficou de fora.
- [ ] **5 arquivos-chave**, cada um com uma frase sobre o motivo: `Exemplar` (encapsulamento), `repositorio.ts` e `repositorio-sqlite.ts` (interface e polimorfismo), `servico-acervo.ts` (regras sem HTTP), `livros.routes.ts` (convenções REST) e `ServicoEmprestimos` (regras de negócio).
- [ ] **Roteiro da demonstração:** cadastre, entre, busque, empreste, renove, devolva e mostre o admin; banco já populado.
- [ ] **Plano B:** vídeo curto da demonstração e prints.
- [ ] **Três ensaios completos (quarta, quinta e sexta),** cronometrados e em voz alta; no terceiro, peça a alguém para fazer perguntas do banco de perguntas.
- [ ] Realizar a entrega final.

**Marco final: 06/12 — Entrega e apresentação da Biblioteca Virtual.**

---

# Marcos principais

| Data | Marco |
|---|---|
| **11/10** | Base do front-end estabilizada |
| **18/10** | Base TypeScript pronta |
| **01/11** | API no ar e ligada ao front |
| **08/11** | Cadastro, login e controle de acesso |
| **15/11** | Fluxo: buscar, emprestar, renovar e devolver |
| **22/11** | Reservas, multas e área administrativa |
| **29/11** | Sistema completo e testado; Estudo A concluído |
| **04/12** | Estudo B concluído e três ensaios feitos |
| **06/12** | **Entrega e apresentação** |

---

# Banco de perguntas (o que o professor provavelmente vai perguntar)

Responda em voz alta e por escrito nos blocos Estudo A e B.

| # | Pergunta | Bloco |
|---|---|---|
| 1 | O que é encapsulamento? Mostre no `Exemplar`. | A |
| 2 | O que é uma interface? Para que serve o `RepositorioAcervo`? | A |
| 3 | O que é polimorfismo? Como trocar o SQLite por outro banco? | A |
| 4 | O que é injeção de dependência? O que `criarApp(repositorio)` ganha? | A |
| 5 | O que é uma API REST e o que significa "sem estado"? | A |
| 6 | Qual a diferença entre `PUT` e `PATCH`? E entre `401` e `403`? | A e B |
| 7 | Por que a URL é `/livros/L01/exemplares` e não `/getExemplares`? | A |
| 8 | Por que o serviço não conhece HTTP? | A |
| 9 | O que são os padrões Strategy e Specification? Onde você usou? | A |
| 10 | O que é herança? Como `AdminUser` e `RegularUser` se comportam diferente? | B |
| 11 | Como a senha é guardada e por quê? Como funciona o JWT? | B |
| 12 | Onde estão as regras do empréstimo? Como testar um atraso sem esperar 14 dias? | B |
| 13 | O que é composição? Qual a relação entre `Livro`, `Exemplar` e `Acervo`? | A |
| 14 | Por que testar o repositório contra a memória e o SQLite? | A |
| 15 | Qual foi a maior dificuldade e o que você faria diferente? | B |

---

# Prioridade em caso de atraso

1. **Fluxo completo:** cadastro → login → busca → empréstimo → devolução
2. **Requisitos do professor:** TypeScript, POO, banco de dados e API REST
3. **Regras de negócio** (limite, prazo, multa, renovação)
4. **Testes e correção de bugs**
5. **Estudo mínimo do código:** os 5 arquivos-chave e o banco de perguntas (não se corta, pois sem ele não dá para apresentar)
6. **Área administrativa**
7. **Acessibilidade**
8. **Polimento visual**
9. **Extras:** notificações, barra de progresso, "esqueci minha senha", página de detalhes, filtro por ano, ordenação, `RankedTextStrategy`

Se o atraso continuar, corte do último para o primeiro: extras → polimento visual → acessibilidade avançada (manter `:focus-visible` e teclado) → fila de reservas (manter só a reserva simples). Os itens 1 a 5 não são cortados.

## Ponto de controle semanal

Na **quarta-feira** de cada semana, confira o marco: se menos da metade estiver pronta, corte os opcionais dessa semana na hora, em vez de empurrá-los.

A última semana é margem de segurança. **Data final não deve ser alterada: 06/12/2026.**