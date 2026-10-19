import { porId } from "./dom";

function iniciarCatalogo(): void {
  // seleciona os elementos da página do acervo e guarda as referências
  const searchInput = porId<HTMLInputElement>("catalogSearchInput"); // campo de texto da busca
  const searchForm = porId<HTMLFormElement>("catalogSearchForm"); // formulário que envolve a busca
  const catalogGrid = porId("catalogGrid"); // grid onde os livros são exibidos
  const catalogEmpty = porId("catalogEmpty"); // mensagem de "nenhum resultado"
  const catalogStatus = porId("catalogStatus"); // status da busca
  const catalogCount = porId("catalogCount"); // contador de livros listados

  if (!searchInput || !catalogGrid || !catalogEmpty || !catalogStatus || !catalogCount) return;

  // converte os cards dentro do grid em um array
  const books = Array.from(catalogGrid.querySelectorAll<HTMLElement>(".catalog-book"));

  // ignorar maiúsculas/minúsculas, acentos e espaços extras
  function normalizeText(value: string): string {
    return value
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  // para ISBN, ignora hífens e espaços digitados pela pessoa
  function normalizeIsbn(value: string): string {
    return value.replace(/[^0-9Xx]/g, "").toLowerCase();
  }

  function filterBooks(): void {
    const query = searchInput!.value.trim(); // texto do usuário sem espaços nas pontas
    const normalizedQuery = normalizeText(query);
    const normalizedIsbnQuery = normalizeIsbn(query);
    let visibleCount = 0; // quantos livros atenderam o critério

    books.forEach((book) => {
      const title = normalizeText(book.dataset.titulo ?? "");
      const autor = normalizeText(book.dataset.autor ?? "");
      const isbn = normalizeIsbn(book.dataset.isbn ?? "");

      const matches =
        !normalizedQuery || // busca vazia -> mostra tudo
        title.includes(normalizedQuery) || // contido no título
        autor.includes(normalizedQuery) || // contido no autor
        (normalizedIsbnQuery.length > 0 && isbn.includes(normalizedIsbnQuery)); // contido no ISBN

      book.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    const hasQuery = query.length > 0;
    const hasResults = visibleCount > 0;

    catalogGrid!.hidden = !hasResults; // sem resultado, esconde o grid

    // "Nenhum resultado" só aparece quando há busca E nenhum livro encontrado
    catalogEmpty!.hidden = hasResults || !hasQuery;
    catalogCount!.textContent = `${visibleCount} ${visibleCount === 1 ? "livro" : "livros"}`;

    if (!hasQuery) {
      catalogStatus!.textContent = `Exibindo todos os ${visibleCount} livros do catálogo.`;
    } else if (hasResults) {
      catalogStatus!.textContent = `${visibleCount} ${
        visibleCount === 1 ? "resultado encontrado" : "resultados encontrados"
      } para “${query}”.`;
    } else {
      catalogStatus!.textContent = `Nenhum resultado encontrado para “${query}”.`;
    }
  }

  // a página inicial envia o termo pela URL (?q=...)
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") ?? "";
  searchInput.value = initialQuery;

  // evita recarregar a página ao pressionar Enter no acervo
  searchForm?.addEventListener("submit", (event) => event.preventDefault());

  // atualiza os resultados enquanto a pessoa digita
  searchInput.addEventListener("input", filterBooks);

  filterBooks();

  if (initialQuery) {
    searchInput.focus();
    searchInput.setSelectionRange(initialQuery.length, initialQuery.length);
  }
}

iniciarCatalogo();