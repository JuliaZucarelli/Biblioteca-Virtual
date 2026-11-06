# Cronograma — Biblioteca Virtual (v8)

**Período:** 07/10/2026 a 06/12/2026
**Data final de entrega e apresentação:** 06/12/2026 (não muda)

**Stack:** TypeScript em tudo · Front-end com Vite · Back-end com Node + Express · Banco SQLite · API REST (convenções da aula do professor) · Testes com Vitest

**Carga restante de 05/11 a 06/12:** 170 h disponíveis em 32 dias, com média de 5 h de segunda a sexta e 6 h aos sábados e domingos. A estimativa considera a carga inteira de 05/11 disponível. Desconte as horas já trabalhadas hoje. As horas incluem implementação manual, estudo, testes e correções.

**Situação verificada em 05/11:** arquivos da API de livros e exemplares presentes, dependências e scripts configurados. Typecheck do server e do web passou. Os 277 testes em 9 arquivos passaram com `npm test -- --pool=threads --maxWorkers=1`, incluindo HTTP com memória e SQLite. A API iniciou com banco temporário em memória e respondeu 200 em saúde e catálogo, com 9 livros e 19 exemplares. O front ainda usa cards estáticos e o Vite está sem proxy `/api`. O build do front terminou com avisos de HTML em `web/acervo.html`, linha 273.

**Limites dessa verificação:** falta conferir a persistência ao reiniciar com banco em arquivo e testar a integração no navegador. A execução padrão dos testes neste ambiente encontrou bloqueio de conexões locais e aviso de encerramento do Vite. A suíte passou ao permitir conexões locais e usar um worker. A presença do código e os testes aprovados registram a implementação. A revisão e explicação de cada arquivo seguem nas tarefas de estudo abaixo.

**Estudo diário:** em dias úteis, reserve cerca de 1h30 para ler e experimentar e 3h30 para copiar ou implementar e validar. No fim de semana, reserve 2 h para estudo e 4 h para execução e testes. Para cada arquivo, leia a responsabilidade e os imports, aplique a mudança manualmente, rode a verificação pertinente e registre dúvidas em `info/duvidas.md`. Nas tarefas agrupadas, divida o total entre os dias pela carga diária.

**Ajuste para 06 a 08/11:** a tarde livre de sexta será dedicada à integração do front, estimada em 5 h com leitura durante a implementação manual. Sábado e domingo terão 6 h diárias de estudo e exercícios dos códigos novos, seguindo o guia de API e SQLite. Esse é o plano vigente para a integração, antecipada em relação à observação inicial do guia.

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
- [ ] ~~Responder no caderno as perguntas sobre `Exemplar` e `RepositorioAcervo`~~ → **movido para o Estudo A (29/11)**.

---

## 05/11 a 08/11 — Estudar a API implementada e conectar o catálogo (22 h restantes)

- [x] **Implementação verificada em 05/11** — Arquivos de banco, repositório SQLite, serviço, validação, controllers, rotas, middlewares, app, servidor e testes presentes. Supertest e tipos instalados. Scripts `dev`, `start` e `db:reset` configurados. Typecheck e 277 testes aprovados.
- [ ] **Qui 05/11 (5 h)** — Estudar `server.ts`, `app.ts`, configuração, schema e seed. Desenhar a inicialização e rastrear `GET /api/livros/L01`. Reservar a execução prática para conferir persistência em banco de desenvolvimento ao reiniciar a API. Entender que `db:reset` apaga os dados antes de usá-lo.
- [ ] **Sex 06/11, tarde (5 h)** — Integrar o front manualmente, lendo cada mudança. Reservar 30 min para conferir API e corrigir as aspas de `web/acervo.html`; 45 min para proxy do Vite e cliente HTTP; 1h30 para renderizar o catálogo com capas e disponibilidade; 45 min para adaptar busca por título, autor e ISBN aos cards carregados; 1 h para estados de carregamento, vazio e erro, typecheck, build e teste no navegador com API ligada e desligada; 30 min de margem para correções. Conectar destaques se houver tempo após validar o catálogo.
- [ ] **Sáb 07/11 (6 h)** — Seguir o sábado do guia de estudo: inicialização, app, configuração, schema, seed, domínio, repositórios, serviço e validação. Desenhar as camadas, responder às questões e rastrear uma consulta. Incluir na explicação como o cliente do front recebe o JSON da API.
- [ ] **Dom 08/11 (6 h)** — Seguir o domingo do guia: rotas, controller, erros, testes e exercícios de criação, PATCH e exclusão. Explicar os status 201, 400, 404, 405 e 409 e apresentar os três rastreamentos em voz alta. Registrar dúvidas com arquivo e função.

**Marco de 08/11** — Catálogo alimentado pela API e rastreamentos das camadas explicados pela aluna. A integração de sexta tem 5 h estimadas. Se exceder esse tempo, registrar a pendência e usar a margem de 15/11, priorizando catálogo, busca e estados de erro antes de destaques. Preservar o bloco de estudo do fim de semana.

## 09/11 a 15/11 — Cadastro, login e permissões (37 h)

- [ ] **Seg 09/11 a ter 10/11 (10 h)** — Modelar `Usuario`, `AdminUser` e `RegularUser`. Implementar persistência e cadastro com e-mail único, senha com hash e resposta 201 com `Location`.
- [ ] **Qua 11/11 a qui 12/11 (10 h)** — Implementar login com JWT, papel administrativo e middlewares 401/403. Proteger as rotas de escrita de livros e exemplares.
- [ ] **Sex 13/11 (5 h)** — Conectar cadastro e login, incluindo os erros dos formulários.
- [ ] **Sáb 14/11 (6 h)** — Restringir conta, empréstimos e histórico a usuários autenticados. Mostrar menu admin apenas para administradores.
- [ ] **Dom 15/11 (6 h)** — Rodar testes de cadastro, login e permissões. Usar o restante para corrigir falhas ou absorver pendências do catálogo.

## 16/11 a 22/11 — Empréstimo, devolução e renovação (37 h)

- [ ] **Seg 16/11 a ter 17/11 (10 h)** — Ler o serviço existente e ligá-lo ao SQLite. Implementar empréstimo com limite de três, prazo de 14 dias e atualização da disponibilidade.
- [ ] **Qua 18/11 a qui 19/11 (10 h)** — Implementar devolução, renovação (até duas, bloqueada se houver atraso) e consulta de empréstimos do usuário com situação e multa.
- [ ] **Sex 20/11 (5 h)** — Conectar a ação de emprestar e as telas de empréstimos, conta e histórico.
- [ ] **Sáb 21/11 (6 h)** — Conectar devolução e renovação, incluindo o modal e os estados de erro.
- [ ] **Dom 22/11 (6 h)** — Testar com Supertest e no navegador o fluxo cadastro → login → busca → empréstimo → renovação → devolução. Corrigir falhas antes de ampliar o escopo.

## 23/11 a 29/11 — Reservas, multas, administração e busca (37 h)

- [ ] **Seg 23/11 a ter 24/11 (10 h)** — Implementar reserva para livro indisponível, bloqueio de renovação por reserva ativa e exibição de multa. Fazer a fila completa se o fluxo principal estiver estável.
- [ ] **Qua 25/11 a qui 26/11 (10 h)** — Conectar a área administrativa protegida ao CRUD de livros e exemplares, com confirmação para exclusão.
- [ ] **Sex 27/11 (5 h)** — Se o fluxo principal estiver estável, implementar filtro de disponibilidade e busca exata com testes. Busca ranqueada e composição de filtros ficam condicionadas ao tempo restante.
- [ ] **Sáb 28/11 (6 h)** — Revisar navegação por teclado, foco visível e fluxo completo. Corrigir regressões.
- [ ] **Dom 29/11 (6 h)** — Margem para pendências do fluxo principal. Revisar o domínio e rastrear `GET /api/livros/L01` até o SQLite, usando as perguntas do Estudo A.

## 30/11 a 06/12 — Revisão, ensaios e entrega (37 h)

- [ ] **Seg 30/11 (5 h)** — Preparar roteiro, mapa das camadas e explicação de cinco arquivos-chave. Revisar autenticação com as perguntas do Estudo B.
- [ ] **Ter 01/12 (5 h)** — Revisar empréstimos, reservas e multas. Atualizar README, documentação da API e justificativa de POO.
- [ ] **Qua 02/12 (5 h)** — Fazer o primeiro ensaio cronometrado com demonstração. Anotar e corrigir bloqueios.
- [ ] **Qui 03/12 (5 h)** — Fazer o segundo ensaio. Revisar responsividade e preparar vídeo ou capturas para o plano B.
- [ ] **Sex 04/12 (5 h)** — Fazer o terceiro ensaio, incluindo perguntas do professor e demonstração com dados iniciais.
- [ ] **Sáb 05/12 (6 h)** — Validar a instalação do zero, rodar os testes de back-end e conferir o build do front. Reservar o restante para correções críticas.
- [ ] **Dom 06/12 (6 h disponíveis)** — Conferir os materiais, executar a checagem final, entregar e apresentar.

## Marcos revisados

| Data | Resultado esperado |
|---|---|
| 08/11 | API validada e catálogo conectado |
| 15/11 | Cadastro, login e permissões validados |
| 22/11 | Fluxo de empréstimo, renovação e devolução validado |
| 29/11 | Reservas, multas e administração conforme a capacidade da semana |
| 04/12 | Três ensaios concluídos |
| 06/12 | Entrega e apresentação |

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

Na **quarta-feira** de cada semana, compare o que falta com as horas até domingo. Se a carga não couber, adie os opcionais e use a margem para concluir e testar o fluxo principal.

A última semana é margem de segurança. **Data final não deve ser alterada: 06/12/2026.**
