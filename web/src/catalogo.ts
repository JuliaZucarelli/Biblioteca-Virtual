import { porId } from "./dom";
import { listarLivros } from "./api";
import type { LivroResumo } from "./api";

// função que recebe um livro e monsta a estrutura em memoria
function criarCardLivro(livro: LivroResumo): HTMLElement {
  const card = document.createElement("article")
  card.className = "book-card catalog-book"

  // acessar atributos personalizados -> guardam informações no elemento, mas não produzem texto visível 
  card.dataset.titulo = livro.titulo
  card.dataset.autor = livro.autor
  card.dataset.isbn = livro.isbn

  // corpo do card
  const corpo = document.createElement("div")
  corpo.className = "book-card__body"

  // título do card
  const titulo = document.createElement("h3")
  titulo.className = "book-card__title"
  titulo.textContent = livro.titulo

  // informações gerais do card
  const informacoes = document.createElement("p")
  informacoes.className = "book-card__meta"
  informacoes.textContent = `${livro.autor} • ${livro.ano}`

  // disponibilidade do card
  const disponibilidade = document.createElement("p")
  disponibilidade.className = "book-card__meta"

  if(livro.disponiveis > 0) {
    disponibilidade.textContent = `${livro.disponiveis} disponíveis / ${livro.total} total`
  } else {
    disponibilidade.textContent = "Indisponível"
  }

  // capa do card
  const capa = document.createElement("div")
  capa.className = "book-card__cover"

  const imagem = document.createElement("img")
  imagem.src = livro.capa
  imagem.alt = `Capa do livro ${livro.titulo}`
  imagem.loading = "lazy"

  corpo.append(titulo, informacoes, disponibilidade)
  card.append(capa, corpo)
  capa.append(imagem)

  return card
}

function iniciarCatalogo(): void {
  // seleciona os elementos da página do acervo e guarda as referências
  const searchInput = porId<HTMLInputElement>("catalogSearchInput"); // campo de texto da busca
  const searchForm = porId<HTMLFormElement>("catalogSearchForm"); // formulário que envolve a busca
  const catalogGrid = porId("catalogGrid"); // grid onde os livros são exibidos
  const catalogEmpty = porId("catalogEmpty"); // mensagem de "nenhum resultado"
  const catalogStatus = porId("catalogStatus"); // status da busca
  const catalogCount = porId("catalogCount"); // contador de livros listados

  if (!searchInput || !catalogGrid || !catalogEmpty || !catalogStatus || !catalogCount) return;

  // reconhecer os cards recebidos da API -> se procurar antes da resposta sempre vai retornar uma lista vazia 
  let books: HTMLElement[] = []

  // garante que a consulta só aconteça nas páginas que possuem elementos do catálogo
  listarLivros()
  // recebe a lista quando a consulta funciona -> cria o card
  .then((livros) => {
  console.log("Livros recebidos da API:", livros);

  for (const livro of livros) {
    const card = criarCardLivro(livro);
    catalogGrid.append(card);
  }

  // buscar elementos que entram na página
  books = Array.from(
    catalogGrid.querySelectorAll<HTMLElement>(".catalog-book")
  );

  filterBooks();
  })

  // recebe uma falha
  .catch((erro: unknown) => {
    console.log("Erro ao consultar os livros:", erro)
  })



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

  function filterBooks() : void {

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