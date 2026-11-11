# Justificativa de Programação Orientada a Objetos

## 1. Objetivo da modelagem

A Biblioteca Virtual adota orientação a objetos para representar o acervo, os usuários, os empréstimos e as reservas, concentrando os dados e comportamentos que caracterizam cada parte do domínio.

A arquitetura proposta para o projeto completo organiza essas responsabilidades em entidades, serviços, repositórios, controllers e rotas. Este documento apresenta a justificativa dessa modelagem e os exemplos que orientam seu desenvolvimento. O andamento das implementações é acompanhado no cronograma.

## 2. Encapsulamento

### Estado dos exemplares

A classe `Exemplar` representa uma unidade de um livro e controla seu status. Operações como emprestar e devolver devem verificar o estado anterior antes de realizar a mudança. Um exemplar disponível pode ser emprestado, e a devolução exige que ele esteja emprestado.

O atributo de estado é protegido e consultado por um getter. A disponibilidade é calculada a partir do status, evitando manter dois valores independentes para a mesma informação.

### Datas e situação dos empréstimos

A classe `Emprestimo` representa o vínculo entre usuário e exemplar, com data de empréstimo, vencimento, devolução e número de renovações. A proteção desses atributos permite controlar o encerramento e a alteração de prazo.

As datas devem ser copiadas ao entrar e sair da entidade, pois objetos Date são mutáveis. O cálculo de atraso utiliza o vencimento e a data de referência ou de devolução.

O serviço coordena as condições que dependem de outros objetos, como o limite de empréstimos ativos do usuário e a existência de reservas. A entidade mantém os dados e as operações sobre seu próprio estado.

## 3. Abstração e divisão de responsabilidades

Os serviços oferecem operações do domínio e coordenam as entidades envolvidas.

- `ServicoAcervo` organiza cadastro, consulta, alteração e exclusão de livros e exemplares, incluindo unicidade e impedimentos de exclusão.
- `ServicoEmprestimos` coordena empréstimo, devolução, renovação, limite por usuário, prazo e multa.
- O serviço de reservas coordena a fila, o cancelamento e o atendimento das solicitações.
- O serviço de autenticação coordena cadastro, verificação de credenciais e identificação do usuário.

O controller recebe parâmetros e corpo HTTP, chama o serviço e constrói a resposta. O repositório executa o acesso aos dados. Essa divisão permite identificar onde uma regra deve ser aplicada e reutilizá-la nas diferentes entradas da aplicação.

Por exemplo, o limite de três empréstimos pertence ao serviço. A interface chama a API e apresenta a mensagem correspondente quando a operação é recusada.

## 4. Interfaces e polimorfismo

### Contratos de persistência

`RepositorioAcervo` define as operações necessárias para acessar livros e exemplares. `RepositorioMemoria` e `RepositorioSQLite` atendem ao mesmo contrato, oferecendo formas distintas de armazenamento.

O serviço recebe a interface e utiliza suas operações. Essa substituição de uma implementação por outra exemplifica polimorfismo por interface e permite executar os mesmos cenários com memória e SQLite.

A mesma organização orienta a persistência de usuários, empréstimos e reservas. O contrato descreve o comportamento necessário, enquanto a implementação concentra os detalhes do banco.

### Estratégias de busca

O projeto completo prevê a interface `SearchStrategy` com duas implementações.

- `ExactMatchStrategy` realiza correspondência exata sobre o campo pesquisado, com a normalização pertinente.
- `RankedTextStrategy` calcula relevância para correspondências textuais, atribuindo maior peso ao título, depois ao autor e à sinopse.

O componente de busca recebe a estratégia e executa sua operação. A escolha do modo de pesquisa altera o objeto utilizado, mantendo um contrato comum para produzir resultados. O padrão Strategy organiza algoritmos que variam de acordo com a escolha do usuário.

## 5. Composição de filtros com Specification

Uma interface `Specification<Livro>` representa um critério que um livro pode atender. Specifications de gênero e disponibilidade encapsulam verificações individuais.

`AndSpecification` exige o atendimento simultâneo de critérios. `OrSpecification` aceita o atendimento de pelo menos um deles. A composição permite expressar consultas como livros do gênero Romance que tenham exemplares disponíveis.

Esse modelo permite testar cada condição isoladamente e verificar sua combinação. A busca fornece os candidatos, a estratégia define a correspondência ou pontuação, e os filtros restringem os resultados de acordo com as opções selecionadas.

## 6. Herança na modelagem de usuários e erros

A hierarquia `Usuario -> AdminUser / RegularUser` representa tipos de usuário que compartilham identidade e dados comuns e diferem nas permissões administrativas. Os comportamentos de permissão devem ser utilizados pela autorização da API.

Uma referência ao tipo Usuario pode representar um membro ou administrador e consultar o comportamento de permissão correspondente. O papel também deve ser persistido para reconstruir essa identidade durante o acesso.

As classes `ErroValidacao`, `ErroNaoEncontrado` e `ErroConflito` especializam Error. O tratamento HTTP reconhece essas categorias e produz as respostas adequadas, preservando uma forma comum de representar falhas.

## 7. Associações e composição de objetos

Livro representa o registro bibliográfico. Exemplar representa uma unidade vinculada ao livro. Um usuário pode possuir vários empréstimos ao longo do tempo, e cada empréstimo se refere a um exemplar. Reserva associa usuário e livro.

Essas relações são representadas por identificadores, coleções e chaves estrangeiras. O acervo organiza livros e exemplares e controla a coerência de seus vínculos.

Na arquitetura, a aplicação é montada com objetos colaboradores. O controller utiliza um serviço, que utiliza repositórios. Specifications compostas também mantêm referências a outros critérios. Essa composição permite combinar comportamentos com responsabilidades delimitadas.

## 8. Injeção de dependência

A montagem da aplicação fornece aos objetos os colaboradores de que precisam. Em `criarApp(repositorio)`, o armazenamento é recebido por parâmetro e fornecido ao serviço. O controller recebe o serviço.

O serviço de empréstimos recebe também uma função de relógio. Na execução normal ela representa o tempo atual. Nos testes, fornece datas controladas.

Essas dependências explícitas permitem escolher o armazenamento, controlar o tempo e simular falhas para verificar regras sem depender de uma configuração única.

## 9. Consistência e persistência

A orientação a objetos organiza as regras e as transições. O banco relacional reforça vínculos, unicidade e integridade dos registros. Transações devem agrupar operações que precisam ocorrer juntas, como criar um empréstimo e atualizar o exemplar.

As regras de autorização, disponibilidade e atendimento da fila devem ser verificadas na operação do serviço. O repositório realiza a gravação consistente e permite reconstruir os objetos nas consultas seguintes.

O retorno de Promise nos contratos oferece uma interface uniforme aos chamadores. A implementação com better-sqlite3 realiza consultas síncronas, característica que deve ser considerada no funcionamento do servidor.

## 10. Testabilidade

A organização permite verificar o projeto em diferentes níveis.

| Nível | Exemplos de verificação |
|---|---|
| Entidades | Transições de status, datas e encerramento de empréstimo |
| Serviços | Limite de três empréstimos, renovação, multa e fila de reservas |
| Estratégias | Correspondência exata e ordenação por relevância |
| Specifications | Critérios individuais e combinações E/OU |
| Repositórios | Leitura, escrita, unicidade, relacionamentos e persistência |
| API | Validação, status HTTP, autenticação e autorização |
| Fluxo integrado | Cadastro, login, busca, empréstimo, renovação e devolução |

Com um relógio controlado, cinco dias de atraso devem produzir multa de R$ 2,50, considerando R$ 0,50 por dia. Com repositórios intercambiáveis, os mesmos cenários podem verificar a consistência do comportamento em memória e SQLite.

## 11. Relação entre conceitos e objetivos do sistema

| Conceito | Aplicação na modelagem | Benefício |
|---|---|---|
| Encapsulamento | Estado de Exemplar e datas de Emprestimo | Controlar alterações e preservar invariantes |
| Abstração | Serviços de acervo, empréstimos, reservas e autenticação | Oferecer operações com responsabilidade definida |
| Interfaces e polimorfismo | Repositórios e estratégias de busca | Substituir implementações por um contrato comum |
| Herança | Tipos de usuário e categorias de erro | Compartilhar características e especializar comportamentos |
| Composição | Colaboradores da aplicação e specifications | Combinar comportamentos e critérios |
| Injeção de dependência | Repositório, estratégia e relógio recebidos por parâmetro | Configurar e testar colaboradores de forma explícita |

A escolha de POO está ligada às regras da biblioteca e às variações de comportamento do sistema. O projeto completo utiliza esses conceitos para organizar a persistência, controlar as operações dos usuários, combinar buscas e filtros e verificar as regras por testes.
