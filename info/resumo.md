# Resumo de desenvolvimento e estudo - Biblioteca Virtual

**Registro atualizado em 19/11/2026.**

Este documento reúne as alterações realizadas, o funcionamento de cada parte e os testes feitos durante o desenvolvimento guiado. As datas organizam o histórico de trabalho e estudo. O cronograma registra as entregas concluídas e as próximas tarefas.

## 1. Visão geral do que foi construído

A interface em TypeScript e Vite consulta a API REST em Express. A API utiliza serviços para aplicar regras e repositórios para consultar e gravar dados no SQLite.

```text
Navegador -> cliente HTTP -> rota -> controller -> serviço -> repositório -> SQLite
```

O catálogo já foi validado online. O cadastro de usuários foi validado localmente, incluindo o formulário em overlay. A publicação dessa nova versão de cadastro é o próximo passo de entrega. O formulário de login ainda tem comportamento simulado.

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

**Revisão identificada no código:** o primeiro bloco, que rejeita corpo sem estrutura de objeto, lança Error genérico. O middleware transforma erros genéricos em 500. Esse caso precisa usar a categoria de validação e receber teste para esperar 400. Os testes aprovados de senha curta e campo extra não cobrem esse ramo.

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

## 10. Situação antes do próximo commit e deploy

### Concluído

- [X] Catálogo, imagens, busca, modal e estados de interface conectados à API.
- [X] Publicação do catálogo em GitHub Pages e API no Render validada.
- [X] Hierarquia Usuario/AdminUser/RegularUser e atribuição de papel.
- [X] Cadastro com normalização, hash, SQLite, testes e POST /api/usuarios.
- [X] Cadastro pelo overlay da home e estrutura compartilhada de comportamento com o acervo.
- [X] Teste local de criação e duplicidade, testes automatizados e verificação de tipos/build registrados.

### Pendências e pontos de atenção

- [ ] Revisar o Error genérico do corpo inválido e testar a resposta 400 correspondente.
- [ ] Atualizar a apresentação dos endpoints em GET /api para incluir o cadastro, quando o módulo estiver montado.
- [ ] Publicar e validar esta nova versão do cadastro no Render e no GitHub Pages. Os testes online já concluídos referem-se ao catálogo.
- [ ] Implementar login, comparação de credenciais, emissão e validação de JWT.
- [ ] Aplicar a permissão administrativa e a titularidade dos dados nas rotas.
- [ ] Ligar a conta, o histórico e as operações de empréstimo à API e ao SQLite.
- [ ] Integrar devolução, renovação, multa e as demais funcionalidades do recorte acordado.
- [ ] Reavaliar as tarefas de estudo e os requisitos obrigatórios com o prazo da apresentação.

O formulário de login ainda apenas valida preenchimento e registra o e-mail no console. O botão de reservar também possui comportamento demonstrativo. A presença dos overlays e dos métodos de permissão não conclui esses fluxos.

O cabeçalho Location do cadastro é testado como endereço do usuário criado. A rota de consulta GET /api/usuarios/:id ainda requer definição e implementação conforme a autenticação e as regras de acesso.

## 11. Roteiro curto para estudar e explicar

1. Seguir um GET /api/livros desde a página até a consulta SQLite.
2. Explicar por que os cards precisam existir antes de atualizar books.
3. Comparar textContent com dataset.
4. Explicar a diferença entre acervo vazio, busca sem resultado e falha de comunicação.
5. Mostrar como VITE_API_URL é utilizada durante o build e por que o proxy local não atende a publicação.
6. Comparar Usuario, AdminUser e RegularUser e explicar o método de permissão.
7. Seguir POST /api/usuarios desde o overlay até a gravação do hash.
8. Explicar a diferença entre normalização de e-mail e preservação da senha.
9. Mostrar como o teste HTTP verifica 201, Location, dados públicos, 400 e 409.
10. Explicar quais funcionalidades já foram entregues e quais ainda dependem de autenticação e persistência.
