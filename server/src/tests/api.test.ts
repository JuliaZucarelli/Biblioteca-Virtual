import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import request from "supertest"
import { criarApp } from "../app"
import { abrirBanco } from "../config/banco"
import { criarAcervoInicial } from "../database/dados_inicias"
import { semearSeVazio } from "../database/seed"
import { RepositorioAcervo, RepositorioMemoria } from "../repositories/repositorio"
import { RepositorioSQLite } from "../repositories/repositorio-sqlite"

const livroValido = {
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    isbn: "978-0-00-000999-9",
    ano: 1899,
    genero: "Romance",
    sinopse: "Bentinho e a dúvida sobre Capitu.",
    capa: "/img/dom-casmurro.jpg",
}

/* Mesma suíte contra as duas implementações de repositório.
Cada teste recebe uma API nova, com os dados iniciais, então um teste não interfere em outro. */
const implementacoes: Array<[string, () => RepositorioAcervo]> = [
    ["memória", () => new RepositorioMemoria(criarAcervoInicial())],
    ["SQLite", () => {
        const banco = abrirBanco(":memory:")
        semearSeVazio(banco)
        return new RepositorioSQLite(banco)
    }],
]

describe.each(implementacoes)("API REST de livros (repositório: %s)", (_nome, criarRepositorio) => {
    let app: ReturnType<typeof criarApp>

    beforeEach(() => {
        app = criarApp(criarRepositorio())
    })

    // ================= GET =================
    describe("GET /api e /api/saude", () => {
        it("GET /api apresenta a API e seus endpoints", async () => {
            const res = await request(app).get("/api")
            expect(res.status).toBe(200)
            expect(res.body.nome).toBe("Biblioteca Virtual API")
            expect(res.body.endpoints).toContain("GET /api/livros")
        })

        it("GET /api/saude responde ok", async () => {
            const res = await request(app).get("/api/saude")
            expect(res.status).toBe(200)
            expect(res.body).toEqual({ status: "ok" })
        })

        it("não revela que usa Express (x-powered-by)", async () => {
            const res = await request(app).get("/api")
            expect(res.headers["x-powered-by"]).toBeUndefined()
        })
    })

    describe("GET /api/livros", () => {
        it("lista os 9 livros em JSON", async () => {
            const res = await request(app).get("/api/livros")
            expect(res.status).toBe(200)
            expect(res.headers["content-type"]).toMatch(/application\/json/)
            expect(res.body).toHaveLength(9)
        })

        it("cada livro traz dados, capa e contagem de exemplares", async () => {
            const res = await request(app).get("/api/livros")
            expect(res.body[0]).toEqual({
                id: "L01",
                isbn: "9780000000019",
                titulo: "Noites Brancas",
                autor: "Fiódor Dostoiévski",
                ano: 1848,
                genero: "Literatura russa",
                sinopse: expect.stringContaining("São Petersburgo"),
                capa: "/img/noites-brancas.jpg",
                total: 3,
                disponiveis: 2,
            })
        })

        it("mostra livro indisponível e livro sem exemplares", async () => {
            const res = await request(app).get("/api/livros")
            const porId = Object.fromEntries(res.body.map((l: { id: string }) => [l.id, l]))
            expect(porId.L03).toMatchObject({ titulo: "A Queda", total: 1, disponiveis: 0 })
            expect(porId.L08).toMatchObject({ titulo: "O Código Da Vinci", total: 0, disponiveis: 0 })
        })

        it("HEAD devolve os mesmos cabeçalhos do GET, sem corpo", async () => {
            const res = await request(app).head("/api/livros")
            expect(res.status).toBe(200)
            expect(res.headers["content-type"]).toMatch(/json/)
            expect(res.text ?? "").toBe("")
        })
    })

    describe("GET /api/livros/:id", () => {
        it("devolve o livro", async () => {
            const res = await request(app).get("/api/livros/L02")
            expect(res.status).toBe(200)
            expect(res.body).toMatchObject({ id: "L02", titulo: "A Metamorfose", total: 2, disponiveis: 1 })
        })

        it("404 para livro inexistente", async () => {
            const res = await request(app).get("/api/livros/L999")
            expect(res.status).toBe(404)
            expect(res.body).toEqual({ erro: "Livro não encontrado." })
        })
    })

    // ================= POST =================
    describe("POST /api/livros", () => {
        it("201 Created, com Location e o livro criado no corpo", async () => {
            const res = await request(app).post("/api/livros").send(livroValido)
            expect(res.status).toBe(201)
            expect(res.headers.location).toBe("/api/livros/L10")
            expect(res.body).toEqual({
                id: "L10",
                isbn: "9780000009999", // hífens removidos
                titulo: "Dom Casmurro",
                autor: "Machado de Assis",
                ano: 1899,
                genero: "Romance",
                sinopse: "Bentinho e a dúvida sobre Capitu.",
                capa: "/img/dom-casmurro.jpg",
                total: 0,
                disponiveis: 0,
            })
        })

        it("o livro criado passa a existir (GET no Location)", async () => {
            const criado = await request(app).post("/api/livros").send(livroValido)
            const res = await request(app).get(criado.headers.location!)
            expect(res.status).toBe(200)
            expect(res.body.titulo).toBe("Dom Casmurro")
            expect((await request(app).get("/api/livros")).body).toHaveLength(10)
        })

        it("sinopse e capa são opcionais", async () => {
            const { sinopse, capa, ...minimo } = livroValido
            const res = await request(app).post("/api/livros").send(minimo)
            expect(res.status).toBe(201)
            expect(res.body).toMatchObject({ sinopse: "", capa: "" })
        })

        it("remove espaços nas pontas dos textos", async () => {
            const res = await request(app).post("/api/livros").send({ ...livroValido, titulo: "  Dom Casmurro  " })
            expect(res.body.titulo).toBe("Dom Casmurro")
        })

        it("400 quando falta um campo obrigatório", async () => {
            const { autor, ...semAutor } = livroValido
            const res = await request(app).post("/api/livros").send(semAutor)
            expect(res.status).toBe(400)
            expect(res.body.erro).toBe("O campo 'autor' é obrigatório.")
        })

        it("400 quando um texto está vazio", async () => {
            const res = await request(app).post("/api/livros").send({ ...livroValido, titulo: "   " })
            expect(res.status).toBe(400)
            expect(res.body.erro).toMatch(/titulo/)
        })

        it("400 quando o ano não é um número inteiro positivo", async () => {
            for (const ano of ["1899", -5, 0, 18.5]) {
                const res = await request(app).post("/api/livros").send({ ...livroValido, ano })
                expect(res.status, `ano=${ano}`).toBe(400)
                expect(res.body.erro).toMatch(/ano/)
            }
        })

        it("400 quando o ISBN não tem 10 ou 13 dígitos", async () => {
            const res = await request(app).post("/api/livros").send({ ...livroValido, isbn: "12345" })
            expect(res.status).toBe(400)
            expect(res.body.erro).toMatch(/isbn/)
        })

        it("400 quando um campo tem o tipo errado", async () => {
            const res = await request(app).post("/api/livros").send({ ...livroValido, titulo: 123 })
            expect(res.status).toBe(400)
            expect(res.body.erro).toBe("O campo 'titulo' deve ser um texto.")
        })

        it("400 para campos desconhecidos, inclusive id (o servidor é quem gera o id)", async () => {
            const res = await request(app).post("/api/livros").send({ ...livroValido, id: "L99" })
            expect(res.status).toBe(400)
            expect(res.body.erro).toBe("Campos não permitidos: id.")
        })

        it("400 quando o corpo não é um objeto JSON", async () => {
            const lista = await request(app).post("/api/livros").send([])
            expect(lista.status).toBe(400)
            const vazio = await request(app).post("/api/livros")
            expect(vazio.status).toBe(400)
            expect(vazio.body.erro).toBe("O corpo da requisição deve ser um objeto JSON.")
        })

        it("400 quando o JSON é inválido (e não 500)", async () => {
            const res = await request(app)
                .post("/api/livros")
                .set("Content-Type", "application/json")
                .send("{ isto não é json")
            expect(res.status).toBe(400)
            expect(res.body).toEqual({ erro: "O corpo da requisição não é um JSON válido." })
        })

        it("409 Conflict quando o ISBN já está cadastrado (mesmo escrito com hífens)", async () => {
            const res = await request(app).post("/api/livros").send({ ...livroValido, isbn: "978-0-00-000001-9" })
            expect(res.status).toBe(409)
            expect(res.body).toEqual({ erro: "Já existe um livro cadastrado com este ISBN." })
        })
    })

    // ================= PUT =================
    describe("PUT /api/livros/:id", () => {
        it("200: substitui o livro inteiro, mantendo o id e os exemplares", async () => {
            const res = await request(app).put("/api/livros/L01").send(livroValido)
            expect(res.status).toBe(200)
            expect(res.body).toMatchObject({ id: "L01", titulo: "Dom Casmurro", ano: 1899, total: 3, disponiveis: 2 })
        })

        it("campos opcionais que não vieram voltam ao padrão (PUT substitui tudo)", async () => {
            const { sinopse, capa, ...minimo } = livroValido
            const res = await request(app).put("/api/livros/L01").send(minimo)
            expect(res.body).toMatchObject({ sinopse: "", capa: "" })
        })

        it("200 ao reenviar o próprio ISBN (não conflita consigo mesmo)", async () => {
            const res = await request(app).put("/api/livros/L01").send({ ...livroValido, isbn: "9780000000019" })
            expect(res.status).toBe(200)
        })

        it("400 quando falta campo obrigatório (PUT exige o livro completo)", async () => {
            const { genero, ...semGenero } = livroValido
            const res = await request(app).put("/api/livros/L01").send(semGenero)
            expect(res.status).toBe(400)
            expect(res.body.erro).toBe("O campo 'genero' é obrigatório.")
        })

        it("404 para livro inexistente", async () => {
            const res = await request(app).put("/api/livros/L999").send(livroValido)
            expect(res.status).toBe(404)
        })

        it("409 quando o ISBN pertence a outro livro", async () => {
            const res = await request(app).put("/api/livros/L01").send({ ...livroValido, isbn: "9780000000026" })
            expect(res.status).toBe(409)
        })
    })

    // ================= PATCH =================
    describe("PATCH /api/livros/:id", () => {
        it("200: altera só os campos enviados", async () => {
            const res = await request(app).patch("/api/livros/L01").send({ ano: 1850, genero: "Clássico" })
            expect(res.status).toBe(200)
            expect(res.body).toMatchObject({
                id: "L01",
                ano: 1850,
                genero: "Clássico",
                titulo: "Noites Brancas",       // não mudou
                autor: "Fiódor Dostoiévski",    // não mudou
            })
        })

        it("a alteração fica salva", async () => {
            await request(app).patch("/api/livros/L01").send({ titulo: "Noites Brancas (edição de bolso)" })
            const res = await request(app).get("/api/livros/L01")
            expect(res.body.titulo).toBe("Noites Brancas (edição de bolso)")
        })

        it("400 quando nenhum campo é enviado", async () => {
            const res = await request(app).patch("/api/livros/L01").send({})
            expect(res.status).toBe(400)
            expect(res.body.erro).toBe("Informe ao menos um campo para atualizar.")
        })

        it("400 ao tentar alterar o id", async () => {
            const res = await request(app).patch("/api/livros/L01").send({ id: "L77" })
            expect(res.status).toBe(400)
        })

        it("400 quando um campo enviado é inválido", async () => {
            const res = await request(app).patch("/api/livros/L01").send({ titulo: "" })
            expect(res.status).toBe(400)
        })

        it("404 para livro inexistente", async () => {
            const res = await request(app).patch("/api/livros/L999").send({ ano: 2000 })
            expect(res.status).toBe(404)
        })

        it("409 quando o novo ISBN pertence a outro livro", async () => {
            const res = await request(app).patch("/api/livros/L01").send({ isbn: "9780000000026" })
            expect(res.status).toBe(409)
        })
    })

    // ================= DELETE =================
    describe("DELETE /api/livros/:id", () => {
        it("204 No Content, sem corpo; o livro deixa de existir", async () => {
            const res = await request(app).delete("/api/livros/L04") // 2 exemplares, nenhum emprestado
            expect(res.status).toBe(204)
            expect(res.text ?? "").toBe("")
            expect((await request(app).get("/api/livros/L04")).status).toBe(404)
            expect((await request(app).get("/api/livros")).body).toHaveLength(8)
        })

        it("apaga também os exemplares do livro", async () => {
            await request(app).delete("/api/livros/L04")
            expect((await request(app).get("/api/livros/L04/exemplares")).status).toBe(404)
            // os códigos de tombo ficam livres para uso
            const novo = await request(app).post("/api/livros/L08/exemplares").send({ codigo: "TOMBO-007" })
            expect(novo.status).toBe(201)
        })

        it("404 para livro inexistente (e ao apagar duas vezes)", async () => {
            expect((await request(app).delete("/api/livros/L999")).status).toBe(404)
            await request(app).delete("/api/livros/L04")
            expect((await request(app).delete("/api/livros/L04")).status).toBe(404)
        })

        it("409 quando há exemplar emprestado", async () => {
            const res = await request(app).delete("/api/livros/L01")
            expect(res.status).toBe(409)
            expect(res.body.erro).toMatch(/emprestados ou reservados/)
            expect((await request(app).get("/api/livros/L01")).status).toBe(200) // continua lá
        })
    })

    // ================= exemplares (sub-recurso) =================
    describe("GET /api/livros/:id/exemplares", () => {
        it("lista os exemplares do livro", async () => {
            const res = await request(app).get("/api/livros/L01/exemplares")
            expect(res.status).toBe(200)
            expect(res.body).toEqual([
                { id: "E001", livroId: "L01", codigo: "TOMBO-001", status: "DISPONIVEL", disponivel: true },
                { id: "E002", livroId: "L01", codigo: "TOMBO-002", status: "DISPONIVEL", disponivel: true },
                { id: "E003", livroId: "L01", codigo: "TOMBO-003", status: "EMPRESTADO", disponivel: false },
            ])
        })

        it("lista vazia para livro sem exemplares", async () => {
            const res = await request(app).get("/api/livros/L08/exemplares")
            expect(res.status).toBe(200)
            expect(res.body).toEqual([])
        })

        it("404 para livro inexistente", async () => {
            expect((await request(app).get("/api/livros/L999/exemplares")).status).toBe(404)
        })
    })

    describe("POST /api/livros/:id/exemplares", () => {
        it("201 com Location; o código de tombo é gerado quando não é informado", async () => {
            const res = await request(app).post("/api/livros/L08/exemplares")
            expect(res.status).toBe(201)
            expect(res.headers.location).toMatch(/^\/api\/livros\/L08\/exemplares\/E\d{3}$/)
            expect(res.body).toMatchObject({ livroId: "L08", status: "DISPONIVEL", disponivel: true })
            expect(res.body.codigo).toMatch(/^TOMBO-\d{3}$/)
        })

        it("a contagem do livro é atualizada", async () => {
            await request(app).post("/api/livros/L08/exemplares")
            const res = await request(app).get("/api/livros/L08")
            expect(res.body).toMatchObject({ total: 1, disponiveis: 1 })
        })

        it("aceita um código de tombo informado", async () => {
            const res = await request(app).post("/api/livros/L08/exemplares").send({ codigo: "  BIB-0001 " })
            expect(res.status).toBe(201)
            expect(res.body.codigo).toBe("BIB-0001")
        })

        it("409 quando o código de tombo já existe (sem diferenciar maiúsculas)", async () => {
            const res = await request(app).post("/api/livros/L08/exemplares").send({ codigo: "tombo-001" })
            expect(res.status).toBe(409)
        })

        it("400 para código inválido ou campo desconhecido", async () => {
            expect((await request(app).post("/api/livros/L08/exemplares").send({ codigo: 5 })).status).toBe(400)
            expect((await request(app).post("/api/livros/L08/exemplares").send({ status: "EMPRESTADO" })).status).toBe(400)
        })

        it("404 para livro inexistente", async () => {
            expect((await request(app).post("/api/livros/L999/exemplares")).status).toBe(404)
        })
    })

    describe("/api/livros/:id/exemplares/:exemplarId", () => {
        it("GET devolve o exemplar", async () => {
            const res = await request(app).get("/api/livros/L01/exemplares/E003")
            expect(res.status).toBe(200)
            expect(res.body).toMatchObject({ id: "E003", status: "EMPRESTADO" })
        })

        it("GET 404 quando o exemplar não pertence àquele livro (hierarquia respeitada)", async () => {
            expect((await request(app).get("/api/livros/L02/exemplares/E001")).status).toBe(404)
        })

        it("DELETE 204 para exemplar disponível", async () => {
            const res = await request(app).delete("/api/livros/L01/exemplares/E001")
            expect(res.status).toBe(204)
            expect((await request(app).get("/api/livros/L01")).body).toMatchObject({ total: 2, disponiveis: 1 })
            expect((await request(app).get("/api/livros/L01/exemplares/E001")).status).toBe(404)
        })

        it("DELETE 409 para exemplar emprestado", async () => {
            const res = await request(app).delete("/api/livros/L01/exemplares/E003")
            expect(res.status).toBe(409)
            expect(res.body.erro).toMatch(/emprestado/)
        })

        it("DELETE 404 para exemplar inexistente", async () => {
            expect((await request(app).delete("/api/livros/L01/exemplares/E999")).status).toBe(404)
        })
    })

    // ================= 404 e 405 =================
    describe("rotas e métodos inexistentes", () => {
        it("rota inexistente devolve 404 em JSON", async () => {
            const res = await request(app).get("/api/nada")
            expect(res.status).toBe(404)
            expect(res.body.erro).toBeDefined()
        })

        it("405 Method Not Allowed na coleção, com Allow", async () => {
            const res = await request(app).delete("/api/livros")
            expect(res.status).toBe(405)
            expect(res.headers.allow).toBe("GET, HEAD, POST, OPTIONS")
            expect(res.body.erro).toMatch(/DELETE/)
        })

        it("405 no recurso, com Allow listando os métodos aceitos", async () => {
            const res = await request(app).post("/api/livros/L01")
            expect(res.status).toBe(405)
            expect(res.headers.allow).toBe("GET, HEAD, PUT, PATCH, DELETE, OPTIONS")
        })

        it("405 em exemplar (PUT não existe)", async () => {
            const res = await request(app).put("/api/livros/L01/exemplares/E001").send({})
            expect(res.status).toBe(405)
        })

        it("OPTIONS responde 204 com Allow", async () => {
            const res = await request(app).options("/api/livros/L01")
            expect(res.status).toBe(204)
            expect(res.headers.allow).toBe("GET, HEAD, PUT, PATCH, DELETE, OPTIONS")
        })

        it("o preflight de CORS continua funcionando (navegador em outra origem)", async () => {
            const res = await request(app)
                .options("/api/livros")
                .set("Origin", "http://localhost:5173")
                .set("Access-Control-Request-Method", "POST")
            expect(res.status).toBe(204)
            expect(res.headers["access-control-allow-origin"]).toBe("*")
            expect(res.headers["access-control-allow-methods"]).toContain("POST")
            expect(res.headers.allow).toContain("POST")
        })
    })
})

describe("API REST: quando o repositório falha", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("devolve 500 com mensagem genérica, sem vazar detalhes", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {}) // não poluir a saída do teste
        const app = criarApp(new RepositorioMemoria(criarAcervoInicial(), { falhar: true }))

        const res = await request(app).get("/api/livros")
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ erro: "Não foi possível processar a requisição." })
    })
})
