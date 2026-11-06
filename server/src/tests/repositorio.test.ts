import { describe, it, expect, beforeEach } from "vitest"
import { abrirBanco } from "../config/banco"
import { Exemplar, StatusExemplar } from "../domain/exemplares"
import { Livro } from "../domain/livro"
import { criarAcervoInicial } from "../database/dados_inicias"
import { semearSeVazio } from "../database/seed"
import { RepositorioAcervo, RepositorioMemoria } from "../repositories/repositorio"
import { RepositorioSQLite } from "../repositories/repositorio-sqlite"

/* Teste de CONTRATO: as mesmas verificações rodam contra as duas implementações
de RepositorioAcervo. Se uma delas se comportar diferente, o teste acusa. */
const implementacoes: Array<[string, () => RepositorioAcervo]> = [
    ["RepositorioMemoria", () => new RepositorioMemoria(criarAcervoInicial())],
    ["RepositorioSQLite", () => {
        const banco = abrirBanco(":memory:")
        semearSeVazio(banco)
        return new RepositorioSQLite(banco)
    }],
]

describe.each(implementacoes)("contrato RepositorioAcervo: %s", (_nome, criar) => {
    let repo: RepositorioAcervo

    beforeEach(() => {
        repo = criar()
    })

    it("lista todos os livros, na ordem de cadastro", async () => {
        const livros = await repo.listarLivros()
        expect(livros).toHaveLength(9)
        expect(livros[0]!.titulo).toBe("Noites Brancas")
        expect(livros[8]!.titulo).toBe("Grande Sertão: Veredas")
    })

    it("obtém um livro pelo id, com todos os campos", async () => {
        const livro = await repo.obterLivro("L01")
        expect(livro?.titulo).toBe("Noites Brancas")
        expect(livro?.autor).toBe("Fiódor Dostoiévski")
        expect(livro?.ano).toBe(1848)
        expect(livro?.capa).toBe("/img/noites-brancas.jpg")
    })

    it("retorna undefined para livro inexistente", async () => {
        expect(await repo.obterLivro("L999")).toBeUndefined()
    })

    it("lista os exemplares de um livro", async () => {
        expect(await repo.listarExemplares("L05")).toHaveLength(4)
        expect(await repo.listarExemplares("L08")).toHaveLength(0)
    })

    it("preserva o status de cada exemplar", async () => {
        const status = (await repo.listarExemplares("L01")).map(e => e.status)
        expect(status).toEqual([StatusExemplar.DISPONIVEL, StatusExemplar.DISPONIVEL, StatusExemplar.EMPRESTADO])
    })

    it("conta exemplares disponíveis", async () => {
        expect(await repo.quantidadeDisponivel("L01")).toBe(2)  // 2 disponíveis, 1 emprestado
        expect(await repo.quantidadeDisponivel("L03")).toBe(0)  // todos emprestados
        expect(await repo.quantidadeDisponivel("L08")).toBe(0)  // sem exemplares
    })

    describe("escrita", () => {
        const novoLivro = () => new Livro("L10", "Dom Casmurro", "Machado de Assis", "9780000009999", 1899, "Romance", "", "/img/x.jpg")

        it("salvarLivro grava e o livro passa a ser listado", async () => {
            await repo.salvarLivro(novoLivro())
            expect(await repo.listarLivros()).toHaveLength(10)
            expect((await repo.obterLivro("L10"))?.titulo).toBe("Dom Casmurro")
        })

        it("atualizarLivro troca os dados e mantém os exemplares", async () => {
            await repo.atualizarLivro(new Livro("L01", "Novo título", "Outro autor", "9780000000019", 2000, "Drama", "x", "/img/y.jpg"))
            const livro = await repo.obterLivro("L01")
            expect(livro).toMatchObject({ titulo: "Novo título", autor: "Outro autor", ano: 2000, genero: "Drama", capa: "/img/y.jpg" })
            expect(await repo.listarExemplares("L01")).toHaveLength(3)
        })

        it("atualizarLivro falha para livro inexistente", async () => {
            await expect(repo.atualizarLivro(novoLivro())).rejects.toThrow("não encontrado")
        })

        it("removerLivro apaga o livro e seus exemplares", async () => {
            await repo.removerLivro("L04")
            expect(await repo.obterLivro("L04")).toBeUndefined()
            expect(await repo.listarExemplares("L04")).toEqual([])
            expect(await repo.listarLivros()).toHaveLength(8)
        })

        it("removerLivro falha para livro inexistente", async () => {
            await expect(repo.removerLivro("L999")).rejects.toThrow("não encontrado")
        })

        it("adicionarExemplar grava e existeTombo passa a responder true", async () => {
            expect(await repo.existeTombo("BIB-1")).toBe(false)
            await repo.adicionarExemplar(new Exemplar("E900", "L08", "BIB-1"))
            expect(await repo.existeTombo("BIB-1")).toBe(true)
            expect(await repo.existeTombo("bib-1")).toBe(true) // sem diferenciar maiúsculas
            expect(await repo.listarExemplares("L08")).toHaveLength(1)
        })

        it("removerExemplar apaga o exemplar e libera o código de tombo", async () => {
            await repo.removerExemplar("E001")
            expect(await repo.listarExemplares("L01")).toHaveLength(2)
            expect(await repo.existeTombo("TOMBO-001")).toBe(false)
        })

        it("removerExemplar falha para exemplar inexistente", async () => {
            await expect(repo.removerExemplar("E999")).rejects.toThrow("não encontrado")
        })
    })
})

describe("RepositorioMemoria: falha e latência simuladas", () => {
    it("simula falha quando configurado", async () => {
        const comFalha = new RepositorioMemoria(criarAcervoInicial(), { falhar: true })
        await expect(comFalha.listarLivros()).rejects.toThrow("Não foi possível carregar")
    })

    it("simula latência quando configurado", async () => {
        const lento = new RepositorioMemoria(criarAcervoInicial(), { latenciaMs: 50 })
        const inicio = Date.now()
        await lento.listarLivros()
        expect(Date.now() - inicio).toBeGreaterThanOrEqual(45)
    })
})
