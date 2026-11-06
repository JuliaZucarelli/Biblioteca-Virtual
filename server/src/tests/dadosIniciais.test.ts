import { describe, it, expect } from "vitest"
import { criarAcervoInicial } from "../database/dados_inicias"

describe("Seed (dados iniciais)", () => {
    it("cria 9 livros", () => {
        expect(criarAcervoInicial().listarLivros()).toHaveLength(9)
    })

    it("cada livro tem ISBN único", () => {
        const isbns = criarAcervoInicial().listarLivros().map(l => l.isbn)
        expect(new Set(isbns).size).toBe(isbns.length)
    })

    it("cada livro tem capa em /img", () => {
        for (const livro of criarAcervoInicial().listarLivros()) {
            expect(livro.capa).toMatch(/^\/img\/.+\.jpg$/)
        }
    })

    it("cada exemplar aponta para o livro a que pertence", () => {
        const acervo = criarAcervoInicial()
        for (const livro of acervo.listarLivros()) {
            for (const exemplar of acervo.obterExemplares(livro.id)) {
                expect(exemplar.livroId).toBe(livro.id)
            }
        }
    })

    it("reproduz a disponibilidade que estava nos cards do HTML", () => {
        const acervo = criarAcervoInicial()
        expect(acervo.quantidadeDisponivel("L01")).toBe(2) // Noites Brancas: 2 disponíveis / 3 total
        expect(acervo.quantidadeTotal("L01")).toBe(3)
        expect(acervo.quantidadeDisponivel("L02")).toBe(1) // A Metamorfose: 1 disponível / 2 total
        expect(acervo.quantidadeTotal("L02")).toBe(2)
        expect(acervo.livroDisponivel("L03")).toBe(false)  // A Queda: indisponível
        expect(acervo.quantidadeDisponivel("L04")).toBe(2) // Água Viva: 2 disponíveis / 2 total
        expect(acervo.quantidadeTotal("L04")).toBe(2)
    })

    it("inclui livros para testar a disponibilidade", () => {
        const acervo = criarAcervoInicial()
        expect(acervo.livroDisponivel("L01")).toBe(true)   // parte emprestada, parte disponível
        expect(acervo.livroDisponivel("L03")).toBe(false)  // todos emprestados
        expect(acervo.quantidadeTotal("L08")).toBe(0)      // sem exemplares
    })

    describe("independência entre execuções", () => {
        it("cria instâncias novas de Livro a cada chamada", () => {
            const a = criarAcervoInicial()
            const b = criarAcervoInicial()
            expect(a.obterLivro("L01")).not.toBe(b.obterLivro("L01"))
            expect(a.obterLivro("L01")).toEqual(b.obterLivro("L01"))
        })

        it("cria instâncias novas de Exemplar a cada chamada", () => {
            const a = criarAcervoInicial()
            const b = criarAcervoInicial()
            expect(a.obterExemplares("L01")[0]).not.toBe(b.obterExemplares("L01")[0])
        })

        it("alterar um acervo não afeta outro", () => {
            const a = criarAcervoInicial()
            const b = criarAcervoInicial()
            a.obterExemplares("L09").forEach(e => e.emprestar())
            a.obterLivro("L09")!.titulo = "Título alterado"

            expect(a.livroDisponivel("L09")).toBe(false)
            expect(b.livroDisponivel("L09")).toBe(true)
            expect(b.obterLivro("L09")!.titulo).toBe("Grande Sertão: Veredas")
        })
    })
})
