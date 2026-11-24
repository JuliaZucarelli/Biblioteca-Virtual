import request from "supertest"
import { describe, it, expect } from "vitest"
import { RegularUser } from "../domain/regular-user"
import { ServicoTokens } from "../services/servico-tokens"
import { criarApp } from "../app"
import { RepositorioEmprestimosSQLite } from "../repositories/repositorio-emprestimos-sqlite"
import { RepositorioSQLite } from "../repositories/repositorio-sqlite"
import { criarBancoDeTeste } from "./auxiliar-circulacao"

function montarApi() {
    const banco = criarBancoDeTeste()
    const tokens = new ServicoTokens("segredo-de-testes-de-circulacao-com-32-bytes")
    const app = criarApp(new RepositorioSQLite(banco), undefined, tokens, new RepositorioEmprestimosSQLite(banco))
    const bearer = (id: string) => "Bearer " + tokens.gerarToken(new RegularUser(id, id, id + "@teste.local"))
    const como = (usuario: string) => ({
        get: (url: string) => request(app).get(url).set("Authorization", bearer(usuario)),
        post: (url: string) => request(app).post(url).set("Authorization", bearer(usuario)),
        delete: (url: string) => request(app).delete(url).set("Authorization", bearer(usuario)),
    })
    return { app, como }
}

describe("API de empréstimos", () => {
    it("lista os endpoints novos em GET /api", async () => {
        const { app } = montarApi()
        const res = await request(app).get("/api")
        expect(res.body.emprestimos).toBe("/api/emprestimos")
        expect(res.body.endpoints).toContain("POST /api/emprestimos/:id/devolucao")
    })

    it("sem o repositório de empréstimos, as rotas não existem (compatível com criarApp(repositorio))", async () => {
        const app = criarApp(new RepositorioSQLite(criarBancoDeTeste()))
        expect((await request(app).get("/api/emprestimos")).status).toBe(404)
    })

    describe("identificação", () => {
        it("sem JWT responde 401 em todas as rotas protegidas", async () => {
            const { app } = montarApi()
            for (const rota of ["/api/emprestimos", "/api/emprestimos/EMP-001", "/api/reservas", "/api/reservas/RES-001"]) {
                const res = await request(app).get(rota).set("X-Usuario-Id", "U1")
                expect(res.status, rota).toBe(401)
                expect(res.body.erro).toMatch(/token/)
            }
            expect((await request(app).post("/api/emprestimos").send({ exemplarId: "E1" })).status).toBe(401)
        })

        it("usuário que não existe responde 401", async () => {
            const { como } = montarApi()
            expect((await como("U99").get("/api/emprestimos")).status).toBe(401)
        })
    })

    describe("empréstimo, renovação e devolução", () => {
        it("POST /emprestimos responde 201 com Location e o empréstimo", async () => {
            const { como } = montarApi()
            const res = await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })
            expect(res.status).toBe(201)
            expect(res.headers.location).toBe("/api/emprestimos/EMP-001")
            expect(res.body).toMatchObject({ id: "EMP-001", usuarioId: "U1", exemplarId: "E1", livroId: "L1", ativo: true, renovacoes: 0 })
        })

        it("o empréstimo aparece na lista do titular, muda a disponibilidade do acervo e não aparece para outro", async () => {
            const { como } = montarApi()
            await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })

            const meus = await como("U1").get("/api/emprestimos?situacao=ativos")
            expect(meus.status).toBe(200)
            expect(meus.body).toHaveLength(1)
            expect((await como("U2").get("/api/emprestimos")).body).toEqual([])
            expect((await como("U1").get("/api/emprestimos?situacao=encerrados")).body).toEqual([])
            expect((await como("U1").get("/api/emprestimos?situacao=xyz")).status).toBe(400)
        })

        it("responde 400 sem exemplarId, 404 para exemplar inexistente e 409 para unidade já emprestada", async () => {
            const { como } = montarApi()
            expect((await como("U1").post("/api/emprestimos").send({})).status).toBe(400)
            expect((await como("U1").post("/api/emprestimos").send({ exemplarId: "E999" })).status).toBe(404)
            await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })
            expect((await como("U2").post("/api/emprestimos").send({ exemplarId: "E1" })).status).toBe(409)
        })

        it("o 4º empréstimo do mesmo usuário responde 409", async () => {
            const { como } = montarApi()
            for (const exemplar of ["E3", "E4", "E5"]) {
                expect((await como("U1").post("/api/emprestimos").send({ exemplarId: exemplar })).status).toBe(201)
            }
            const res = await como("U1").post("/api/emprestimos").send({ exemplarId: "E6" })
            expect(res.status).toBe(409)
            expect(res.body.erro).toMatch(/limite de 3/)
        })

        it("outro usuário não vê, não renova e não devolve (403)", async () => {
            const { como } = montarApi()
            await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })
            expect((await como("U2").get("/api/emprestimos/EMP-001")).status).toBe(403)
            expect((await como("U2").post("/api/emprestimos/EMP-001/renovacoes")).status).toBe(403)
            expect((await como("U2").post("/api/emprestimos/EMP-001/devolucao")).status).toBe(403)
            expect((await como("U1").get("/api/emprestimos/EMP-999")).status).toBe(404)
        })

        it("renova (200) e devolve (200); devolver de novo responde 409", async () => {
            const { como } = montarApi()
            await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })

            const renovacao = await como("U1").post("/api/emprestimos/EMP-001/renovacoes")
            expect(renovacao.status).toBe(200)
            expect(renovacao.body.renovacoes).toBe(1)

            const devolucao = await como("U1").post("/api/emprestimos/EMP-001/devolucao")
            expect(devolucao.status).toBe(200)
            expect(devolucao.body).toMatchObject({ diasDeAtraso: 0, multaCentavos: 0 })
            expect(devolucao.body.emprestimo.ativo).toBe(false)

            expect((await como("U1").post("/api/emprestimos/EMP-001/devolucao")).status).toBe(409)
            expect((await como("U1").post("/api/emprestimos/EMP-001/renovacoes")).status).toBe(409)
        })

        it("métodos fora da lista respondem 405 com Allow", async () => {
            const { como } = montarApi()
            const res = await request((montarApi()).app).delete("/api/emprestimos/EMP-001")
            expect(res.status).toBe(405)
            expect(res.headers.allow).toContain("GET")
            expect((await como("U1").get("/api/emprestimos/EMP-001/devolucao")).status).toBe(405)
        })
    })

    describe("reservas e fila", () => {
        it("reservar com exemplar disponível responde 409", async () => {
            const { como } = montarApi()
            const res = await como("U3").post("/api/reservas").send({ livroId: "L1" })
            expect(res.status).toBe(409)
        })

        it("fluxo completo: reservar, consultar posição, devolução guarda a unidade e só o titular pega", async () => {
            const { como } = montarApi()
            await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })
            await como("U2").post("/api/emprestimos").send({ exemplarId: "E2" })

            const reserva = await como("U3").post("/api/reservas").send({ livroId: "L1" })
            expect(reserva.status).toBe(201)
            expect(reserva.headers.location).toBe("/api/reservas/RES-001")
            expect(reserva.body).toMatchObject({ posicao: 1, pronta: false, status: "ATIVA", livroTitulo: "Dom Casmurro" })

            const outra = await como("U4").post("/api/reservas").send({ livroId: "L1" })
            expect(outra.body.posicao).toBe(2)
            expect((await como("U3").post("/api/reservas").send({ livroId: "L1" })).status).toBe(409)

            // a reserva bloqueia a renovação
            expect((await como("U1").post("/api/emprestimos/EMP-001/renovacoes")).status).toBe(409)

            // devolução: a unidade fica guardada para U3
            await como("U1").post("/api/emprestimos/EMP-001/devolucao")
            const pronta = await como("U3").get("/api/reservas/RES-001")
            expect(pronta.body.pronta).toBe(true)

            expect((await como("U4").post("/api/emprestimos").send({ exemplarId: "E1" })).status).toBe(409)
            expect((await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })).status).toBe(409)
            expect((await como("U3").post("/api/emprestimos").send({ exemplarId: "E1" })).status).toBe(201)

            const lista = await como("U3").get("/api/reservas")
            expect(lista.body[0]).toMatchObject({ id: "RES-001", status: "ATENDIDA", posicao: null })
            expect((await como("U4").get("/api/reservas")).body[0].posicao).toBe(1)
        })

        it("DELETE cancela (204), só o titular cancela (403) e cancelar de novo responde 409", async () => {
            const { como } = montarApi()
            await como("U1").post("/api/emprestimos").send({ exemplarId: "E1" })
            await como("U2").post("/api/emprestimos").send({ exemplarId: "E2" })
            await como("U3").post("/api/reservas").send({ livroId: "L1" })

            expect((await como("U4").delete("/api/reservas/RES-001")).status).toBe(403)
            expect((await como("U4").get("/api/reservas/RES-001")).status).toBe(403)
            expect((await como("U3").delete("/api/reservas/RES-001")).status).toBe(204)
            expect((await como("U3").delete("/api/reservas/RES-001")).status).toBe(409)
            expect((await como("U3").delete("/api/reservas/RES-999")).status).toBe(404)

            // sem reserva ativa, a renovação volta a ser permitida
            expect((await como("U1").post("/api/emprestimos/EMP-001/renovacoes")).status).toBe(200)
        })

        it("reservar sem livroId responde 400 e livro inexistente responde 404", async () => {
            const { como } = montarApi()
            expect((await como("U3").post("/api/reservas").send({})).status).toBe(400)
            expect((await como("U3").post("/api/reservas").send({ livroId: "L99" })).status).toBe(404)
        })
    })
})
