import { elementoFocado, porId } from "./dom";

/* ========== MODAL DO LIVRO ========== */

interface DadosLivro {
  genero: string;
  titulo: string;
  autor: string;
  ano: string;
  descricao: string;
  disponibilidade: string;
  capa: string;
}

interface ElementosModalLivro {
  overlay: HTMLElement;
  closeBtn: HTMLButtonElement;
  reserveBtn: HTMLButtonElement;
  cover: HTMLImageElement;
  genre: HTMLElement;
  title: HTMLElement;
  meta: HTMLElement;
  description: HTMLElement;
  availability: HTMLElement;
}

function lerElementosModalLivro(): ElementosModalLivro | null {
  const overlay = porId("bookOverlay");
  const closeBtn = porId<HTMLButtonElement>("closeBook");
  const reserveBtn =
    overlay?.querySelector<HTMLButtonElement>(".book-modal__reserve") ?? null;
  const cover = porId<HTMLImageElement>("modalCover");
  const genre = porId("modalGenre");
  const title = porId("modalTitle");
  const meta = porId("modalMeta");
  const description = porId("modalDescription");
  const availability = porId("modalAvailability");

  if (
    !overlay || !closeBtn || !reserveBtn || !cover ||
    !genre || !title || !meta || !description || !availability
  ) {
    return null;
  }

  return { overlay, closeBtn, reserveBtn, cover, genre, title, meta, description, availability };
}

/* Lê os dados do card: usa os data-* e, se faltar algum, cai no texto do próprio card */
function getBookData(card: HTMLElement): DadosLivro {
  const d = card.dataset;
  const img = card.querySelector<HTMLImageElement>(".book-card__cover img");
  const metaText = card.querySelector(".book-card__meta")?.textContent?.trim() ?? "";
  const [autorDom = "", anoDom = ""] = metaText.split("•").map((s) => s.trim());

  return {
    genero: d.genero || card.querySelector(".book-card__genre")?.textContent?.trim() || "",
    titulo: d.titulo || card.querySelector(".book-card__title")?.textContent?.trim() || "",
    autor: d.autor || autorDom,
    ano: d.ano || anoDom,
    descricao: d.descricao || "",
    disponibilidade:
      d.disponibilidade ||
      card.querySelector(".book-card__disponibilidade p")?.textContent?.trim() ||
      "",
    capa: img?.getAttribute("src") ?? "",
  };
}

function isAvailable(text: string): boolean {
  // "indisponível ..." ou "0 disponíveis ..." => indisponível
  return !/^\s*(indispon|0\s)/i.test(text);
}

function iniciarModalLivro(): void {
  const modal = lerElementosModalLivro();
  if (!modal) return; // página sem o modal do livro

  let lastFocused: HTMLElement | null = null;

  function openBook(card: HTMLElement): void {
    const book = getBookData(card);

    modal!.cover.src = book.capa;
    modal!.cover.alt = `capa do livro ${book.titulo}`;
    modal!.genre.textContent = book.genero;
    modal!.title.textContent = book.titulo;
    modal!.meta.textContent = [book.autor, book.ano].filter(Boolean).join(" • ");
    modal!.description.textContent = book.descricao;

    const available = isAvailable(book.disponibilidade);

    const dot = document.createElement("span");
    dot.className =
      "book-modal__dot " +
      (available ? "book-modal__dot--disponivel" : "book-modal__dot--indisponivel");

    const label = document.createElement("span");
    label.textContent = book.disponibilidade;

    modal!.availability.replaceChildren(dot, label);

    lastFocused = elementoFocado();
    modal!.overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    modal!.closeBtn.focus();
  }

  function closeBook(): void {
    modal!.overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    lastFocused?.focus();
  }

  /* Torna cada card clicável e acessível pelo teclado */
  document.querySelectorAll<HTMLElement>(".book-card").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    card.addEventListener("click", () => openBook(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBook(card);
      }
    });
  });

  /* Fechar: botão, clique no fundo e tecla Esc */
  modal.closeBtn.addEventListener("click", closeBook);

  modal.overlay.addEventListener("click", (e) => {
    if (e.target === modal.overlay) closeBook();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.overlay.classList.contains("is-open")) closeBook();
  });

  /* Botão reservar (troque pela sua lógica depois) */
  modal.reserveBtn.addEventListener("click", () => {
    console.log("Reservar:", modal.title.textContent);
  });
}

/* ========== MODAL DE LOGIN ========== */

function iniciarLogin(): void {
  const loginOverlay = porId("loginOverlay");
  if (!loginOverlay) return; // página sem o modal de login

  const openBtn = document.querySelector<HTMLButtonElement>(".avatar--button"); // avatar da topbar
  const closeBtn = porId<HTMLButtonElement>("closeLogin");
  const form = porId<HTMLFormElement>("loginForm");
  const emailInput = porId<HTMLInputElement>("email");
  const passwordInput = porId<HTMLInputElement>("password");
  const errorEl = porId("loginError");
  const forgotBtn = document.querySelector<HTMLButtonElement>(".login-modal__Fpassword");

  if (!openBtn || !closeBtn || !form || !emailInput || !passwordInput || !errorEl || !forgotBtn) {
    console.warn(
      'Login: algum elemento do modal não foi encontrado (o <form> precisa de id="loginForm").',
    );
    return;
  }

  let lastFocused: HTMLElement | null = null;

  function openLogin(): void {
    lastFocused = elementoFocado();
    loginOverlay!.classList.add("is-open");
    document.body.classList.add("modal-open");
    emailInput!.focus();
  }

  function closeLogin(): void {
    loginOverlay!.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    form!.reset();
    errorEl!.textContent = "";
    lastFocused?.focus();
  }

  openBtn.addEventListener("click", openLogin);
  closeBtn.addEventListener("click", closeLogin);

  loginOverlay.addEventListener("click", (e) => {
    if (e.target === loginOverlay) closeLogin();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && loginOverlay.classList.contains("is-open")) closeLogin();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorEl.textContent = "Preencha e-mail e senha para entrar.";
      return;
    }

    errorEl.textContent = "";

    // TODO: trocar pela chamada de autenticação da API
    console.log("Login:", { email });
  });

  forgotBtn.addEventListener("click", () => {
    // TODO: fluxo de "esqueci minha senha"
    console.log("Esqueci minha senha");
  });
}

iniciarModalLivro();
iniciarLogin();