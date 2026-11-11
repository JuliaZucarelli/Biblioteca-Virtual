# Requisitos do Sistema Biblioteca Virtual

## 1. Objetivo e abrangência

A Biblioteca Virtual é uma aplicação web para consulta e administração de acervo, cadastro e autenticação de usuários e controle de empréstimos, devoluções, renovações, reservas e multas.

Este documento especifica o comportamento esperado do projeto completo. As prioridades de implementação, os prazos e o acompanhamento de execução são registrados no cronograma.

## 2. Atores

| Ator | Operações permitidas |
|---|---|
| Visitante | Consultar catálogo e detalhes, buscar, filtrar, cadastrar-se e acessar login |
| Membro autenticado | Consultar sua conta e histórico, emprestar, renovar, devolver, reservar e cancelar suas reservas |
| Administrador autenticado | Executar as operações de membro e administrar livros e exemplares |

A API deve verificar a identidade e o papel em cada operação protegida. A navegação deve apresentar as opções correspondentes ao acesso do usuário.

## 3. Requisitos funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF01 | Listar o acervo | Catálogo apresenta capa, título, autor e quantidade de exemplares disponíveis e totais com dados da API |
| RF02 | Consultar detalhes de livro | Usuário acessa sinopse, ISBN, ano, gênero e exemplares com seus status |
| RF03 | Pesquisar por título, autor ou ISBN | Pesquisa aplica normalização textual e de ISBN, mostrando resultados coerentes com o termo |
| RF04 | Selecionar busca exata ou por relevância | Modo exato compara o campo normalizado; relevância ordena correspondências com pesos de título > autor > sinopse |
| RF05 | Filtrar o acervo | Filtros de gênero e disponibilidade podem ser combinados e removidos com Limpar filtros |
| RF06 | Cadastrar usuário | Nome, e-mail e senha válidos geram um usuário persistido; e-mail repetido é rejeitado e a senha é armazenada com hash |
| RF07 | Autenticar e sair | Credenciais válidas retornam JWT; sair remove o token do cliente e encerra o acesso autenticado da interface |
| RF08 | Aplicar permissões | Operações sem autenticação válida retornam 401 e operações sem papel necessário retornam 403 |
| RF09 | Emprestar exemplar | Operação respeita limite, disponibilidade e prioridade de reserva, persistindo empréstimo e estado da unidade |
| RF10 | Consultar empréstimos do usuário | Tela apresenta ativos e encerrados, livro, datas, renovações, atraso e multa do titular autenticado |
| RF11 | Devolver exemplar | Devolução encerra empréstimo e libera a unidade para o atendimento conforme as reservas existentes |
| RF12 | Renovar empréstimo | Operação verifica titular, situação ativa, atraso, limite de renovações e reservas do livro |
| RF13 | Calcular multa | Valor considera os dias de atraso e fica fixado pela data de devolução |
| RF14 | Reservar livro indisponível | Reserva válida entra na fila do livro com posição consultável e impede duplicidade ativa do mesmo usuário |
| RF15 | Atender e cancelar reserva | Fila respeita ordem de solicitação; titular pode cancelar; empréstimo ao titular encerra sua reserva |
| RF16 | Cadastrar e alterar livro | Administrador informa dados bibliográficos válidos, com ISBN único e identificação estável |
| RF17 | Adicionar e excluir exemplar | Administrador vincula unidade a livro existente com tombo único; exclusão respeita vínculos e uso |
| RF18 | Excluir livro | Administrador pode excluir quando os exemplares, reservas e histórico permitirem a operação pelas regras de integridade |
| RF19 | Exibir estados da interface | Consultas e formulários informam carregamento, vazio, sucesso e erro, preservando mensagens compreensíveis |
| RF20 | Atualizar disponibilidade | Empréstimos e devoluções alteram a informação mostrada nas próximas consultas ao acervo |

## 4. Regras de negócio

### 4.1 Acervo e identificação

- RN01. Cada livro possui ID e ISBN únicos. Título, autor, ISBN, ano e gênero são obrigatórios. Sinopse e capa são opcionais.
- RN02. O ano deve ser inteiro positivo. O ISBN deve ser normalizado e validado pelo formato ISBN-10 ou ISBN-13, aceitando hífens e espaços na entrada.
- RN03. Cada exemplar pertence a um único livro e possui ID, código de tombo único e status. A unicidade de tombo ignora maiúsculas e minúsculas.
- RN04. Cadastrar um livro cria o registro bibliográfico. A adição de cada exemplar aumenta a quantidade de unidades do livro.
- RN05. Total e disponíveis são calculados pelos exemplares. Disponível é a unidade no estado DISPONIVEL. Os demais estados são EMPRESTADO, RESERVADO e INDISPONIVEL.
- RN06. Exclusão de livro ou exemplar deve ser bloqueada quando houver empréstimo ou reserva em andamento que dependa do recurso. Os vínculos com histórico devem ser preservados ou a exclusão deve ser recusada.
- RN07. Alterar os dados bibliográficos mantém o ID do livro e os vínculos de seus exemplares.

### 4.2 Busca e filtros

- RN08. A comparação textual ignora diferenças de caixa, acentos e espaços nas pontas. A comparação de ISBN ignora separadores e usa igualdade do identificador completo.
- RN09. Na busca exata, o termo deve corresponder integralmente ao campo textual selecionado ou ao ISBN normalizado.
- RN10. Na busca por relevância, correspondências em título têm peso maior que em autor, e correspondências em autor têm peso maior que em sinopse. Empates devem usar um critério estável, como título e ID.
- RN11. Filtros selecionados de gênero e disponibilidade devem ser aplicados conjuntamente aos resultados da busca. Limpar filtros remove essas restrições e atualiza os resultados.
- RN12. Consulta vazia apresenta o catálogo de acordo com os filtros ativos. Consulta sem correspondências informa que nenhum resultado foi encontrado.

### 4.3 Usuários e autenticação

- RN13. O e-mail é único, sem distinguir maiúsculas e minúsculas. O login exige usuário cadastrado e verificação da senha pelo hash.
- RN14. O projeto acadêmico adota o domínio exato admin.com para atribuição do papel ADMIN no cadastro. Os demais usuários recebem MEMBRO. A API determina e persiste esse papel.
- RN15. O cliente envia JWT em Authorization Bearer nas operações protegidas. A API valida o token e verifica as permissões.
- RN16. O membro consulta e altera somente seus próprios empréstimos e reservas. Escrita de livros e exemplares exige papel administrativo.

### 4.4 Empréstimo e devolução

- RN17. Cada usuário pode manter no máximo 3 empréstimos ativos. Uma operação rejeitada preserva o estado do exemplar e a quantidade de empréstimos.
- RN18. O prazo inicial é de 14 dias de calendário a partir da data do empréstimo.
- RN19. O empréstimo exige exemplar disponível e respeito à fila de reservas. A unidade passa a EMPRESTADO quando a operação é efetivada.
- RN20. A devolução exige empréstimo ativo do titular, registra a data e encerra a operação. Repetir a devolução deve gerar resposta de conflito.
- RN21. Empréstimo e alteração do exemplar devem ser gravados na mesma transação. Devolução e atendimento de reserva, quando aplicável, devem manter a mesma consistência.
- RN22. Tentativas simultâneas sobre uma unidade devem preservar a exclusividade do empréstimo e a integridade dos identificadores.

### 4.5 Renovação e multa

- RN23. Cada empréstimo admite até 2 renovações, desde que esteja ativo, sem atraso e sem reserva ativa para o livro.
- RN24. O novo vencimento é a data da renovação acrescida de 14 dias de calendário.
- RN25. O atraso corresponde aos dias de calendário após o vencimento, desconsiderando o horário. Na data de vencimento, a multa é zero.
- RN26. A multa é de R$ 0,50 por dia de atraso, calculada em centavos e exibida em reais. Cinco dias de atraso correspondem a R$ 2,50.
- RN27. Para empréstimo ativo, o valor considera a data de referência. Após devolução, considera a data registrada e permanece fixo. O sistema apresenta o valor devido para consulta.

### 4.6 Reserva e fila

- RN28. O membro pode reservar um livro quando não houver exemplar disponível. A reserva se refere ao livro, e cada usuário pode ter apenas uma reserva ativa por livro.
- RN29. A fila segue a ordem de criação das reservas, com desempate por identificador estável. O primeiro usuário ativo possui prioridade para o próximo exemplar liberado.
- RN30. Uma devolução mantém a prioridade da fila. Havendo reserva ativa, a unidade liberada deve ser direcionada ao atendimento do primeiro usuário, impedindo que outro membro a tome antes dele.
- RN31. O empréstimo efetivado ao titular encerra sua reserva como ATENDIDA. O titular pode cancelar uma reserva ativa, liberando a prioridade para o próximo usuário.
- RN32. Havendo mais de uma unidade liberada, o atendimento respeita a ordem da fila e a quantidade de unidades. O status RESERVADO identifica uma unidade destinada ao atendimento e impede empréstimo fora dessa prioridade.
- RN33. Reservar um livro indisponível registra a solicitação e a posição na fila. A quantidade de unidades disponíveis diminui ao emprestar ou destinar uma unidade ao atendimento de reserva.
- RN34. A efetivação do empréstimo ao titular da reserva continua sujeita ao limite de 3 empréstimos ativos. A reserva mantém a prioridade até ser atendida ou cancelada, sem prazo automático de expiração neste modelo.

## 5. Modelo de dados e relacionamentos

| Entidade | Dados principais |
|---|---|
| Usuario | id, nome, email, senha_hash, papel, criado_em |
| Livro | id, titulo, autor, isbn, ano, genero, sinopse, capa |
| Exemplar | id, livroId, codigo, status |
| Emprestimo | id, usuarioId, exemplarId, dataEmprestimo, dataVencimento, dataDevolucao, renovacoes |
| Reserva | id, usuarioId, livroId, criada_em, status |

Um livro possui vários exemplares. Um usuário possui vários empréstimos e reservas ao longo do tempo. Cada empréstimo vincula um usuário a um exemplar. Cada reserva vincula um usuário a um livro.

Disponibilidade, situação de atraso e multa são informações calculadas a partir dos registros. O atendimento da fila deve manter rastreável o vínculo entre o titular prioritário e a unidade destinada a ele.

## 6. Arquitetura e requisitos técnicos

| ID | Requisito | Forma de verificação |
|---|---|---|
| RT01 | TypeScript no front e no back | Verificação de tipos aprovada |
| RT02 | Front com Vite e API com Node.js e Express | Inicialização e consumo da API documentados |
| RT03 | Domínio orientado a objetos e serviços separados do HTTP | Entidades, contratos e responsabilidades verificáveis no código |
| RT04 | Persistência em SQLite | Dados preservados após reiniciar e integridade referencial validada |
| RT05 | Repositórios por interface | Implementações de memória e SQLite atendem ao contrato utilizado |
| RT06 | Estratégias de busca intercambiáveis | ExactMatchStrategy e RankedTextStrategy testadas com resultados esperados |
| RT07 | Filtros com Specification | Critérios individuais e combinações E/OU testados |
| RT08 | Herança e permissões de usuários | Usuario, AdminUser e RegularUser expressam comportamentos utilizados na autorização |
| RT09 | Validação no servidor e erros JSON | Entradas inválidas e conflitos produzem respostas consistentes |
| RT10 | Testes automatizados com Vitest e Supertest | Cobertura de regras, persistência, autenticação e fluxo HTTP |
| RT11 | Transações para operações relacionadas | Falhas parciais e tentativas concorrentes preservam os dados |
| RT12 | Execução reproduzível | README descreve dependências, configuração, banco e inicialização |

A API deve usar substantivos nos caminhos, métodos HTTP compatíveis com a operação e os status apropriados. Criações retornam 201 com Location, exclusões bem-sucedidas retornam 204, e os erros distinguem validação, autenticação, permissão, ausência de recurso e conflito.

O front deve usar a API como fonte do acervo e das operações. As instruções de execução devem distinguir a publicação dos arquivos estáticos da execução do servidor e do banco.

## 7. Interface e qualidade de uso

- Catálogo com campo de busca, seleção do modo de pesquisa, filtros de gênero e disponibilidade e ação de limpar filtros.
- Cards com capa, título, autor e disponibilidade, com acesso a sinopse, metadados e situação dos exemplares.
- Cadastro e login com validação e mensagens de sucesso ou erro.
- Conta, empréstimos e histórico com datas, situação, multa, renovação e devolução.
- Consulta das reservas com posição na fila e cancelamento.
- Administração de livros e exemplares com confirmação nas exclusões.
- Navegação por teclado, foco visível, rótulos nos formulários e layout utilizável em telas menores.
- Atualização visível dos estados de carregamento, vazio, erro e sucesso após as ações.

## 8. Critérios de aceite do projeto completo

1. Cadastrar um membro, autenticar e pesquisar livros nos modos exato e por relevância.
2. Combinar filtros, limpar a seleção e consultar detalhes e disponibilidade.
3. Emprestar, consultar, renovar e devolver, verificando os limites e as datas.
4. Demonstrar multa com datas controladas e persistência ao reiniciar a aplicação.
5. Reservar um livro indisponível, consultar posição, cancelar e verificar atendimento por ordem da fila.
6. Demonstrar que reserva ativa bloqueia renovação e que terceiros não ultrapassam a prioridade da unidade destinada ao titular.
7. Administrar livros e exemplares, verificando unicidade, vínculos e bloqueios de exclusão.
8. Demonstrar recusa de acesso sem autenticação, sem permissão ou a dados de outro usuário.
9. Executar testes de entidades, serviços, estratégias, specifications, repositórios e API.
10. Explicar encapsulamento, abstração, polimorfismo, herança e composição com exemplos da modelagem.

## 9. Limites funcionais

O projeto calcula e apresenta multas. Processamento de pagamentos, envio automático de notificações, recuperação de senha, integrações externas e prazo de expiração de reservas constituem possíveis ampliações, sujeitas a especificação própria.

As decisões de implementação e a distribuição das funcionalidades entre etapas devem seguir este documento e ser acompanhadas no cronograma.
