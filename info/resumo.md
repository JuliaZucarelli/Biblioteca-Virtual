# Resumo de desenvolvimento e estudo - Biblioteca Virtual

**Registro atualizado em 25/11/2026, ao encerrar o trabalho do dia.**

Este documento reúne as alterações realizadas, o funcionamento de cada parte e os testes feitos durante o desenvolvimento guiado. As datas organizam o histórico de trabalho e estudo. O cronograma registra as entregas concluídas e as próximas tarefas.

## 1. Visão geral do que foi construído

A interface em TypeScript e Vite consulta a API REST em Express. A API utiliza serviços para aplicar regras e repositórios para consultar e gravar dados no SQLite.

```text
Navegador -> cliente HTTP -> rota -> controller -> serviço -> repositório -> SQLite
```

O catálogo e o cadastro pelo overlay foram publicados e validados online. Até 25/11, login local, sessão na aba e saída da conta foram conectados ao front e conferidos; a escrita do acervo recebeu autenticação e autorização administrativa. O merge do colaborador incorporou circulação com SQLite e API autenticada. O cliente de empréstimos foi iniciado, mas falta conectá-lo ao catálogo e às telas de consulta e devolução. A publicação dessas novas funções permanece sem confirmação. As seções datadas de 24/11 preservam o estado histórico; a atualização de 25/11 está na seção 14.

## 2. Base anterior - domínio, banco e API do acervo

### Entidades e regras

- `Livro` representa os dados bibliográficos, incluindo título, autor, ISBN, ano, gênero, sinopse e capa.
- `Exemplar` representa uma unidade física vinculada a um livro, com tombo e status. O estado é alterado por operações como emprestar e devolver.
- `Acervo` organiza livros e exemplares em memória, verifica vínculos e tombos e oferece operações de consulta e escrita.
- `Emprestimo` protege datas e número de renovações e calcula a situação de atraso.
- `ServicoEmprestimos` aplica limite de 3 empréstimos, prazo de 14 dias, multa de 50 centavos por dia e até 2 renovações. Esse serviço ainda mantém empréstimos em memória e precisa ser integrado ao SQLite e à API.

### Banco e inicialização

`schema.ts` define as tabelas de livros, exemplares, usuários, empréstimos e reservas. A existência da tabela prepara a persistência; cada funcionalidade também precisa de serviço, repositório, rota e interface.

`abrirBanco()` abre o SQLite, ativa chaves estrangeiras e garante a criação das tabelas. `dados_inicias.ts` fornece os dados de 9 livros e 19 exemplares. `seed.ts` grava o acervo inicial numa transação quando a tabela de livros está vazia.

`server.ts` abre o banco, aplica o seed, monta os repositórios e inicia a escuta HTTP. `app.ts` monta o Express e suas rotas. Essa separação permite testar a aplicação com Supertest.

### Camadas do acervo

`RepositorioAcervo` define as operações de armazenamento. `RepositorioMemoria` e `RepositorioSQLite` implementam o contrato. `ServicoAcervo` coordena validação, ISBN único, contagens e impedimentos de exclusão.

O controller lê os dados HTTP e responde com status e JSON. As rotas associam os caminhos aos métodos do controller. Os middlewares tratam métodos não permitidos e convertem os erros conhecidos em respostas.

Em 05/11, a base passou por 277 testes em 9 arquivos. A API respondeu às consultas de saúde e acervo usando SQLite temporário.

## 3. Organização e documentação do projeto

Foram revisados o cronograma, os requisitos e a justificativa de POO. Os requisitos e a justificativa descrevem o projeto completo, incluindo o comportamento pretendido de usuários, empréstimos, reservas e busca avançada. O cronograma acompanha as prioridades e o recorte para a apresentação de 02/12.

Também foi elaborado um guia de API e SQLite em Markdown e PDF, com leitura por arquivos, rastreamentos, exercícios e 36 questões. O desenvolvimento passou a ser realizado em etapas pequenas, com explicação e conferência após cada alteração.

## 4. 12/11 - Integração do catálogo com a API

### Proxy do Vite

Em `web/vite.config.ts`, o proxy encaminha chamadas iniciadas em `/api` para `http://localhost:3000`.

No desenvolvimento, o navegador consulta o Vite, e o Vite encaminha o pedido ao Express. A configuração do proxy pertence ao ambiente de desenvolvimento.

### Cliente HTTP e formato dos dados

Em `web/src/api.ts`, `LivroResumo` descreve os dados recebidos para cada livro. `listarLivros()` faz GET, verifica `resposta.ok`, interpreta o JSON e devolve a lista.

O uso de `async` e `await` permite aguardar a resposta. Respostas HTTP de erro exigem verificação explícita porque fetch não rejeita automaticamente todos os status como 404 e 500.

As interfaces orientam o TypeScript. Elas não verificam automaticamente a estrutura do JSON em tempo de execução.

### Cards dinâmicos

Os cards fixos foram retirados de `catalogGrid` em `acervo.html`. A função `criarCardLivro()`, em `catalogo.ts`, passou a construir cada card com os dados da API.

- `document.createElement()` cria um elemento.
- `className` associa as classes de estilo.
- `textContent` preenche texto.
- `append()` insere elementos na estrutura.
- `return card` devolve o elemento montado para inserção no catálogo.

Cada card apresenta título, autor, ano, capa e disponibilidade. Os números de exemplares vêm do servidor. Se disponíveis for zero, a interface apresenta Indisponível.

### Diferença entre livros e books

`livros` contém os objetos recebidos da API. `books` contém referências aos elementos HTML que representam esses objetos.

```text
API responde
-> criar os cards
-> inserir os cards na página
-> atualizar books
-> executar filterBooks()
```

A consulta inicial aos cards foi substituída por uma lista que é atualizada depois da resposta. Um array criado antes da inserção permaneceria vazio, pois não acompanha automaticamente os elementos adicionados depois.

### Dataset e pesquisa

Cada card recebe `data-titulo`, `data-autor` e `data-isbn`. A busca lê esses atributos por `dataset`. O texto visível do título é preenchido por textContent; a informação consultada pela busca é preenchida no dataset.

A normalização textual remove diferenças de caixa, acentos e espaços externos. Título e autor aceitam ocorrência parcial. O ISBN é normalizado e comparado por igualdade do identificador completo.

`URLSearchParams` lê o termo em `?q=Noites`. O campo recebe esse valor e a pesquisa é aplicada depois que os cards chegam.

### Capas e estados de interface

A imagem recebe caminho, texto alternativo e `loading="lazy"`. O texto alternativo descreve a capa, e lazy permite adiar o carregamento de imagens fora da área visível.

Os estados foram diferenciados.

| Situação | Comportamento |
|---|---|
| Carregando | Mostrar a mensagem e manter a pesquisa desabilitada |
| Carregado | Exibir os cards, habilitar a pesquisa e atualizar a contagem |
| Acervo vazio | Informar que ainda não existem livros cadastrados |
| Pesquisa sem resultado | Informar ausência de correspondências e permitir mudar o termo |
| Erro | Mostrar mensagem de falha e manter a pesquisa desabilitada até nova carga |

O `.catch()` atualiza a mensagem quando a consulta falha. O carregamento deixou de ficar visível indefinidamente nesse cenário. O teste temporário com `slice(0, 0)` foi retirado, restaurando o processamento de todos os livros.

### Correções compreendidas durante a etapa

Foram corrigidos a atribuição da classe ao elemento errado, a ausência de append para título e informações, o fechamento de filterBooks e a duplicação das condições que sobrescreviam as mensagens.

A mensagem de diagnóstico inicial mostrava zero cards porque era emitida antes da API responder. Depois da carga e da pesquisa por Noites, o diagnóstico mostrou 9 cards reconhecidos e 1 resultado.

## 5. 13/11 - Modal, imagens e publicação

### Delegação de eventos no modal

O código anterior associava cliques apenas aos cards existentes na inicialização. Os cards recebidos posteriormente pela API ficavam fora dessa associação.

O clique passou a ser escutado no document. `evento.target` identifica o elemento clicado, e `closest(".book-card")` encontra seu card. O registro ficou fora do forEach para existir mesmo quando a página começa sem cards.

Os atributos de gênero, ano, descrição e disponibilidade foram preenchidos no card para o modal consultar os dados. `sinopse` da API alimenta `dataset.descricao`, conforme o nome esperado pelo modal.

A abertura dos cards pelo teclado foi adiada por escolha da usuária. O clique e a exibição dos detalhes foram testados. O fechamento por Escape continua no comportamento dos overlays.

### Imagens na versão de produção

As capas e os demais arquivos de imagem foram copiados para `web/public/img`. O Vite copia essa pasta para `dist/img`, mantendo caminhos previsíveis para arquivos referenciados dinamicamente.

O caminho da capa usa `import.meta.env.BASE_URL` junto ao valor recebido da API, removendo a barra inicial desse valor.

Nos HTML, os caminhos foram padronizados para `./img/...`. A investigação de um 404 mostrou uma imagem sendo solicitada fora da pasta Biblioteca-Virtual. Após a correção e a atualização da publicação, a logo e os ícones voltaram a aparecer.

### GitHub Pages e Render

O workflow `.github/workflows/deploy-pages.yml` instala as dependências do front, executa o build e publica `web/dist` a partir da main.

A API foi hospedada como Web Service gratuito no Render, usando a pasta server, Node 22, o comando de build `npm ci --include=dev && npm run typecheck` e o comando de inicialização `npm start`.

Foram conferidos os endereços públicos.

- [Interface publicada no GitHub Pages](https://juliazucarelli.github.io/Biblioteca-Virtual/)
- [Saúde da API no Render](https://biblioteca-virtual-lcrv.onrender.com/api/saude)
- [Livros da API no Render](https://biblioteca-virtual-lcrv.onrender.com/api/livros)

A variável de repositório `VITE_API_URL` foi cadastrada no GitHub e passada ao build pelo workflow. O cliente HTTP utiliza esse endereço na publicação e o proxy local quando a variável não está definida.

```text
GitHub Pages -> arquivos HTML, CSS, JavaScript e imagens
Render -> servidor Express e SQLite
```

O catálogo, a pesquisa e o modal foram conferidos no site online. O SQLite no plano gratuito pode perder os dados em reinicializações, suspensão ou republicação. A conexão online funcionando não garante retenção durável dos cadastros nesse plano.

## 6. 15 a 17/11 - Modelagem e persistência dos usuários

### Hierarquia de classes

`Usuario` é uma classe abstrata com ID, nome, e-mail, papel e o contrato `podeAdministrarAcervo()`. Seu construtor valida campos obrigatórios e normaliza nome e e-mail.

- `abstract` define a base e os comportamentos exigidos das classes filhas.
- `protected` permite que os construtores das filhas chamem super.
- `readonly` impede reatribuição desses campos pelo código TypeScript.
- `super()` executa a preparação dos dados comuns.
- `AdminUser` define ADMIN e retorna true na consulta de permissão.
- `RegularUser` define MEMBRO e retorna false.

As duas subclasses oferecem comportamentos diferentes pelo mesmo contrato, exemplificando herança e polimorfismo. A utilização dessa permissão para proteger as rotas será feita na etapa de autenticação.

### Contrato e implementação SQLite

`RepositorioUsuarios` define obterPorEmail e salvar. `UsuarioComCredenciais` reúne o usuário e seu hash para uso interno.

`RepositorioUsuariosSQLite` recebe uma conexão Banco. A consulta usa parâmetro SQL, normaliza o e-mail e reconstrói AdminUser ou RegularUser a partir do papel salvo. A gravação insere ID, nome, e-mail, senha_hash e papel.

A coluna email possui UNIQUE com COLLATE NOCASE. O serviço consulta a existência antes de gravar, e o banco protege a unicidade na inserção. O repositório converte SQLITE_CONSTRAINT_UNIQUE em ErroConflito.

O teste de repositório atualmente salvo verifica gravação, consulta, classe reconstruída e recuperação do hash fictício. A duplicidade está coberta pelos testes de serviço e HTTP. Um teste direto da rejeição de e-mail repetido no repositório pode complementar essa cobertura.

## 7. 19/11 - Hash e validação do cadastro

### Hash de senha

Foi instalada `bcryptjs`, registrada em package.json e package-lock.json do server. Referência de estudo na [documentação de bcryptjs](https://github.com/dcodeIO/bcrypt.js).

`gerarHashSenha()`, em `services/senhas.ts`, verifica se a senha ultrapassa 72 bytes e produz o hash com custo 10. O custo define o esforço computacional. A biblioteca gera um salt aleatório, incorporado ao processo, por isso hashes da mesma senha podem ser diferentes.

A senha mantém o conteúdo digitado. O hash é armazenado na coluna senha_hash. A futura autenticação poderá usar bcrypt.compare para verificar a correspondência, sem recuperar a senha original.

Foram testados hash diferente da senha, correspondência correta, rejeição de senha diferente e limite de bytes. O teste com 37 repetições de `é` produz 74 bytes em UTF-8 e verifica a rejeição.

### Validação dos dados

`lerCadastro()`, em `validacao-usuarios.ts`, recebe unknown e verifica objeto, campos permitidos, nome, e-mail e senha. Os campos aceitos são nome, email e senha.

- O corpo deve ter estrutura de objeto.
- Campos extras, incluindo papel enviado pelo cliente, são rejeitados.
- Nome deve ser texto preenchido.
- E-mail deve ser texto, é normalizado e passa por uma expressão regular básica.
- A senha exige comprimento mínimo 8 pelo length do JavaScript.
- O limite máximo de bytes é conferido na função de hash.

Cada if identifica uma condição inválida e interrompe o processamento com uma exceção. O operador OU permite rejeitar por qualquer condição suficiente e evita executar métodos em valores de tipo errado.

**Correção posterior à revisão de 19/11:** o primeiro bloco, que rejeita corpo sem estrutura de objeto, foi alterado de Error genérico para ErroValidacao. O middleware pode, assim, responder 400 para essa entrada. O código salvo confirma a correção. Um teste HTTP específico para corpo que não seja objeto ainda pode complementar a cobertura.

## 8. 19/11 - Serviço, controller e rota de cadastro

### Serviço de usuários

`ServicoUsuarios` recebe RepositorioUsuarios pelo construtor. Seu método cadastrar executa a sequência abaixo.

```text
lerCadastro
-> consultar e-mail existente
-> gerar hash
-> gerar ID com randomUUID()
-> escolher AdminUser ou RegularUser
-> salvar usuário e hash
-> retornar usuário
```

O domínio exato admin.com recebe ADMIN, conforme a regra acadêmica do projeto. Os demais e-mails recebem MEMBRO. A escolha é feita depois da normalização e validação do e-mail.

randomUUID precisa ser chamado com parênteses para fornecer uma string. Referenciar apenas a função faz o identificador ter um tipo incompatível com o construtor.

O teste do serviço confere membro, dados normalizados e hash persistido; administrador e reconstrução do papel; e-mail repetido e preservação do cadastro original.

### Entrada HTTP

`UsuariosController` recebe req.body, chama o serviço e devolve 201 com Location e JSON de id, nome, email e papel. Senha e hash ficam fora da resposta.

`criarRotasUsuarios()` registra POST na raiz de seu agrupamento e utiliza metodoNaoPermitido para outros métodos. Em app.ts, o agrupamento é montado em /api/usuarios antes da resposta de rota inexistente.

criarApp recebe opcionalmente o repositório de usuários. Isso mantém os testes anteriores de acervo compatíveis. server.ts fornece os dois repositórios usando a mesma conexão SQLite.

A interpolação dos endereços utiliza crases e ${...}, sem barras invertidas que transformem a expressão em texto literal.

### Testes manuais e automatizados

O cadastro foi enviado por PowerShell com Invoke-WebRequest, POST, Content-Type application/json e corpo convertido com ConvertTo-Json.

Foram conferidos status 201, dados públicos, rejeição de e-mail repetido e manutenção do cadastro após parar e iniciar novamente a API local.

Supertest verifica a aplicação HTTP com banco temporário.

| Arquivo novo | Quantidade de testes salva | Comportamentos |
|---|---|---|
| usuario.test.ts | 3 | Papéis, permissão e normalização |
| repositorio-usuarios.test.ts | 1 | Gravação e consulta do membro e hash |
| senhas.test.ts | 3 | Correspondência, senha incorreta e limite de bytes |
| servico-usuarios.test.ts | 3 | Cadastro de membro, administrador e duplicidade |
| usuarios-api.test.ts | 4 | 201 e campos públicos/Location, 409, senha curta e papel extra |

A execução completa informada pela usuária passou em **291 testes de 14 arquivos**. O typecheck do server também passou. A quantidade considera os testes anteriores do acervo e empréstimos, mais os novos testes de usuários.

Durante a etapa foram corrigidos nome de arquivo fora do padrão .test.ts, arquivo vazio por falta de salvamento, expectativa membro em vez de MEMBRO, ausência de chamada de randomUUID e escape indevido na comparação de Location.

## 9. 19/11 - Cliente HTTP e overlay de cadastro

### Contratos e envio no front

Em `web/src/api.ts`, DadosCadastroUsuario descreve nome, email e senha enviados. UsuarioResumo descreve ID, nome, e-mail e papel recebidos.

`cadastrarUsuario()` usa VITE_API_URL, POST, cabeçalho JSON e JSON.stringify. Em resposta de erro, tenta ler a mensagem do servidor. Se o corpo não for JSON, utiliza uma alternativa de mensagem. Em sucesso, devolve os dados públicos.

### Escolha da interface

Foi criada inicialmente a página cadastro-usuario.html como estrutura de formulário. Depois, o fluxo escolhido passou a ser um overlay semelhante ao login. O formulário de cadastro de livros em cadastro.html mantém sua finalidade.

O overlay de cadastro e o botão Cadastre-se foram incluídos em index.html e acervo.html. O CSS existente de login foi reaproveitado para fundo, caixa, campos e botões.

### Abertura, retorno e fechamento

Dentro de iniciarLogin, os elementos de cadastro são procurados por ID e os eventos só são ligados quando os elementos necessários existem.

- Cadastre-se retira is-open do login e acrescenta a classe ao cadastro.
- Já tenho conta. Entrar faz o caminho inverso e foca o e-mail.
- O botão de fechar, o clique no fundo e Escape fecham o cadastro.
- A função de fechamento usa o comportamento do login para liberar a rolagem e restaurar o foco anterior.
- Botões de navegação usam type=button para evitar envio do formulário.
- O formulário possui rótulos, autocomplete, campos required, senha com minlength e região de mensagens.

### Envio e estados do formulário

O evento submit chama preventDefault para evitar o envio nativo e o recarregamento. O botão é desabilitado durante a consulta e a mensagem passa a Cadastrando.

```text
submit -> ler campos -> chamar cadastrarUsuario()
-> sucesso: limpar campos e informar criação
-> erro: mostrar mensagem e preservar campos
-> finally: reabilitar botão
```

O conteúdo da senha é enviado sem trim. Após sucesso, reset limpa também a senha. A interface utiliza textContent para apresentar as mensagens.

A consulta ao elemento pode retornar null. O if confere todos os elementos antes de usar .value. Uma repetição acidental da conferência de cadastroEmail foi corrigida para incluir cadastroSenha.

### Resultado da conferência local

A usuária confirmou criação de conta pelo overlay da home, mensagem de sucesso, limpeza dos campos e mensagem de e-mail duplicado. A troca entre os overlays também foi conferida no acervo. Typecheck e build do front terminaram sem erros após as alterações.

## 10. 23/11 - Login da API e emissão de JWT

### Conceito de JWT

JWT significa JSON Web Token. É um formato de token emitido após a autenticação. Ele possui três partes separadas por pontos.

```text
cabeçalho.conteúdo.assinatura
```

O cabeçalho identifica o algoritmo. O conteúdo, chamado payload, transporta os dados necessários à identificação. A assinatura permite conferir a origem esperada e a integridade do token. O conteúdo pode ser lido por quem possui o token, por isso os dados de senha e hash permanecem fora dele.

O fluxo pretendido da interface autenticada é o seguinte.

```text
E-mail e senha
-> API consulta o SQLite
-> bcrypt.compare verifica a senha
-> API emite token com validade
-> navegador envia Authorization: Bearer TOKEN nas operações protegidas
-> middleware verifica a identidade
-> autorização confere a permissão da operação
```

A emissão pelo back-end já foi implementada. O envio pelo formulário de login e o uso do token nas operações do front pertencem à próxima integração.

### ErroAutenticacao e resposta 401

Em `server/src/domain/erros.ts`, foi acrescentada a classe ErroAutenticacao, que estende Error e identifica as falhas de autenticação.

Em `server/src/middlewares/tratar-erros.ts`, foi adicionada a condição que reconhece essa classe e responde com status 401 e JSON no formato habitual de erro. O return encerra o tratamento daquela falha.

Essa mudança mantém a decisão de autenticação no serviço e a tradução para HTTP no middleware.

| Situação | Tratamento |
|---|---|
| Campos de login ausentes ou com tipo inválido | ErroValidacao, convertido em 400 |
| E-mail não cadastrado ou senha incorreta | ErroAutenticacao, convertido em 401 |
| Token ausente, inválido ou expirado | ErroAutenticacao na verificação, convertido em 401 |
| Usuário autenticado sem permissão administrativa | ErroPermissao é convertido em 403; a verificação do papel será aplicada pelo middleware de autorização |

### Validação da entrada de login

Foi criado `server/src/services/validacao-sessoes.ts`, com DadosLogin e a função lerLogin.

DadosLogin descreve os campos email e senha. lerLogin recebe unknown e verifica os dados antes de utilizá-los.

1. O primeiro if exige um objeto e rejeita null, listas e outros tipos.
2. O segundo obtém os nomes dos campos com Object.keys e usa some/includes para rejeitar propriedades extras. Os campos permitidos são email e senha.
3. O terceiro exige e-mail em texto e preenchido após trim.
4. O quarto exige senha em texto com comprimento maior que zero.
5. O retorno normaliza o e-mail com trim e toLowerCase e preserva a senha digitada.

O operador OU interrompe a avaliação quando encontra uma condição verdadeira. Por exemplo, se email não for string, a operação trim não é executada. Isso permite verificar o tipo antes de chamar seus métodos.

No login, o preenchimento e o tipo são conferidos nessa função. A correspondência com um usuário é verificada pelo serviço na consulta ao banco.

### ServicoSessoes e verificação das credenciais

Foi criado `server/src/services/servico-sessoes.ts`. O construtor recebe RepositorioUsuarios e ServicoTokens, fornecidos por injeção de dependência.

O método autenticar executa esta sequência.

```text
lerLogin(corpo)
-> obterPorEmail(email normalizado)
-> verificar existência e limite de bytes
-> bcrypt.compare(senha informada, hash salvo)
-> devolver o usuário ou lançar ErroAutenticacao
```

Se o usuário estiver ausente, a autenticação é rejeitada. bcrypt.truncates também rejeita senhas que excedem os 72 bytes suportados, evitando que uma parte da entrada seja ignorada na comparação.

bcrypt.compare devolve um booleano. Quando o resultado é false, o serviço lança o erro de autenticação. As rejeições utilizam a mesma mensagem, E-mail ou senha inválidos., sem informar qual credencial falhou.

O método criarSessao reaproveita autenticar. Após o sucesso, chama gerarToken e devolve um objeto com token e usuario. Se a autenticação falhar, a execução é interrompida antes da emissão.

### Dependências e ServicoTokens

Foram instalados jsonwebtoken como dependência de execução e @types/jsonwebtoken como dependência de desenvolvimento. Os registros ficam em package.json e package-lock.json do server.

Foi criado `server/src/services/servico-tokens.ts`, com a classe ServicoTokens. O construtor recebe a chave secreta e exige pelo menos 32 bytes, medidos por Buffer.byteLength.

O método gerarToken utiliza jwt.sign e configura os dados abaixo.

| Campo ou opção | Finalidade |
|---|---|
| papel | Papel obtido do usuário autenticado |
| algorithm = HS256 | Algoritmo utilizado para assinar |
| subject | ID do usuário, registrado como sub |
| expiresIn = 1h | Validade de uma hora |
| issuer = biblioteca-virtual | Identificação da API emissora |
| audience = biblioteca-virtual-web | Identificação do destinatário |
| iat e exp | Instante de emissão e expiração incluídos pela biblioteca conforme a configuração |

A assinatura usa a chave recebida pelo serviço. A verificação usa essa mesma chave e limita os algoritmos aceitos a HS256.

O método verificarToken chama jwt.verify para conferir assinatura, validade, emissor e destinatário. Depois valida se o conteúdo é um objeto, se sub é texto preenchido e se papel é ADMIN ou MEMBRO.

Quando tudo está correto, devolve a identidade simplificada com id e papel. As falhas de verificação da biblioteca são convertidas em ErroAutenticacao. As demais exceções são relançadas.

Na configuração de geração a opção é algorithm. Na configuração de verificação, algorithms recebe uma lista. Foi corrigido um erro de digitação em algorith que impedia a verificação de tipos.

### Configuração da chave no desenvolvimento

Foi preparado `server/.env`, com a variável JWT_SECRET. O valor privado da chave permanece fora deste resumo e do código versionado.

A chave foi gerada a partir de 32 bytes aleatórios, representados por 64 caracteres hexadecimais. A entrada .env no .gitignore já protege o arquivo contra inclusão automática em novos commits.

Em `server/package.json`, o comando dev passou a ser.

```text
tsx watch --env-file=.env src/server.ts
```

A opção env-file carrega a configuração antes de executar a aplicação. watch reinicia o servidor ao alterar arquivos monitorados.

Em `server/src/config/ambiente.ts`, lerSegredoJwt consulta process.env.JWT_SECRET, rejeita uma variável ausente ou vazia e devolve a chave. A validação ocorre quando a função é chamada. Os testes fornecem uma chave própria diretamente ao serviço.

O comando start continua sendo tsx src/server.ts. Na hospedagem, JWT_SECRET deve ser configurada no ambiente do Render antes de publicar esta versão, pois o arquivo local .env fica fora do repositório. A variável VITE_API_URL continua sendo a configuração pública do front, com finalidade diferente da chave de assinatura.

### Controller e rota de sessões

Foi criado `server/src/controllers/sessoes-controller.ts`. SessoesController recebe o serviço, utiliza req.body e chama criarSessao. Em sucesso, responde 201 com token e um objeto de usuário contendo apenas id, nome, email e papel.

Foi criado `server/src/routes/sessoes.routes.ts`. O router associa POST ao método criar do controller e utiliza metodoNaoPermitido para os demais métodos, seguindo o padrão da API.

```text
POST /api/sessoes
-> SessoesController.criar
-> ServicoSessoes.criarSessao
-> autenticar as credenciais
-> ServicoTokens.gerarToken
-> resposta 201 com token e dados públicos
```

O código do projeto usa o nome de arquivo sessoes-controller.ts, com hífen.

### Montagem da aplicação e inicialização

Em `server/src/app.ts`, criarApp passou a receber também tokens como terceiro parâmetro opcional.

- Com repositório de acervo, monta as rotas de livros.
- Com repositório de usuários, monta o cadastro em /api/usuarios.
- Com repositório de usuários e serviço de tokens, monta o login em /api/sessoes.

Esses registros ficam antes da resposta genérica de rota inexistente. Os parâmetros opcionais mantêm compatíveis os testes que montam apenas parte da aplicação.

Em `server/src/server.ts`, ServicoTokens é construído com lerSegredoJwt antes de abrir o banco. Depois é passado como terceiro argumento de criarApp. A chave e seu tamanho são conferidos durante a montagem do servidor.

Durante o teste local, a porta 3000 estava ocupada por outra execução da API. Após encerrar a execução anterior, npm run dev iniciou normalmente. A mensagem de rota não encontrada na raiz foi diferenciada da consulta correta a /api/saude.

### Testes manuais e de serviços em 23/11

Pelo PowerShell, foi enviado POST /api/sessoes com dados de um usuário local. O resultado confirmado foi status 201, dados públicos e presença de um token.

A resposta foi convertida com ConvertFrom-Json. Conferiu-se a existência do token sem publicar seu conteúdo. Outro pedido, com senha incorreta, retornou 401 e a mensagem de credenciais inválidas.

No serviço de sessões, foram confirmados quatro testes.

| Cenário | Verificação |
|---|---|
| E-mail e senha corretos | Normalização e recuperação do mesmo usuário cadastrado |
| Senha incorreta | Lançamento de ErroAutenticacao |
| E-mail ausente no banco | Lançamento de ErroAutenticacao |
| Criação de sessão | Token válido com ID e papel correspondentes ao cadastro |

No serviço de tokens, foram confirmados três testes.

| Cenário | Verificação |
|---|---|
| Geração de JWT | Assinatura verificável e campos sub, papel, iss, aud e exp |
| Leitura da identidade | Retorno de id e papel pelo verificarToken |
| Chave diferente | Rejeição da assinatura como ErroAutenticacao |

As chaves desses testes são fictícias e específicas do ambiente de teste. A biblioteca verifica a expiração no uso normal. Um cenário automatizado com relógio avançado para token expirado ainda pode complementar a cobertura.

## 11. 24/11 - Testes HTTP e middleware de autenticação

### Testes da rota de login

Foi criado `server/src/tests/sessoes-api.test.ts`, utilizando Supertest e SQLite em memória. O beforeEach monta a aplicação com repositórios e serviço de tokens. O afterEach fecha o banco.

Foram confirmados três cenários.

1. Cadastrar um usuário pela API e fazer login. A resposta deve ser 201, conter token e usuario, manter os dados públicos iguais aos retornados pelo cadastro e apresentar JWT verificável com o ID e papel corretos.
2. Enviar senha incorreta para um usuário existente. A resposta deve ser 401, com a mensagem genérica de credenciais inválidas.
3. Enviar o login sem senha. A resposta deve ser 400, com a mensagem de campo obrigatório.

A verificação de Object.keys confere os campos externos exatos da resposta de sucesso. A leitura do token confere o vínculo entre a identidade emitida e o usuário que acabou de entrar.

### Correções durante os testes HTTP

O teste foi inicialmente executado na raiz do projeto e não encontrou package.json. A execução foi ajustada para a pasta server.

O primeiro POST do teste recebeu 404 porque o registro de /api/usuarios havia sido retirado de app.ts ao incluir o login. O bloco de cadastro foi restaurado antes do registro de sessões e do tratamento de rota inexistente.

Em seguida, foi corrigida uma importação que repetia ServicoUsuarios duas vezes na mesma linha. Essa duplicação impedia o processamento do arquivo e a execução dos testes.

Depois das correções, a usuária confirmou a aprovação dos três testes HTTP.

### Middleware autenticar

Foi criado `server/src/middlewares/autenticar.ts`. A função recebe ServicoTokens e devolve um RequestHandler do Express.

O processamento é o seguinte.

```text
Ler Authorization
-> exigir formato Bearer TOKEN
-> capturar token
-> verificar assinatura, validade e conteúdo
-> guardar identidade em res.locals.usuario
-> chamar next()
```

req.get lê o cabeçalho. Quando ele está ausente, o código utiliza texto vazio. A expressão regular reconhece Bearer seguido de espaço e um token sem espaços. A captura de posição 1 contém o token.

Se o formato estiver ausente ou incorreto, o middleware lança ErroAutenticacao. Se a verificação do JWT falhar, a falha também é encaminhada ao tratamento de erros.

res.locals compartilha a identidade entre os middlewares e o controller daquela requisição. next permite continuar. next(erro) encaminha o problema ao middleware de erros.

### Testes do middleware

Foi criado `server/src/tests/autenticar.test.ts`. Ele monta uma aplicação pequena de teste com uma rota /protegida e registra autenticar antes do handler.

- Sem token, a rota deve responder 401.
- Com token válido, deve responder 200 e disponibilizar id e papel em res.locals.usuario.

Os dois testes passaram conforme a confirmação da usuária.

A rota /protegida pertence somente à aplicação do teste. O middleware ainda precisa ser conectado às rotas reais do projeto para protegê-las.

### Autenticação e autorização

Autenticação identifica o usuário a partir de credenciais ou de um token válido. Autorização decide se essa identidade pode executar uma operação.

Em 24/11, foi criada ErroPermissao em domain/erros.ts e acrescentado seu tratamento em middlewares/tratar-erros.ts. A usuária confirmou que a verificação de tipos terminou sem erros.

ErroPermissao estende Error, recebe a mensagem por super e identifica sua categoria pela propriedade name. Em tratarErros, instanceof reconhece essa categoria, res.status(403).json devolve a mensagem e return encerra o tratamento antes da resposta genérica 500.

Esse tratamento prepara a resposta para uma operação negada por falta de permissão. O middleware que verifica o papel administrativo, seus testes e a aplicação às rotas reais continuam pendentes.

A futura ordem das operações protegidas será.

```text
Requisição
-> autenticar o JWT
-> conferir permissão
-> executar a operação
```

A presença do campo papel no token permite consultar a categoria validada. A aplicação da permissão deve ocorrer no servidor.

### Registro dos testes novos

| Arquivo | Testes confirmados na execução direcionada |
|---|---|
| servico-sessoes.test.ts | 4 |
| servico-tokens.test.ts | 3 |
| sessoes-api.test.ts | 3 |
| autenticar.test.ts | 2 |

São 12 testes novos em quatro arquivos, confirmados nas execuções direcionadas durante as etapas de 23 e 24/11. A última execução completa registrada anteriormente teve 291 testes de 14 arquivos em 19/11. Uma nova execução completa deve ser registrada após integrar as proteções. Esta atualização do resumo foi feita pela leitura do código e pelos resultados relatados, sem executar novamente a suíte.

## 12. Situação consolidada em 24/11 — registro histórico

### Concluído

- [X] Catálogo, imagens, busca, modal e estados de interface conectados à API.
- [X] Publicação e validação online do catálogo.
- [X] Hierarquia Usuario/AdminUser/RegularUser e atribuição de papel.
- [X] Cadastro com hash, SQLite, testes e POST /api/usuarios.
- [X] Overlays de cadastro na home e no acervo.
- [X] Publicação e validação online do cadastro, com criação e rejeição de e-mail duplicado confirmadas pela usuária.
- [X] Correção da categoria de erro para corpo inválido no cadastro.
- [X] Validação de login e comparação de credenciais.
- [X] Geração e verificação de JWT com configuração local da chave.
- [X] POST /api/sessoes montado e conferido localmente.
- [X] Testes direcionados de sessões, tokens, rota HTTP e middleware de autenticação.
- [X] Middleware de autenticação funcionando na aplicação isolada de teste.

### Próximas tarefas

- [X] Acrescentar a classe ErroPermissao em domain/erros.ts, conforme a conferência final de 24/11.
- [X] Implementar o tratamento HTTP 403 para ErroPermissao e concluir o typecheck, conforme confirmação da usuária em 24/11.
- [ ] Implementar e testar a exigência de papel administrativo.
- [ ] Aplicar autenticação e autorização às rotas reais de escrita do acervo.
- [ ] Conectar o formulário de login do front a POST /api/sessoes e organizar o uso do token nas requisições.
- [ ] Implementar saída da conta e comportamento da navegação autenticada.
- [ ] Configurar JWT_SECRET no ambiente do Render antes do deploy desta versão. A inicialização agora exige essa configuração.
- [ ] Atualizar a apresentação de GET /api para incluir os módulos de cadastro e sessões montados.
- [ ] Conferir os testes complementares de expiração, token inválido e corpo inválido conforme a cobertura necessária.
- [ ] Rodar a suíte completa e registrar o resultado atualizado.
- [ ] Publicar e validar online o login e as proteções.
- [ ] Integrar empréstimos, devoluções, renovação e multa com SQLite, API e telas.
- [ ] Preparar o recorte funcional, os materiais e os ensaios para a apresentação.

No código do front, o formulário de login ainda valida o preenchimento e registra o e-mail no console. O botão de reservar também tem comportamento demonstrativo. Em app.ts, o middleware autenticar ainda não está aplicado às rotas de livros.

O cabeçalho Location do cadastro aponta para o identificador criado. A rota GET /api/usuarios/:id ainda depende da definição de consulta e de suas regras de acesso.

## 13. Roteiro curto para estudar e explicar

1. Seguir um GET /api/livros desde a página até a consulta SQLite.
2. Explicar por que os cards precisam existir antes de atualizar books.
3. Comparar textContent com dataset.
4. Diferenciar acervo vazio, pesquisa sem resultado e falha de comunicação.
5. Mostrar como VITE_API_URL é utilizada no build e qual é a função do proxy local.
6. Comparar Usuario, AdminUser e RegularUser e explicar o método de permissão.
7. Seguir POST /api/usuarios desde o overlay até a gravação do hash.
8. Explicar a normalização do e-mail e a preservação da senha.
9. Seguir POST /api/sessoes desde o controller até a comparação do bcrypt e a assinatura do JWT.
10. Explicar sub, papel, exp, issuer, audience e algoritmo do token.
11. Explicar como JWT_SECRET chega ao servidor e como as chaves dos testes são fornecidas.
12. Diferenciar 400, 401 e 403.
13. Explicar Authorization Bearer, res.locals.usuario, next e next(erro).
14. Mostrar um teste de login válido, um de senha incorreta e um de rota sem token.
15. Apontar as proteções já testadas e as integrações que ainda precisam ser realizadas.

## 14. Atualizações até 25/11 — autorização, merge, login no front e início dos empréstimos

### Proteção real da escrita do acervo

O middleware `middlewares/exigir-admin.ts` consulta `res.locals.usuario`. Sem identidade, encaminha ErroAutenticacao, convertido em 401; com papel diferente de ADMIN, encaminha ErroPermissao, convertido em 403. Com permissão, chama next para continuar. Foram confirmados os três testes do middleware: ausência de token, membro e administrador.

Em `routes/livros.routes.ts`, as seis operações de escrita receberam a sequência autenticarUsuario -> exigirAdmin -> controller: criar, substituir, atualizar e remover livro, adicionar e remover exemplar. GET/HEAD continuam públicos e o tratamento de métodos não permitidos permanece separado.

Em `app.ts`, autenticarAcervo é montado com o serviço de tokens e passado como segundo argumento de criarRotasLivros. Quando a aplicação é montada sem esse serviço, a escrita é bloqueada com erro de autenticação; as consultas públicas continuam disponíveis. Essa ligação corrigiu o erro de argumento faltando que ficou durante a implementação em partes.

Em `tests/api.test.ts`, as operações de escrita passaram a enviar um token de administrador. Inclusive cenários que esperam 400, 404 ou 409 precisam autenticar primeiro, para alcançar a validação ou regra que desejam testar. Foram acrescentados testes de cadastro sem token (401) e com membro (403), verificando também que nenhum livro foi incluído. Cada cenário roda com memória e SQLite. Os testes anteriores de cadastro autorizado já verificam 201.

### Integração recebida do colaborador

O merge trouxe `services/servico-circulacao.ts`, que coordena regras de empréstimo, devolução, renovação, multa e reservas. Ele depende da interface RepositorioEmprestimos, separando regras da tecnologia de armazenamento, e recebe um relógio substituível para testar datas sem esperar o tempo real.

`repositories/repositorio-emprestimos-sqlite.ts` consulta e grava empréstimos e reservas e reconstrói entidades a partir das linhas do banco. As transações agrupam alterações do empréstimo e do exemplar, com rollback em caso de falha. Os testes incorporados cobrem regras, HTTP, integridade e rollback. O teste descrito como reinício reconstrói serviço e repositório sobre a mesma conexão SQLite em memória; ele não substitui a conferência manual de fechar e abrir a API usando o arquivo do banco.

`controllers/emprestimos.controller.ts` recebe parâmetros HTTP, chama o serviço e monta respostas. `routes/emprestimos.routes.ts` registra criação, consulta, devolução e renovação, além das rotas de reservas. Essas operações recebem autenticação JWT. `usuario-da-requisicao.ts` recupera o identificador validado em res.locals; o serviço confere existência e titularidade, impedindo que uma pessoa manipule empréstimos de outra.

`server.ts` fornece o repositório SQLite de circulação a criarApp. O ServicoEmprestimos antigo em memória continua no projeto; o fluxo HTTP novo utiliza ServicoCirculacao. Não é necessário refazer a integração do backend que estava prevista para 26 e 27/11.

Reservas, renovação e multa passaram a existir também nesse backend. Suas telas continuam fora do recorte essencial, que permanece centrado em empréstimo e devolução. A pasta local `.integracao-emprestimos` foi identificada como repositório separado e a orientação foi ignorá-la no Git do projeto, preservando seu conteúdo.

### Login, sessão e saída na interface

Em `web/src/api.ts`, DadosLogin define e-mail e senha enviados e RespostaLogin define token e dados públicos recebidos. iniciarSessao faz POST /api/sessoes e transforma falhas HTTP em mensagens para o formulário. Em `script.ts`, o submit passou a ser assíncrono: impede recarregar a página, verifica campos, mostra Entrando..., aguarda a API e exibe sucesso ou erro. Após sucesso, limpa o campo de senha.

A sessão retornada é serializada com JSON.stringify e gravada em sessionStorage sob a chave biblioteca.sessao. A senha não é incluída nessa resposta. obterSessao lê o texto, usa JSON.parse e devolve sessão ou null; quando o JSON é inválido, remove o registro. A anotação de tipo não valida a estrutura em tempo de execução, e a leitura local não comprova a validade do token. Essa validação continua sendo da API.

Ao abrir o overlay, a interface recupera a sessão e mostra o nome conectado. A usuária confirmou a mensagem com o nome Luana. O armazenamento permanece ao recarregar e navegar entre páginas da mesma origem na aba, mas não prolonga o prazo de validade do JWT.

O botão sairConta foi acrescentado aos overlays da home e do acervo, com type=button para não enviar o formulário e hidden para controlar a visibilidade. O clique chama encerrarSessao, remove o registro, limpa o formulário, esconde o botão e mostra a mensagem de saída. Isso remove a cópia local do token; não revoga no servidor um JWT já emitido. Login, recuperação após recarregar e saída foram conferidos pela usuária.

Durante essa etapa, foi corrigida uma vírgula no fechamento do fetch e uma chave ausente no fechamento de iniciarLogin. Também ocorreu Failed to fetch; a rota local /api/saude foi conferida com status ok, e o fluxo de login e recuperação de sessão voltou a ser confirmado posteriormente.

### Cliente HTTP dos empréstimos — etapa iniciada

ExemplarResumo descreve a unidade, com id, livroId, código, status e disponibilidade. listarExemplares consulta a rota pública GET /api/livros/:id/exemplares. EmprestimoResumo descreve os campos usados inicialmente pela UI; a API devolve também outros campos.

emprestarExemplar recupera a sessão e recusa a solicitação quando ela está ausente. Envia POST /api/emprestimos com exemplarId no JSON e o token em Authorization: Bearer. A identidade do usuário vem do token. Em resposta 401, remove a sessão e pede novo login; nas demais falhas, tenta apresentar a mensagem da API. Em sucesso, devolve o empréstimo criado.

A usuária confirmou typecheck sem erros após essas funções. Ainda não houve confirmação de um empréstimo executado pelo botão da interface. O modal continua precisando transportar o ID do livro, consultar exemplares e chamar a função de empréstimo.

**Ajuste encontrado na leitura final, pendente para a retomada:** listarExemplares está usando `/api/livros${encodeURIComponent(livroId)}/exemplares`. Falta a barra entre livros e o identificador. O correto é `/api/livros/${encodeURIComponent(livroId)}/exemplares`. TypeScript não detecta esse erro de endereço. Nenhum código foi alterado nesta atualização documental.

### Verificações e limites do registro

- Após o merge, a execução observada teve 366 testes aprovados em 22 arquivos. O typecheck do backend apontou o argumento faltando durante a alteração das rotas; essa ligação foi corrigida depois.
- A suíte direcionada de api.test.ts teve 119 testes aprovados após incluir os tokens, com aviso de demora no encerramento interno do Vitest. Não houve falha de asserção nessa execução.
- Depois dos novos cenários 401 e 403, a usuária confirmou typecheck e suíte completa sem falhas; o total atualizado não foi informado.
- No front, a usuária confirmou os typechecks e os testes manuais de login, sessão e saída. O build aprovado observado após o merge precede essas últimas alterações e deve ser repetido na validação final.
- As funções de consulta de exemplares e solicitação de empréstimo tiveram apenas aprovação de tipos relatada; a URL pendente e a ausência de ligação à UI impedem marcar o fluxo como concluído.
- Esta atualização de documentação foi feita por leitura dos arquivos e resultados já registrados, sem nova execução da suíte.

### Ponto exato para retomar em 26/11

1. Corrigir a barra ausente na URL de listarExemplares.
2. Estudar como o card entrega o ID do livro ao modal.
3. Ligar o botão do catálogo à consulta de exemplares e a emprestarExemplar, com carregamento e mensagens.
4. Atualizar a disponibilidade exibida após sucesso.
5. Implementar lista dos próprios empréstimos e devolução na página existente.
6. Conferir o fluxo com duas contas, persistência após reiniciar a API e as regras de bloqueio; depois preparar os ensaios.
