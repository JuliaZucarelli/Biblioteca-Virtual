# Cronograma — Biblioteca Virtual (v2)

**Período:** 07/10/2026 a 06/12/2026
**Data final de entrega:** 06/12/2026

**Stack:** TypeScript em tudo · Front-end com Vite · Back-end com Node + Express · Banco SQLite · API REST · Testes com Vitest

**Estratégia:** cada semana entrega uma funcionalidade **completa** (banco + API + tela). Não existe mais uma "semana de integração" no final, porque a integração acontece junto com cada funcionalidade.

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

**Sex 16/10 — Organização e linha de base**
- [x] Decidir e registrar as regras (multa: R$ 2,50 ou R$ 0,50 por dia; regra de renovação/fila de reserva).
- [x] Confirmar com o professor: banco, framework e se a documentação da API é exigida.
- [x] Separar o projeto em `web/` (front-end) e `server/` (back-end), com um único `package.json` por pasta.
- [x] Criar `.gitignore` (`node_modules`, `dist`, `*.db`) e reinstalar as dependências.
- [x] Criar `tsconfig.json` com `strict: true` em `server/` e `web/`.
- [x] Corrigir o import quebrado em `repositorio.ts` (`./models/...` → `../models/...`).
- [x] `tsc --noEmit` sem erros e todos os testes existentes passando.

**Sáb 17/10 — Front-end em TypeScript**
- [x] Configurar o Vite com múltiplas páginas HTML.
- [x] Migrar `script.js` e `catalogo.js` para TypeScript (modais, login overlay, busca).
- [x] Trocar `<script src="...js">` por `<script type="module" src="...ts">` nas páginas.

**Dom 18/10 — Banco e API mínima**
- [ ] Unificar os dados iniciais com os livros do HTML (títulos, capas, ISBNs únicos).
- [ ] Criar o esquema SQLite (usuários, livros, exemplares, empréstimos, reservas) e o seed.
- [ ] Criar Express + `GET /livros` retornando dados do banco.
- [ ] Front-end listando os livros vindos da API (ponta a ponta funcionando).

**Marco: 18/10 — Base TypeScript pronta: web → API → banco funcionando.**

---

## 19/10 a 25/10 — Busca, filtros e catálogo (banco + API + tela)

- [ ] `RepositorioSQLite` implementando as interfaces de repositório (o `RepositorioMemoria` continua nos testes).
- [ ] Métodos estáticos de restauração (`Emprestimo.restaurar`, `Exemplar.restaurar`) para reconstruir objetos a partir do banco.
- [ ] `SearchStrategy` (interface) com `ExactMatchStrategy` (título, autor e ISBN) e `RankedTextStrategy`.
- [ ] Pesos de relevância: título > autor > sinopse.
- [ ] `Specification<Livro>` com `AndSpecification` / `OrSpecification` para gênero, ano e disponibilidade.
- [ ] Endpoint `GET /livros?q=&modo=&genero=&ano=&disponivel=&ordem=`.
- [ ] `GET /livros/:id` e página de detalhes (sinopse, metadados, lista de exemplares).
- [ ] Cards gerados a partir dos dados da API, com ISBN, disponibilidade e indicador de relevância.
- [ ] Filtros laterais, "Limpar filtros" e ordenação (relevância, título, ano).
- [ ] Estados de loading, vazio e erro (textos do `melhorias.md`).
- [ ] Testes unitários das estratégias de busca e das specifications.

**Marco: 25/10 — Catálogo, busca e filtros funcionando com banco e API.**

---

## 26/10 a 01/11 — Autenticação e usuários

- [ ] Hierarquia `Usuario` → `AdminUser` / `RegularUser`.
- [ ] `POST /auth/cadastro` (e-mail único, senha com hash/bcrypt).
- [ ] `POST /auth/login` (token JWT ou sessão).
- [ ] Papel admin definido por e-mail `nome@admin.com`, salvo no banco.
- [ ] Middleware de autenticação e de autorização por papel na API.
- [ ] Telas de cadastro e login conectadas à API.
- [ ] Menu admin aparece apenas para administradores.
- [ ] Conta, empréstimos e histórico visíveis somente após o login (botão de login quando deslogado).
- [ ] Testes de cadastro, login e permissões.

**Marco: 01/11 — Cadastro, login e controle de acesso funcionando.**

---

## 02/11 a 08/11 — Empréstimos, reservas e renovação (banco + API + tela)

- [ ] `POST /emprestimos` (limite de 3, prazo de 14 dias, exemplar passa a emprestado).
- [ ] `POST /emprestimos/:id/devolver` (disponibilidade atualizada).
- [ ] `POST /emprestimos/:id/renovar` (máximo de 2 renovações, bloqueio se atrasado).
- [ ] `POST /reservas` (só quando não houver exemplar disponível).
- [ ] Botão **Emprestar** ou **Reservar** conforme a disponibilidade.
- [ ] `GET /emprestimos/meus` com situação, multa acumulada e indicador de atraso.
- [ ] Telas de empréstimos, histórico (status Devolvido/Atrasado) e conta conectadas à API.
- [ ] Modal de renovação ("Você possui 1 de 2 renovações disponíveis") e mensagem de renovação indisponível.
- [ ] Barra de progresso do prazo (se sobrar tempo).
- [ ] Tratamento dos erros da API na interface.

**Marco: 08/11 — Fluxo completo do usuário: buscar, emprestar, renovar e devolver.**

---

## 09/11 a 15/11 — Regras de negócio e robustez

- [ ] Fila de reservas e regra de renovação definida (reserva ativa bloqueia renovação).
- [ ] Cálculo e exibição de multas por atraso (valor definido em 16/10).
- [ ] Revisão do controle de disponibilidade após empréstimo, devolução e reserva.
- [ ] Validação da busca por relevância com casos de teste.
- [ ] Revisão das regras de autenticação e acesso.
- [ ] Testes de integração da API (supertest).
- [ ] Notificações básicas (vence amanhã, reserva disponível), se houver tempo.

**Marco: 15/11 — Núcleo do sistema funcionando e testado.**

---

## 16/11 a 22/11 — Área Administrativa

- [ ] Página `admin.html` com controle de acesso.
- [ ] `POST /livros` (admin) e tela de cadastro de livro.
- [ ] `POST /livros/:id/exemplares` (admin) com botão de adicionar exemplar nos livros cadastrados.
- [ ] Atualização da quantidade disponível ao adicionar exemplar.
- [ ] `DELETE /exemplares/:id` com modal de confirmação.
- [ ] Gerenciamento do acervo.
- [ ] Revisão das permissões de usuário e administrador.

**Marco: 22/11 — Área administrativa funcional.**

---

## 23/11 a 29/11 — Testes, Acessibilidade e Estados

- [ ] Testar cadastro e login.
- [ ] Testar busca exata e por relevância.
- [ ] Testar filtros.
- [ ] Testar empréstimos, reservas, renovações e devoluções.
- [ ] Testar multas.
- [ ] Testar permissões administrativas.
- [ ] Revisar loading, erro, estados vazios e sucesso.
- [ ] `:focus-visible` em links, botões, busca, filtros, inputs e cards clicáveis.
- [ ] Revisar navegação por teclado, labels, textos e feedbacks.
- [ ] Corrigir bugs encontrados.

**Marco: 29/11 — Sistema completo e testado.**

---

## 30/11 a 06/12 — Documentação, polimento e entrega

- [ ] Corrigir bugs restantes.
- [ ] Revisar responsividade e consistência visual.
- [ ] Limpar código desnecessário e revisar a organização das pastas.
- [ ] README: como rodar do zero (instalar, criar banco, iniciar API e front).
- [ ] Documentação da API (endpoints, exemplos de requisição e resposta).
- [ ] Atualizar `justificativa-poo.md` com os nomes reais das classes.
- [ ] Preparar a apresentação (tour de código: interfaces, polimorfismo, encapsulamento, composição).
- [ ] Executar o projeto do zero em uma máquina limpa para validação final.
- [ ] Conferir todos os requisitos e os arquivos da entrega.
- [ ] Realizar a entrega final.

**Marco final: 06/12 — Entrega da Biblioteca Virtual.**

---

# Marcos principais

| Data | Marco |
|---|---|
| **11/10** | Base do front-end estabilizada |
| **18/10** | Base TypeScript pronta: web → API → banco |
| **25/10** | Catálogo, busca e filtros com banco e API |
| **01/11** | Cadastro, login e controle de acesso |
| **08/11** | Fluxo completo: buscar, emprestar, renovar e devolver |
| **15/11** | Núcleo do sistema funcionando e testado |
| **22/11** | Área administrativa funcional |
| **29/11** | Sistema completo e testado |
| **06/12** | **Entrega final** |

---

# Prioridade em caso de atraso

1. **Fluxo completo:** cadastro → login → busca → empréstimo → devolução
2. **Requisitos do professor:** TypeScript, POO, banco de dados e API REST
3. **Regras de negócio** (limite, prazo, multa, renovação)
4. **Testes e correção de bugs**
5. **Área administrativa**
6. **Acessibilidade**
7. **Polimento visual**
8. **Extras:** notificações, barra de progresso, "esqueci minha senha"

A última semana (30/11 a 06/12) continua sendo margem de segurança. **Data final não deve ser alterada: 06/12/2026.**
