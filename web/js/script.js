const overlay = document.getElementById('bookOverlay');

if (overlay) {
const closeBtn = document.getElementById('closeBook');
const reserveBtn = overlay.querySelector('.book-modal__reserve');

const modal = {
  cover: document.getElementById('modalCover'),
  genre: document.getElementById('modalGenre'),
  title: document.getElementById('modalTitle'),
  meta: document.getElementById('modalMeta'),
  description: document.getElementById('modalDescription'),
  availability: document.getElementById('modalAvailability'),
};

let lastFocused = null;

/* Lê os dados do card: usa os data-* e, se faltar algum, cai no texto do próprio card */
function getBookData(card) {
  const d = card.dataset;
  const img = card.querySelector('.book-card__cover img');
  const metaText = card.querySelector('.book-card__meta')?.textContent.trim() || '';
  const [autorDom = '', anoDom = ''] = metaText.split('•').map((s) => s.trim());

  return {
    genero: d.genero || card.querySelector('.book-card__genre')?.textContent.trim() || '',
    titulo: d.titulo || card.querySelector('.book-card__title')?.textContent.trim() || '',
    autor: d.autor || autorDom,
    ano: d.ano || anoDom,
    descricao: d.descricao || '',
    disponibilidade:
      d.disponibilidade ||
      card.querySelector('.book-card__disponibilidade p')?.textContent.trim() ||
      '',
    capa: img?.getAttribute('src') || '',
  };
}

function isAvailable(text) {
  // "indisponível ..." ou "0 disponíveis ..." => indisponível
  return !/^\s*(indispon|0\s)/i.test(text);
}

function openBook(card) {
  const book = getBookData(card);

  modal.cover.src = book.capa;
  modal.cover.alt = `capa do livro ${book.titulo}`;
  modal.genre.textContent = book.genero;
  modal.title.textContent = book.titulo;
  modal.meta.textContent = [book.autor, book.ano].filter(Boolean).join(' • ');
  modal.description.textContent = book.descricao;

  const available = isAvailable(book.disponibilidade);
  modal.availability.innerHTML = '';

  const dot = document.createElement('span');
  dot.className =
    'book-modal__dot ' + (available ? 'book-modal__dot--disponivel' : 'book-modal__dot--indisponivel');

  const label = document.createElement('span');
  label.textContent = book.disponibilidade;

  modal.availability.append(dot, label);

  lastFocused = document.activeElement;
  overlay.classList.add('is-open');
  document.body.classList.add('modal-open');
  closeBtn.focus();
}

function closeBook() {
  overlay.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  lastFocused?.focus();
}

/* Torna cada card clicável e acessível pelo teclado */
document.querySelectorAll('.book-card').forEach((card) => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');

  card.addEventListener('click', () => openBook(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBook(card);
    }
  });
});

/* Fechar: botão, clique no fundo e tecla Esc */
closeBtn.addEventListener('click', closeBook);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeBook();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeBook();
});

/* Botão reservar (troque pela sua lógica depois) */
reserveBtn.addEventListener('click', () => {
  console.log('Reservar:', modal.title.textContent);
});
} // fim do if (overlay)

// LOGIN OVERLAY
(() => {
  const loginOverlay = document.getElementById('loginOverlay');
  if (!loginOverlay) return;

  const openBtn = document.querySelector('.avatar--button'); // avatar da topbar
  const closeBtn = document.getElementById('closeLogin');
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('loginError');
  const forgotBtn = document.querySelector('.login-modal__Fpassword');
 
  let lastFocused = null;
 
  function openLogin() {
    lastFocused = document.activeElement;
    loginOverlay.classList.add('is-open');
    document.body.classList.add('modal-open');
    emailInput.focus();
  }
 
  function closeLogin() {
    loginOverlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    form.reset();
    errorEl.textContent = '';
    lastFocused?.focus();
  }
 
  openBtn.addEventListener('click', openLogin);
  closeBtn.addEventListener('click', closeLogin);
 
  loginOverlay.addEventListener('click', (e) => {
    if (e.target === loginOverlay) closeLogin();
  });
 
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginOverlay.classList.contains('is-open')) closeLogin();
  });
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    const email = emailInput.value.trim();
    const password = passwordInput.value;
 
    if (!email || !password) {
      errorEl.textContent = 'Preencha e-mail e senha para entrar.';
      return;
    }
 
    errorEl.textContent = '';
 
    // TODO: trocar pela sua lógica de autenticação
    console.log('Login:', { email });
  });
 
  forgotBtn.addEventListener('click', () => {
    // TODO: fluxo de "esqueci minha senha"
    console.log('Esqueci minha senha');
  });
})();