import { describe, it, expect, beforeEach } from "vitest"
import { criarAcervoInicial } from "./data/dados_inicias"
import { RepositorioMemoria } from "./repositorio"

describe("Seed (dados iniciais)", () => {
    it("cria 8 livros", () => {
        expect(criarAcervoInicial().listarLivros()).toHaveLength(8)
    })

    it("cada exemplar aponta para um livro existente", () => {
        const acervo = criarAcervoInicial()
        for (const livro of acervo.listarLivros()) {
            for (const exemplar of acervo.obterExemplares(livro.id)) {
                expect(exemplar.livroId).toBe(livro.id)
            }
        }
    })
})

describe("RepositorioMemoria", () => {
    let repo: RepositorioMemoria

    beforeEach(() => {
        repo = new RepositorioMemoria(criarAcervoInicial())
    })

    it("lista todos os livros", async () => {
        expect(await repo.listarLivros()).toHaveLength(8)
    })

    it("obtém um livro pelo id", async () => {
        const livro = await repo.obterLivro("L01")
        expect(livro?.titulo).toBe("Dom Casmurro")
    })

    it("retorna undefined para livro inexistente", async () => {
        expect(await repo.obterLivro("L999")).toBeUndefined()
    })

    it("lista os exemplares de um livro", async () => {
        expect(await repo.listarExemplares("L06")).toHaveLength(4)
    })

    it("conta exemplares disponíveis", async () => {
        expect(await repo.quantidadeDisponivel("L01")).toBe(2)  // 2 disponíveis, 1 emprestado
        expect(await repo.quantidadeDisponivel("L03")).toBe(0)  // todos emprestados
        expect(await repo.quantidadeDisponivel("L08")).toBe(0)  // sem exemplares
    })

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