12//11 - Quinta-feira 
- teste de API se está funcionando 
- configurado o proxy do Vite
    - quando o front chamar /api/livros, o Vite encaminhará a requisição para a API na porta 3000. 
- cria interface que descreve um livro na resposta da API
- cria uma função que busca o livro e retorna uma lista de livros
    - faz requisição GET e converte o json em js 
- cria uma função em catalogo.ts que recebe um livro e monta uma estrutura em memória 
    - createElement: cria um elemento HTML
    - textContent: preenche seu texto 
    - append: coloca um elemento dentro de outro 
- insere informações do livro na função de criar catalogo 
- atualizar a lista de cards depois da resposta da API
    - sequência: 
        o js começa a executar
        solicita os livros a API
        continua executando enquanto aguarda resposta 
        a API responde e o .then() é executado 
        os cards são criados e inseridos na página
- existem duas listas diferentes no código: 
    - livros: objetos com dados recebidos da API
    - books: elementos HTML criados para representar esses livros
- books precisa ser preenchido depois que a API responder e os cards forem inseridos na página 
    - sequência:
        API responde 
        cria o card 
        insere na página 
        atualiza books 
        executa filterBooks()
- cria capa dos livros 
    - src: recebe o caminho enviado pela API 
    - alt: descreve a imagem para leitores de tela quando ela não puder ser exibida
    - loading = "lazy": permite adiar o carregamento das imagens que estão fora da área visível 
- adiciona disponibilidade dos livros
- normaliza o ISBN e faz verificações


13/11 - Sexta-feira
- clique para abrir o modal dos cards recebidos da API pela técnica de delegação de eventos
- mudança de localização das imagens para vite fazer carregamento correto das imagens de capa 
- testes de pesquisas no site e integração básica do catálogo concluída e validada localmente 
    - livros carregados pela API
    - capas e disponibilidade 
    - busca por título, autor e ISBN completo
    - pesquisa recebida pela URL
    - modal com detalhes do livro 
    - estados de carregamento, vazio e erro 