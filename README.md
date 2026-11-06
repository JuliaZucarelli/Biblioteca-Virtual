# Biblioteca Virtual

Sistema web para consulta e gestão de um acervo bibliográfico, com interface em TypeScript, API REST em Node.js e persistência em SQLite.

O projeto aplica conceitos de desenvolvimento full stack, programação orientada a objetos, modelagem relacional e testes automatizados no contexto de uma biblioteca.

## Tecnologias

- **Frontend:** HTML, CSS, TypeScript e Vite.
- **Backend:** Node.js, Express e TypeScript.
- **Banco de dados:** SQLite com better-sqlite3.
- **Testes:** Vitest e Supertest.

## Regras de negócio

- Cada livro possui ISBN único e pode ter múltiplos exemplares.
- Cada exemplar possui um código de tombo único e um estado de disponibilidade.
- Livros e exemplares emprestados ou reservados não podem ser excluídos.
- Os empréstimos seguem regras de prazo, limite por usuário e renovação.
- Devoluções em atraso geram cálculo de multa por dia.

## Destaques técnicos

- API REST para cadastro, consulta, atualização e exclusão de livros e gestão de exemplares.
- Backend organizado em domínio, serviços, repositórios, controllers e rotas.
- Validação de dados e tratamento centralizado de erros HTTP.
- Banco relacional com chaves estrangeiras, restrições de unicidade e índices.
- Testes de regras de negócio, persistência e endpoints.
- Catálogo com busca por título, autor e ISBN.

## Como executar

Com Node.js 22.12 ou superior e npm, execute em dois terminais:

**Backend:**

```sh
cd server
npm ci
npm run dev
```

**Frontend:**

```sh
cd web
npm ci
npm run dev
```

Interface: [localhost:5173](http://localhost:5173) · API: [localhost:3000/api](http://localhost:3000/api).

O banco SQLite é criado e populado automaticamente na primeira execução.

## Testes

Dentro de `server`, execute:

```sh
npm test
```
