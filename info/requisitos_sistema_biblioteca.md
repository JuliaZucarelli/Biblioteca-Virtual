# Sistema de Biblioteca

## Núcleo obrigatório: motor de busca

### Interface de busca
- Busca por **ISBN** ou **título**.
- Busca textual com **pontuação de relevância**:
  - Match no título possui maior peso.
  - Match no autor possui peso intermediário.
  - Match na sinopse possui menor peso.
- Interface para **filtros combináveis**.
- Execução da busca final.

---

## Empréstimo com regras reais

- Definir o **número máximo de empréstimos simultâneos** por usuário.
- Definir **prazo de devolução**.
- Calcular **multa por atraso**.
- Implementar **renovação limitada**:
  - O livro só pode ser renovado se **ninguém tiver realizado uma renovação anteriormente**.
  - Cada empréstimo pode ser renovado no máximo **2 vezes**.

---

# UI/UX

## 1. Busca — Home

### Elementos
- Campo de busca central.
- Filtros expansíveis:
  - Gênero.
  - Ano.
  - Disponibilidade.
- Toggle ou chips para escolher entre:
  - **Busca exata**.
  - **Busca por relevância**.

### Estados
- **Vazio:** sugestões e livros populares.
- **Carregando.**
- **Resultados.**
- **Nenhum resultado.**

---

## 2. Resultado da busca

### Cards de livros
Cada card deve apresentar:
- Capa.
- Título.
- Autor.
- Disponibilidade.
- Indicador visual de **relevância**.

### Navegação e filtros
- Ordenação.
- Filtros persistentes na lateral.

---

## 3. Detalhes do livro

Apresentar:
- Sinopse.
- Metadados.
- Lista de exemplares.
- Status de cada exemplar.

### Ações
- **Emprestar**.
- **Reservar**.

---

## 4. Minha conta / Meus empréstimos

### Empréstimos ativos
Cada empréstimo deve apresentar:
- Data de devolução.
- Indicador visual de atraso.
- Multa acumulada.

### Ações
- **Renovar**.

### Histórico
- Histórico de empréstimos passados.

---

## 5. Painel simples de Admin

### Funcionalidades
- Cadastro de livro.
- Cadastro de exemplar.

---

# O que criar no Figma

## 1. Fundações

Criar as definições visuais básicas do sistema:

- Paleta de cores.
- Tipografia.
- Grid e espaçamento.
- Biblioteca de ícones.
- Estilos de sombra.
- Estilos de borda.

---

## 2. Componentes

Criar uma biblioteca de componentes reutilizáveis:

- Botões.
- Campo de busca.
- Badge / Pill de status.
- Card de livro.
- Card de empréstimo ativo.
- Input de filtro.
- Navbar / Sidebar de navegação.
- Toast / Alerta de feedback.
- Modal.

---

## 3. Telas

Criar os principais fluxos da aplicação:

1. Home / Busca.
2. Resultado de busca.
3. Estados da busca.
4. Detalhes do livro.
5. Meus empréstimos.
6. Histórico de empréstimos.
7. Login / Cadastro simples.
8. Painel Admin.

---

## 4. Estados que não podem faltar

Todas as telas e componentes relevantes devem considerar os seguintes estados:

- **Loading** — carregamento.
- **Error** — erro.
- **Vazio** — ausência de conteúdo.
- **Sucesso** — operação concluída.
