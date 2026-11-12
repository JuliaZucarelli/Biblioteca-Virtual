# Cronograma - Biblioteca Virtual (v9)

**Replanejado em 11/11/2026. Apresentação em 02/12/2026.**

**Prazo de preparação:** concluir a versão apresentável e os materiais até 01/12. A data de entrega formal não foi informada novamente. Confirmá-la com o professor e preparar tudo para a apresentação de 02/12.

**Carga prevista:** 5 h de segunda a sexta e 6 h aos sábados e domingos. De 11/11 a 01/12 são 21 dias e 111 h, sendo 89 h até 27/11 e 22 h para revisão, correções e ensaios de 28/11 a 01/12. A carga considera 11/11 inteiro disponível. Se parte do dia já passou, usar a margem de 15/11 para o que faltar. As horas de 02/12 ficam para a apresentação, fora da capacidade de implementação.

**Situação em 11/11:** a API de livros e exemplares com SQLite está presente. O front continua com cards estáticos e sem proxy da API. Há configuração para publicação estática no GitHub Pages. Cadastro, login e integração de empréstimos com SQLite e HTTP seguem pendentes. O serviço de empréstimos existente trabalha com Acervo e Map em memória e precisará ser adaptado para persistência. O estudo previsto para o último fim de semana fica pendente até ser realizado.

**Verificações anteriores:** em 05/11 passaram os typechecks e 277 testes do back-end; a API respondeu com 9 livros e 19 exemplares usando banco temporário. Esses resultados são históricos. Rodar novamente as verificações no início e após cada etapa deste plano.

## Escopo mínimo para apresentar

- [ ] Catálogo vindo da API, com capa, disponibilidade e busca simples por título, autor ou ISBN.
- [ ] Cadastro, login, senha com hash, JWT e controle de acesso no servidor. Hierarquia de usuários com permissões efetivas.
- [ ] Empréstimo e devolução persistidos no SQLite, com atualização consistente do exemplar e consulta dos empréstimos do próprio usuário.
- [ ] Limite de 3 empréstimos, prazo de 14 dias, multa de R$ 0,50/dia e até 2 renovações, reaproveitando as regras existentes.
- [ ] Administração mínima para cadastrar livro e adicionar exemplar, protegida por papel administrativo.
- [ ] TypeScript, POO, API REST, banco relacional, testes do fluxo principal, documentação de execução e explicação do código.
- [ ] Carregamento, vazio, erro, navegação por teclado e foco visível nas telas usadas na demonstração.

**Funcionalidades condicionadas à avaliação:** reserva simples e busca com Strategy/Specification estão no documento de requisitos. Conferir em 11/11 se são obrigatórias para a nota. Se forem, usar os blocos de 23 e 24/11 para suas versões mínimas e reduzir o acabamento da administração e das telas secundárias. A fila completa, o ranking por relevância e a composição avançada de filtros ficam adiados pelo plano reduzido, sujeitos a essa conferência.

**Decisões de escopo:** demonstração local com API e Vite. O GitHub Pages publica arquivos estáticos e não executa o servidor Express nem o SQLite. Hospedagem do back-end fica fora da preparação essencial, salvo exigência expressa do professor. Reutilizar as telas existentes, com conta e histórico simplificados a partir das consultas já implementadas.

## Como estudar durante a implementação

Nos dias úteis, reservar 1 h para ler o código e 4 h para implementar manualmente, testar e registrar dúvidas. Nos fins de semana, reservar 1h30 para estudo e 4h30 para execução. Essas horas já estão dentro dos totais diários. Em 28/11 a 01/12, o estudo ocorre durante revisões e ensaios.

Para cada arquivo novo, identificar responsabilidade, entrada, saída e quem o chama. Explicar uma requisição em voz alta ao terminar a sessão. Usar os capítulos pertinentes de `info/guia-estudo-api-sqlite.md`, sem tentar resolver as 36 questões de uma vez. O roteiro datado do guia e as datas das versões anteriores são substituídos por este cronograma.

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

*A API de acervo foi incorporada posteriormente e está registrada no diagnóstico abaixo.*

---

## 19/10 a 25/10 — Semana de recuperação (doença)

- [X] Mandar a mensagem ao professor com as dúvidas.
- [X] Decidir o valor da multa e a regra de renovação, e anotar em `info/`.
- [X] Criar o `info/caderno-de-apresentacao.md`.
- [X] Ler `Livro`, `Exemplar` e `Acervo`.
- [ ] ~~Responder no caderno as perguntas sobre `Exemplar` e `RepositorioAcervo`~~ → **retomado no estudo diário e na revisão de 28/11**.

---

## 11/11 a 15/11 - Catálogo e autenticação (27 h)

- [x] **Qua 11/11 (5 h)** - Conferir requisitos obrigatórios e regras de reserva/renovação com o material do professor. Rodar typechecks e testes, corrigir o HTML da sinopse e configurar proxy e cliente HTTP. Iniciar a renderização do catálogo com dados da API. Estudar o caminho front -> rota -> serviço -> repositório.
- [ ] **Qui 12/11 (5 h)** - Reservar 4 h para concluir catálogo, capas, disponibilidade, busca simples e estados de carregamento, vazio e erro. Conferir o build, a API desligada e a persistência ao reiniciar. Reservar 1 h para o problema de publicação no GitHub Pages descrito abaixo.
- [ ] **Bloco de GitHub Pages em 12/11 (1 h incluída nas 5 h do dia)** - Investigar por que o endereço publicado exibe o README em vez da página inicial. Conferir a URL acessada, a origem configurada no Pages (branch/pasta ou GitHub Actions), o build do Vite e a presença de `index.html` na raiz do conteúdo publicado. Corrigir a configuração identificada e validar a página inicial, links, CSS e imagens no endereço público. Se exceder 1 h, usar a margem de 15/11. Critério de conclusão: abrir o endereço do site e visualizar a interface de `index.html`.
- [ ] **Sex 13/11 (5 h)** - Implementar usuários e cadastro com e-mail único, hash da senha, persistência e testes. Modelar Usuario, AdminUser e RegularUser aproveitando a tabela existente. Definir papel conforme a regra do projeto e conferir permissões no servidor.
- [ ] **Sáb 14/11 (6 h)** - Implementar login, JWT, middleware de autenticação e de administrador. Proteger escrita de livros e exemplares. Testar senha incorreta, token ausente ou inválido e usuário sem permissão.
- [ ] **Dom 15/11 (6 h)** - Conectar cadastro e login às telas e tratar erros. Bloquear acesso de usuário comum às operações administrativas e conferir navegação autenticada. Reservar as 2 h finais como margem para pendências desta etapa.

**Aceite de 15/11:** cadastrar, entrar, buscar livros da API e demonstrar 401/403 nas operações protegidas. Se faltar algo, concluir em 16/11 e cortar os opcionais antes de avançar.

## 16/11 a 22/11 - Fluxo completo de empréstimos (37 h)

- [ ] **Seg 16/11 (5 h)** - Ler ServicoEmprestimos e Emprestimo. Definir a adaptação para repositórios SQLite, preservando os testes e as regras existentes. Persistir empréstimos e consultar ativos por usuário. Planejar transação entre empréstimo e estado do exemplar.
- [ ] **Ter 17/11 (5 h)** - Implementar POST de empréstimo com usuário obtido do token, disponibilidade, limite de 3 e prazo de 14 dias. Gravar empréstimo e mudança do exemplar na mesma transação. Testar tentativa repetida e exemplar indisponível.
- [ ] **Qua 18/11 (5 h)** - Implementar devolução e listagem dos empréstimos do usuário autenticado, impedindo acesso ou alteração de empréstimo alheio. Testar persistência após reiniciar e disponibilidade depois da devolução.
- [ ] **Qui 19/11 (5 h)** - Conectar botão de emprestar e tela de empréstimos, com devolução e mensagens de erro. Mostrar datas e status usando as telas existentes.
- [ ] **Sex 20/11 (5 h)** - Integrar renovação e multa ao serviço persistente. Manter até 2 renovações, bloqueio por atraso e multa de R$ 0,50/dia. Validar datas com relógio controlado nos testes.
- [ ] **Sáb 21/11 (6 h)** - Conectar renovação e exibir atraso e multa. Usar a mesma consulta para uma conta/histórico simples, evitando duplicar regras. Conferir que nenhuma operação essencial perde dados ao reiniciar.
- [ ] **Dom 22/11 (6 h)** - Testar cadastro -> login -> busca -> empréstimo -> renovação -> devolução, no navegador e com Supertest. Reservar 3 h para corrigir falhas do fluxo principal.

**Aceite de 22/11:** o fluxo funciona do início ao fim, com isolamento entre usuários e dados persistidos. Se não passar, usar 23 e 24/11 para corrigir e adiar os opcionais desses dias.

## 23/11 a 27/11 - Requisitos restantes e versão apresentável (25 h)

- [ ] **Seg 23/11 (5 h)** - Se o núcleo estiver validado, implementar reserva simples de livro indisponível e bloqueio de renovação por reserva ativa, caso obrigatório na avaliação. Definir uma regra mínima de encerramento/cancelamento da reserva e testar. Sem essa exigência, usar o dia para correções e estudo do núcleo.
- [ ] **Ter 24/11 (5 h)** - Se exigido na avaliação, implementar a menor versão de Strategy e Specification que cumpra a rubrica, com testes e filtro de disponibilidade. Se ranking ou múltiplas estratégias forem obrigatórios e não couberem, ajustar o escopo com o professor. Sem essa exigência, usar o dia para estabilizar empréstimos e autenticação.
- [ ] **Qua 25/11 (5 h)** - Criar administração mínima para cadastrar livro e adicionar exemplar, consumindo o CRUD já existente e respeitando as permissões. Conferir validação e erros. Edição e exclusão por tela ficam condicionadas ao tempo.
- [ ] **Qui 26/11 (5 h)** - Revisar o que falta nos requisitos essenciais. Conferir teclado, foco visível, mensagens e layout nas telas da apresentação. Corrigir bugs, sem iniciar novos extras.
- [ ] **Sex 27/11 (5 h)** - Fechar a versão apresentável. Rodar testes, typechecks e build. Preparar dados de demonstração coerentes, conferir capas e reinício do banco. Atualizar README e documentação da API com o que realmente foi implementado.

**Aceite de 27/11:** fluxo principal demonstrável, administração mínima e requisitos obrigatórios conferidos. Congelar funcionalidades e concentrar os dias seguintes em correções e apresentação.

## 28/11 a 01/12 - Revisão, margem e ensaios (22 h)

- [ ] **Sáb 28/11 (6 h)** - Revisar domínio, API e SQLite por 2 h, responder às perguntas prioritárias por 1 h e reservar 3 h para bugs pendentes. Desenhar o mapa das camadas e preparar roteiro com cinco arquivos-chave.
- [ ] **Dom 29/11 (6 h)** - Fazer o primeiro ensaio completo e cronometrado. Conferir instalação do zero em pasta limpa ou outra máquina, sem apagar a versão de trabalho. Usar o restante para corrigir bloqueios e atualizar instruções de execução.
- [ ] **Seg 30/11 (5 h)** - Fazer o segundo ensaio, incluindo perguntas sobre POO, HTTP, autenticação, transações e testes. Corrigir a justificativa de POO com os nomes reais das classes. Gravar um vídeo curto ou capturas do fluxo como plano B.
- [ ] **Ter 01/12 (5 h)** - Fazer o terceiro ensaio e checagem final de testes, build, dados e materiais. Separar cópia do projeto e instruções para execução. Reservar o restante para problemas críticos.

## 02/12 - Apresentação

- [ ] Conferir a inicialização local, os dados de demonstração e o plano B antes do horário da apresentação.
- [ ] Demonstrar cadastro, login, busca, empréstimo e devolução. Incluir renovação, multa e administração conforme o roteiro ensaiado.
- [ ] Explicar o caminho de uma requisição, uma regra de negócio, uma transação e um teste.
- [ ] Apresentar o escopo efetivamente concluído e as limitações registradas.

## Marcos e critérios para reduzir o escopo

| Data | Marco |
|---|---|
| 15/11 | Catálogo integrado, cadastro e login com permissões |
| 22/11 | Empréstimo, renovação e devolução persistentes e testados |
| 27/11 | Versão apresentável e requisitos obrigatórios conferidos |
| 01/12 | Três ensaios, instalação validada e materiais prontos |
| 02/12 | Apresentação |

Os dias 15 e 22/11 incluem margem dentro das horas indicadas. Os blocos de 23 e 24/11 podem absorver atraso quando as funcionalidades propostas para eles forem dispensáveis na avaliação. Os dias 28/11 a 01/12 incluem correções, estudo e ensaios, sem capacidade adicional escondida.

Adiar primeiro notificações, barra de progresso, recuperação de senha, nova página de detalhes, destaques dinâmicos, filtros por ano, ordenação e polimento visual. Depois adiar fila completa de reservas, busca ranqueada e filtros avançados quando a rubrica permitir. Simplificar conta, histórico e administração usando componentes existentes. Preservar autenticação, persistência, limite/prazo/multa/renovação do fluxo principal, testes e capacidade de explicar o código.

Se o marco de 22/11 falhar, concentrar 23 a 27/11 no núcleo e registrar as funcionalidades adiadas. Se algum item dispensável for requisito obrigatório, confirmar a redução com o professor, sem assumir que o corte atende à avaliação.

## Perguntas prioritárias para o estudo e os ensaios

1. Qual a diferença entre Livro, Exemplar e Emprestimo? Onde estão seus dados e comportamentos?
2. Onde aparece encapsulamento no Exemplar e no Emprestimo?
3. Como RepositorioMemoria e RepositorioSQLite atendem à mesma interface?
4. Como uma requisição GET percorre rota, controller, serviço e banco?
5. Onde nascem os erros 400, 404 e 409? Qual a diferença entre 401 e 403?
6. O que diferencia PUT de PATCH? Para que servem Location e Allow?
7. Como o token identifica o usuário e como a API impede alterar empréstimos de outra pessoa?
8. Por que a senha é armazenada com hash? Como o papel de administrador é verificado?
9. Como impedir que exista empréstimo sem atualizar o exemplar se uma gravação falhar?
10. Como limite, prazo, multa e renovação são testados sem esperar dias?
11. O que persiste ao reiniciar a API? Qual é o efeito de db:reset?
12. Como a hierarquia de usuários representa herança e diferenças de permissão?
13. Se houver Strategy/Specification na versão entregue, quais classes as implementam e qual problema resolvem?
14. Qual teste demonstra uma regra e qual demonstra o fluxo HTTP?
15. Quais funcionalidades foram adiadas e por quê?

**Meta da explicação:** apresentar cinco arquivos reais e rastrear consulta, cadastro inválido e operação bloqueada sem depender do texto do guia. Conferir a divergência de regras de reserva e renovação em `info/requisitos_sistema_biblioteca.md` antes de implementá-las.

**Prazo vigente de apresentação: 02/12/2026. Preparação concluída até 01/12/2026.**
