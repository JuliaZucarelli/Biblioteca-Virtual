(() => {
    // seleciona elementos HTML pelo ID e guarda suas referências em constantes locais dentro de uma função anônima
    const searchInput = document.getElementById('catalogSearchInput') // campo de texto onde o usuário digita a busca
    const searchForm = document.getElementById('catalogSearchForm') // fórmulario que envelopa a busca
    const catalogGrid = document.getElementById('catalogGrid') // container/grid onde os itens ou livros estão sendo exibidos
    const catalogEmpty = document.getElementById('catalogEmpty') // mensagem exibida se nenhum resultado for encontrado
    const catalogStatus = document.getElementById('catalogStatus') // exibe o status de busca
    const catalogCount = document.getElementById('catalogCount') // contador que exibe a quantidade total de itens listados

    if (!searchInput || !catalogGrid || !catalogEmpty || !catalogStatus || !catalogCount) return 

    // converte todos os elementos que estão dentro do container 'catalagoGrid' e os converte em um array
    const books = Array.from(catalogGrid.querySelectorAll('.catalog-book'))

    // ignorar maiúscula/minúsculas, acentos e espaços extras
    function normalizeText(value) {
        return value
            .toLocaleLowerCase('pt-BR')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // para ISBN, ignora hífens e espaços digitados pela pessoa
    function normalizeIsbn(value) {
        return value.replace(/[^0-9Xx]/g, '').toLowerCase();
    }

    function filterBooks() {
        const query = searchInput.value.trim(); // recebe o texto do usuário e remove os espaços do início e fim
        const normalizedQuery = normalizeText(query); // prepara o termo a ser buscado em texto
        const normalizedIsbnQuery = normalizeIsbn(query); // prepara o termo para ser buscado
        let visibleCount = 0; // contador para registrar quantos livros atenderam o critério de busca

        // percorre a lista de livros e extrai os dados cadastrados
        books.forEach((book) => {
            const title = normalizeText(book.dataset.titulo || ''); // busca o atributo data-titulo do HTML
            const autor = normalizeText(book.dataset.autor || ''); // busca o elemento data-autor do HTML
            const isbn = normalizeIsbn(book.dataset.isbn || ''); // busca o elemento data-isbn do HTML

            const matches = !normalizedQuery || // busca vazia -> ! inverte para true e retorna toda a lista
                title.includes(normalizedQuery) || // verifica se está contido em qualquer parte do título
                autor.includes(normalizedQuery) || // verifica se está contido no nome do autor
                (normalizedIsbnQuery.length > 0 && isbn.includes(normalizedIsbnQuery));

                // se 'matches' for true (livro encontrado), '!matches' vira false -> book.hidden = false (livro aparece)
                // se 'matches' for false (não encontrou), '!matches' vira true -> book.hidden - true (livro não aparece)
                book.hidden = !matches;
                if(matches) visibleCount += 1;  
        });

        const hasQuery = query.length > 0; // variave que indica se o usuário digitou não
        const hasResults = visibleCount > 0; 
    
        catalogGrid.hidden = !hasResults; // se não houver resultado, esconder o grid
        
        /* a mensagem "Nenhum resultado" só aparecerá quando o usuário digitar algo na busca (hasQuery true) E esse termo
        não encontrar nenhum resultado (hasResults false) */
        catalogEmpty.hidden = hasResults || !hasQuery; // controla exibição da mensagem
        catalogCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'livro' : 'livros'}`;
        
        if (!hasQuery) { // busca vazia -> exibe todo os livros do catálogo
            catalogStatus.textContent = `Exibindo todos os ${visibleCount} livros do catálogo.`;
        } else if (hasResults) { // busca com resultado -> exibe os resultados encontrado
            catalogStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'resultado encontrado' : 'resultados encontrados'} para “${query}”.`;        
        } else { // busca sem resultado -> não exibe nenhum livro
            catalogStatus.textContent = `Nenhum resultado encontrado para “${query}”.`;
        }
    }

        // a página inicial envia o termo pelo URL
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        searchInput.value = initialQuery; // atribui o valor da URL ao campo de entrada de texto

        // evita recarregar a página ao presionar Enter no acervo
        searchForm?.addEventListener('submit', (event) => event.preventDefault());

        // atualiza os resultados imediatamente enquanto a pessoa digita 
        searchInput.addEventListener('input', filterBooks);

        filterBooks();

        if (initialQuery) {
            searchInput.focus();
            searchInput.setSelectionRange(initialQuery.length, initialQuery.length);
        }
    
})();