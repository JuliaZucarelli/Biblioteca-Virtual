import { elementoFocado, porId } from "./dom";
import { cadastrarUsuario, iniciarSessao, obterSessao, encerrarSessao, listarExemplares, emprestarExemplar } from "./api";

/* ========== MODAL DO LIVRO ========== */

interface DadosLivro {
  genero: string
  id : string
  titulo: string
  autor: string
  ano: string
  descricao: string
  disponibilidade: string
  capa: string
}

interface ElementosModalLivro {
  overlay: HTMLElement
  closeBtn: HTMLButtonElement
  reserveBtn: HTMLButtonElement
  cover: HTMLImageElement
  genre: HTMLElement
  title: HTMLElement
  meta: HTMLElement
  description: HTMLElement
  availability: HTMLElement
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
    id : d.id ?? "",
    titulo: d.titulo || card.querySelector(".book-card__title")?.textContent?.trim() || "",
    autor: d.autor || autorDom,
    ano: d.ano || anoDom,
    descricao: d.descricao || "",
    disponibilidade:
      d.disponibilidade ||
      card.querySelector(".book-card__disponibilidade p")?.textContent?.trim() ||
      "",
    capa: img?.getAttribute("src") ?? "",
  }
}

function isAvailable(text: string): boolean {
  // "indisponível ..." ou "0 disponíveis ..." => indisponível
  return !/^\s*(indispon|0\s)/i.test(text)
}

function iniciarModalLivro(): void {
  const modal = lerElementosModalLivro()
  if (!modal) return // página sem o modal do livro

  let lastFocused: HTMLElement | null = null
  let livroSelecionadoId = ""

  async function atualizarDisponibilidade(livroId : string) : Promise<void> {
    // consulta os dados atuais da API
    const exemplares = await listarExemplares(livroId)

    // conta quantas unidades estão disponíveis
    const disponiveis = exemplares.filter(exemplar => exemplar.disponivel).length

    // escolhem entre a contagem e o "Indisponível"
    const texto = disponiveis > 0
      ? `${disponiveis} disponíveis / ${exemplares.length} total`
      : "Indisponível"

      document.querySelectorAll<HTMLElement>(".book-card").forEach(card => {
        // ignora os cards de outros livros e o return encerra apenas a execução atual do forEach
        if(card.dataset.id !== livroId) return

        // atualiza a informação que o modal lerá quando for aberto novamente
        card.dataset.disponibilidade = texto

        const disponibilidade = card.querySelector<HTMLElement>("book-card__availability")

        // atualiza o texto visível quando encontra o elemento com a classe que add
        if(disponibilidade) {
          disponibilidade.textContent = texto
        }
    })
  }

  function openBook(card: HTMLElement): void {
    const book = getBookData(card)
    livroSelecionadoId = book.id

    modal!.cover.src = book.capa
    modal!.cover.alt = `capa do livro ${book.titulo}`
    modal!.genre.textContent = book.genero
    modal!.title.textContent = book.titulo
    modal!.meta.textContent = [book.autor, book.ano].filter(Boolean).join(" • ")
    modal!.description.textContent = book.descricao

    const available = isAvailable(book.disponibilidade)

    const dot = document.createElement("span")
    dot.className =
      "book-modal__dot " +
      (available ? "book-modal__dot--disponivel" : "book-modal__dot--indisponivel")

    const label = document.createElement("span")
    label.textContent = book.disponibilidade

    modal!.availability.replaceChildren(dot, label)

    lastFocused = elementoFocado()
    modal!.overlay.classList.add("is-open")
    document.body.classList.add("modal-open")
    modal!.closeBtn.focus()
  }

  function closeBook(): void {
    modal!.overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    lastFocused?.focus();
  }

  /* Configura o teclado nos cards já presentes no HTML */
  document.querySelectorAll<HTMLElement>(".book-card").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBook(card);
      }
    });

  });

  /* Reconhece cliques também nos cards criados depois pela API */
  document.addEventListener("click", (evento) => {
    const alvo = evento.target

    if (!(alvo instanceof Element)) return

    const card = alvo.closest<HTMLElement>(".book-card")

    if (!card) return;

    openBook(card);
  })

  /* Fechar: botão, clique no fundo e tecla Esc */
  modal.closeBtn.addEventListener("click", closeBook)

  modal.overlay.addEventListener("click", (e) => {
    if (e.target === modal.overlay) closeBook()
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.overlay.classList.contains("is-open")) closeBook()
  })

  /* Botão reservar (troque pela sua lógica depois) */
  modal.reserveBtn.textContent = "Emprestar"

  modal.reserveBtn.addEventListener("click", async () => {
    // impedir cliques repetidos
    if(modal.reserveBtn.disabled) return

    const livroId = livroSelecionadoId

    // verificar se existe um livro identificado
    // ! (significa não) -> o livroId será verdadeiro quando o identificador estiver vazio
    if(!livroId) {
      modal.availability.textContent = "Abra um livro pelo acervo para solicitar o empréstimo."
      return
    }

    // verificar se há uma sessão salva 
    // se retornar null esse if mostra a orientação de login e interrompe a operação
    // essa verificação confirma que há uma sessão armazenada, a API ainda verifica se o token é válido e não expirou 
    if(!obterSessao()) {
      modal.availability.textContent = "Entre na conta antes de solicitar um empréstimo."
      return
    }

    modal.reserveBtn.disabled = true
    modal.availability.textContent = "Solicitando empréstimo..."

    try {
      const exemplares = await listarExemplares(livroId)
      // find: procura uma unidade disponível
      const exemplar = exemplares.find(item => item.disponivel)

      // verificar se encontramos uma unidade disponpivel 
      if(!exemplar) {
        throw new Error("Este livro não tem exemplar disponível no momento. ")
      }

      const emprestimo = await emprestarExemplar(exemplar.id)

      // mostrar sucesso somente no livro correspondente -> mostra a confirmação e o vencimento 
      // livroId: guarda o livro selecionado no momento do clique 
      // livroSelecionadoId: representa o livro atualmente aberto +
      if(livroSelecionadoId === livroId) {
        const vencimento = new Date(emprestimo.dataVencimento).toLocaleDateString("pt-BR")

        modal.availability.textContent = `Empréstimo realizado! Devolução até ${vencimento}.`
      }
    } catch (erro : unknown) {
      // mostrar o errro somente no livro correspondente -> impedir que uma falha da solicitação de um livo apareça no modal de outro 
      if(livroSelecionadoId === livroId) {
        modal.availability.textContent = 
          erro instanceof Error
            ? erro.message
            : "Não foi possível realizar o empréstimo."
      }
    }

    finally {
        modal.reserveBtn.disabled = false
      }
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
  const sairBtn = porId<HTMLButtonElement>("sairConta")
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

    // recupera os dados salvos
    const sessao = obterSessao()

    // o operador ? : escolhe a mensagem, se houver sessão mostra o nome, caso contrário deixa o campo vazio
    errorEl!.textContent = sessao ? `Você está conectado como ${sessao.usuario.nome}` : ""

    if(sairBtn) {
      sairBtn.hidden = !sessao
    }
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

  sairBtn?.addEventListener("click", () => {
    encerrarSessao()
    sairBtn.hidden = true
    form.reset()
    errorEl.textContent = "Você saiu da conta."
    emailInput.focus()
  })

  const abrirCadastroBtn = porId<HTMLButtonElement>("abrirCadastroUsuario")

  const cadastroOverlay = porId("cadastroUsuarioOverlay");
  const cadastroNome = porId<HTMLInputElement>("cadastroUsuarioNome")

  if(abrirCadastroBtn && cadastroOverlay && cadastroNome) {
    abrirCadastroBtn.addEventListener("click", () => {
      loginOverlay.classList.remove("is-open");
      cadastroOverlay.classList.add("is-open");
    });
  }

  const voltarLoginBtn = porId<HTMLButtonElement>("voltarParaLogin");

  if(voltarLoginBtn && cadastroOverlay) {
    voltarLoginBtn.addEventListener("click", () => {
      cadastroOverlay.classList.remove("is-open");
      loginOverlay.classList.add("is-open");
      emailInput.focus();
    })
  }

  const fecharCadastroBtn = porId<HTMLButtonElement>("fecharCadastroUsuario");

  if(fecharCadastroBtn && cadastroOverlay) {
    function fecharCadastro() : void {
      cadastroOverlay!.classList.remove("is-open");
      closeLogin();
    }

    fecharCadastroBtn.addEventListener("click", fecharCadastro);

    cadastroOverlay.addEventListener("click", (evento) => {
      if(evento.target === cadastroOverlay) {
        fecharCadastro();
      }
    });

    document.addEventListener("keydown", (evento) => {
      if(
        evento.key === "Escape"  &&
        cadastroOverlay.classList.contains("is-open")
      ) {
        fecharCadastro();
      }
    })
  }

  const cadastroForm = porId<HTMLFormElement>("cadastroUsuarioForm");
  const cadastroEmail = porId<HTMLInputElement>("cadastroUsuarioEmail");
  const cadastroSenha = porId<HTMLInputElement>("cadastroUsuarioSenha");
  const cadastroMensagem = porId("cadastroUsuarioMensagem");
  const cadastroBotao = porId<HTMLButtonElement>("cadastroUsuarioBotao");

  if(
    cadastroForm &&
    cadastroNome &&
    cadastroEmail &&
    cadastroSenha &&
    cadastroMensagem &&
    cadastroBotao
  ) {
    cadastroForm.addEventListener("submit", async(evento) => {
      evento.preventDefault();

      if(cadastroBotao.disabled) return; 

      cadastroBotao.disabled = true;
      cadastroMensagem.textContent = "Cadastrando..."

      try {
        const usuario = await cadastrarUsuario({
          nome : cadastroNome.value,
          email : cadastroEmail.value,
          senha : cadastroSenha.value,
        });

        cadastroForm.reset();

        cadastroMensagem.textContent = `Conta de ${usuario.nome} criada com sucesso!`;
      } catch (erro : unknown) {
        cadastroMensagem.textContent = 
          erro instanceof Error ? erro.message : "Não foi possível realizar o cadastro.";
      } finally {
        cadastroBotao.disabled = false;
      }
    });

    cadastroBotao.disabled = false;
  }

  loginOverlay.addEventListener("click", (e) => {
    if (e.target === loginOverlay) closeLogin();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && loginOverlay.classList.contains("is-open")) closeLogin();
  });

  form.addEventListener("submit", async (e) => {
    // impede que o formulário recarregue a página
    e.preventDefault()

    const email = emailInput.value.trim()
    const password = passwordInput.value

    // impede de enviar os campos vazios
    if(!email || !password) {
      errorEl.textContent = "Preencha e-mail e senha para entrar."
      return
    }

    errorEl.textContent = "Entrando..."

    // mostra o nome retornando quando o login funciona e limpa a senha do formulário
    try {
      // envia as credenciais e aguarda a resposta 
      const sessao = await iniciarSessao({
        email,
        senha : password
      })

      // guarda os dados no navegador durante a sessão daquela aba
      sessionStorage.setItem(
        "biblioteca.sessao",
        JSON.stringify(sessao) // transforma o objeto com token e dados públicos do usuário em texto
      )

      // mostrar o botão após um login bem sucedido 
      if(sairBtn) {
        sairBtn.hidden = false
      }

      errorEl.textContent = `Login realizado! Olá, ${sessao.usuario.nome}`

      passwordInput.value = ""
    } catch (erro : unknown) {
      errorEl.textContent = // exibe a mensagem de erro como credenciais inválidas
        erro instanceof Error
        ? erro.message
        : "Não foi possível entrar na conta."
    }
  })
}
iniciarModalLivro()
iniciarLogin()
