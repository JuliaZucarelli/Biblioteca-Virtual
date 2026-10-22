# API REST — Biblioteca Virtual

API em TypeScript (Express + SQLite) que segue as convenções da aula de APIs REST.

- **Endereço:** `http://localhost:3000/api` (o front-end usa o proxy do Vite e chama só `/api/...`)
- **Formato:** JSON em todas as requisições e respostas (`Content-Type: application/json`)
- **Sem estado:** cada requisição é independente; não há sessão guardada no servidor
- **Rodar:** `cd server` e `npm run dev`
- **Testes:** `npm test` (a API inteira é testada contra os dois repositórios, memória e SQLite)

---

## 1. Convenções de nomenclatura (slides da aula)

| # | Convenção | Como foi aplicada |
|---|---|---|
| 1 | URIs com substantivos, sem verbos de CRUD | `/api/livros`, `/api/livros/L01`. A ação está no método HTTP (`DELETE /api/livros/L01`), não no caminho |
| 2 | Recursos no plural (singleton no singular) | `/livros`, `/exemplares`, `/usuarios`, `/emprestimos`. A devolução é singleton, pois um empréstimo só é devolvido uma vez: `/emprestimos/{id}/devolucao` |
| 3 | Barras para hierarquia | `/livros/{id}/exemplares/{exemplarId}`: o exemplar está abaixo do livro, que está abaixo da coleção |
| 4 | Query parameters para filtrar e ordenar | `/livros?genero=Romance&disponivel=true&ordem=titulo` (filtros previstos para a semana de 19/10) |
| 5 | Letras minúsculas e hífens | `/emprestimos-atrasados`, e nunca `/emprestimosAtrasados` |

Ações que mudam estado (como renovar ou devolver) são modeladas como **criação de um recurso substantivo**, no mesmo estilo de `POST /personagens/{nome}/ataques` do exemplo da aula: `POST /emprestimos/{id}/renovacoes` cria uma renovação.

---

## 2. Recursos implementados

| Método | Caminho | Ação | Sucesso | Erros possíveis |
|---|---|---|---|---|
| GET | `/api` | Apresenta a API e seus endpoints | 200 | |
| GET | `/api/saude` | Verifica se a API está no ar | 200 | |
| GET | `/api/livros` | Lista os livros | 200 | 500 |
| POST | `/api/livros` | Cadastra um livro | **201** + `Location` | 400, 409 |
| GET | `/api/livros/{id}` | Consulta um livro | 200 | 404 |
| PUT | `/api/livros/{id}` | Substitui o livro inteiro | 200 | 400, 404, 409 |
| PATCH | `/api/livros/{id}` | Altera só os campos enviados | 200 | 400, 404, 409 |
| DELETE | `/api/livros/{id}` | Exclui o livro e seus exemplares | **204** | 404, 409 |
| GET | `/api/livros/{id}/exemplares` | Lista os exemplares do livro | 200 | 404 |
| POST | `/api/livros/{id}/exemplares` | Cadastra um exemplar | **201** + `Location` | 400, 404, 409 |
| GET | `/api/livros/{id}/exemplares/{exemplarId}` | Consulta um exemplar | 200 | 404 |
| DELETE | `/api/livros/{id}/exemplares/{exemplarId}` | Exclui um exemplar | **204** | 404, 409 |

Qualquer outro método em um desses caminhos recebe **405 Method Not Allowed** com o cabeçalho `Allow` listando os métodos aceitos. `OPTIONS` responde `204` com o mesmo `Allow`, e `HEAD` funciona como `GET`, sem corpo.

---

## 3. Códigos de status usados

| Código | Quando |
|---|---|
| 200 OK | Consulta ou alteração feita com sucesso (o corpo traz o recurso) |
| 201 Created | Recurso criado; o cabeçalho `Location` aponta para ele |
| 204 No Content | Exclusão feita; não há corpo |
| 400 Bad Request | JSON inválido, campo ausente, vazio ou com tipo errado, campo desconhecido |
| 404 Not Found | Livro, exemplar ou rota inexistente |
| 405 Method Not Allowed | O caminho existe, mas não aceita aquele método |
| 409 Conflict | ISBN ou código de tombo repetido; excluir livro ou exemplar emprestado ou reservado |
| 413 Payload Too Large | Corpo da requisição grande demais |
| 500 Internal Server Error | Falha inesperada (mensagem genérica; o detalhe fica só no log do servidor) |

**Formato de erro**, o mesmo em todos os casos:

```json
{ "erro": "O campo 'autor' é obrigatório." }
```

---

## 4. O recurso Livro

```json
{
  "id": "L01",
  "isbn": "9780000000019",
  "titulo": "Noites Brancas",
  "autor": "Fiódor Dostoiévski",
  "ano": 1848,
  "genero": "Literatura russa",
  "sinopse": "Uma história sobre encontros, solidão e expectativas...",
  "capa": "/img/noites-brancas.jpg",
  "total": 3,
  "disponiveis": 2
}
```

`id`, `total` e `disponiveis` são calculados pelo servidor e **não podem ser enviados**. Enviar `id` retorna 400.

| Campo | POST e PUT | PATCH | Regras |
|---|---|---|---|
| `titulo`, `autor`, `genero` | obrigatórios | opcionais | Texto não vazio; as pontas são aparadas |
| `isbn` | obrigatório | opcional | 10 ou 13 dígitos; hífens e espaços são aceitos e removidos; **único** |
| `ano` | obrigatório | opcional | Número inteiro positivo (texto `"1899"` é rejeitado) |
| `sinopse`, `capa` | opcionais | opcionais | No PUT, se omitidos, voltam a `""` |

- **PUT** exige o livro completo, porque substitui tudo. **PATCH** exige ao menos um campo.
- **Exemplar:** `{ "id": "E001", "livroId": "L01", "codigo": "TOMBO-001", "status": "DISPONIVEL", "disponivel": true }`. O `POST` aceita opcionalmente `{ "codigo": "..." }`; sem ele, o tombo é gerado. O código de tombo é único, sem diferenciar maiúsculas.
- Um livro ou exemplar com status `EMPRESTADO` ou `RESERVADO` não pode ser excluído (409).

---

## 5. Exemplos (respostas reais)

**Cadastrar um livro**

```http
POST /api/livros HTTP/1.1
Content-Type: application/json

{ "titulo": "Dom Casmurro", "autor": "Machado de Assis",
  "isbn": "978-0-00-000999-9", "ano": 1899, "genero": "Romance" }
```
```http
HTTP/1.1 201 Created
Location: /api/livros/L10
Content-Type: application/json; charset=utf-8

{"id":"L10","isbn":"9780000009999","titulo":"Dom Casmurro","autor":"Machado de Assis",
 "ano":1899,"genero":"Romance","sinopse":"","capa":"","total":0,"disponiveis":0}
```

**Alterar só a sinopse (PATCH)**

```http
PATCH /api/livros/L10 HTTP/1.1
Content-Type: application/json

{ "sinopse": "Bentinho e a dúvida sobre Capitu." }
```
```http
HTTP/1.1 200 OK
```

**Cadastrar um exemplar**

```http
POST /api/livros/L10/exemplares HTTP/1.1
```
```http
HTTP/1.1 201 Created
Location: /api/livros/L10/exemplares/E020

{"id":"E020","livroId":"L10","codigo":"TOMBO-020","status":"DISPONIVEL","disponivel":true}
```

**Excluir um livro com exemplar emprestado**

```http
DELETE /api/livros/L01 HTTP/1.1
```
```http
HTTP/1.1 409 Conflict

{"erro":"Não é possível excluir o livro: há exemplares emprestados ou reservados."}
```

**Método não permitido**

```http
DELETE /api/livros HTTP/1.1
```
```http
HTTP/1.1 405 Method Not Allowed
Allow: GET, HEAD, POST, OPTIONS

{"erro":"O método DELETE não é permitido neste recurso."}
```

Com `curl`:

```bash
curl http://localhost:3000/api/livros
curl -i -X POST http://localhost:3000/api/livros \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"9780000009999","ano":1899,"genero":"Romance"}'
curl -i -X DELETE http://localhost:3000/api/livros/L04
```

---

## 6. Recursos planejados (já nomeados pelas convenções)

| Método | Caminho | Ação | Sucesso |
|---|---|---|---|
| POST | `/api/usuarios` | Cadastro de usuário | 201 |
| POST | `/api/sessoes` | Login (devolve o token JWT; o cliente o envia em `Authorization: Bearer ...`) | 201 |
| POST | `/api/emprestimos` | Empréstimo de um exemplar | 201 |
| GET | `/api/usuarios/{id}/emprestimos` | Empréstimos de um usuário | 200 |
| POST | `/api/emprestimos/{id}/renovacoes` | Renova o empréstimo | 201 |
| POST | `/api/emprestimos/{id}/devolucao` | Devolve o empréstimo | 201 |
| POST | `/api/livros/{id}/reservas` | Reserva um livro sem exemplar disponível | 201 |
| GET | `/api/emprestimos?situacao=atrasado` | Filtro por query parameter | 200 |

---

## 7. Limitações atuais

- **As rotas de escrita (`POST`, `PUT`, `PATCH`, `DELETE`) ainda não exigem login.** Na semana de autenticação (26/10 a 01/11) elas passam a exigir token e papel de administrador (401 sem token, 403 sem permissão).
- Busca por texto, filtros e ordenação em `GET /api/livros` entram na semana de 19/10.