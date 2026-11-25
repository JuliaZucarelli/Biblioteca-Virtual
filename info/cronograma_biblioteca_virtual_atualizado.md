# Cronograma - Biblioteca Virtual (v14 — escopo essencial)

**Atualizado em 25/11/2026, ao encerrar o trabalho do dia. Apresentação em 02/12/2026.**

**Prazo de preparação:** concluir a versão apresentável e os materiais até 01/12. A data de entrega formal deve seguir o combinado com o professor.

**Capacidade de referência:** 5 h de segunda a sexta e 6 h aos sábados e domingos. A janela de 24/11 a 01/12 tem 42 h nominais, incluindo o trabalho já realizado em 24/11. De 25/11 a 01/12, restam 37 h previstas. Os blocos incluem leitura, implementação manual, testes e correções. As horas de 02/12 são destinadas à apresentação.

**Situação em 25/11:** login local pelo overlay, armazenamento e recuperação de sessão na aba e saída da conta conferidos. Escrita do acervo protegida por autenticação e autorização administrativa. O merge do colaborador trouxe ServicoCirculacao, repositório SQLite e API autenticada de empréstimos, devoluções, renovações e reservas. O front possui listarExemplares e emprestarExemplar, com typecheck aprovado, mas ainda sem ligação ao botão do catálogo. Na leitura final foi identificada uma barra ausente na URL de listarExemplares; corrigir antes do primeiro teste funcional. Lista de empréstimos e devolução pela interface seguem pendentes.

**Verificações até 25/11:** após o merge, foram observados 366 testes aprovados em 22 arquivos. Depois das proteções e dos novos testes 401/403, a usuária confirmou suíte completa e typecheck sem erros, sem informar o novo total. Login, sessão e saída foram conferidos manualmente; funções de empréstimo no front tiveram typecheck aprovado, sem teste funcional do botão. Registro anterior: em 19/11, a usuária confirmou 291 testes de 14 arquivos e typecheck do back-end. Em 23 e 24/11, confirmou 12 testes novos em quatro arquivos, nas execuções direcionadas de sessões, tokens, rota HTTP e autenticação. Também confirmou login local 201 com token e senha incorreta com 401. A confirmação posterior de execução completa está registrada acima; repetir as verificações finais após integrar as telas.

**Regra de acompanhamento:** [X] indica conclusão confirmada; [ ] indica pendência. Backend local, integração ao front e publicação são acompanhados separadamente. A disponibilidade do método de permissão e do middleware em testes não conclui a autorização das rotas reais.

## Escopo mínimo para apresentar

**Critério informado pelo professor em 24/11:** sistema minimamente complexo, com regras de negócio que justifiquem testes automatizados; apresentação com demonstração e tour do código com ênfase em POO, classes, métodos e interfaces. Backend com POO e frontend interativo são o formato ideal indicado. O enunciado fornecido não exige reservas, renovação, multa, Strategy/Specification ou administração por tela. Para atender à complexidade pedida, esta entrega mantém empréstimo e devolução com regras, testes e interação pela UI.

**Recorte desta versão:** cadastro -> login -> catálogo -> emprestar exemplar disponível -> consultar meus empréstimos -> devolver. Usar uma única lista simples na página de empréstimos e reutilizar o catálogo e os overlays existentes. Sem novas páginas ou reformulação visual. Manter limite de 3 empréstimos ativos, prazo de 14 dias, bloqueio de exemplar indisponível, acesso apenas aos próprios empréstimos e impedimento de devolução repetida.

- [X] Catálogo vindo da API, com capa, disponibilidade e busca simples por título, autor ou ISBN.
- [X] Modelar Usuario, AdminUser e RegularUser, normalizar e-mail e definir papel conforme a regra do projeto.
- [X] Cadastro com e-mail único, hash da senha, persistência SQLite, testes e POST /api/usuarios.
- [X] Cadastro pelo overlay da home, mensagens de sucesso e duplicidade e navegação entre login e cadastro. Estrutura e troca dos overlays também conferidas no acervo.
- [X] Publicar o cadastro no Render e no GitHub Pages e testar criação e duplicidade pelo site online.
- [X] Implementar login da API, comparação de senha, emissão e verificação de JWT e configuração local de JWT_SECRET.
- [X] Testar POST /api/sessoes com 201, 401 e 400 e o middleware de autenticação em rota isolada.
- [X] Implementar ErroPermissao e sua conversão em resposta HTTP 403, com typecheck aprovado em 24/11.
- [X] Implementar e testar o middleware de autorização administrativa e aplicar as proteções às rotas reais de escrita do acervo.
- [X] Conectar o overlay de login à API, guardar e recuperar a sessão em sessionStorage e implementar saída da conta, conferidos localmente.
- [ ] Usar o token nas ações de empréstimo pela interface e tratar sessão inválida durante o fluxo completo.
- [ ] Configurar JWT_SECRET no Render e publicar e validar online o login e as proteções.
- [X] Backend de empréstimo e devolução com SQLite, transações, consulta do titular e proteção JWT integrado pelo merge, com testes automatizados aprovados.
- [X] Regras de limite de 3 empréstimos, prazo de 14 dias e disponibilidade disponíveis no backend de circulação.
- [X] Criar listarExemplares e emprestarExemplar no cliente HTTP; typecheck aprovado.
- [ ] Corrigir URL de listarExemplares, ligar empréstimo ao catálogo e implementar consulta e devolução nas telas.
- [X] Base de TypeScript, POO, API REST, banco relacional e testes de acervo e cadastro.
- [ ] Testar o fluxo autenticado completo e concluir documentação de execução e preparação da explicação.
- [X] Estados de carregamento, vazio e erro no catálogo.
- [ ] Conferir formulários, mensagens e navegação das telas usadas na demonstração. O fechamento dos overlays por Escape já foi conferido; a ampliação da navegação dos cards pelo teclado permanece adiada.

**Fora do trabalho de interface para 02/12:** reservas e fila, renovação e multa nas telas, administração por tela, edição de conta, histórico separado, notificações, recuperação de senha, filtros avançados e novos padrões Strategy/Specification. Reservas, renovação e multa já chegaram ao backend pelo merge; preservar esse código e seus testes, sem ampliar as telas previstas. Usar a margem para estudar e corrigir o núcleo e demonstrar o acervo inicial existente.

**Recorte e avaliação:** os requisitos e a justificativa de POO continuam descrevendo o projeto completo. Este cronograma registra a versão demonstrável com base no enunciado fornecido, sem afirmar que houve aprovação específica de cada corte pelo professor. Herança entre usuários, encapsulamento das entidades, interfaces de repositório e regras de empréstimo permitem explicar POO com código real. Demonstrar ao menos um teste que rejeita uma operação inválida, além do caminho de sucesso.

**Limite da previsão:** o volume restante é alto para 37 h a partir de 25/11 e desenvolvimento manual. As datas são metas sujeitas aos pontos de controle. Não considerar funcionalidades concluídas apenas por estarem programadas.

**Decisões de escopo:** a demonstração principal será local, com API, Vite e SQLite. O catálogo online já está validado; a publicação das novas funções é secundária e só ocorre depois do núcleo estável. Antes de publicar o servidor com JWT, configurar JWT_SECRET no Render. O arquivo SQLite no Render gratuito não tem garantia de persistência entre recriações do serviço. Preparar dados locais de demonstração; não depender do ambiente online para apresentar.

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

## Histórico das tarefas previstas para 11 a 15/11, conferido até 24/11

As datas representam as previsões anteriores. O registro detalhado do desenvolvimento está em `info/resumo.md`.

- [X] **Documentação e organização** - Atualizar cronograma, requisitos do projeto completo e justificativa de POO. Elaborar guia de estudo de API e SQLite em Markdown e PDF.
- [X] **Alinhamento com o professor** - Confirmar quais itens do projeto completo são obrigatórios na apresentação e quais cortes são aceitos.
- [X] **Previsto para 11/11** - Configurar proxy e cliente HTTP, corrigir o HTML da sinopse e renderizar os livros da API. Estudar durante a implementação o caminho front -> rota -> serviço -> repositório.
- [X] **Previsto para 12/11** - Concluir catálogo, capas, disponibilidade, busca, pesquisa pela URL e estados de carregamento, vazio e erro. Validar typecheck e build.
- [X] **GitHub Pages e Render** - Validar publicação do index.html, corrigir caminhos das imagens, incluir arquivos públicos e conectar VITE_API_URL ao build. Conferir catálogo, busca e modal online usando a API hospedada.
- [X] **Previsto para 13/11, concluído até 19/11** - Modelar usuários, definir papel, implementar cadastro com e-mail único, hash, persistência, rota e testes. Métodos de permissão das classes conferidos.
- [X] **Parte de login prevista para 14/11, concluída em 23 e 24/11** - Implementar comparação de credenciais, JWT, configuração local, controller, rota e middleware de autenticação. Confirmar testes direcionados.
- [ ] **Complemento de autorização previsto para 14/11** - Implementar exigência de administrador, proteger escrita de livros e exemplares e testar as permissões. A classe de erro e seu tratamento 403 foram concluídos em 24/11.
- [X] **Parte de cadastro prevista para 15/11** - Conectar formulário à API, criar overlay na home e no acervo, tratar sucesso e duplicidade e conferir abertura, fechamento e retorno ao login.
- [ ] **Parte de login prevista para 15/11** - Conectar login à API e restringir operações administrativas e áreas autenticadas.
- [X] **Publicação do cadastro** - Levar a versão de cadastro para a main, aguardar as duas publicações e validar o formulário no site público.
- [X] **Correção da validação do cadastro** - Substituir Error genérico por ErroValidacao no corpo inválido.
- [ ] **Cobertura e documentação complementar** - Testar corpo inválido no cadastro e incluir POST /api/usuarios e POST /api/sessoes na apresentação dos endpoints de GET /api, conforme os módulos montados.

**Marco histórico até 24/11:** catálogo e cadastro online concluídos; login e JWT locais. Em 25/11, autorização e login no front foram concluídos; o foco passou à interface dos empréstimos.

## 16/11 a 22/11 - Registro do marco anterior (pendências daquela janela)

O marco de fluxo completo de empréstimos não foi atingido nessa janela. A etapa foi ocupada pela conclusão do cadastro e sua publicação. As pendências foram transferidas para o plano abaixo. Atualização de 25/11: persistência e API chegaram pelo merge, usando ServicoCirculacao; a integração das telas permanece pendente. As caixas desta seção preservam o estado daquela janela.

- [ ] Adaptar ServicoEmprestimos para persistência SQLite preservando regras e testes.
- [ ] Implementar API de empréstimo, consulta do titular e devolução.
- [ ] Garantir transação entre empréstimo e alteração do exemplar e testar falhas e tentativas repetidas.
- [ ] Conectar essas operações às telas e verificar dados após reinício.
- [ ] ~~Integrar renovação e multa à API e às telas~~ — adiado para depois da apresentação; preservar o código de domínio existente.

## 23 e 24/11 - Login, JWT e autenticação

- [X] **23/11** - Criar ErroAutenticacao e tratamento 401. Validar dados de login e comparar a senha com o hash existente.
- [X] **23/11** - Instalar jsonwebtoken e seus tipos, gerar e verificar JWT com HS256, validade de 1 h, emissor e destinatário.
- [X] **23/11** - Preparar configuração local de JWT_SECRET, carregamento de .env no comando dev e leitura pelo servidor. A chave privada permanece fora da documentação.
- [X] **23/11** - Montar controller, rota POST /api/sessoes e dependências em app.ts e server.ts. Conferir login 201 e senha incorreta com 401 pelo PowerShell.
- [X] **23 e 24/11** - Confirmar os 4 testes de serviço de sessões e 3 de tokens.
- [X] **24/11** - Restaurar o registro de cadastro em app.ts, corrigir importação duplicada e confirmar os 3 testes HTTP de sessões.
- [X] **24/11** - Criar autenticar e confirmar 2 testes em uma aplicação isolada, cobrindo ausência de token e identidade validada.
- [X] **24/11** - Atualizar resumo de desenvolvimento com funções, alterações, testes e pendências.
- [X] **24/11** - Criar ErroPermissao em domain/erros.ts e acrescentar sua conversão em HTTP 403 em tratar-erros.ts. Typecheck concluído sem erros conforme confirmação da usuária.
- [ ] **Próxima ação em 24/11, dentro do tempo que restar do dia** - Implementar o middleware de administrador. Testar membro e administrador antes de aplicar às rotas de escrita. Se exceder o dia, levar para o primeiro bloco de 25/11.

**Ponto de controle histórico de 24/11 (superado em 25/11):** ErroPermissao e seu tratamento 403 estão concluídos. O middleware de autorização administrativa, os testes de permissão e a aplicação às rotas reais seguem pendentes. Middleware de autenticação testado isoladamente precisa ser aplicado às rotas reais. A carga nominal de 24/11 é de 5 h e inclui o que já foi realizado.

## 25 a 28/11 - Núcleo da versão apresentável (21 h)

- [X] **Qua 25/11 (5 h previstas; duração real não registrada)** - Concluir proteção do acervo, ajustar testes e conferir 401/403 na rota real. Conectar login, sessão e saída na interface. Analisar o merge e iniciar o cliente de empréstimos. Encerrar o dia sem exigir tarefas adicionais.
- [ ] **Qui 26/11 (5 h)** - Reservar 1 h para estudar o backend incorporado e o modal do catálogo. Nas 4 h restantes, corrigir a barra na URL de listarExemplares, transportar o ID do livro ao modal e conectar o botão de empréstimo. Consultar exemplares, escolher uma unidade disponível e solicitar o empréstimo com token; tratar carregamento, sucesso, falha e atualização da disponibilidade. Não reimplementar o backend existente.
- [ ] **Sex 27/11 (5 h)** - Reservar 1 h para leitura e 4 h para criar a consulta de empréstimos do usuário no cliente HTTP, preencher a página existente com uma lista simples e conectar devolução. Atualizar a lista após devolver e tratar sessão inválida, vazio e erro. Sem ampliar a UI para reservas e renovação.
- [ ] **Sáb 28/11 (6 h)** - Reservar 1h30 para estudar as camadas e 4h30 para conferir cadastro -> login -> empréstimo -> consulta -> devolução com duas contas. Conferir limite, exemplar indisponível, titularidade, devolução repetida e persistência após reiniciar a API. Usar o restante para correções e roteiro; congelar funcionalidades.

**Aceite de 25/11:** login e saída utilizáveis localmente e escrita do acervo protegida no servidor. Se houver atraso, priorizar autenticação do fluxo de empréstimo e manter escrita administrativa protegida ou desabilitada até corrigir a autorização; nunca deixar escrita desprotegida para ganhar tempo.

**Aceite de 28/11:** conseguir emprestar e devolver pela interface, com dados persistidos e regras testadas. Congelar novas funcionalidades. A previsão de 21 h inclui estudo e testes e continua apertada; o início de 29/11 é a margem de recuperação, sem acrescentar extras.

**Critério para contingência:** se o núcleo atrasar, usar até 3 h de 29/11 para concluir a ligação mínima da UI e validar a execução local. Reduzir a instalação em outra máquina a uma conferência local das instruções. Preservar empréstimo/devolução e os três ensaios. Persistindo o bloqueio, registrar exatamente o que funciona na UI, na API e no domínio e consultar o professor sobre a entrega parcial; somente catálogo e CRUD não demonstram o objetivo de complexidade do enunciado.

## 29/11 a 01/12 - Instalação, correções e três ensaios (16 h)

- [ ] **Dom 29/11 (6 h)** - Reservar até 3 h para recuperação do núcleo ou conferência da instalação e dados locais, conforme o ponto de controle. Fazer o primeiro ensaio completo em 1 h. Usar 2 h para correções e README. Publicar as novas funções apenas se o fluxo local estiver estável e não houver bloqueios; configurar JWT_SECRET antes do deploy.
- [ ] **Seg 30/11 (5 h)** - Fazer o segundo ensaio e responder perguntas sobre POO, HTTP, autenticação, transações e testes. Revisar documentação da API e a correspondência entre a justificativa e o código apresentado. Preparar vídeo ou capturas como plano B e usar o restante para correções críticas.
- [ ] **Ter 01/12 (5 h)** - Fazer o terceiro ensaio, rodar a suíte completa, typechecks e build, conferir banco, materiais e instruções. Separar cópia do projeto e usar a margem restante para problemas críticos.

## 02/12 - Apresentação

- [ ] Conferir a inicialização local, os dados de demonstração e o plano B antes do horário da apresentação.
- [ ] Demonstrar cadastro, login, busca, empréstimo e devolução; mostrar uma tentativa inválida e explicar a regra que a bloqueia.
- [ ] Explicar o caminho de uma requisição, uma regra de negócio, uma transação e um teste.
- [ ] Apresentar o escopo efetivamente concluído e as limitações registradas.

## Marcos e critérios para reduzir o escopo

| Data | Marco e situação |
|---|---|
| Até 24/11 | Catálogo e cadastro online concluídos; login e JWT local testados; autorização e integração do front pendentes |
| 25/11 | Login, sessão, saída e proteção do acervo concluídos localmente; backend de circulação incorporado; cliente de empréstimos iniciado |
| 28/11 | Meta de fluxo de empréstimo/devolução demonstrável e congelamento de funcionalidades |
| 01/12 | Três ensaios, instalação conferida e materiais prontos |
| 02/12 | Apresentação |

Ao encerrar 25/11, restam 32 h previstas de 26/11 a 01/12: 16 h de integração, estudo e correções até 28/11 e 16 h de validação e preparação de 29/11 a 01/12. O backend recebido no merge substitui a implementação que estava agendada para 26 e 27/11. O plano não pressupõe horas adicionais.

Priorizar o fluxo autenticado com persistência e correção dos dados. Os itens retirados desta entrega não voltam ao planejamento antes da apresentação. A publicação completa online também não é condição para a demonstração local prevista no enunciado fornecido.

Preservar os três ensaios. Quando uma meta falhar, atualizar a previsão e o registro do escopo em vez de marcar a tarefa como concluída.

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
10. Como testar limite de empréstimos, prazo, multa e renovação sem esperar dias? Quais regras já estão na API e quais ainda não têm interface?
11. O que persiste ao reiniciar a API? Qual é o efeito de db:reset?
12. Como a hierarquia de usuários representa herança e diferenças de permissão?
13. Como classes, métodos, herança e interfaces resolvem problemas concretos nesta versão? Localizar os exemplos no código.
14. Qual teste demonstra uma regra e qual demonstra o fluxo HTTP?
15. Quais funcionalidades foram adiadas e por quê?

**Meta da explicação:** apresentar cinco arquivos reais e rastrear uma operação de empréstimo da UI ao SQLite, um cadastro inválido e uma regra de negócio bloqueando uma operação, com seu teste. Distinguir o projeto completo em `info/requisitos_sistema_biblioteca.md` do recorte desta apresentação. Não apresentar código de domínio isolado como funcionalidade disponível na interface.

**Prazo vigente de apresentação: 02/12/2026. Preparação concluída até 01/12/2026.**
